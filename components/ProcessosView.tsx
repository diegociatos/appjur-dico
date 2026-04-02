
import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, History, DollarSign, Scale, Eye, Edit3, Archive, Briefcase, 
  Layers, Filter, ShieldCheck, CheckCircle2, Clock, Zap, AlertCircle
} from 'lucide-react';
import { Processo, ProcessType, ProcessUpdate, ProcessScoreConfig, Client, UserProfile } from '../types';
import ProcessModal from './ProcessModal';
import ProcessUpdateModal from './ProcessUpdateModal';
import ProcessTimelineView from './ProcessTimelineView';
import ProcessValidationPanel from './ProcessValidationPanel';

interface ProcessosViewProps {
  processes: Processo[];
  onUpdateProcess: (processId: string, update: ProcessUpdate) => void;
  onAddProcess: (process: Omit<Processo, 'id' | 'data_cadastro' | 'timeline'>) => void;
  onEditProcess: (process: Processo) => void;
  onDeleteProcess: (id: string) => void;
  onValidateUpdate: (processId: string, updateId: string, points: number) => void;
  scoreConfig: ProcessScoreConfig;
  clients: Client[];
  users: UserProfile[];
  currentUser: UserProfile;
}

const ProcessosView: React.FC<ProcessosViewProps> = ({ 
  processes, onUpdateProcess, onAddProcess, onEditProcess, onDeleteProcess, onValidateUpdate, scoreConfig, clients, users, currentUser 
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'validation'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [processToEdit, setProcessToEdit] = useState<Processo | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [selectedProcess, setSelectedProcess] = useState<Processo | null>(null);
  const [typeFilter, setTypeFilter] = useState<'Todos' | 'Pendentes' | 'Atualizados'>('Todos');

  const isAdvogado = currentUser.cargo === 'Advogado';
  const isAdminOrGestor = currentUser.cargo === 'Administrador' || currentUser.cargo === 'Gestor';
  const currentMonth = 'Fevereiro';

  const filteredProcesses = useMemo(() => {
    return processes.filter(p => {
      // Regra de Ouro: Advogado só vê o que é dele. Admin/Gestor vê tudo.
      const matchesOwnership = isAdvogado ? p.advogado_responsavel === currentUser.nome : true;
      
      const matchesSearch = p.numero_processo.includes(searchTerm) || 
                           p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.advogado_responsavel.toLowerCase().includes(searchTerm.toLowerCase());
      
      const hasUpdateThisMonth = p.timeline.some(u => u.mes_referencia === currentMonth);
      
      const matchesType = typeFilter === 'Todos' ? true : 
                         typeFilter === 'Pendentes' ? !hasUpdateThisMonth : 
                         hasUpdateThisMonth;
                         
      return matchesOwnership && matchesSearch && matchesType;
    });
  }, [processes, searchTerm, typeFilter, currentMonth, isAdvogado, currentUser.nome]);

  const handleOpenEdit = (p: Processo) => {
    setProcessToEdit(p);
    setIsProcessModalOpen(true);
  };

  const handleOpenUpdate = (p: Processo) => {
    setSelectedProcess(p);
    setIsUpdateModalOpen(true);
  };

  const handleProcessSave = (data: any) => {
    if (processToEdit) {
      onEditProcess(data);
      if (selectedProcess?.id === data.id) setSelectedProcess(data);
    } else {
      onAddProcess(data);
    }
    setIsProcessModalOpen(false);
    setProcessToEdit(null);
  };

  const handleDelete = (id: string) => {
    onDeleteProcess(id);
    setViewMode('list');
    setSelectedProcess(null);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12 font-serif-elegant">
      {activeTab === 'validation' && isAdminOrGestor ? (
        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-serif font-bold text-[#8B1538]">Curadoria de Processos</h2>
                <p className="text-gray-400 italic">Validação de movimentações e atribuição de score</p>
              </div>
              <button onClick={() => setActiveTab('list')} className="text-[10px] font-black uppercase text-gray-400 hover:text-[#8B1538] transition-colors flex items-center gap-2">← VOLTAR PARA LISTAGEM</button>
           </div>
           <ProcessValidationPanel processes={processes} onValidate={onValidateUpdate} scoreConfig={scoreConfig} />
        </div>
      ) : viewMode === 'timeline' && selectedProcess ? (
        <ProcessTimelineView 
          process={processes.find(p => p.id === selectedProcess.id) || selectedProcess} 
          onBack={() => setViewMode('list')} 
          onUpdate={() => handleOpenUpdate(selectedProcess)}
          onEdit={() => handleOpenEdit(selectedProcess)}
          onDelete={handleDelete}
          currentUser={currentUser}
        />
      ) : (
        <div className="space-y-10 animate-in slide-in-from-left duration-500">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-bold text-[#8B1538] leading-tight">
                {isAdvogado ? 'Meus Processos' : 'Gestão de Processos'}
              </h1>
              <p className="text-[#2D3748] mt-2 font-medium text-[16px] opacity-70 italic">
                {isAdvogado ? `Exibindo dossiês sob responsabilidade de ${currentUser.nome}` : 'Governança estratégica de dossiês e performance da equipe'}
              </p>
            </div>
            {isAdminOrGestor && (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab('validation')} 
                  className="bg-white border-2 border-[#8B1538]/10 text-[#8B1538] px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-[#8B1538]/5 transition-all"
                >
                  Fila de Validação
                </button>
                <button 
                  onClick={() => { setProcessToEdit(null); setIsProcessModalOpen(true); }} 
                  className="flex items-center gap-3 bg-[#8B1538] text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#8B1538]/20 transition-all hover:scale-105"
                >
                  <Plus size={20} /> Novo Processo
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 relative w-full">
              <input type="text" placeholder="Filtrar por número, cliente ou advogado..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-[#8B1538]/5 transition-all" />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={22} />
            </div>
            <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
              {['Todos', 'Pendentes', 'Atualizados'].map((f) => (
                <button key={f} onClick={() => setTypeFilter(f as any)} className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${typeFilter === f ? 'bg-white text-[#8B1538] shadow-md' : 'text-gray-400'}`}>{f}</button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Processo / Cliente</th>
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Responsável</th>
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status / Nível</th>
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Última Upd.</th>
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProcesses.map((p) => {
                  const lastUpdate = p.timeline[0];
                  const isPending = !p.timeline.some(u => u.mes_referencia === currentMonth);
                  
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/10 transition-colors group">
                      <td className="px-10 py-8">
                        <div className="flex flex-col">
                          <span className="text-sm font-mono font-bold text-[#2D3748]">{p.numero_processo}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-tight">{p.cliente}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-[#8B1538]">
                              {p.advogado_responsavel.substring(0,1)}
                           </div>
                           <span className="text-xs font-bold text-gray-600 font-serif">{p.advogado_responsavel}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                         <div className="flex items-center gap-3">
                            <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase border ${p.status === 'Ativo' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{p.status}</span>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{p.tipo_processo}</span>
                         </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                         {lastUpdate ? (
                           <div className="flex flex-col">
                             <span className="text-xs font-bold text-gray-600">{lastUpdate.mes_referencia}</span>
                             <span className="text-[9px] text-gray-400 uppercase font-black">{lastUpdate.data_atualizacao.split('-').reverse().join('/')}</span>
                           </div>
                         ) : (
                           <span className="text-[9px] font-black text-red-400 uppercase">Sem Registro</span>
                         )}
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => { setSelectedProcess(p); setViewMode('timeline'); }} 
                            className="p-3 text-gray-300 hover:text-[#8B1538] hover:bg-[#8B1538]/5 rounded-xl transition-all"
                            title="Ver Histórico"
                          >
                             <Eye size={20} />
                          </button>
                          <button 
                            onClick={() => handleOpenUpdate(p)} 
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest
                              ${isPending ? 'bg-[#8B1538] text-white shadow-lg shadow-[#8B1538]/20' : 'bg-green-50 text-green-600 border border-green-100'}`}
                          >
                            {isPending ? <Zap size={14}/> : <CheckCircle2 size={14}/>}
                            {isPending ? 'Atualizar' : 'Em dia'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredProcesses.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center opacity-30">
                 <Briefcase size={48} className="mb-4 text-gray-300" />
                 <p className="font-serif italic text-lg">Nenhum processo localizado para os filtros atuais.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ProcessModal 
        isOpen={isProcessModalOpen} 
        onClose={() => { setIsProcessModalOpen(false); setProcessToEdit(null); }} 
        onSave={handleProcessSave} 
        existingProcesses={processes} 
        clients={clients}
        users={users}
        processToEdit={processToEdit}
      />

      {isUpdateModalOpen && selectedProcess && (
        <ProcessUpdateModal 
          isOpen={isUpdateModalOpen} 
          onClose={() => { setIsUpdateModalOpen(false); }} 
          process={processes.find(p => p.id === selectedProcess.id) || selectedProcess} 
          onSave={onUpdateProcess} 
        />
      )}
    </div>
  );
};

export default ProcessosView;
