
import React, { useState } from 'react';
import { ArrowLeft, Calendar, Users, Star, Scale, DollarSign, Activity, AlertTriangle, ArrowRight, Edit3, Clock, History, Briefcase, Zap, Trash2, ShieldAlert, X, CheckCircle2, MapPin } from 'lucide-react';
import { Processo, ProcessUpdate, UserProfile } from '../types';

interface ProcessTimelineViewProps {
  process: Processo;
  onBack: () => void;
  onUpdate: (process: Processo) => void;
  onEdit: (process: Processo) => void;
  onDelete: (processId: string) => void;
  currentUser: UserProfile;
}

const ProcessTimelineView: React.FC<ProcessTimelineViewProps> = ({ process, onBack, onUpdate, onEdit, onDelete, currentUser }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const canManage = currentUser.cargo === 'Gestor' || currentUser.cargo === 'Administrador';

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="animate-in fade-in duration-500 pb-20 font-serif-elegant">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-[#8B1538] transition-all font-bold text-xs uppercase tracking-widest group">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-100 group-hover:border-[#8B1538] shadow-sm transition-all"><ArrowLeft size={16} /></div>
          Voltar para Listagem
        </button>
        
        <div className="flex items-center gap-4">
          {canManage && (
            <>
              <button 
                onClick={() => onEdit(process)}
                className="flex items-center gap-2 bg-[#8B1538] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#8B1538]/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Edit3 size={16} /> Editar Processo
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-2 bg-white border-2 border-red-100 text-red-500 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all"
              >
                <Trash2 size={16} /> Deletar
              </button>
            </>
          )}
          <button 
            onClick={() => onUpdate(process)} 
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-[#8B1538] px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-sm"
          >
            <Zap size={16} fill="currentColor"/> Lançar Movimentação
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 mb-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
           <Briefcase size={240}/>
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase bg-purple-50 text-purple-600 border border-purple-100">{process.tipo_processo}</span>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${process.status === 'Ativo' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{process.status}</span>
            </div>
            <h1 className="text-4xl font-serif font-bold text-[#8B1538] leading-tight">{process.numero_processo}</h1>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <Users size={16} className="text-[#8B1538]" />
                  <span className="text-sm font-bold text-gray-700">{process.cliente}</span>
               </div>
               <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-tight">
                  <MapPin size={16} className="text-gray-300"/> {process.tribunal} / {process.vara}
               </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 pt-10 lg:pt-0 lg:border-l border-gray-100 lg:pl-12">
            <div><span className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Advogado Resp.</span><span className="text-sm font-serif font-bold text-[#2D3748]">{process.advogado_responsavel}</span></div>
            <div><span className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Honorários Atuais</span><span className="text-sm font-serif font-bold text-[#2D3748]">{formatCurrency(process.valor_honorarios)}</span></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-12 border-b border-gray-100 pb-6">
           <History className="text-[#8B1538]" size={24} />
           <h2 className="text-2xl font-serif font-bold text-[#2D3748]">Histórico de Atuação Estratégica</h2>
        </div>

        <div className="relative pl-12 space-y-16 before:content-[''] before:absolute before:left-6 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100">
          {process.timeline.length === 0 ? (
            <div className="py-20 text-center opacity-40 italic font-serif text-gray-400">Nenhuma atualização mensal registrada para este dossiê.</div>
          ) : (
            process.timeline.map((update, idx) => (
              <div key={update.id} className="relative animate-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className={`absolute -left-[35px] top-1 w-11 h-11 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${idx === 0 ? 'bg-[#8B1538] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {idx === 0 ? <Star size={20} fill="currentColor" /> : <Clock size={20} />}
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center font-serif font-bold text-[#8B1538] border border-gray-100">{update.advogado_atualizador.substring(0, 2).toUpperCase()}</div>
                      <div>
                        <h4 className="text-[10px] font-black text-[#8B1538] uppercase tracking-[0.2em] mb-1">{update.mes_referencia} / {update.ano_referencia}</h4>
                        <p className="text-sm font-serif font-bold text-gray-700">Responsável: {update.advogado_atualizador}</p>
                      </div>
                    </div>
                    
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border 
                      ${update.status_validacao === 'VALIDADO' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                       {update.status_validacao === 'VALIDADO' ? <CheckCircle2 size={14}/> : <Clock size={14}/>}
                       {update.status_validacao === 'VALIDADO' ? `Validado: +${update.pontos_atribuidos} pts` : 'Aguardando Validação'}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <h5 className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                        <Scale size={14} className="text-[#8B1538]" /> Movimentações Realizadas
                      </h5>
                      <p className="text-[15px] font-serif text-gray-700 leading-relaxed font-medium italic">"{update.movimentacoes_realizadas}"</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                      <div className="space-y-2">
                        <h5 className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2"><ArrowRight size={12} /> Próximos Passos</h5>
                        <p className="text-xs text-gray-600 font-medium leading-relaxed">{update.proximos_passos}</p>
                      </div>
                      {update.riscos_identificados && (
                        <div className="space-y-2">
                          <h5 className="text-[9px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2"><AlertTriangle size={12} /> Riscos Mapedos</h5>
                          <p className="text-xs text-gray-600 font-medium leading-relaxed">{update.riscos_identificados}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="bg-red-50 p-12 text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                    <Trash2 size={240} className="translate-y-10" />
                 </div>
                 <div className="relative z-10">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100 text-red-500">
                       <ShieldAlert size={32} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-red-900 mb-3">Confirmar Exclusão</h2>
                    <p className="text-sm font-serif italic text-red-700 leading-relaxed">
                       Tem certeza que deseja excluir o processo <strong className="font-black">{process.numero_processo}</strong>? 
                       Esta ação é irreversível e removerá todo o histórico de performance.
                    </p>
                 </div>
              </div>
              <div className="p-10 flex flex-col gap-4 bg-white">
                 <button 
                  onClick={() => { onDelete(process.id); setIsDeleteModalOpen(false); }}
                  className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                 >
                    <Trash2 size={16}/> Sim, Excluir Processo
                 </button>
                 <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-5 border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all"
                 >
                    Cancelar
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProcessTimelineView;
