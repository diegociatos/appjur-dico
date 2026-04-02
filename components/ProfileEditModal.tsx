
import React, { useState, useRef } from 'react';
import { X, Camera, Save, Mail, Phone, Shield, Calendar, Award, Bell, Eye, EyeOff } from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import Avatar from './Avatar';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updatedUser: UserProfile) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>({ ...user });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, fotoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[1000] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 my-auto">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-[2.5rem]">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#8B1538]">Meu Perfil</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Identidade Digital Ciatos</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2 transition-colors"><X size={28} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          {/* Seção 1: Foto */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <Avatar nome={formData.nome} fotoUrl={formData.fotoUrl} size="2xl" className="ring-4 ring-[#8B1538]/10" />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-3 bg-[#8B1538] text-white rounded-full shadow-xl hover:scale-110 transition-all border-4 border-white"
              >
                <Camera size={20} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase">Clique no ícone para alterar sua foto (Máx 2MB)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Nome Completo</label>
              <input 
                type="text" required value={formData.nome} 
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">E-mail Corporativo</label>
              <div className="relative">
                <input 
                  type="email" required value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-5 py-4 text-sm font-bold outline-none"
                />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Cargo / Função</label>
              <select 
                value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value as UserRole})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none"
              >
                <option value="Advogado">Advogado</option>
                {/* Fix: changed 'Gestora' to 'Gestor' as it's the correct value for UserRole type */}
                <option value="Gestor">Gestora</option>
                <option value="Administrador">Administrador</option>
                <option value="Estagiário">Estagiário</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Telefone</label>
              <div className="relative">
                <input 
                  type="text" value={formData.telefone}
                  onChange={e => setFormData({...formData, telefone: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-5 py-4 text-sm font-bold outline-none"
                />
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100">
             <h3 className="text-sm font-serif font-bold text-gray-800 mb-6 flex items-center gap-2"><Shield size={18} className="text-[#8B1538]"/> Dados Profissionais</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">OAB</label>
                   <input type="text" value={formData.oab} onChange={e => setFormData({...formData, oab: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Admissão</label>
                   <input type="date" value={formData.dataAdmissao} onChange={e => setFormData({...formData, dataAdmissao: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Especialidade</label>
                   <input type="text" value={formData.especialidade} onChange={e => setFormData({...formData, especialidade: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                </div>
             </div>
          </div>

          <div className="pt-8 border-t border-gray-100">
             <h3 className="text-sm font-serif font-bold text-gray-800 mb-6 flex items-center gap-2"><Bell size={18} className="text-[#8B1538]"/> Preferências</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                   <div>
                      <p className="text-xs font-bold text-gray-700">Notificações por E-mail</p>
                      <p className="text-[10px] text-gray-400 uppercase">Alertas de prazos e validações</p>
                   </div>
                   <button 
                    type="button"
                    onClick={() => setFormData({...formData, notificacoesEmail: !formData.notificacoesEmail})}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.notificacoesEmail ? 'bg-green-500' : 'bg-gray-300'}`}
                   >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.notificacoesEmail ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                   <div>
                      <p className="text-xs font-bold text-gray-700">Visibilidade no Ranking</p>
                      <p className="text-[10px] text-gray-400 uppercase">Exibir pontuação na Elite Ciatos</p>
                   </div>
                   <button 
                    type="button"
                    onClick={() => setFormData({...formData, exibirNoRanking: !formData.exibirNoRanking})}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.exibirNoRanking ? 'bg-[#8B1538]' : 'bg-gray-300'}`}
                   >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.exibirNoRanking ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>
             </div>
          </div>

          <div className="pt-10 flex gap-6">
            <button type="button" onClick={onClose} className="flex-1 py-5 border-2 border-gray-100 rounded-2xl font-black text-[10px] uppercase text-gray-400 hover:bg-gray-50 transition-all">Cancelar</button>
            <button type="submit" className="flex-1 py-5 bg-[#8B1538] text-white rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-[#8B1538]/20 flex items-center justify-center gap-3">
              <Save size={18} /> Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
