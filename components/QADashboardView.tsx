
import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, Database, Calculator, Lock, History, AlertCircle, 
  CheckCircle2, ArrowRight, Table, FileSpreadsheet, UserCheck, 
  RefreshCcw, Search, Filter, Terminal, X
} from 'lucide-react';
import { ClientContract, MonthlyBillingEntry, AuditLog, UserProfile, Client } from '../types';
import { calculateMonthlyBilling } from '../utils/billingEngine';

interface QADashboardViewProps {
  contracts: ClientContract[];
  entries: MonthlyBillingEntry[];
  auditLogs: AuditLog[];
  clients: Client[];
  currentUser: UserProfile;
}

const QADashboardView: React.FC<QADashboardViewProps> = ({ 
  contracts, entries, auditLogs, clients, currentUser 
}) => {
  const [testMode, setTestMode] = useState<'audit' | 'calc_tester' | 'permissions'>('audit');

  // Lógica de Simulação de Cálculo para Teste Manual
  const [simData, setSimData] = useState({ contractId: '', proc: 0, hours: 0 });
  const simContract = contracts.find(c => c.id === simData.contractId);
  const simResult = simContract ? calculateMonthlyBilling({
    totalReportedProcesses: simData.proc,
    totalExecutedHours: simData.hours
  }, simContract) : null;

  return (
    <div className="animate-in fade-in duration-500 pb-20 font-serif-elegant">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-[#8B1538] leading-tight">Centro de Validação (QA)</h1>
          <p className="text-[#2D3748] mt-2 font-medium text-[16px] opacity-70 italic">Ambiente de auditoria e testes manuais de integridade</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
          <button onClick={() => setTestMode('audit')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${testMode === 'audit' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>Logs de Auditoria</button>
          <button onClick={() => setTestMode('calc_tester')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${testMode === 'calc_tester' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>Testador de Motor</button>
          <button onClick={() => setTestMode('permissions')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${testMode === 'permissions' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>Matriz de Acesso</button>
        </div>
      </div>

      {testMode === 'audit' && (
        <div className="space-y-8 animate-in slide-in-from-left duration-500">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                 <span className="block text-[9px] font-black text-gray-400 uppercase mb-1">Ações de Exportação</span>
                 <span className="text-3xl font-bold text-[#8B1538]">{auditLogs.filter(l => l.action.includes('EXPORT')).length}</span>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                 <span className="block text-[9px] font-black text-gray-400 uppercase mb-1">Conciliações Realizadas</span>
                 <span className="text-3xl font-bold text-emerald-600">{auditLogs.filter(l => l.action === 'CONFIRM_PAYMENT').length}</span>
              </div>
              <div className="bg-[#8B1538] p-8 rounded-[2.5rem] shadow-xl shadow-[#8B1538]/20 flex items-center justify-between text-white">
                 <div>
                    <span className="block text-[9px] font-black text-white/40 uppercase mb-1">Status da Base</span>
                    <span className="text-xl font-serif font-bold">Integridade 100%</span>
                 </div>
                 <Database size={32} className="opacity-20" />
              </div>
           </div>

           <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                 <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-3"><Terminal size={16}/> Rastro de Atividades Críticas</h3>
              </div>
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/30 border-b border-gray-50">
                       <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase">Timestamp</th>
                       <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase">Usuário</th>
                       <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase">Ação</th>
                       <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase">Recurso/Detalhes</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 font-mono text-[11px]">
                    {auditLogs.length === 0 ? (
                      <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-300 italic">Nenhum log registrado para esta sessão.</td></tr>
                    ) : (
                      auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50/50">
                           <td className="px-8 py-4 text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                           <td className="px-8 py-4 font-bold text-gray-600">{log.userName}</td>
                           <td className="px-8 py-4">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">{log.action}</span>
                           </td>
                           <td className="px-8 py-4 text-gray-400">{log.details}</td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {testMode === 'calc_tester' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 animate-in zoom-in duration-500">
           <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
              <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Calculator size={24}/></div>
                 <h3 className="text-xl font-serif font-bold text-[#8B1538]">Simulador de Faturamento</h3>
              </div>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">1. Selecionar Regra de Contrato</label>
                    <select 
                      value={simData.contractId} onChange={e => setSimData({...simData, contractId: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none"
                    >
                       <option value="">Selecione para testar...</option>
                       {contracts.map(c => <option key={c.id} value={c.id}>{c.clientName} (Franquia: {c.planIncludes.processesIncluded}p / {c.planIncludes.hoursIncluded}h)</option>)}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">2. Processos Relatados</label>
                       <input type="number" value={simData.proc} onChange={e => setSimData({...simData, proc: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">3. Horas Relatadas</label>
                       <input type="number" value={simData.hours} onChange={e => setSimData({...simData, hours: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold outline-none" />
                    </div>
                 </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex items-start gap-4">
                 <AlertCircle className="text-blue-500 shrink-0" size={20} />
                 <p className="text-xs font-serif italic text-blue-800 leading-relaxed">
                   <strong>Dica de Teste:</strong> Tente ultrapassar a franquia configurada para validar se o motor aplica as taxas excedentes corretamente.
                 </p>
              </div>
           </div>

           <div className="bg-[#8B1538] rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-10 opacity-5"><RefreshCcw size={200}/></div>
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-10">Output do Motor de Cálculo</h3>
              
              {!simResult ? (
                 <div className="text-center py-10 opacity-30 italic">Aguardando entrada de dados...</div>
              ) : (
                <div className="space-y-8 animate-in fade-in">
                   <div className="flex justify-between border-b border-white/10 pb-4">
                      <span className="text-xs font-bold text-white/60">{simResult.monthlyFee.label}</span>
                      <span className="text-sm font-black">R$ {simResult.monthlyFee.valor.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between border-b border-white/10 pb-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white/60">{simResult.processes.label}</span>
                        <span className="text-[9px] text-white/30">{simResult.processes.descricao}</span>
                      </div>
                      <span className="text-sm font-black">R$ {simResult.processes.valor.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between border-b border-white/10 pb-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white/60">{simResult.hours.label}</span>
                        <span className="text-[9px] text-white/30">{simResult.hours.descricao}</span>
                      </div>
                      <span className="text-sm font-black">R$ {simResult.hours.valor.toFixed(2)}</span>
                   </div>
                   <div className="pt-6 flex flex-col items-center">
                      <span className="text-[9px] font-black uppercase text-white/40 mb-2">Total Estimado Bruto</span>
                      <span className="text-6xl font-serif font-bold tracking-tighter">R$ {simResult.total.toFixed(2)}</span>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}

      {testMode === 'permissions' && (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
           <div className="p-10 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-serif font-bold text-[#8B1538]">Matriz de Governança e Permissões</h3>
              <Lock size={20} className="text-gray-200" />
           </div>
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-gray-50/50">
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase">Módulo / Funcionalidade</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase text-center">Admin</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase text-center">Gestora</th>
                    <th className="px-6 py-6 text-[10px] font-black text-[#8B1538] uppercase text-center">Financeiro</th>
                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase text-center">Advogado</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {[
                   { label: 'Gestão de Clientes (CRUD)', adm: true, ges: true, fin: false, adv: false },
                   { label: 'Exportação de Dados Financeiros', adm: true, ges: true, fin: true, adv: false },
                   { label: 'Configuração de Contratos', adm: true, ges: true, fin: false, adv: false },
                   { label: 'Conciliação de Pagamentos', adm: true, ges: true, fin: true, adv: false },
                   { label: 'Visualização de Ranking Elite', adm: true, ges: true, fin: false, adv: true },
                   { label: 'Ajuste de Pontuação (Curadoria)', adm: true, ges: true, fin: false, adv: false },
                 ].map((row, i) => (
                   <tr key={i} className="hover:bg-gray-50/20 transition-colors">
                      <td className="px-10 py-5 text-sm font-bold text-gray-600">{row.label}</td>
                      <td className="px-6 py-5 text-center">{row.adm ? <CheckCircle2 className="text-green-500 mx-auto" size={18}/> : <X className="text-red-300 mx-auto" size={18}/>}</td>
                      <td className="px-6 py-5 text-center">{row.ges ? <CheckCircle2 className="text-green-500 mx-auto" size={18}/> : <X className="text-red-300 mx-auto" size={18}/>}</td>
                      <td className="px-6 py-5 text-center">{row.fin ? <CheckCircle2 className="text-green-500 mx-auto" size={18}/> : <X className="text-red-300 mx-auto" size={18}/>}</td>
                      <td className="px-6 py-5 text-center">{row.adv ? <CheckCircle2 className="text-green-500 mx-auto" size={18}/> : <X className="text-red-300 mx-auto" size={18}/>}</td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default QADashboardView;
