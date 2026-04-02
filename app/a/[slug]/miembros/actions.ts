'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { getMembership } from '@/services/memberships';
import { getManagedStudentAnalyticsSummary } from '@/services/academyAnalytics';

async function checkAcademyAdminOrTeacher(academyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No estás autenticado.');
  }

  const membership = await getMembership(user.id, academyId);
  
  if (!membership || !membership.is_active || (membership.role !== 'teacher' && membership.role !== 'academy_admin')) {
    throw new Error('No tienes permisos suficientes o tu membresía no está activa.');
  }

  return membership; // Devolvemos la membership completa para usar su role
}

export async function getAcademyMembersAction(academyId: string) {
  await checkAcademyAdminOrTeacher(academyId);
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.rpc('get_academy_members_admin', { 
    p_academy_id: academyId 
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function addMemberAction(
  academyId: string,
  slug: string,
  email: string,
  role: 'student' | 'teacher'
) {
  const actorMembership = await checkAcademyAdminOrTeacher(academyId);

  if (actorMembership.role === 'teacher') {
    throw new Error('Un profesor no tiene permisos para añadir miembros.');
  }

  if (role !== 'student' && role !== 'teacher') {
    throw new Error('Solo se puede añadir miembros con rol Alumno o Profesor.');
  }

  const adminClient = createAdminClient();

  // 1. Obtener ID del usuario vía RPC
  const { data: userId, error: userErr } = await adminClient.rpc('get_user_id_by_email', { p_email: email });
  if (userErr || !userId) {
    throw new Error('No se encontró un usuario con ese email en el sistema.');
  }

  // 2. Comprobar profile
  const { data: profile } = await adminClient.from('profiles').select('id').eq('id', userId).single();
  if (!profile) {
    throw new Error('El usuario existe pero no tiene perfil asociado.');
  }

  // 3. Proteger admins existentes antes del upsert
  const { data: existingMembership } = await adminClient
    .from('academy_memberships')
    .select('role')
    .match({ user_id: userId, academy_id: academyId })
    .maybeSingle();

  if (existingMembership?.role === 'academy_admin') {
    throw new Error('No puedes modificar a otro administrador de la academia.');
  }

  // 4. Upsert
  const { error: upsertErr } = await adminClient.from('academy_memberships').upsert({
    user_id: userId,
    academy_id: academyId,
    role: role,
    is_active: true
  }, { onConflict: 'user_id,academy_id' });

  if (upsertErr) throw new Error(upsertErr.message);

  revalidatePath(`/a/${slug}/miembros`);
}

export async function updateMemberRoleAction(
  academyId: string,
  slug: string,
  membershipId: string,
  role: 'student' | 'teacher'
) {
  const actorMembership = await checkAcademyAdminOrTeacher(academyId);
  const adminClient = createAdminClient();

  // REGLA: Solo un academy_admin puede gestionar roles, el profesor es modo lectura
  if (actorMembership.role === 'teacher') {
    throw new Error('Un profesor no tiene permisos para cambiar roles.');
  }

  // REGLA: academy_admin no puede modificar a otro academy_admin ni promocionar a admin
  const { data: currentTarget } = await adminClient
    .from('academy_memberships')
    .select('role')
    .match({ id: membershipId, academy_id: academyId })
    .maybeSingle();

  if (currentTarget?.role === 'academy_admin') {
    throw new Error('No puedes cambiar el rol de otro administrador de la academia.');
  }
  
  const { data, error } = await adminClient
    .from('academy_memberships')
    .update({ role })
    .match({ id: membershipId, academy_id: academyId })
    .select('id')
    .maybeSingle();
    
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Membresía no encontrada.');
  
  revalidatePath(`/a/${slug}/miembros`);
}

export async function toggleMemberActiveAction(
  academyId: string, 
  slug: string, 
  membershipId: string, 
  is_active: boolean
) {
  const actorMembership = await checkAcademyAdminOrTeacher(academyId);
  const adminClient = createAdminClient();

  // REGLA: Solo un academy_admin puede gestionar el estado (activo/inactivo)
  if (actorMembership.role === 'teacher') {
    throw new Error('Un profesor no tiene permisos para cambiar el estado de membresía.');
  }

  // REGLA: academy_admin no puede desactivar a otro academy_admin
  const { data: currentTarget } = await adminClient
    .from('academy_memberships')
    .select('role')
    .match({ id: membershipId, academy_id: academyId })
    .maybeSingle();

  if (currentTarget?.role === 'academy_admin') {
    throw new Error('No puedes cambiar el estado de otro administrador de la academia.');
  }
  
  const { data, error } = await adminClient
    .from('academy_memberships')
    .update({ is_active })
    .match({ id: membershipId, academy_id: academyId })
    .select('id')
    .maybeSingle();
    
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Membresía no encontrada.');
  
  revalidatePath(`/a/${slug}/miembros`);
}

export async function deleteMemberAction(
  academyId: string, 
  slug: string, 
  membershipId: string
) {
  const actorMembership = await checkAcademyAdminOrTeacher(academyId);
  const adminClient = createAdminClient();

  // REGLA: Solo un academy_admin puede eliminar miembros
  if (actorMembership.role === 'teacher') {
    throw new Error('Un profesor no tiene permisos para eliminar miembros.');
  }

  // REGLA: academy_admin no puede eliminar a otro academy_admin
  const { data: currentTarget } = await adminClient
    .from('academy_memberships')
    .select('role')
    .match({ id: membershipId, academy_id: academyId })
    .maybeSingle();

  if (currentTarget?.role === 'academy_admin') {
    throw new Error('No puedes eliminar a otro administrador de la academia.');
  }
  
  const { data, error } = await adminClient
    .from('academy_memberships')
    .delete()
    .match({ id: membershipId, academy_id: academyId })
    .select('id')
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Membresía no encontrada.');
  
  revalidatePath(`/a/${slug}/miembros`);
}

/**
 * Server action para obtener el resumen de analítica de un miembro específico.
 */
export async function getMemberAnalyticsSummaryAction(
  academyId: string,
  targetUserId: string,
  from: string,
  to: string
) {
  const actorMembership = await checkAcademyAdminOrTeacher(academyId);

  return getManagedStudentAnalyticsSummary({
    academyId,
    actorUserId: actorMembership.user_id,
    targetUserId,
    from,
    to
  });
}
