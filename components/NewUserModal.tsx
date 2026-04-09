
import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield, Calendar, Award, Lock, Copy, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { UserProfile, UserRole, UserStatus } from '../types';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserProfile, password?: string) => void | Promise<void>;
  userToEdit?: UserProfile;
}

const NewUserModal: React.FC<NewUserModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cargo: 'Advogado' as UserRole,
    telefone: '',
    oab: '',
    dataAdmissao: new Date().toISOString().split('T')[0],
    especialidade: '',
    enviarEmail: true
  });

  const [provisionalPassword, setProvisionalPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
    let pass = "Ciatos@";
    for (let i = 0; i < 3; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    return pass;
  };

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setFormData({
          nome: userToEdit.nome,
          email: userToEdit.email,
          cargo: userToEdit.cargo,
          telefone: userToEdit.telefone || '',
          oab: userToEdit.oab || '',
          dataAdmissao: userToEdit.dataAdmissao || new Date().toISOString().split('T')[0],
          especialidade: userToEdit.especialidade || '',
          enviarEmail: false
        });
        setProvisionalPassword(''); // Não mostra senha ao editar
      } else {
        setFormData({
          nome: '',
          email: '',
          cargo: 'Advogado',
          telefone: '',
          oab: '',
          dataAdmissao: new Date().toISOString().split('T')[0],
          especialidade: '',
          enviarEmail: true
        });
        setProvisionalPassword(generatePassword());
      }
      setErrors({});
    }
  }, [isOpen, userToEdit]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(provisionalPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'E-mail inválido';
    if (formData.cargo === 'Advogado' && !formData.oab) newErrors.oab = 'OAB é obrigatória para advogados';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const savedUser: UserProfile = {
      id: userToEdit ? userToEdit.id : `user_${Date.now()}`,
      ...formData,
      status: userToEdit ? userToEdit.status : 'Aguardando Primeiro Acesso',
      dataCadastro: userToEdit ? userToEdit.dataCadastro : new Date().toLocaleDateString('pt-BR'),
      notificacoesEmail: userToEdit ? userToEdit.notificacoesEmail : true,
      exibirNoRanking: userToEdit ? userToEdit.exibirNoRanking : true,
      requiresPasswordChange: userToEdit ? userToEdit.requiresPasswordChange : true,
      fotoUrl: userToEdit?.fotoUrl
    };

    await Promise.resolve(onSave(savedUser, userToEdit ? undefined : provisionalPassword));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#8B1538]/5 rounded-2xl flex items-center justify-center text-[#8B1538]">
              {userToEdit ? <Save size={24} /> : <User size={24} />}
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#8B1538]">
                {userToEdit ? 'Editar Usuário' : 'Provisionar Novo Usuário'}
              </h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {userToEdit ? 'Atualização de perfil e acesso' : 'Criação de identidade e acesso'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#8B1538] p-2 transition-all hover:bg-gray-50 rounded-full"><X size={28} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
          {/* Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Nome Completo *</label>
              <input 
                type="text" required value={formData.nome} 
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className={`w-full bg-gray-50 border rounded-xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5 transition-all ${errors.nome ? 'border-red-300' : 'border-gray-100'}`}
              />
              {errors.nome && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.nome}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">E-mail Corporativo *</label>
              <div className="relative">
                <input 
                  type="email" required value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className={`w-full bg-gray-50 border rounded-xl pl-12 pr-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5 transition-all ${errors.email ? 'border-red-300' : 'border-gray-100'}`}
                />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              </div>
              {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Cargo / Perfil de Acesso</label>
              <select 
                value={formData.cargo} 
                onChange={e => setFormData({...formData, cargo: e.target.value as UserRole})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none cursor-pointer"
              >
                <option value="Advogado">Advogado</option>
                <option value="Gestor">Gestora</option>
                <option value="Administrador">Administrador</option>
                <option value="Estagiário">Estagiário</option>
                <option value="Financeiro">Financeiro</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Telefone</label>
              <div className="relative">
                <input 
                  type="text" value={formData.telefone}
                  onChange={e => setFormData({...formData, telefone: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-5 py-4 text-sm font-bold outline-none"
                  placeholder="(00) 00000-0000"
                />
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              </div>
            </div>
          </div>

          {/* Dados Profissionais */}
          <div className="pt-6 border-t border-gray-50 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Nº OAB {formData.cargo === 'Advogado' && '*'}</label>
              <input 
                type="text" value={formData.oab} 
                onChange={e => setFormData({...formData, oab: e.target.value})}
                className={`w-full bg-gray-50 border rounded-xl px-5 py-3.5 text-sm font-bold outline-none ${errors.oab ? 'border-red-300' : 'border-gray-100'}`}
              />
              {errors.oab && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.oab}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Admissão</label>
              <input 
                type="date" value={formData.dataAdmissao} 
                onChange={e => setFormData({...formData, dataAdmissao: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-bold outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Especialidade</label>
              <input 
                type="text" value={formData.especialidade} 
                onChange={e => setFormData({...formData, especialidade: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-bold outline-none"
                placeholder="Ex: Cível, Tributário"
              />
            </div>
          </div>

          {/* Credenciais Provisórias (Apenas para novos usuários) */}
          {!userToEdit && (
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 space-y-6">
              <div className="flex items-center gap-3 text-[#8B1538] mb-2">
                 <Lock size={18} />
                 <h4 className="text-[11px] font-black uppercase tracking-widest">Segurança & Credenciais</h4>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 items-center">
                 <div className="flex-1 space-y-2 w-full">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Senha Temporária Gerada</label>
                    <div className="flex gap-2">
                       <div className="flex-1 bg-white border border-gray-200 rounded-xl px-6 py-4 text-lg font-mono font-bold tracking-widest text-[#8B1538] shadow-sm select-all">
                          {provisionalPassword}
                       </div>
                       <button 
                         type="button"
                         onClick={handleCopy}
                         className={`px-5 rounded-xl border transition-all flex items-center justify-center ${copied ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-400 hover:text-[#8B1538] hover:border-[#8B1538]'}`}
                       >
                         {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                       </button>
                    </div>
                 </div>

                 <div className="flex items-center gap-4 py-4 px-6 bg-white border border-gray-200 rounded-[2rem] shrink-0">
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, enviarEmail: !formData.enviarEmail})}
                      className={`w-12 h-6 rounded-full transition-all relative ${formData.enviarEmail ? 'bg-green-50' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.enviarEmail ? 'left-7' : 'left-1'}`} />
                    </button>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-700 uppercase tracking-tighter">Enviar credenciais</span>
                      <span className="text-[9px] text-gray-400 uppercase font-bold">Por e-mail automático</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                 <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                 <p className="text-[10px] font-serif font-medium text-amber-900 leading-relaxed italic">
                   O usuário será obrigado a criar uma nova senha pessoal no primeiro acesso ao sistema.
                 </p>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 bg-gray-50 flex gap-6">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-5 border-2 border-gray-200 rounded-2xl font-black text-[11px] uppercase tracking-widest text-gray-400 hover:bg-white hover:text-gray-600 transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-1 py-5 bg-[#8B1538] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#8B1538]/20 hover:bg-[#72112d] transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {userToEdit ? 'Atualizar Usuário' : 'Cadastrar e Habilitar Acesso'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewUserModal;
