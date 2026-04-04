'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.is_superadmin !== true) {
    throw new Error('No tienes permisos.');
  }
}

export async function getAcademyMembers(academyId: string) {
  await checkAdmin();
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.rpc('get_academy_members_admin', { p_academy_id: academyId });
  if (error) throw new Error(error.message);
  return data;
}

export async function addMemberAction(
  academyId: string,
  email: string,
  role: 'student' | 'teacher' | 'academy_admin'
) {
  await checkAdmin();
  const adminClient = createAdminClient();

  // 1. Obtener ID del usuario vía RPC
  const { data: userId, error: userErr } = await adminClient.rpc('get_user_id_by_email', { p_email: email });
  if (userErr || !userId) {
    throw new Error('No se encontró un usuario con ese email en el sistema.');
  }

  // 2. Comprobar profile (opcional pero pedido de forma robusta)
  const { data: profile } = await adminClient.from('profiles').select('id').eq('id', userId).single();
  if (!profile) {
    throw new Error('El usuario existe pero no tiene perfil asociado (registro incompleto).');
  }

  // 3. Comprobar membresía existente
  const { data: existingMembership } = await adminClient
    .from('academy_memberships')
    .select('role, is_active')
    .match({ user_id: userId, academy_id: academyId })
    .maybeSingle();

  if (existingMembership?.is_active) {
    throw new Error('Este usuario ya es un miembro activo de esta academia.');
  }

  // 4. Upsert (Reactivar o Crear)
  const { error: upsertErr } = await adminClient.from('academy_memberships').upsert({
    user_id: userId,
    academy_id: academyId,
    role,
    is_active: true
  }, { onConflict: 'user_id,academy_id' });

  if (upsertErr) throw new Error(upsertErr.message);

  revalidatePath(`/admin/academias/${academyId}/miembros`);
}

export async function updateMemberRoleAction(
  academyId: string,
  membershipId: string,
  role: 'student' | 'teacher' | 'academy_admin'
) {
  await checkAdmin();
  const adminClient = createAdminClient();
  
  const { data: currentTarget } = await adminClient
    .from('academy_memberships')
    .select('role')
    .match({ id: membershipId, academy_id: academyId })
    .maybeSingle();

  if (!currentTarget) throw new Error('Membresía no encontrada.');
  if (currentTarget?.role === 'academy_admin') {
    throw new Error('No puedes cambiar el rol de otro administrador de la academia.');
  }

  if (currentTarget?.role === role) {
    throw new Error(`El miembro ya tiene el rol de ${role === 'student' ? 'Alumno' : 'Profesor'}.`);
  }
  
  const { data, error } = await adminClient
    .from('academy_memberships')
    .update({ role })
    .match({ id: membershipId, academy_id: academyId })
    .select('id')
    .maybeSingle();
    
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Membership no encontrada para esta academia.');
  
  revalidatePath(`/admin/academias/${academyId}/miembros`);
}

export async function toggleMemberActiveAction(academyId: string, membershipId: string, is_active: boolean) {
  await checkAdmin();
  const adminClient = createAdminClient();
  
  const { data: currentTarget } = await adminClient
    .from('academy_memberships')
    .select('role, is_active')
    .match({ id: membershipId, academy_id: academyId })
    .maybeSingle();

  if (!currentTarget) throw new Error('Membresía no encontrada.');
  if (currentTarget?.role === 'academy_admin') {
    throw new Error('No puedes cambiar el estado de otro administrador de la academia.');
  }

  if (currentTarget?.is_active === is_active) {
    throw new Error(`Esta membresía ya se encuentra ${is_active ? 'activa' : 'inactiva'}.`);
  }

  const { data, error } = await adminClient
    .from('academy_memberships')
    .update({ is_active })
    .match({ id: membershipId, academy_id: academyId })
    .select('id')
    .maybeSingle();
    
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Membership no encontrada para esta academia.');
  
  revalidatePath(`/admin/academias/${academyId}/miembros`);
}

export async function deleteMemberAction(academyId: string, membershipId: string) {
  await checkAdmin();
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('academy_memberships')
    .delete()
    .match({ id: membershipId, academy_id: academyId })
    .select('id')
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Membership no encontrada para esta academia.');
  
  revalidatePath(`/admin/academias/${academyId}/miembros`);
}
