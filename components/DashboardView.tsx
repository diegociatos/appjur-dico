
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Heart, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  Sparkles,
  Calendar,
  AlertCircle,
  X,
  ArrowRight,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Scale,
  ShieldAlert,
  AlertTriangle,
  Trophy,
  Target,
  Zap,
  Crown,
  CalendarCheck2,
  ChevronRight,
  BarChart3,
  LineChart,
  UserCheck,
  Star,
  Wallet,
  Download,
  PieChart,
  DollarSign,
  Search,
  MessageSquare
} from 'lucide-react';
import { OfficeIndicator, Appointment, MonthlyIndicator, Processo, Client, UserProfile, Assignment, MonthlyBillingEntry, DailyEntry, DailyEntryType, ScoreEvent, ClientContract } from '../types';
import { calculateAdvancedScore } from '../utils/productivity';
import Avatar from './Avatar';

interface DashboardViewProps {
  indicator: OfficeIndicator;
  appointments: Appointment[];
  indicators: MonthlyIndicator[];
  processes: Processo[];
  clients: Client[];
  currentUser: UserProfile;
  assignments: Assignment[];
  billingEntries: MonthlyBillingEntry[];
  contracts: ClientContract[];
  dailyEntries?: DailyEntry[];
  dailyEntryTypes?: DailyEntryType[];
  scoreEvents?: ScoreEvent[];
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DashboardView: React.FC<DashboardViewProps> = ({ 
  indicator, 
  appointments, 
  indicators, 
  processes, 
  clients, 
  currentUser, 
  assignments, 
  billingEntries,
  contracts = [],
  dailyEntries = [],
  dailyEntryTypes = [],
  scoreEvents = []
}) => {
  const [selectedMonth, setSelectedMonth] = useState('Fevereiro');
  
  const isAdmin = currentUser.cargo === 'Administrador';
  const isGestor = currentUser.cargo === 'Gestor';
  const isFinanceiro = currentUser.cargo === 'Financeiro';
  const isAdvogado = currentUser.cargo === 'Advogado';

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // --- LÓGICA DO ADVOGADO (COCKPIT INDIVIDUAL) ---
  const lawyerStats = useMemo(() => {
    if (!isAdvogado) return null;

    const myProcesses = processes.filter(p => p.advogado_responsavel === currentUser.nome);
    const myAssignments = assignments.filter(a => a.advogadoId === currentUser.id);
    
    // Compliance de atualização mensal (Fevereiro)
    const currentMonth = 'Fevereiro';
    const pendingUpdates = myProcesses.filter(p => 
      !p.timeline.some(upd => upd.mes_referencia === currentMonth)
    ).length;

    const pendingTasks = myAssignments.filter(a => a.status === 'PENDENTE');
    const urgentTasks = pendingTasks.filter(a => a.prioridade === 'Urgente').length;

    // Score Atual
    const myIndicator = indicators.find(i => i.advogado === currentUser.nome) || {
      advogado: currentUser.nome, mes: 'Fevereiro', ano: 2026,
      bloco_producao: {}, bloco_resultado: {}, bloco_organizacao: {}, bloco_comunicacao: {}, bloco_qualidade: { erros_ocorridos: 0 }, bloco_financeiro: {}
    } as any;

    const calc = calculateAdvancedScore(myIndicator, [], [], dailyEntries, dailyEntryTypes, [], scoreEvents);

    return {
      score: calc.score_total,
      penalties: calc.penalidades,
      pendingUpdates,
      urgentTasks,
      totalPendingTasks: pendingTasks.length,
      processesCount: myProcesses.length,
      nextDeadlines: pendingTasks.sort((a,b) => new Date(a.prazo).getTime() - new Date(b.prazo).getTime()).slice(0, 3)
    };
  }, [isAdvogado, processes, assignments, indicators, dailyEntries, dailyEntryTypes, scoreEvents, currentUser]);

  // --- LÓGICA GERAL (ADMIN/GESTOR/FINANCEIRO) ---
  const finStats = useMemo(() => {
    const monthKey = `2026-${selectedMonth === 'Janeiro' ? '01' : '02'}`;
    const safeEntries = billingEntries || [];
    
    const faturamentoMes = safeEntries
      .filter(e => e.month === monthKey)
      .reduce((acc, e) => acc + e.totalAmount, 0);
    
    const recebimentoMes = safeEntries
      .filter(e => e.month === monthKey && e.isPaid)
      .reduce((acc, e) => acc + e.totalAmount, 0);

    const inadimplenciaMes = safeEntries
      .filter(e => e.month === monthKey && !e.isPaid && e.status === 'FINALIZADO')
      .reduce((acc, e) => acc + e.totalAmount, 0);

    return { faturamentoMes, recebimentoMes, inadimplenciaMes };
  }, [billingEntries, selectedMonth]);

  const ranking = useMemo(() => {
    const safeIndicators = indicators || [];
    return safeIndicators.map(ind => ({ 
      name: ind.advogado, 
      score: calculateAdvancedScore(ind, [], [], dailyEntries, dailyEntryTypes, [], scoreEvents).score_total 
    })).sort((a,b) => b.score - a.score);
  }, [indicators, dailyEntries, dailyEntryTypes, scoreEvents]);

  const execStats = useMemo(() => {
    const safeProcesses = processes || [];
    const active = safeProcesses.filter(p => p.status === 'Ativo');
    const n1 = active.filter(p => p.tipo_processo === 'Nível 1');
    const hasSuc = active.filter(p => p.tipo_honorarios === 'Sucumbencial' || p.tipo_honorarios === 'Ambos');
    const sucVal = hasSuc.reduce((acc, p) => acc + (p.valor_sucumbencial || 0), 0);
    
    return { 
      activeCount: active.length, 
      n1Count: n1.length, 
      sucCount: hasSuc.length, 
      sucValue: sucVal, 
    };
  }, [processes]);

  // --- RENDERS ---

  const renderLawyerDashboard = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER PERSONALIZADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-[#8B1538]">Olá, {currentUser.nome.split(' ')[0]}</h1>
          <p className="text-gray-500 font-serif italic text-lg mt-1">Faltam {Math.max(0, 500 - (lawyerStats?.score || 0)).toFixed(0)} pontos para atingir o topo da Elite este mês.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <Calendar size={18} className="text-[#8B1538]" />
            <span className="text-xs font-black uppercase text-gray-400">Competência Fev/26</span>
          </div>
        </div>
      </div>

      {/* CARDS DE PERFORMANCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Trophy size={80}/></div>
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Meu Score Atual</span>
           <div className="flex items-baseline gap-2">
             <span className="text-4xl font-black text-[#8B1538]">{lawyerStats?.score.toFixed(0)}</span>
             <span className="text-xs font-bold text-gray-300">pts</span>
           </div>
           <div className="mt-4 w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
             <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(100, ((lawyerStats?.score || 0) / 500) * 100)}%` }} />
           </div>
        </div>

        <div className={`p-8 rounded-[2.5rem] border shadow-xl relative overflow-hidden group ${lawyerStats?.pendingUpdates! > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
           <div className="absolute top-0 right-0 p-6 opacity-10"><RefreshCw size={80}/></div>
           <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${lawyerStats?.pendingUpdates! > 0 ? 'text-red-500' : 'text-gray-400'}`}>Dossiês s/ Atualização</span>
           <div className="flex items-baseline gap-2">
             <span className={`text-4xl font-black ${lawyerStats?.pendingUpdates! > 0 ? 'text-red-600' : 'text-gray-800'}`}>{lawyerStats?.pendingUpdates}</span>
             <span className="text-xs font-bold text-gray-300">processos</span>
           </div>
           {lawyerStats?.pendingUpdates! > 0 && (
             <p className="mt-2 text-[10px] font-bold text-red-400 uppercase animate-pulse flex items-center gap-1"><AlertTriangle size={12}/> Ação obrigatória pendente</p>
           )}
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5"><Zap size={80}/></div>
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Compromissos</span>
           <div className="flex items-baseline gap-2">
             <span className="text-4xl font-black text-gray-800">{lawyerStats?.totalPendingTasks}</span>
             <span className="text-xs font-bold text-gray-300">em aberto</span>
           </div>
           <div className="mt-2 flex gap-2">
             <span className="text-[9px] font-black px-2 py-0.5 rounded bg-red-50 text-red-500 uppercase">{lawyerStats?.urgentTasks} urgentes</span>
           </div>
        </div>

        <div className="bg-[#8B1538] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-white group">
           <div className="absolute top-0 right-0 p-6 opacity-10"><Scale size={80}/></div>
           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Minha Carteira</span>
           <div className="flex items-baseline gap-2">
             <span className="text-4xl font-black">{lawyerStats?.processesCount}</span>
             <span className="text-xs font-bold text-white/40">dossiês ativos</span>
           </div>
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL - PRAZOS E RANKING */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* COMPROMISSOS IMEDIATOS */}
        <div className="xl:col-span-2 bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-xl">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-serif font-bold text-[#8B1538] flex items-center gap-3">
                 <CalendarCheck2 size={22}/> Prazos Fatais da Semana
              </h3>
              <button className="text-[10px] font-black text-gray-400 hover:text-[#8B1538] uppercase transition-colors">Ver todos os compromissos</button>
           </div>
           
           <div className="space-y-4">
              {lawyerStats?.nextDeadlines.length === 0 ? (
                <div className="py-20 text-center opacity-30 italic font-serif">Nenhum compromisso pendente para esta semana.</div>
              ) : (
                lawyerStats?.nextDeadlines.map(task => (
                  <div key={task.id} className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                     <div className="flex items-center gap-5">
                        <div className={`w-2 h-10 rounded-full ${task.prioridade === 'Urgente' ? 'bg-red-500' : 'bg-[#8B1538]'}`} />
                        <div>
                           <h4 className="text-sm font-bold text-gray-700">{task.titulo}</h4>
                           <div className="flex items-center gap-4 mt-1">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter flex items-center gap-1"><Clock size={12}/> {new Date(task.prazo).toLocaleDateString()}</span>
                              <span className="text-[10px] font-black text-[#8B1538] uppercase tracking-tighter">+{task.pontos} PTS</span>
                           </div>
                        </div>
                     </div>
                     <button className="p-3 text-gray-300 hover:text-green-500 transition-colors"><CheckCircle2 size={22}/></button>
                  </div>
                ))
              )}
           </div>

           <div className="mt-10 p-6 bg-amber-50 border border-amber-100 rounded-[2.5rem] flex items-start gap-4">
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                 <p className="text-sm font-serif font-bold text-amber-900 leading-tight">Lembrete de Compliance:</p>
                 <p className="text-xs font-serif italic text-amber-700 leading-relaxed mt-1">
                    A não atualização mensal do dossiê até o dia 05 gera uma penalidade automática de -10 pontos por processo.
                 </p>
              </div>
           </div>
        </div>

        {/* RANKING LITE - VISÃO RÁPIDA */}
        <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-xl">
           <h3 className="text-xl font-serif font-bold text-[#8B1538] mb-10 flex items-center gap-3">
              <Crown size={22} className="text-amber-500"/> Elite Ciatos
           </h3>
           <div className="space-y-6">
              {ranking.slice(0, 5).map((r, i) => (
                <div key={r.name} className={`flex items-center justify-between p-4 rounded-2xl transition-all ${r.name === currentUser.nome ? 'bg-[#8B1538]/5 ring-1 ring-[#8B1538]/10' : 'hover:bg-gray-50'}`}>
                   <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-black ${i < 3 ? 'text-amber-500' : 'text-gray-300'}`}>{i+1}º</span>
                      <Avatar nome={r.name} size="sm" />
                      <span className={`text-sm font-bold font-serif ${r.name === currentUser.nome ? 'text-[#8B1538]' : 'text-gray-700'}`}>{r.name === currentUser.nome ? 'Você' : r.name}</span>
                   </div>
                   <span className="text-lg font-black text-gray-400">{r.score.toFixed(0)}</span>
                </div>
              ))}
           </div>
           <button className="w-full mt-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black text-[#8B1538] uppercase tracking-widest hover:bg-[#8B1538] hover:text-white transition-all active:scale-95">Ver Ranking Completo</button>
        </div>
      </div>
    </div>
  );

  const renderAdminOrGestorDashboard = () => (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div>
           <h1 className="text-4xl font-bold text-[#8B1538] leading-tight">
             {isAdmin ? 'Painel Executivo Ciatos' : 'Gestão Operacional'}
           </h1>
           <p className="text-[#2D3748] mt-2 font-medium text-[16px] opacity-70 italic">
             {isAdmin ? 'Visão global: Financeiro, Operação e Meritocracia' : 'Monitoramento de Dossiês e Faturamento de Clientes'}
           </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 bg-white px-6 py-3.5 rounded-[1.5rem] border border-gray-100 shadow-sm">
              <Calendar size={18} className="text-[#8B1538]" />
              <select 
                value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} 
                className="text-[11px] font-black uppercase tracking-widest text-gray-500 bg-transparent outline-none cursor-pointer"
              >
                {MESES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
         <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-2">Faturamento Atual</span>
            <span className="text-3xl font-serif font-black text-[#2D3748]">{formatCurrency(finStats.faturamentoMes)}</span>
         </div>
         <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] block mb-2">Inadimplência</span>
            <span className="text-3xl font-serif font-black text-amber-600">{formatCurrency(finStats.inadimplenciaMes)}</span>
         </div>

         { (isAdmin || isFinanceiro) ? (
            <>
              <div className="bg-[#8B1538] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden text-white group hover:scale-[1.02] transition-all">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block mb-2">Recebimento Realizado</span>
                <span className="text-3xl font-serif font-black text-white">{formatCurrency(finStats.recebimentoMes)}</span>
                <div className="mt-4 flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 size={14}/>
                  <span className="text-[9px] font-black uppercase">Caixa Disponível</span>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl group hover:scale-[1.02] transition-all">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-2">Provisionado Sucumbência</span>
                <span className="text-3xl font-serif font-black text-gray-800">{formatCurrency(execStats.sucValue)}</span>
              </div>
            </>
         ) : (
            <>
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                 <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em] block mb-2">Dossiês Ativos</span>
                 <span className="text-3xl font-serif font-black text-[#2D3748]">{execStats.activeCount}</span>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                 <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em] block mb-2">Processos Nível 1</span>
                 <span className="text-3xl font-serif font-black text-[#2D3748]">{execStats.n1Count}</span>
              </div>
            </>
         )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
         { !isFinanceiro && (
            <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-xl">
               <h3 className="text-xl font-serif font-bold text-[#2D3748] mb-10 flex items-center gap-3">
                  <Trophy size={22} className="text-[#8B1538]"/> Ranking Elite do Mês
               </h3>
               <div className="space-y-6">
                  {ranking.slice(0, 5).map((r, i) => (
                    <div key={r.name} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all">
                       <div className="flex items-center gap-4">
                          <span className={`text-xs font-black ${i < 3 ? 'text-[#8B1538]' : 'text-gray-300'}`}>{i+1}º</span>
                          <Avatar nome={r.name} size="sm" />
                          <span className="text-sm font-bold text-gray-700 font-serif">{r.name}</span>
                       </div>
                       <span className="text-lg font-black text-[#8B1538]">{r.score.toFixed(0)}</span>
                    </div>
                  ))}
               </div>
            </div>
         )}

         { (isAdmin || isFinanceiro) ? (
            <div className={`bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-xl ${isFinanceiro ? 'xl:col-span-2' : ''}`}>
              <h3 className="text-xl font-serif font-bold text-[#2D3748] mb-10 flex items-center gap-3">
                 <LineChart size={22} className="text-[#8B1538]"/> Tendência de Liquidez (6 meses)
              </h3>
              <div className="h-64 w-full flex items-end gap-3 px-4 relative">
                 {[...Array(6)].map((_, i) => {
                   const hFat = 100 + Math.random() * 100;
                   const hRec = hFat * 0.8;
                   return (
                     <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex justify-center gap-1">
                           <div className="w-3 bg-[#8B1538]/20 rounded-t" style={{ height: `${hFat}px` }} />
                           <div className="w-3 bg-[#8B1538] rounded-t" style={{ height: `${hRec}px` }} />
                        </div>
                        <span className="text-[9px] font-black text-gray-300 uppercase">Mês -{5-i}</span>
                     </div>
                   );
                 })}
              </div>
            </div>
         ) : (
            <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-xl">
               <h3 className="text-xl font-serif font-bold text-[#2D3748] mb-10 flex items-center gap-3">
                  <BarChart3 size={22} className="text-blue-500"/> Volume de Produção
               </h3>
               <div className="grid grid-cols-2 gap-8">
                  <div className="p-6 bg-gray-50 rounded-3xl">
                     <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Total de Peças</span>
                     <span className="text-2xl font-black text-gray-700">{indicator.volume_juridico.pecas_iniciais + indicator.volume_juridico.defesas}</span>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-3xl">
                     <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Audiências Realizadas</span>
                     <span className="text-2xl font-black text-gray-700">{indicator.volume_juridico.audiencias}</span>
                  </div>
               </div>
               <div className="mt-10 p-6 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-center gap-4">
                  <Zap className="text-blue-500" />
                  <p className="text-sm font-serif italic text-blue-800">A operação está 15% mais célere que no mês passado.</p>
               </div>
            </div>
         )}
      </div>
    </>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-20 relative font-serif-elegant">
      {isAdvogado ? renderLawyerDashboard() : renderAdminOrGestorDashboard()}
    </div>
  );
};

const RefreshCw = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
);

export default DashboardView;
