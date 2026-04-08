
import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Key, 
  UserX, 
  UserCheck, 
  ShieldCheck,
  Calendar,
  X,
  Copy,
  CheckCircle2,
  ArrowUpDown,
  AlertCircle
} from 'lucide-react';
import { UserProfile, UserRole, UserStatus } from '../types';
import Avatar from './Avatar';
import NewUserModal from './NewUserModal';

interface UsersViewProps {
  users: UserProfile[];
  onAddUser: (user: UserProfile, password?: string) => Promise<boolean>;
  onUpdateUser: (user: UserProfile) => void;
  onResetPassword: (userId: string) => void;
}

const UsersView: React.FC<UsersViewProps> = ({ users, onAddUser, onUpdateUser, onResetPassword }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [filterRole, setFilterRole] = useState<string>('Todos');
  const [createdUserModal, setCreatedUserModal] = useState<{ isOpen: boolean; userName: string; email: string; password: string }>({
    isOpen: false, userName: '', email: '', password: ''
  });

  // Estado para o Modal de Reset de Senha
  const [resetModalData, setResetModalData] = useState<{ isOpen: boolean; userId: string; userName: string; newPass: string }>({
    isOpen: false,
    userId: '',
    userName: '',
    newPass: ''
  });
  const [copied, setCopied] = useState(false);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'Todos' || u.cargo === filterRole;
    return matchesSearch && matchesRole;
  });

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'Inativo':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'Aguardando Primeiro Acesso':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const handleToggleStatus = (user: UserProfile) => {
    const nextStatus: UserStatus = user.status === 'Ativo' ? 'Inativo' : 'Ativo';
    onUpdateUser({ ...user, status: nextStatus });
  };

  const handleResetPasswordClick = (user: UserProfile) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
    let pass = "Ciatos@";
    for (let i = 0; i < 3; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    
    setResetModalData({
      isOpen: true,
      userId: user.id,
      userName: user.nome,
      newPass: pass
    });
    onResetPassword(user.id);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resetModalData.newPass);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#8B1538] leading-tight text-shadow-sm">Gestão de Usuários</h1>
          <p className="text-[#2D3748] mt-2 font-medium text-[16px] opacity-70 italic font-serif">Controle de acessos, permissões e governança de identidades</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="flex items-center gap-3 bg-[#8B1538] text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#8B1538]/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          Provisionar Novo Usuário
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar por nome ou e-mail..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-[#8B1538]/5 transition-all"
              />
           </div>
           
           <div className="flex items-center gap-3">
              <Filter className="text-[#8B1538]" size={18} />
              <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold outline-none cursor-pointer appearance-none"
              >
                <option value="Todos">Todos os Cargos</option>
                <option value="Administrador">Administradores</option>
                {/* Fix: changed 'Gestora' to 'Gestor' as it's the correct value for UserRole type */}
                <option value="Gestor">Gestoras</option>
                <option value="Advogado">Advogados</option>
                <option value="Estagiário">Estagiários</option>
              </select>
           </div>

           <div className="flex items-center justify-end gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">
              <ArrowUpDown size={14} /> Ordenar por nome
           </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identidade</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cargo/Perfil</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cadastrado em</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50/10 transition-colors group">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <Avatar nome={user.nome} fotoUrl={user.fotoUrl} size="md" />
                    <div className="flex flex-col">
                      <span className="text-[15px] font-serif font-bold text-[#2D3748]">{user.nome}</span>
                      <span className="text-[11px] text-gray-400 font-medium">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    {user.cargo === 'Administrador' && <ShieldCheck size={14} className="text-[#8B1538]" />}
                    <span className="text-xs font-bold text-gray-600 font-serif">{user.cargo}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tight border ${getStatusBadge(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-xs font-bold text-gray-400 font-serif">{user.dataCadastro || '—'}</span>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      title="Resetar Senha"
                      onClick={() => handleResetPasswordClick(user)}
                      className="p-3 text-gray-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                    >
                      <Key size={18} />
                    </button>
                    <button 
                      title={user.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                      onClick={() => handleToggleStatus(user)}
                      className={`p-3 rounded-xl transition-all ${user.status === 'Ativo' ? 'text-gray-300 hover:text-red-500 hover:bg-red-50' : 'text-gray-300 hover:text-green-500 hover:bg-green-50'}`}
                    >
                      {user.status === 'Ativo' ? <UserX size={18} /> : <UserCheck size={18} />}
                    </button>
                    <button 
                      onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                      className="p-3 text-gray-300 hover:text-[#8B1538] hover:bg-gray-100 rounded-xl transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-10 py-20 text-center">
                  <div className="flex flex-col items-center opacity-30">
                    <Users size={48} className="mb-4" />
                    <p className="font-serif italic text-lg">Nenhum usuário encontrado com os filtros aplicados.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <NewUserModal 
        isOpen={isModalOpen} 
        userToEdit={editingUser || undefined}
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }} 
        onSave={async (u, password) => {
          if (editingUser) {
            onUpdateUser(u);
          } else {
            const success = await onAddUser(u, password);
            if (success && password) {
              setCreatedUserModal({ isOpen: true, userName: u.nome, email: u.email, password });
            }
          }
        }} 
      />

      {/* MODAL DE FEEDBACK DE RESET DE SENHA */}
      {resetModalData.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                      <Key size={20} />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-[#8B1538]">Senha Resetada</h3>
                 </div>
                 <button onClick={() => setResetModalData(prev => ({ ...prev, isOpen: false }))} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X size={24} />
                 </button>
              </div>
              <div className="p-10 space-y-6">
                 <p className="text-sm text-gray-500 leading-relaxed font-serif italic">
                   A senha do usuário <strong>{resetModalData.userName}</strong> foi redefinida com sucesso. 
                   Forneça a nova senha provisória abaixo para o acesso.
                 </p>
                 
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Senha Temporária Gerada</label>
                    <div className="flex gap-2">
                       <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 text-lg font-mono font-bold tracking-widest text-[#8B1538] select-all">
                          {resetModalData.newPass}
                       </div>
                       <button 
                         onClick={handleCopy}
                         className={`px-5 rounded-xl border transition-all flex items-center justify-center ${copied ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-400 hover:text-[#8B1538]'}`}
                       >
                         {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                       </button>
                    </div>
                 </div>

                 <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] font-serif font-medium text-amber-900 leading-relaxed italic">
                      O usuário será forçado a criar uma nova senha pessoal no próximo login. 
                      O status da conta foi alterado para 'Aguardando Primeiro Acesso'.
                    </p>
                 </div>
              </div>
              <div className="p-8 bg-gray-50 border-t border-gray-100 text-right">
                 <button 
                   onClick={() => setResetModalData(prev => ({ ...prev, isOpen: false }))}
                   className="px-8 py-3.5 bg-[#8B1538] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#8B1538]/20"
                 >
                   Entendido
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE CRIAÇÃO DE USUÁRIO */}
      {createdUserModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                      <CheckCircle2 size={20} />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-[#8B1538]">Usuário Criado</h3>
                 </div>
                 <button onClick={() => setCreatedUserModal(prev => ({ ...prev, isOpen: false }))} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X size={24} />
                 </button>
              </div>
              <div className="p-10 space-y-6">
                 <p className="text-sm text-gray-500 leading-relaxed font-serif italic">
                   O usuário <strong>{createdUserModal.userName}</strong> foi criado com sucesso. 
                   Anote as credenciais abaixo para informar ao colaborador.
                 </p>
                 
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">E-mail</label>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 text-sm font-medium text-gray-700 select-all">
                       {createdUserModal.email}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Senha Provisória</label>
                    <div className="flex gap-2">
                       <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 text-lg font-mono font-bold tracking-widest text-[#8B1538] select-all">
                          {createdUserModal.password}
                       </div>
                       <button 
                         onClick={handleCopy}
                         className={`px-5 rounded-xl border transition-all flex items-center justify-center ${copied ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-400 hover:text-[#8B1538]'}`}
                       >
                         {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                       </button>
                    </div>
                 </div>

                 <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] font-serif font-medium text-amber-900 leading-relaxed italic">
                      O usuário deverá criar uma nova senha pessoal no primeiro acesso ao sistema.
                    </p>
                 </div>
              </div>
              <div className="p-8 bg-gray-50 border-t border-gray-100 text-right">
                 <button 
                   onClick={() => setCreatedUserModal(prev => ({ ...prev, isOpen: false }))}
                   className="px-8 py-3.5 bg-[#8B1538] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#8B1538]/20"
                 >
                   Entendido
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default UsersView;
