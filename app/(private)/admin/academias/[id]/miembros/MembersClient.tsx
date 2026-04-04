'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  addMemberAction,
  updateMemberRoleAction,
  toggleMemberActiveAction,
  deleteMemberAction,
} from './actions';

type MemberRole = 'student' | 'teacher' | 'academy_admin';

interface Member {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: MemberRole;
  is_active: boolean;
  created_at: string;
}

interface MembersClientProps {
  academyId: string;
  initialMembers: Member[];
}

export function MembersClient({ academyId, initialMembers }: MembersClientProps) {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>(initialMembers);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<MemberRole>('student');

  const [adding, setAdding] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [togglingMemberId, setTogglingMemberId] = useState<string | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const [confirmDeleteMember, setConfirmDeleteMember] = useState<Member | null>(null);

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
    window.setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = newEmail.trim();
    if (!email || adding) return;

    clearMessages();
    setAdding(true);

    try {
      await addMemberAction(academyId, email, newRole);
      setNewEmail('');
      setNewRole('student');
      showSuccess('Miembro añadido correctamente.');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al añadir miembro');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleRoleChange = async (id: string, role: MemberRole) => {
    if (updatingRoleId || deletingMemberId || confirmDeleteMember) return;

    clearMessages();
    setUpdatingRoleId(id);

    const previousMembers = members;
    setMembers((prev) =>
      prev.map((member) => (member.id === id ? { ...member, role } : member))
    );

    try {
      await updateMemberRoleAction(academyId, id, role);
      router.refresh();
    } catch (err: unknown) {
      setMembers(previousMembers);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al actualizar rol');
      }
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleToggleActive = async (id: string, nextIsActive: boolean) => {
    if (togglingMemberId || deletingMemberId || confirmDeleteMember) return;

    clearMessages();
    setTogglingMemberId(id);

    const previousMembers = members;
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, is_active: nextIsActive } : member
      )
    );

    try {
      await toggleMemberActiveAction(academyId, id, nextIsActive);
      router.refresh();
    } catch (err: unknown) {
      setMembers(previousMembers);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al cambiar estado');
      }
    } finally {
      setTogglingMemberId(null);
    }
  };

  const openDeleteConfirm = (member: Member) => {
    if (deletingMemberId) return;
    clearMessages();
    setConfirmDeleteMember(member);
  };

  const closeDeleteConfirm = () => {
    if (deletingMemberId) return;
    setConfirmDeleteMember(null);
  };

  const handleDelete = async () => {
    if (!confirmDeleteMember || deletingMemberId) return;

    clearMessages();
    setDeletingMemberId(confirmDeleteMember.id);

    const memberToDelete = confirmDeleteMember;
    const previousMembers = members;
    setMembers((prev) => prev.filter((member) => member.id !== memberToDelete.id));

    try {
      await deleteMemberAction(academyId, memberToDelete.id);
      setConfirmDeleteMember(null);
      router.refresh();
    } catch (err: unknown) {
      setMembers(previousMembers);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al eliminar miembro');
      }
    } finally {
      setDeletingMemberId(null);
    }
  };

  const uiLocked = adding || deletingMemberId !== null || confirmDeleteMember !== null;

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesText =
        !query ||
        member.email.toLowerCase().includes(query) ||
        (member.full_name ?? '').toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && member.is_active) ||
        (statusFilter === 'inactive' && !member.is_active);

      const matchesRole =
        roleFilter === 'all' || member.role === roleFilter;

      return matchesText && matchesStatus && matchesRole;
    });
  }, [members, search, statusFilter, roleFilter]);

  return (
    <>
      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-black text-slate-800 dark:text-slate-100 mb-4">
            Añadir usuario existente
          </h2>

          {error && (
            <div className="mb-4 text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-3 rounded-xl">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleAdd} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                Email del usuario
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={adding || deletingMemberId !== null}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="alumno@ejemplo.com"
              />
            </div>

            <div className="w-48">
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                Rol
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as MemberRole)}
                disabled={adding || deletingMemberId !== null}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="student">Alumno</option>
                <option value="teacher">Profesor</option>
                <option value="academy_admin">Admin Academia</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={adding || !newEmail.trim() || deletingMemberId !== null}
              className="h-11 px-6 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:bg-slate-700 dark:hover:bg-white disabled:opacity-50 transition min-w-[120px]"
            >
              {adding ? 'Guardando...' : 'Añadir'}
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
               <input 
                 type="text" 
                 placeholder="Buscar por nombre o email" 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full sm:max-w-xs h-9 px-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
               />
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
               <span className="text-[10px] font-black uppercase text-slate-400 mr-2 whitespace-nowrap">
                 Mostrando {filteredMembers.length} de {members.length}
               </span>
               <select
                 value={roleFilter}
                 onChange={(e) => setRoleFilter(e.target.value as 'all' | 'student' | 'teacher' | 'academy_admin')}
                 className="h-9 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-xs font-bold focus:ring-2 focus:ring-blue-500 transition-colors"
               >
                 <option value="all">Todos los roles</option>
                 <option value="student">Alumno</option>
                 <option value="teacher">Profesor</option>
                 <option value="academy_admin">Admin</option>
               </select>
               <select
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                 className="h-9 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-xs font-bold focus:ring-2 focus:ring-blue-500 transition-colors"
               >
                 <option value="all">Todos</option>
                 <option value="active">Activos</option>
                 <option value="inactive">Inactivos</option>
               </select>
            </div>
          </div>
          
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-[10px] uppercase font-black tracking-widest text-slate-400">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-bold">
                    No hay miembros registrados en esta academia.
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-bold">
                    No hay resultados con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                const rowDeleting = deletingMemberId === member.id;
                const rowUpdatingRole = updatingRoleId === member.id;
                const rowToggling = togglingMemberId === member.id;
                const rowBusy = rowDeleting || rowUpdatingRole || rowToggling || uiLocked;

                return (
                  <tr
                    key={member.id}
                    className={!member.is_active ? 'opacity-50 bg-gray-50 dark:bg-slate-800/30' : ''}
                  >
                    <td className="px-6 py-4">
                      <div className="font-black text-slate-900 dark:text-slate-100">
                        {member.full_name || 'Desconocido'}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">{member.email}</div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as MemberRole)}
                        disabled={rowBusy}
                        className="bg-transparent border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50"
                      >
                        <option value="student">Alumno</option>
                        <option value="teacher">Profesor</option>
                        <option value="academy_admin">Admin</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(member.id, !member.is_active)}
                        disabled={rowBusy}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all hover:opacity-80 active:scale-95 disabled:opacity-50 ${member.is_active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                          }`}
                      >
                        {rowToggling
                          ? 'Guardando...'
                          : member.is_active
                            ? 'Activo'
                            : 'Inactivo'}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openDeleteConfirm(member)}
                        disabled={rowBusy}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors disabled:opacity-50"
                        title="Eliminar miembro"
                      >
                        {rowDeleting ? (
                          <span className="text-[10px] font-black uppercase tracking-wider">
                            Borrando...
                          </span>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" x2="10" y1="11" y2="17" />
                            <line x1="14" x2="14" y1="11" y2="17" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDeleteMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/10 bg-white dark:bg-slate-900 shadow-2xl p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-2">
              Eliminar miembro
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
              Vas a eliminar este miembro de la academia:
            </p>

            <div className="mb-6 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-4 py-3">
              <div className="font-bold text-slate-900 dark:text-slate-100">
                {confirmDeleteMember.full_name || 'Desconocido'}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {confirmDeleteMember.email}
              </div>
            </div>

            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-6">
              Esta acción eliminará su membership de esta academia.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                disabled={deletingMemberId !== null}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deletingMemberId !== null}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 disabled:opacity-50 min-w-[120px]"
              >
                {deletingMemberId ? 'Borrando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}