import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { StudentAnalyticsSummary } from '@/types/academy-analytics';
import { UserLearningEvent } from '@/types/academy-events';

/**
 * Parsea una fecha en formato español DD/MM/YYYY a un objeto Date (UTC start of day).
 * Valida fechas imposibles (ej. 31/02/2026).
 */
function parseSpanishDate(dateStr: string): Date {
  const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  if (!regex.test(dateStr)) {
    throw new Error('Formato de fecha inválido. Se espera DD/MM/YYYY.');
  }

  const parts = dateStr.split('/');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10); // 1-12
  const year = parseInt(parts[2], 10);

  // Crear fecha en UTC
  const date = new Date(Date.UTC(year, month - 1, day));

  // Validar si la fecha es posible (JS Date corrige automáticamente, ej: 31/02 -> 03/03)
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error('Fecha no válida.');
  }

  return date;
}

/**
 * Formatea un objeto Date (UTC) a string DD/MM/YYYY.
 */
function formatSpanishDate(date: Date): string {
  const d = date.getUTCDate().toString().padStart(2, '0');
  const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const y = date.getUTCFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * Normaliza un rango de fechas para consultas Supabase en UTC.
 */
export function normalizeAnalyticsRange(from: string, to: string) {
  const fromDate = parseSpanishDate(from);
  const toDate = parseSpanishDate(to);

  if (fromDate > toDate) {
    throw new Error('La fecha inicial no puede ser posterior a la fecha final.');
  }

  const fromIso = fromDate.toISOString();
  
  // Inicio del día siguiente en UTC para rango [from, to+1)
  const toPlusOne = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate() + 1));
  const toIsoExclusive = toPlusOne.toISOString();

  return {
    fromDate,
    toDate,
    fromIso,
    toIsoExclusive
  };
}

/**
 * Procesa una lista de eventos para generar el resumen final (Lógica interna reutilizable).
 */
function calculateSummaryFromEvents(
  events: UserLearningEvent[],
  baseSummary: StudentAnalyticsSummary
): StudentAnalyticsSummary {
  const summary = { ...baseSummary };
  const learnedSet = new Set<string>();
  const seenSet = new Set<string>();

  events.forEach((event) => {
    switch (event.event_type) {
      case 'favorite_added':
        summary.favoritesAdded++;
        break;
      case 'favorite_removed':
        summary.favoritesRemoved++;
        break;
      case 'status_changed':
        summary.statusChanges++;
        if (event.source && event.entry_key) {
          const combo = `${event.source}:${event.entry_key}`;
          if (event.status_to === 'seen') seenSet.add(combo);
          if (event.status_to === 'learned') learnedSet.add(combo);
        }
        break;
      case 'quiz_answered':
        summary.quizAnswered += event.quiz_total_delta;
        summary.quizCorrect += event.quiz_correct_delta;
        summary.quizIncorrect += event.quiz_incorrect_delta;
        break;
      case 'academy_reset':
        summary.academyResets++;
        break;
      case 'quiz_reset':
        summary.quizResets++;
        break;
    }
  });

  summary.wordsSeenInRange = seenSet.size;
  summary.wordsLearnedInRange = learnedSet.size;

  return summary;
}

/**
 * Obtiene el resumen de analítica de un alumno para una academia en un rango de fechas.
 */
