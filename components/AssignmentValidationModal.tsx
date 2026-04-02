
import React, { useState } from 'react';
import { X, ShieldCheck, FileText, User, Calendar, Zap, ShieldAlert, CheckCircle2, XCircle, ArrowRight, AlertCircle, Send } from 'lucide-react';
import { Assignment, AssignmentStatus } from '../types';

interface AssignmentValidationModalProps {
  isOpen: boolean;
  assignment: Assignment;
  onClose: () => void;
  // Fix: changed 'APROVADO' | 'REPROVADO' to AssignmentStatus for better type consistency
  onAudit: (id: string, decision: AssignmentStatus, reason?: string) => void;
}

const AssignmentValidationModal: React.FC<AssignmentValidationModalProps> = ({ isOpen, assignment, onClose, onAudit }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setIsLoading(true);
    // Simulação de delay para elegância visual
    setTimeout(() => {
      onAudit(assignment.id, 'APROVADO');
      alert('✅ Compromisso validado! Pontos creditados ao advogado.');
      setIsLoading(false);
      onClose();
    }, 500);
  };

  const handleReprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
        alert('Por favor, informe o motivo da reprovação.');
        return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
        onAudit(assignment.id, 'REPROVADO', rejectionReason);
        alert('❌ Compromisso reprovado. Penalidade aplicada ao ranking.');
        setIsLoading(false);
        onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
                <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#8B1538]">Curadoria Tática</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Validar Entrega: {assignment.advogadoNome}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-red-500 p-2 transition-all"><X size={28} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
           {/* Detalhes da Tarefa */}
           <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">{assignment.categoria}</span>
                <span className="flex items-center gap-2 text-[#8B1538]"><Zap size={14}/> {assignment.pontos} PONTOS EM JOGO</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#2D3748] leading-tight">"{assignment.titulo}"</h3>
              <div className="bg-gray-50/50 p-6 rounded-2xl border-l-4 border-[#8B1538]/20 italic text-sm text-gray-500 font-serif">
                "{assignment.descricao}"
              </div>
           </div>

           {/* Datas e Prazos */}
           <div className="grid grid-cols-2 gap-8 bg-gray-50/30 p-8 rounded-[2rem] border border-gray-100">
              <div className="space-y-1">
                 <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> Prazo Estipulado</span>
                 <p className="text-sm font-bold text-gray-700">{new Date(assignment.prazo).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                 <span className="text-[9px] font-black text-green-400 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={12}/> Data da Entrega</span>
                 <p className="text-sm font-bold text-green-700">{assignment.concluidoEm ? new Date(assignment.concluidoEm).toLocaleDateString() : 'Não informada'}</p>
              </div>
           </div>

           {/* Evidência do Advogado */}
           <div className="space-y-4">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><FileText size={16}/> Relato de Conclusão (Advogado)</h4>
              <div className="bg-white border-2 border-dashed border-gray-200 p-8 rounded-[2.5rem] text-[15px] font-serif font-medium text-gray-700 leading-relaxed shadow-inner italic">
                 "{assignment.evidenciaAdvogado || 'Nenhuma evidência textual fornecida.'}"
              </div>
           </div>

           {/* Formulário de Reprovação (Condicional) */}
           {showRejectionForm && (
             <form onSubmit={handleReprove} className="animate-in slide-in-from-top-4 space-y-4 bg-red-50/50 p-8 rounded-[2.5rem] border border-red-100">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertCircle size={18}/>
                    <label className="text-[11px] font-black uppercase tracking-widest block">Motivo da Reprovação (Obrigatório)</label>
                </div>
                {/* Fixed: setReason changed to setRejectionReason to match state */}
                <textarea 
                  required 
                  disabled={isLoading}
                  value={rejectionReason} 
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Justifique por que esta entrega foi invalidada técnica ou operacionalmente..."
                  className="w-full bg-white border border-red-200 rounded-3xl p-6 text-sm h-32 outline-none focus:ring-4 focus:ring-red-500/5 transition-all font-serif"
                />
                <div className="flex items-center gap-3 p-4 bg-white/50 rounded-xl border border-red-100">
                    <ShieldAlert size={20} className="text-red-500"/>
                    <p className="text-[10px] font-black text-red-700 uppercase leading-tight">ATENÇÃO: ESTA AÇÃO SUBTRAIRÁ -{assignment.penalidade} PONTOS DO ADVOGADO (DOBRO DO PESO ORIGINAL).</p>
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                   {isLoading ? 'Processando...' : 'Confirmar Reprovação e Penalizar'}
                </button>
             </form>
           )}
        </div>

        {/* Rodapé de Ações Principais */}
        <div className="p-10 border-t border-gray-100 bg-gray-50">
           {!showRejectionForm ? (
             <div className="flex gap-6">
                <button 
                  onClick={() => setShowRejectionForm(true)}
                  disabled={isLoading}
                  className="flex-1 py-5 border-2 border-red-200 text-red-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                   <XCircle size={18}/> Reprovar Entrega
                </button>
                <button 
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="flex-1 py-5 bg-green-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-green-600/20 flex items-center justify-center gap-2 hover:bg-green-700 active:scale-95 transition-all"
                >
                   {isLoading ? 'Processando...' : <><CheckCircle2 size={18}/> Aprovar e Pontuar</>}
                </button>
             </div>
           ) : (
             <button 
                onClick={() => setShowRejectionForm(false)} 
                className="w-full py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-[#8B1538] transition-all flex items-center justify-center gap-2"
             >
                <ArrowRight className="rotate-180" size={14}/> Voltar às opções de decisão
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentValidationModal;
