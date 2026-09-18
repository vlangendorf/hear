import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { getStoredUsers, saveUsers } from '../auth/authService';
import { X, Users, UserPlus, Shield, Eye, Trash2, KeyRound, Check, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface UserManagementModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onToast,
}) => {
  const { isParchment } = useTheme();
  const [users, setUsers] = useState<User[]>(() => getStoredUsers());
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('VIEWER');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUser = newUsername.trim().toLowerCase();
    if (!cleanUser) {
      setErrorMessage('Informe o nome de usuário.');
      return;
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUser)) {
      setErrorMessage('Este nome de usuário já está em uso.');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: cleanUser,
      name: newName.trim() || cleanUser,
      email: newEmail.trim() || `${cleanUser}@hearmearoar.com`,
      role: newRole,
      password: newPassword.trim() || '123456',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [...users, newUser];
    setUsers(updated);
    saveUsers(updated);

    onToast(`Usuário "${newUser.username}" criado com perfil ${newUser.role}!`);
    setIsAdding(false);
    setNewUsername('');
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('VIEWER');
  };

  const handleToggleRole = (userId: string) => {
    if (userId === currentUser.id) {
      onToast('Você não pode alterar o próprio perfil de administrador.');
      return;
    }

    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextRole: UserRole = u.role === 'ADMIN' ? 'VIEWER' : 'ADMIN';
        return { ...u, role: nextRole };
      }
      return u;
    });

    setUsers(updated);
    saveUsers(updated);
    onToast('Permissão do usuário atualizada com sucesso!');
  };

  const handleDeleteUser = (userId: string, username: string) => {
    if (userId === currentUser.id) {
      onToast('Você não pode excluir sua própria conta.');
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o usuário "${username}"?`)) {
      const updated = users.filter((u) => u.id !== userId);
      setUsers(updated);
      saveUsers(updated);
      onToast(`Usuário "${username}" removido.`);
    }
  };

  const handleResetPassword = (userId: string, username: string) => {
    const newPass = prompt(`Digite a nova senha para o usuário "${username}":`, '123456');
    if (!newPass || !newPass.trim()) return;

    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, password: newPass.trim() };
      }
      return u;
    });

    setUsers(updated);
    saveUsers(updated);
    onToast(`Senha de "${username}" atualizada com sucesso!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border ${
          isParchment
            ? 'parchment-card border-[#c09761] text-[#3d2008]'
            : 'bg-slate-900 border-slate-700/80 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isParchment
              ? 'bg-[#ecd8b5] border-[#c09761]'
              : 'bg-gradient-to-r from-slate-800 to-indigo-950/80 border-slate-700/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                isParchment
                  ? 'bg-[#ecd1a7] border-[#b8860b] text-[#7a4417]'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              }`}
            >
              <Users size={18} />
            </div>
            <div>
              <h2
                className={`text-base font-bold flex items-center gap-2 ${
                  isParchment ? 'text-[#3b1f06] font-serif' : 'text-white'
                }`}
              >
                Gerenciamento de Usuários & Permissões
              </h2>
              <p className={`text-xs ${isParchment ? 'text-[#7d532b]' : 'text-slate-400'}`}>
                Controle quem tem acesso total de Edição (Admin) ou Somente Visualização (Viewer)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isParchment
                ? 'text-[#7d532b] hover:text-[#3d2008] hover:bg-[#dfc49c]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Top Bar with Add User Button */}
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isParchment ? 'text-[#693f18]' : 'text-slate-300'
              }`}
            >
              Usuários Registrados ({users.length})
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                isParchment
                  ? 'bg-gradient-to-r from-[#7a4417] to-[#9c5b23] text-[#fff9ee] hover:brightness-110 border border-[#c5994f]'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <UserPlus size={14} />
              <span>{isAdding ? 'Cancelar Novo' : 'Novo Usuário'}</span>
            </button>
          </div>

          {/* Add User Form Drawer */}
          {isAdding && (
            <form
              onSubmit={handleCreateUser}
              className={`p-4 rounded-xl border space-y-3 animate-in fade-in duration-150 ${
                isParchment
                  ? 'bg-[#f7ebda] border-[#cbb085]'
                  : 'bg-slate-950/90 border-amber-500/40'
              }`}
            >
              <div
                className={`flex items-center gap-2 text-xs font-bold border-b pb-2 ${
                  isParchment ? 'text-[#7a4417] border-[#cbb085]' : 'text-amber-400 border-slate-800'
                }`}
              >
                <UserPlus size={14} />
                <span>Cadastrar Novo Usuário</span>
              </div>

              {errorMessage && (
                <div className="p-2 rounded-lg bg-rose-950 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-[11px] font-bold mb-1 ${
                      isParchment ? 'text-[#5a3311]' : 'text-slate-400'
                    }`}
                  >
                    Nome de Usuário (Login) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Ex: tank_leader"
                    className={`w-full px-3 py-1.5 rounded-lg text-xs focus:outline-none ${
                      isParchment
                        ? 'bg-[#fffcf4] border border-[#c29c67] text-[#4d2807] placeholder-[#a68662] focus:border-[#7a4417]'
                        : 'bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-400'
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-[11px] font-bold mb-1 ${
                      isParchment ? 'text-[#5a3311]' : 'text-slate-400'
                    }`}
                  >
                    Nome Completo / Exibição
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    className={`w-full px-3 py-1.5 rounded-lg text-xs focus:outline-none ${
                      isParchment
                        ? 'bg-[#fffcf4] border border-[#c29c67] text-[#4d2807] placeholder-[#a68662] focus:border-[#7a4417]'
                        : 'bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-400'
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-[11px] font-bold mb-1 ${
                      isParchment ? 'text-[#5a3311]' : 'text-slate-400'
                    }`}
                  >
                    Senha de Acesso *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ex: 123456"
                    className={`w-full px-3 py-1.5 rounded-lg text-xs focus:outline-none ${
                      isParchment
                        ? 'bg-[#fffcf4] border border-[#c29c67] text-[#4d2807] placeholder-[#a68662] focus:border-[#7a4417]'
                        : 'bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-400'
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-[11px] font-bold mb-1 ${
                      isParchment ? 'text-[#5a3311]' : 'text-slate-400'
                    }`}
                  >
                    Nível de Permissão *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs focus:outline-none ${
                      isParchment
                        ? 'bg-[#fffcf4] border border-[#c29c67] text-[#4d2807] focus:border-[#7a4417]'
                        : 'bg-slate-900 border border-slate-700 text-white focus:border-amber-400'
                    }`}
                  >
                    <option value="VIEWER">Visualizador (Somente Leitura)</option>
                    <option value="ADMIN">Administrador / Editor (Acesso Total)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className={`px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                    isParchment ? 'text-[#7d532b] hover:text-[#3d2008]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 font-bold text-xs rounded-lg shadow-sm cursor-pointer ${
                    isParchment
                      ? 'bg-gradient-to-r from-[#7a4417] to-[#9c5b23] text-[#fff9ee] hover:brightness-110 border border-[#c5994f]'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          )}

          {/* User List Table */}
          <div
            className={`border rounded-xl overflow-hidden ${
              isParchment
                ? 'bg-[#fffdf7] border-[#cbb085]'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <table className="w-full text-left text-xs">
              <thead
                className={`uppercase font-bold text-[10px] tracking-wider ${
                  isParchment
                    ? 'bg-[#eedbbd] text-[#5e320d]'
                    : 'bg-slate-800/80 text-slate-400'
                }`}
              >
                <tr>
                  <th className="py-2.5 px-3">Usuário</th>
                  <th className="py-2.5 px-3">Nome</th>
                  <th className="py-2.5 px-3">Permissão</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isParchment ? 'divide-[#ecd8b5]' : 'divide-slate-800'}`}>
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <tr
                      key={u.id}
                      className={`transition-colors ${
                        isParchment ? 'hover:bg-[#f7ebda]' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <td className={`py-2.5 px-3 font-mono font-bold ${isParchment ? 'text-[#3d2008]' : 'text-slate-200'}`}>
                        <div className="flex items-center gap-1.5">
                          <span>{u.username}</span>
                          {isCurrent && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${
                                isParchment
                                  ? 'bg-[#eed7b3] text-[#5e320d] border-[#cbb085]'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              }`}
                            >
                              Você
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`py-2.5 px-3 ${isParchment ? 'text-[#5a3311]' : 'text-slate-300'}`}>{u.name}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.role === 'ADMIN'
                              ? isParchment
                                ? 'bg-[#eed7b3] text-[#69390e] border-[#c09761]'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : isParchment
                                ? 'bg-[#e2edf4] text-[#16435c] border-[#95bed5]'
                                : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          }`}
                        >
                          {u.role === 'ADMIN' ? <Shield size={10} /> : <Eye size={10} />}
                          {u.role === 'ADMIN' ? 'ADMINISTRADOR' : 'VISUALIZADOR'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleToggleRole(u.id)}
                              className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-colors cursor-pointer ${
                                isParchment
                                  ? 'bg-[#eedbc0] hover:bg-[#e4cbab] text-[#542d0a] border-[#cbb085]'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                              }`}
                              title={`Alterar para ${u.role === 'ADMIN' ? 'Visualizador' : 'Administrador'}`}
                            >
                              Alternar Perfil
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleResetPassword(u.id, u.username)}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              isParchment
                                ? 'bg-[#eedbc0] hover:bg-[#e4cbab] text-[#542d0a]'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-300'
                            }`}
                            title="Alterar senha"
                          >
                            <KeyRound size={12} />
                          </button>
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                isParchment
                                  ? 'bg-[#eedbc0] hover:bg-rose-100 text-[#542d0a] hover:text-rose-800'
                                  : 'bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300'
                              }`}
                              title="Excluir usuário"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex justify-end ${
            isParchment ? 'bg-[#ecd8b5] border-[#c09761]' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 font-bold text-xs rounded-xl transition-colors cursor-pointer ${
              isParchment
                ? 'bg-gradient-to-r from-[#7a4417] to-[#9c5b23] text-[#fff9ee] hover:brightness-110 border border-[#c5994f]'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
