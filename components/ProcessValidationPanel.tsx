
import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Scale, 
  User, 
  Calendar, 
  FileText, 
  Zap, 
  AlertTriangle, 
  Search,
  ArrowRight,
  History,
  Edit3
} from 'lucide-react';
import { Processo, ProcessUpdate, ProcessScoreConfig } from '../types';

interface ProcessValidationPanelProps {
  processes: Processo[];
  onValidate: (processId: string, updateId: string, points: number) => void;
  scoreConfig: ProcessScoreConfig;
}

const ProcessValidationPanel: React.FC<ProcessValidationPanelProps> = ({ processes, onValidate, scoreConfig }) => {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'history'>('pending');
  const [selectedPoints, setSelectedPoints] = useState<Record<string, number>>({});

  const pendingUpdates = useMemo(() => {
    const list: { process: Processo; update: ProcessUpdate }[] = [];
    processes.forEach(p => {
      p.timeline.forEach(u => {
        if (u.status_validacao === 'PENDENTE_VALIDACAO') {
          list.push({ process: p, update: u });
        }
      });
    });
    return list.sort((a, b) => new Date(b.update.data_atualizacao).getTime() - new Date(a.update.data_atualizacao).getTime());
  }, [processes]);

  const historyUpdates = useMemo(() => {
    const list: { process: Processo; update: ProcessUpdate }[] = [];
    processes.forEach(p => {
      p.timeline.forEach(u => {
        if (u.status_validacao === 'VALIDADO') {
          list.push({ process: p, update: u });
        }
      });
    });
    return list.sort((a, b) => new Date(b.update.data_validacao!).getTime() - new Date(a.update.data_validacao!).getTime());
  }, [processes]);

  const getSuggestedPoints = (process: Processo) => {
    if (process.tipo_processo === 'Nível 1') return scoreConfig.sugestaoNivel1;
    
    // Se o processo for de honorários, prioriza Contratual no cálculo padrão
    if (process.tipo_honorarios === 'Contratual' || process.tipo_honorarios === 'Ambos') {
      return scoreConfig.sugestaoHonorarios;
    }
    
    if (process.tipo_honorarios === 'Sucumbencial') {
      return scoreConfig.sugestaoSucumbenciais;
    }
    
    // Fallback caso não caia em nenhuma regra estratégica
    return scoreConfig.sugestaoSucumbenciais;
  };

  const handlePointChange = (updateId: string, pts: number) => {
    setSelectedPoints(prev => ({ ...prev, [updateId]: pts }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-right duration-500 space-y-10">
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit">
        <button onClick={() => setActiveSubTab('pending')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'pending' ? 'bg-gray-100 text-[#8B1538]' : 'text-gray-400'}`}>Aguardando Curadoria</button>
        <button onClick={() => setActiveSubTab('history')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'history' ? 'bg-gray-100 text-[#8B1538]' : 'text-gray-400'}`}>Histórico Validado</button>
      </div>

      {activeSubTab === 'pending' ? (
        <div className="grid grid-cols-1 gap-8">
          {pendingUpdates.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-24 border border-dashed border-gray-200 text-center">
               <div className="w-16 h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={32}/></div>
               <h3 className="text-xl font-serif font-bold text-gray-700">Tudo em dia!</h3>
               <p className="text-sm text-gray-400 font-serif italic mt-2">Nenhuma atualização mensal aguardando validação tática.</p>
            </div>
          ) : (
            pendingUpdates.map(({ process, update }) => (
              <div key={update.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col xl:flex-row group hover:shadow-xl transition-all">
                <div className="p-8 xl:w-1/3 bg-gray-50/50 border-r border-gray-50 space-y-4">
                   <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${process.tipo_processo === 'Nível 1' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>{process.tipo_processo}</span>
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{update.mes_referencia} / {update.ano_referencia}</span>
                   </div>
                   <h4 className="text-lg font-serif font-bold text-[#8B1538] leading-tight">{process.numero_processo}</h4>
                   <div className="flex items-center gap-3 pt-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-[#8B1538] border border-gray-100 shadow-sm">{update.advogado_atualizador.substring(0, 2).toUpperCase()}</div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-600">{update.advogado_atualizador}</span>
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Atualizado em {update.data_atualizacao.split('-').reverse().join('/')}</span>
                      </div>
                   </div>
                </div>

                <div className="p-8 flex-1 space-y-6">
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest"><FileText size={14}/> Resumo das Movimentações</div>
                      <p className="text-sm font-serif text-gray-600 italic line-clamp-3 leading-relaxed">"{update.movimentacoes_realizadas}"</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-50">
                        <span className="block text-[8px] font-black text-blue-400 uppercase mb-1">Próximos Passos</span>
                        <p className="text-[11px] font-medium text-blue-800 truncate">{update.proximos_passos}</p>
                      </div>
                      <div className="bg-orange-50/30 p-4 rounded-xl border border-orange-50">
                        <span className="block text-[8px] font-black text-orange-400 uppercase mb-1">Riscos</span>
                        <p className="text-[11px] font-medium text-orange-800 truncate">{update.riscos_identificados || 'Nenhum'}</p>
                      </div>
                   </div>
                </div>

                <div className="p-10 xl:w-1/4 bg-white flex flex-col items-center justify-center border-l border-gray-50 space-y-6">
                   <div className="text-center w-full space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Atribuir Score</label>
                      <div className="flex items-center justify-center gap-4">
                         <input 
                            type="number" 
                            className="w-20 text-center text-2xl font-serif font-bold text-[#8B1538] bg-gray-50 border border-gray-100 rounded-xl py-2 outline-none focus:ring-4 focus:ring-[#8B1538]/5"
                            value={selectedPoints[update.id] ?? getSuggestedPoints(process)}
                            onChange={(e) => handlePointChange(update.id, Number(e.target.value))}
                         />
                         <div className="text-left">
                            <span className="block text-[8px] font-black text-amber-500 uppercase tracking-tighter">Sugestão</span>
                            <span className="text-xs font-bold text-gray-400">{getSuggestedPoints(process)} pts</span>
                         </div>
                      </div>
                   </div>
                   <button 
                    onClick={() => onValidate(process.id, update.id, selectedPoints[update.id] ?? getSuggestedPoints(process))}
                    className="w-full py-4 bg-[#8B1538] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#8B1538]/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                   >
                     <ShieldCheck size={16}/> Validar e Pontuar
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in">
           <div className="p-8 border-b border-gray-50 bg-gray-50/20">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><History size={16}/> Histórico de Curadoria Mensal</h3>
           </div>
           <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/30">
                  <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase">Processo</th>
                  <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase">Advogado</th>
                  <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase text-center">Período</th>
                  <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase text-center">Data Validação</th>
                  <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase text-right">Score Creditado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {historyUpdates.map(({ process, update }) => (
                   <tr key={update.id} className="hover:bg-gray-50/10 transition-colors">
                     <td className="px-8 py-5">
                       <div className="flex flex-col">
                          <span className="text-xs font-mono font-bold text-gray-700">{process.numero_processo}</span>
                          <span className="text-[9px] text-gray-400 font-serif">{process.cliente}</span>
                       </div>
                     </td>
                     <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-[9px] font-bold text-[#8B1538] border border-gray-100">{update.advogado_atualizador.substring(0, 1)}</div>
                          <span className="text-xs font-bold text-gray-600 font-serif">{update.advogado_atualizador}</span>
                       </div>
                     </td>
                     <td className="px-8 py-5 text-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase">{update.mes_referencia} / {update.ano_referencia}</span>
                     </td>
                     <td className="px-8 py-5 text-center">
                        <span className="text-[10px] font-bold text-green-600">{update.data_validacao?.split('T')[0].split('-').reverse().join('/')}</span>
                     </td>
                     <td className="px-8 py-5 text-right font-serif font-bold text-[#8B1538]">
                        +{update.pontos_atribuidos} pts
                     </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default ProcessValidationPanel;
