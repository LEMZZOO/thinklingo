'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  addMemberAction, 
  updateMemberRoleAction, 
  toggleMemberActiveAction, 
  deleteMemberAction 
} from './actions';
import { MemberAnalyticsModal } from '@/components/academy/MemberAnalyticsModal';

type MemberRole = 'student' | 'teacher' | 'academy_admin';

interface Member {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: MemberRole;
  is_active: boolean;
  created_at: string;
  stats_favorites_count: number;
  stats_seen_count: number;
  stats_learned_count: number;
  stats_quiz_correct: number;
  stats_quiz_total: number;
}

interface AcademyMembersClientProps {
  academyId: string;
  academySlug: string;
  initialMembers: Member[];
  actorRole: MemberRole;
}

export function AcademyMembersClient({ 
  academyId, 
  academySlug, 
  initialMembers,
  actorRole
}: AcademyMembersClientProps) {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'student' | 'teacher'>('student');

  const [adding, setAdding] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [togglingMemberId, setTogglingMemberId] = useState<string | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [confirmDeleteMember, setConfirmDeleteMember] = useState<Member | null>(null);
  const [analyticsMember, setAnalyticsMember] = useState<Member | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher' | 'academy_admin'>('all');

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  const clearMessages = () => {
    setError('');
    setSuccessMsg('');
  };

  const showSuccess = (message: string) => {
    setSuccessMsg(message);
    window.setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = newEmail.trim();
    if (!email || adding) return;

    clearMessages();
    setAdding(true);

    try {
      await addMemberAction(academyId, academySlug, email, newRole);
      setNewEmail('');
      setNewRole('student');
      showSuccess('Miembro añadido correctamente.');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al añadir miembro');
    } finally {
      setAdding(false);
    }
  };

  const handleRoleChange = async (id: string, role: 'student' | 'teacher') => {
    if (updatingRoleId || deletingMemberId || confirmDeleteMember) return;

    clearMessages();
    setUpdatingRoleId(id);

    const previousMembers = members;
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));

    try {
      await updateMemberRoleAction(academyId, academySlug, id, role);
      router.refresh();
    } catch (err: unknown) {
      setMembers(previousMembers);
      setError(err instanceof Error ? err.message : 'Error al actualizar rol');
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleToggleActive = async (id: string, nextIsActive: boolean) => {
    if (togglingMemberId || deletingMemberId || confirmDeleteMember) return;

    clearMessages();
    setTogglingMemberId(id);

    const previousMembers = members;
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, is_active: nextIsActive } : m)));

    try {
      await toggleMemberActiveAction(academyId, academySlug, id, nextIsActive);
      router.refresh();
    } catch (err: unknown) {
      setMembers(previousMembers);
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
    } finally {
      setTogglingMemberId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteMember || deletingMemberId) return;

    clearMessages();
    setDeletingMemberId(confirmDeleteMember.id);

    const memberToDelete = confirmDeleteMember;
    const previousMembers = members;
    setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));

    try {
      await deleteMemberAction(academyId, academySlug, memberToDelete.id);
      setConfirmDeleteMember(null);
      router.refresh();
    } catch (err: unknown) {
      setMembers(previousMembers);
      setError(err instanceof Error ? err.message : 'Error al eliminar miembro');
    } finally {
      setDeletingMemberId(null);
    }
  };

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((member) => {
      const matchesText = !query || (member.email || '').toLowerCase().includes(query) || (member.full_name ?? '').toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && member.is_active) || (statusFilter === 'inactive' && !member.is_active);
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      return matchesText && matchesStatus && matchesRole;
    });
  }, [members, search, statusFilter, roleFilter]);

  const uiLocked = adding || deletingMemberId !== null || confirmDeleteMember !== null;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {actorRole !== 'teacher' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-black text-slate-800 dark:text-slate-100 mb-4 text-xl">Añadir Miembro</h2>

          {error && <div className="mb-4 text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-3 rounded-xl">{error}</div>}
          {successMsg && <div className="mb-4 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">{successMsg}</div>}

          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Email del usuario</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={uiLocked}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-[var(--academy-primary)] transition-colors"
                placeholder="alumno@ejemplo.com"
              />
            </div>
            <div className="w-full sm:w-48">
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Rol</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'student' | 'teacher')}
                disabled={uiLocked}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-[var(--academy-primary)] transition-colors disabled:opacity-70"
              >
                <option value="student">Alumno</option>
                <option value="teacher">Profesor</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={uiLocked || !newEmail.trim()}
              className="h-11 w-full sm:w-auto px-6 bg-[var(--academy-primary)] text-white font-bold rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50 transition min-w-[120px]"
            >
              {adding ? 'Guardando...' : 'Añadir'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <input 
              type="text" 
              placeholder="Buscar por nombre o email" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:max-w-xs h-9 px-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-[var(--academy-primary)] transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            <span className="text-[10px] font-black uppercase text-slate-400 mr-2 whitespace-nowrap">
              Mostrando {filteredMembers.length} de {members.length}
            </span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-xs font-bold focus:ring-2 focus:ring-[var(--academy-primary)] transition-colors"
            >
              <option value="all">Todos los roles</option>
              <option value="student">Alumno</option>
              <option value="teacher">Profesor</option>
              <option value="academy_admin">Admin</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-xs font-bold focus:ring-2 focus:ring-[var(--academy-primary)] transition-colors"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-[10px] uppercase font-black tracking-widest text-slate-400">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4 text-center">Favoritos</th>
                <th className="px-6 py-4 text-center">Seen</th>
                <th className="px-6 py-4 text-center">Learned</th>
                <th className="px-6 py-4 text-center">Quiz</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {members.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-400 font-bold">No hay miembros registrados.</td></tr>
              ) : filteredMembers.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-400 font-bold">No hay resultados con los filtros.</td></tr>
              ) : (
                filteredMembers.map((m) => {
                  const isTargetAdmin = m.role === 'academy_admin';
                  const isRestrictedForTeacher = actorRole === 'teacher' && m.role !== 'student';
                  
                  // REGLA: academy_admin no puede tocar a otro academy_admin
                  const isRestrictedForAdmin = actorRole === 'academy_admin' && isTargetAdmin;
                  
                  const canManage = !isRestrictedForTeacher && !isRestrictedForAdmin;
                  
                  const rowBusy = uiLocked || updatingRoleId === m.id || togglingMemberId === m.id || deletingMemberId === m.id;
                  
                  return (
                    <tr key={m.id} className={!m.is_active ? 'opacity-50' : ''}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{m.full_name || 'Desconocido'}</div>
                        <div className="text-xs text-slate-500">{m.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {isTargetAdmin ? (
                          <span className="text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">
                            Admin academia
                          </span>
                        ) : (
                          <select
                            value={m.role}
                            onChange={(e) => handleRoleChange(m.id, e.target.value as 'student' | 'teacher')}
                            disabled={rowBusy || actorRole === 'teacher'}
                            className="bg-transparent border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold disabled:opacity-50"
                          >
                            <option value="student">Alumno</option>
                            <option value="teacher">Profesor</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-500 dark:text-slate-400">
                        {m.role === 'student' ? m.stats_favorites_count : '—'}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-500 dark:text-slate-400">
                        {m.role === 'student' ? m.stats_seen_count : '—'}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-blue-600 dark:text-blue-400">
                        {m.role === 'student' ? m.stats_learned_count : '—'}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-xs text-slate-600 dark:text-slate-300">
                        {m.role === 'student' ? `${m.stats_quiz_correct}/${m.stats_quiz_total}` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {actorRole === 'academy_admin' ? (
                          <button 
                            onClick={() => handleToggleActive(m.id, !m.is_active)}
                            disabled={rowBusy || isTargetAdmin}
                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${m.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-slate-100 text-slate-500'} disabled:opacity-50`}
                          >
                            {togglingMemberId === m.id ? '...' : m.is_active ? 'Activo' : 'Inactivo'}
                          </button>
                        ) : (
                          <span className={`text-[10px] font-black uppercase ${m.is_active ? 'text-green-600' : 'text-slate-400'}`}>
                            {m.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {m.role === 'student' && (
                          <button 
                            onClick={() => setAnalyticsMember(m)}
                            disabled={rowBusy}
                            className="p-2 text-slate-400 hover:text-[var(--academy-primary)] transition-colors mr-1"
                            title="Ver Analítica"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                          </button>
                        )}
                        {actorRole === 'academy_admin' && !isTargetAdmin && (
                          <button 
                            onClick={() => setConfirmDeleteMember(m)}
                            disabled={rowBusy}
                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-30"
                            title="Eliminar Miembro"
                          >
                            {deletingMemberId === m.id ? '...' : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDeleteMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-black mb-4">¿Eliminar miembro?</h3>
            <p className="text-sm text-slate-500 mb-6">Vas a eliminar a <b>{confirmDeleteMember.full_name || confirmDeleteMember.email}</b>.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDeleteMember(null)} disabled={deletingMemberId !== null} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 transition">Cancelar</button>
              <button 
                onClick={handleDelete} 
                disabled={deletingMemberId !== null} 
                className="px-4 py-2 bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition"
              >
                {deletingMemberId ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Analítica */}
      {analyticsMember && (
        <MemberAnalyticsModal 
          open={!!analyticsMember}
          onClose={() => setAnalyticsMember(null)}
          academyId={academyId}
          memberUserId={analyticsMember.user_id}
          memberName={analyticsMember.full_name || analyticsMember.email || 'Alumno'}
          memberRole={analyticsMember.role}
        />
      )}
    </div>
  );
}
