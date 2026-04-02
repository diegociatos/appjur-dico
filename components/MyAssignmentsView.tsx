
import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, Clock, AlertTriangle, ArrowRight, Zap, Target, ShieldAlert,
  Calendar, FileText, Info, Send, X, ShieldCheck, Trophy, Sparkles
} from 'lucide-react';
import { Assignment, AssignmentStatus, AssignmentPriority } from '../types';

interface MyAssignmentsViewProps {
  assignments: Assignment[];
  onComplete: (id: string, evidence: string) => void;
}

const MyAssignmentsView: React.FC<MyAssignmentsViewProps> = ({ assignments, onComplete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [evidence, setEvidence] = useState('');

  const sorted = useMemo(() => {
    return [...assignments].sort((a,b) => {
      // Prioriza Pendentes Urgentes
      if (a.status === 'PENDENTE' && b.status !== 'PENDENTE') return -1;
      if (a.status !== 'PENDENTE' && b.status === 'PENDENTE') return 1;
      return new Date(a.prazo).getTime() - new Date(b.prazo).getTime();
    });
  }, [assignments]);

  const getPriorityColor = (p: AssignmentPriority) => {
    switch (p) {
      case 'Urgente': return 'border-red-500 shadow-red-100';
      case 'Alta': return 'border-orange-500 shadow-orange-100';
      case 'Média': return 'border-blue-500 shadow-blue-100';
      default: return 'border-gray-200';
    }
  };

  const handleOpenComplete = (a: Assignment) => {
    setSelectedAssignment(a);
    setEvidence('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAssignment && evidence.trim()) {
      onComplete(selectedAssignment.id, evidence);
      setIsModalOpen(false);
    }
  };

  const getTimeLeft = (prazo: string) => {
    const diff = new Date(prazo).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: 'VENCIDO', color: 'text-red-600' };
    if (days === 0) return { label: 'VENCE HOJE', color: 'text-orange-600 font-black animate-pulse' };
    return { label: `Faltam ${days} dias`, color: 'text-gray-400' };
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20 font-serif-elegant">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 className="text-4xl font-bold text-[#8B1538] leading-tight">Meus Compromissos</h1>
          <p className="text-[#2D3748] mt-2 font-medium text-[16px] opacity-70 italic">Gerenciamento tático de entregas e pontuação Elite</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-8 py-5 rounded-[2rem] border border-gray-100 shadow-sm">
           <div className="flex flex-col items-center border-r border-gray-100 pr-8">
              <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Pendentes</span>
              <span className="text-2xl font-bold text-[#2D3748]">{assignments.filter(a => a.status === 'PENDENTE').length}</span>
           </div>
           <div className="flex flex-col items-center pl-4">
              <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Score Potencial</span>
              <span className="text-2xl font-bold text-green-600">+{assignments.filter(a => a.status === 'PENDENTE').reduce((acc, a) => acc + a.pontos, 0)}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
        {sorted.map(a => {
          const timeLeft = getTimeLeft(a.prazo);
          return (
            <div key={a.id} className={`bg-white rounded-[2.5rem] border-l-[12px] shadow-lg shadow-black/[0.03] transition-all hover:scale-[1.02] overflow-hidden flex flex-col ${getPriorityColor(a.prioridade)}`}>
               <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                     <span className="text-[9px] font-black bg-gray-50 border border-gray-100 px-3 py-1 rounded-full text-gray-400 uppercase tracking-widest">{a.categoria}</span>
                     <span className={`text-[10px] font-black uppercase tracking-widest ${timeLeft.color}`}>{timeLeft.label}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#2D3748] mb-4 leading-tight group-hover:text-[#8B1538] transition-colors">{a.titulo}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed font-serif italic line-clamp-3 mb-8">{a.descricao}</p>
                  
                  <div className="mt-auto grid grid-cols-2 gap-4 py-6 border-t border-gray-50">
                     <div>
                        <span className="block text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Recompensa</span>
                        <div className="flex items-center gap-1.5 text-green-600 font-bold">
                           <Zap size={14}/> +{a.pontos} pts
                        </div>
                     </div>
                     <div>
                        <span className="block text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Penalidade</span>
                        <div className="flex items-center gap-1.5 text-red-500 font-bold opacity-60">
                           <ShieldAlert size={14}/> -{a.penalidade} pts
                        </div>
                     </div>
                  </div>
               </div>

               <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                  {a.status === 'PENDENTE' ? (
                    <button 
                      onClick={() => handleOpenComplete(a)}
                      className="w-full bg-[#8B1538] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#8B1538]/20 hover:bg-[#72112d] transition-all flex items-center justify-center gap-2"
                    >
                       Marcar como Concluído <ArrowRight size={14}/>
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-3.5">
                       <div className={`w-2 h-2 rounded-full ${a.status === 'APROVADO' ? 'bg-green-500' : a.status === 'REPROVADO' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`} />
                       <span className={`text-[10px] font-black uppercase tracking-widest ${a.status === 'APROVADO' ? 'text-green-600' : a.status === 'REPROVADO' ? 'text-red-600' : 'text-amber-600'}`}>
                          {a.status.replace('_', ' ')}
                       </span>
                    </div>
                  )}
               </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
           <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-30 text-center">
              <Sparkles size={64} className="text-gray-300 mb-6"/>
              <h3 className="text-2xl font-serif font-bold">Portfólio Limpo!</h3>
              <p className="text-sm font-serif italic">Nenhum compromisso pendente no momento.</p>
           </div>
        )}
      </div>

      {/* Modal de Conclusão */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><CheckCircle2 size={24}/></div>
                    <h3 className="text-lg font-serif font-bold text-[#8B1538]">Concluir Entrega</h3>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={28}/></button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                 <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase block mb-1">Item selecionado</span>
                    <p className="text-sm font-bold text-gray-700 font-serif">"{selectedAssignment?.titulo}"</p>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Comentário / Evidência da Conclusão *</label>
                    <textarea 
                      required value={evidence} onChange={e => setEvidence(e.target.value)}
                      placeholder="Relate como o trabalho foi realizado e onde o arquivo final pode ser encontrado..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] p-6 text-sm h-40 resize-none outline-none focus:ring-4 focus:ring-[#8B1538]/5 transition-all"
                    />
                 </div>
                 <div className="flex gap-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:bg-gray-50">Cancelar</button>
                    <button type="submit" className="flex-1 py-4 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase shadow-xl flex items-center justify-center gap-2">
                       <Send size={16}/> Enviar Auditoria
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default MyAssignmentsView;