export async function getStudentAnalyticsSummary(params: {
  academyId: string;
  userId: string;
  from: string;
  to: string;
}): Promise<StudentAnalyticsSummary> {
  const supabase = await createClient();

  // 1. Obtener la membresía más antigua (fecha de alta oficial)
  const { data: membership, error: memError } = await supabase
    .from('academy_memberships')
    .select('created_at')
    .eq('academy_id', params.academyId)
    .eq('user_id', params.userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (memError) {
    throw new Error(`Error al consultar membresía: ${memError.message}`);
  }

  if (!membership) {
    throw new Error('No se encontró membresía para este usuario en la academia solicitada.');
  }

  const membershipStartedAt = membership.created_at;
  const normalized = normalizeAnalyticsRange(params.from, params.to);
  const requestedFromDateUtc = normalized.fromDate;
  const membershipDate = new Date(membershipStartedAt);
  const effectiveStartTime = membershipDate > requestedFromDateUtc ? membershipDate : requestedFromDateUtc;

  // Resumen inicial
  const baseSummary: StudentAnalyticsSummary = {
    academyId: params.academyId,
    userId: params.userId,
    membershipStartedAt,
    effectiveFrom: formatSpanishDate(effectiveStartTime),
    effectiveTo: params.to,
    favoritesAdded: 0,
    favoritesRemoved: 0,
    statusChanges: 0,
    wordsSeenInRange: 0,
    wordsLearnedInRange: 0,
    quizAnswered: 0,
    quizCorrect: 0,
    quizIncorrect: 0,
    academyResets: 0,
    quizResets: 0
  };

  const toPlusOneDateUtc = new Date(normalized.toIsoExclusive);
  if (effectiveStartTime >= toPlusOneDateUtc) {
    return baseSummary;
  }

  // Se usa cliente público porque el usuario consulta sus propios datos
  const { data: events, error: eventsError } = await supabase
    .from('user_learning_events')
    .select('event_type, source, entry_key, status_to, quiz_total_delta, quiz_correct_delta, quiz_incorrect_delta')
    .eq('academy_id', params.academyId)
    .eq('user_id', params.userId)
    .gte('created_at', effectiveStartTime.toISOString())
    .lt('created_at', normalized.toIsoExclusive);

  if (eventsError) {
    throw new Error(`Error al consultar eventos: ${eventsError.message}`);
  }

  return calculateSummaryFromEvents((events || []) as UserLearningEvent[], baseSummary);
}

/**
 * Versión gestionada: Permite a profesores/admins ver analítica de otros miembros.
 */
export async function getManagedStudentAnalyticsSummary(params: {
  academyId: string;
  actorUserId: string;
  targetUserId: string;
  from: string;
  to: string;
}): Promise<StudentAnalyticsSummary> {
  const adminClient = createAdminClient();

  // 1. Validar actor de forma robusta (Membresía activa)
  const { data: actorStats, error: actorErr } = await adminClient
    .from('academy_memberships')
    .select('role')
    .eq('user_id', params.actorUserId)
    .eq('academy_id', params.academyId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1);

  const actorMem = actorStats?.[0];

  if (actorErr || !actorMem) {
    throw new Error('No se encontró membresía activa del actor en esta academia.');
  }

  if (actorMem.role !== 'teacher' && actorMem.role !== 'academy_admin') {
    throw new Error('No autorizado para consultar analítica de miembros.');
  }

  // 2. Validar target para permisos (Lectura A: Rol)
  const { data: targetStats, error: targetErr } = await adminClient
    .from('academy_memberships')
    .select('role')
    .eq('user_id', params.targetUserId)
    .eq('academy_id', params.academyId)
    .order('created_at', { ascending: false })
    .limit(1);

  const targetRoleMem = targetStats?.[0];

  if (targetErr || !targetRoleMem) {
    throw new Error('No se encontró el miembro solicitado en esta academia.');
  }

  // 3. Reglas de permisos obligatorias
  if (actorMem.role === 'teacher' && targetRoleMem.role !== 'student') {
    throw new Error('No autorizado para consultar analítica de este miembro.');
  }

  // 4. Primera fecha de alta del target (Lectura B: Cronología)
  const { data: enrollmentStats, error: enrollmentErr } = await adminClient
    .from('academy_memberships')
    .select('created_at')
    .eq('user_id', params.targetUserId)
    .eq('academy_id', params.academyId)
    .order('created_at', { ascending: true })
    .limit(1);

  const firstEnrollment = enrollmentStats?.[0];

  if (enrollmentErr || !firstEnrollment) {
    throw new Error('No se pudo determinar la fecha de alta del miembro solicitado.');
  }

  const membershipStartedAt = firstEnrollment.created_at;
  const normalized = normalizeAnalyticsRange(params.from, params.to);
  const requestedFromDateUtc = normalized.fromDate;
  const membershipDate = new Date(membershipStartedAt);
  const effectiveStartTime = membershipDate > requestedFromDateUtc ? membershipDate : requestedFromDateUtc;

  const baseSummary: StudentAnalyticsSummary = {
    academyId: params.academyId,
    userId: params.targetUserId,
    membershipStartedAt,
    effectiveFrom: formatSpanishDate(effectiveStartTime),
    effectiveTo: params.to,
    favoritesAdded: 0,
    favoritesRemoved: 0,
    statusChanges: 0,
    wordsSeenInRange: 0,
    wordsLearnedInRange: 0,
    quizAnswered: 0,
    quizCorrect: 0,
    quizIncorrect: 0,
    academyResets: 0,
    quizResets: 0
  };

  const toPlusOneDateUtc = new Date(normalized.toIsoExclusive);
  if (effectiveStartTime >= toPlusOneDateUtc) {
    return baseSummary;
  }

  // Usamos adminClient para saltar RLS y ver eventos del target
  const { data: events, error: eventsError } = await adminClient
    .from('user_learning_events')
    .select('event_type, source, entry_key, status_to, quiz_total_delta, quiz_correct_delta, quiz_incorrect_delta')
    .eq('academy_id', params.academyId)
    .eq('user_id', params.targetUserId)
    .gte('created_at', effectiveStartTime.toISOString())
    .lt('created_at', normalized.toIsoExclusive);

  if (eventsError) {
    throw new Error(`Error al consultar eventos: ${eventsError.message}`);
  }

  return calculateSummaryFromEvents((events || []) as UserLearningEvent[], baseSummary);
}
