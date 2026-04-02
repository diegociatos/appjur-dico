
import React, { useState } from 'react';
import { X, CalendarCheck2, Target, Scale, Zap, Info, Save, ShieldAlert } from 'lucide-react';
import { Assignment, UserProfile, AssignmentCategory, AssignmentPriority } from '../types';

interface NewAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  onSave: (assignment: Assignment) => void;
}

const NewAssignmentModal: React.FC<NewAssignmentModalProps> = ({ isOpen, onClose, users, onSave }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    advogadoId: '',
    prazo: '',
    pontos: 50,
    categoria: 'Peça Processual' as AssignmentCategory,
    prioridade: 'Média' as AssignmentPriority
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.advogadoId || !formData.prazo) return;

    const lawyer = users.find(u => u.id === formData.advogadoId);

    const newAssignment: Assignment = {
      ...formData,
      id: `as_${Date.now()}`,
      advogadoNome: lawyer?.nome || 'Advogado',
      penalidade: formData.pontos * 2,
      status: 'PENDENTE',
      criadoEm: new Date().toISOString()
    };

    onSave(newAssignment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#8B1538]/5 rounded-2xl flex items-center justify-center text-[#8B1538]"><CalendarCheck2 size={24} /></div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#8B1538]">Atribuir Compromisso</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gestão de Demandas Táticas</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2"><X size={28} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Título do Compromisso *</label>
              <input 
                type="text" required value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})}
                placeholder="Ex: Elaborar parecer estratégico sobre caso X"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5"
              />
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Instruções Detalhadas *</label>
              <textarea 
                required value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-5 text-sm h-32 resize-none outline-none focus:ring-4 focus:ring-[#8B1538]/5"
                placeholder="Descreva o escopo e os critérios de aceitação..."
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Advogado Responsável *</label>
                 <select 
                   required value={formData.advogadoId} onChange={e => setFormData({...formData, advogadoId: e.target.value})}
                   className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none"
                 >
                    <option value="">Selecione...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Prazo de Conclusão *</label>
                 <input 
                    type="date" required value={formData.prazo} onChange={e => setFormData({...formData, prazo: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none"
                 />
              </div>
           </div>

           <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1 flex items-center gap-2"><Zap size={14} className="text-[#8B1538]"/> Pontuação Potencial</label>
                    <input 
                      type="number" value={formData.pontos} onChange={e => setFormData({...formData, pontos: Number(e.target.value)})}
                      className="w-full bg-white border border-gray-100 rounded-xl px-5 py-4 text-xl font-serif font-black text-green-600 outline-none"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1 flex items-center gap-2"><ShieldAlert size={14} className="text-red-500"/> Risco de Penalidade</label>
                    <div className="w-full bg-red-50 border border-red-100 rounded-xl px-5 py-4 text-xl font-serif font-black text-red-600 flex items-center justify-between opacity-80 cursor-not-allowed">
                       -{formData.pontos * 2} <span className="text-[8px] font-black uppercase tracking-tighter">2x PONTOS</span>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Categoria</label>
                    <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value as AssignmentCategory})} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-xs font-bold outline-none">
                       {['Peça Processual', 'Reunião', 'Consultoria', 'Administrativo', 'Outro'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Prioridade</label>
                    <select value={formData.prioridade} onChange={e => setFormData({...formData, prioridade: e.target.value as AssignmentPriority})} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-xs font-bold outline-none">
                       {['Baixa', 'Média', 'Alta', 'Urgente'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                 </div>
              </div>
           </div>
        </form>

        <div className="p-10 border-t border-gray-100 bg-gray-50 flex gap-6">
          <button type="button" onClick={onClose} className="flex-1 py-5 border-2 border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-white transition-all">Cancelar</button>
          <button onClick={handleSubmit} className="flex-1 py-5 bg-[#8B1538] text-white rounded-2xl font-black text-[10px] uppercase shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
             <Save size={18} /> Criar Compromisso
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAssignmentModal;
