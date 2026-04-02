
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Building2, User, Phone, Mail, MapPin, Edit3, Briefcase, 
  Calendar, CheckCircle2, XCircle, Plus, Search, MessageSquare, History,
  Cake, UserCircle2, Clock, Scale, ShieldCheck, Star, Contact2, ChevronRight,
  Download, FileSpreadsheet, Zap, AlertTriangle, DollarSign
} from 'lucide-react';
import { Client, Processo, UserProfile, MonthlyBillingEntry } from '../types';
import Avatar from './Avatar';
import ExportBillingModal from './ExportBillingModal';

interface ClientDetailsViewProps {
  client: Client;
  onBack: () => void;
  onEdit: () => void;
  processes: Processo[];
  users: UserProfile[];
  billingEntries: MonthlyBillingEntry[];
  currentUser: UserProfile;
  onLogAudit: (log: any) => void;
}

const ClientDetailsView: React.FC<ClientDetailsViewProps> = ({ 
  client, onBack, onEdit, processes, users, billingEntries, currentUser, onLogAudit 
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'contacts' | 'processes' | 'history'>('info');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const lawyerResp = users.find(u => u.id === client.responsavelId);
  
  // Fix: changed 'Gestora' to 'Gestor' as it's the correct value for UserRole type
  const canSeeFinance = currentUser.cargo === 'Administrador' || 
                        currentUser.cargo === 'Gestor' || 
                        currentUser.cargo === 'Financeiro';

  // Consolidar todas as atualizações de todos os processos do cliente para a Linha do Tempo
  const clientTimeline = useMemo(() => {
    const allUpdates = processes.flatMap(p => 
      p.timeline.map(upd => ({
        ...upd,
        processNumber: p.numero_processo,
        type: 'PROCESS_UPDATE'
      }))
    );
    
    // Adicionar eventos de faturamento se houver (opcional)
    const billingEvents = billingEntries.map(e => ({
      id: e.id,
      // Fix: normalize date to data_atualizacao to satisfy union type sorting and common field access
      data_atualizacao: e.createdAt,
      mes_referencia: e.month,
      ano_referencia: 2026, // fixo para o mock
      advogado_atualizador: e.createdBy,
      movimentacoes_realizadas: `Faturamento Mensal Provisionado: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(e.totalAmount)}`,
      proximos_passos: 'Aguardando conciliação financeira.',
      processNumber: 'Financeiro',
      status_validacao: 'VALIDADO',
      type: 'BILLING'
    }));

    // Fix: sorting based on unified data_atualizacao field
    return [...allUpdates, ...billingEvents].sort((a, b) => 
      new Date(b.data_atualizacao).getTime() - 
      new Date(a.data_atualizacao).getTime()
    );
  }, [processes, billingEntries]);

  return (
    <div className="animate-in fade-in duration-500 pb-20 font-serif-elegant">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-[#8B1538] transition-all font-bold text-xs uppercase tracking-widest group">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-100 group-hover:border-[#8B1538] shadow-sm"><ArrowLeft size={16} /></div>
          Voltar para Listagem
        </button>
        <div className="flex items-center gap-4">
           {canSeeFinance && (
             <button 
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-2 bg-[#8B1538] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#72112d] transition-all shadow-xl shadow-[#8B1538]/20"
             >
                <FileSpreadsheet size={18} /> Exportar Financeiro
             </button>
           )}
           <button 
            onClick={onEdit} 
            className="flex items-center gap-2 bg-white border-2 border-gray-100 text-gray-400 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-[#8B1538]/20 hover:text-[#8B1538] transition-all shadow-sm"
           >
            <Edit3 size={18} /> Editar Prontuário
           </button>
        </div>
      </div>

      {/* HEADER DO CLIENTE */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
           {client.tipo === 'PJ' ? <Building2 size={240}/> : <UserCircle2 size={240}/>}
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${client.tipo === 'PJ' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                {client.tipo === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
              </span>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${client.status === 'Ativo' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                {client.status}
              </span>
            </div>
            <h1 className="text-4xl font-serif font-bold text-[#8B1538] leading-tight">{client.nome}</h1>
            <div className="flex flex-wrap gap-6 pt-2">
               <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-tight"><MapPin size={16} className="text-[#8B1538]"/> {client.endereco.cidade} / {client.endereco.estado}</div>
               <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-tight"><Mail size={16} className="text-[#8B1538]"/> {client.email}</div>
               <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-tight"><Phone size={16} className="text-[#8B1538]"/> {client.telefone}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 pt-10 lg:pt-0 lg:border-l border-gray-100 lg:pl-12">
            <div><span className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Responsável Interno</span><span className="text-sm font-serif font-bold text-gray-700">{lawyerResp?.nome}</span></div>
            <div><span className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Portfólio Ativo</span><span className="text-sm font-serif font-bold text-gray-700">{processes.length} processos</span></div>
          </div>
        </div>
      </div>

      {/* TABS NAVEGAÇÃO */}
      <div className="flex bg-white p-1.5 rounded-[1.5rem] shadow-sm border border-gray-100 w-fit mb-10">
        {[
          { id: 'info', label: 'Dados Cadastrais', icon: ShieldCheck },
          { id: 'contacts', label: 'Interlocutores / Sócios', icon: Contact2 },
          { id: 'processes', label: 'Processos Vinculados', icon: Scale },
          { id: 'history', label: 'Linha do Tempo', icon: Clock },
        ].map(tab => (
          <button 
            key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <tab.icon size={16}/> {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO ABAS */}
      <div className="animate-in slide-in-from-bottom-4 duration-500">
        
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                   <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-10 border-b border-gray-50 pb-4">Detalhamento Jurídico</h3>
                   <div className="grid grid-cols-2 gap-10">
                      <div>
                         <span className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">CPF / CNPJ</span>
                         <span className="text-lg font-mono font-bold text-gray-700">{client.documento}</span>
                      </div>
                      <div>
                         <span className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Segmento</span>
                         <span className="text-lg font-serif font-bold text-gray-700">{client.segmento || 'Não Classificado'}</span>
                      </div>
                      <div>
                         <span className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Início da Relação</span>
                         <span className="text-lg font-serif font-bold text-gray-700">{client.dataInicio.split('-').reverse().join('/')}</span>
                      </div>
                      <div>
                         <span className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Logradouro</span>
                         <span className="text-sm font-serif font-bold text-gray-700">{client.endereco.rua}, {client.endereco.numero}</span>
                         <p className="text-xs text-gray-400">{client.endereco.bairro} - {client.endereco.cidade}/{client.endereco.estado}</p>
                      </div>
                   </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                   <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Observações e Estratégia de Atendimento</h3>
                   <p className="text-sm font-serif text-gray-600 leading-relaxed italic">
                     "{client.observacoes || 'Nenhuma observação estratégica registrada para este cliente.'}"
                   </p>
                </div>
             </div>

             <div className="space-y-8">
                <div className="bg-[#8B1538] p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-10"><History size={120}/></div>
                   <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Auditoria de Dados</h4>
                   <div className="space-y-6">
                      <div>
                         <span className="block text-[9px] font-black text-white/40 uppercase">Criado por</span>
                         <span className="text-sm font-serif font-bold">{client.criadoPor || 'Admin'}</span>
                         <p className="text-[10px] text-white/40">{client.criadoEm ? new Date(client.criadoEm).toLocaleString() : '31/12/2025, 21:00:00'}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {client.contatos.map(ct => {
               const bday = new Date(ct.aniversario);
               const today = new Date();
               const isMonthBday = bday.getMonth() === today.getMonth();
               
               return (
                 <div key={ct.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 group hover:border-[#8B1538]/20 transition-all">
                    <div className="flex items-center gap-4 mb-8">
                       <Avatar nome={ct.nome} size="lg" className="shadow-inner" />
                       <div>
                          <h4 className="text-[17px] font-serif font-bold text-[#2D3748] group-hover:text-[#8B1538] transition-colors">{ct.nome}</h4>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{ct.cargo}</span>
                       </div>
                    </div>
                    
                    <div className="space-y-4 pt-6 border-t border-gray-50">
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMonthBday ? 'bg-amber-50 text-amber-500' : 'bg-gray-50 text-gray-300'}`}>
                             <Cake size={18}/>
                          </div>
                          <div>
                             <span className="block text-[9px] font-black text-gray-300 uppercase">Aniversário</span>
                             <span className={`text-xs font-bold ${isMonthBday ? 'text-amber-600' : 'text-gray-600'}`}>{bday.getDate()}/{bday.getMonth()+1} {isMonthBday && '🎉'}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gray-50 text-gray-300 rounded-xl flex items-center justify-center`}><Mail size={18}/></div>
                          <div>
                             <span className="block text-[9px] font-black text-gray-300 uppercase">E-mail</span>
                             <span className="text-xs font-bold text-gray-600 truncate max-w-[180px] block">{ct.email}</span>
                          </div>
                       </div>
                    </div>
                 </div>
               );
             })}
          </div>
        )}

        {activeTab === 'processes' && (
           <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
                 <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Processos Ativos em Portfólio</h3>
              </div>
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/30">
                       <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Número / CNJ</th>
                       <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Tipo</th>
                       <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                       <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Ação</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {processes.length === 0 ? (
                      <tr><td colSpan={4} className="px-10 py-20 text-center text-gray-300 italic font-serif">Nenhum processo vinculado a este cliente.</td></tr>
                    ) : (
                      processes.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50/20 transition-colors group">
                           <td className="px-10 py-6 text-xs font-mono font-bold text-gray-700">{p.numero_processo}</td>
                           <td className="px-8 py-6">
                              <span className="text-[10px] font-black text-gray-400 uppercase px-2 py-1 bg-gray-50 rounded border border-gray-100">{p.tipo_processo}</span>
                           </td>
                           <td className="px-8 py-6 text-center">
                              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${p.status === 'Ativo' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{p.status}</span>
                           </td>
                           <td className="px-10 py-6 text-right">
                              <button className="p-2 text-gray-300 hover:text-[#8B1538] transition-colors"><ChevronRight size={20}/></button>
                           </td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>
        )}

        {activeTab === 'history' && (
           <div className="max-w-4xl mx-auto py-10">
              <div className="relative pl-12 space-y-16 before:content-[''] before:absolute before:left-6 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100">
                {clientTimeline.length === 0 ? (
                  <div className="py-20 text-center opacity-40 italic font-serif text-gray-400">Nenhum evento registrado na linha do tempo deste cliente.</div>
                ) : (
                  clientTimeline.map((item, idx) => (
                    <div key={item.id} className="relative animate-in slide-in-from-bottom-4">
                      {/* Fixed: using data_atualizacao consistently for all timeline items */}
                      <div className={`absolute -left-[35px] top-1 w-11 h-11 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${item.type === 'BILLING' ? 'bg-blue-500 text-white' : 'bg-[#8B1538] text-white'}`}>
                        {item.type === 'BILLING' ? <DollarSign size={20} /> : <Zap size={20} fill="currentColor" />}
                      </div>

                      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                          <div>
                            <span className="text-[9px] font-black text-[#8B1538] uppercase tracking-[0.2em] block mb-1">
                              {item.processNumber === 'Financeiro' ? 'Financeiro' : `PROCESSO: ${item.processNumber}`}
                            </span>
                            <h4 className="text-sm font-serif font-bold text-gray-700">Responsável: {item.advogado_atualizador}</h4>
                          </div>
                          {/* Fix: normalized data_atualizacao usage */}
                          <span className="text-[10px] font-black text-gray-400 uppercase bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                            {new Date(item.data_atualizacao).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-[15px] font-serif text-gray-600 leading-relaxed italic mb-6">"{item.movimentacoes_realizadas}"</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                           <div className="space-y-1">
                              <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest block">Próximo Passo</span>
                              <p className="text-xs text-gray-500 font-medium">{item.proximos_passos}</p>
                           </div>
                           {item.status_validacao === 'VALIDADO' && (
                             <div className="flex items-center gap-2 text-green-600 self-end justify-end">
                                <CheckCircle2 size={14}/>
                                <span className="text-[10px] font-black uppercase tracking-tighter">Validado pela Gestão</span>
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
           </div>
        )}
      </div>

      <ExportBillingModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        client={client}
        entries={billingEntries.filter(e => e.clientId === client.id)}
        currentUser={currentUser}
        onLogAudit={onLogAudit}
      />
    </div>
  );
};

export default ClientDetailsView;
