
import React, { useMemo, useState } from 'react';
import { 
  Briefcase, 
  Layers, 
  DollarSign, 
  Scale, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Users, 
  ChevronDown,
  Calendar,
  Filter,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import { Processo } from '../types';

interface ProcessDashboardViewProps {
  processes: Processo[];
}

const ProcessDashboardView: React.FC<ProcessDashboardViewProps> = ({ processes }) => {
  const [lawyerFilter, setLawyerFilter] = useState('Todos');
  const [periodFilter, setPeriodFilter] = useState('Todos');

  const lawyers = useMemo(() => Array.from(new Set(processes.map(p => p.advogado_responsavel))), [processes]);

  const filteredData = useMemo(() => {
    return processes.filter(p => {
      const matchesLawyer = lawyerFilter === 'Todos' ? true : p.advogado_responsavel === lawyerFilter;
      // Período simplificado para demonstração
      return matchesLawyer;
    });
  }, [processes, lawyerFilter]);

  // Cálculos dos Cards
  const stats = useMemo(() => {
    const active = filteredData.filter(p => p.status === 'Ativo');
    const n1 = filteredData.filter(p => p.tipo_processo === 'Nível 1');
    const contractual = filteredData
      .filter(p => p.tipo_processo === 'Honorários Contratuais')
      .reduce((acc, curr) => acc + curr.valor_honorarios, 0);
    const success = filteredData
      .filter(p => p.tipo_processo === 'Honorários Sucumbenciais')
      .reduce((acc, curr) => acc + curr.valor_honorarios, 0);

    return { 
      activeCount: active.length, 
      n1Count: n1.length, 
      contractual, 
      success 
    };
  }, [filteredData]);

  // Processos sem atualização > 30 dias
  const inertiaAlerts = useMemo(() => {
    const now = new Date();
    return filteredData.filter(p => {
      const lastUpdateStr = p.timeline[0]?.data_atualizacao || p.data_cadastro;
      const lastUpdate = new Date(lastUpdateStr);
      const diffTime = Math.abs(now.getTime() - lastUpdate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 30;
    }).map(p => {
      const lastUpdateStr = p.timeline[0]?.data_atualizacao || p.data_cadastro;
      const diff = Math.ceil(Math.abs(now.getTime() - new Date(lastUpdateStr).getTime()) / (1000 * 60 * 60 * 24));
      return { ...p, daysWithoutUpdate: diff };
    });
  }, [filteredData]);

  // Processos com risco na última atualização
  const riskAlerts = useMemo(() => {
    return filteredData.filter(p => p.timeline[0]?.riscos_identificados);
  }, [filteredData]);

  // Dados Gráfico: Processos por Advogado
  const processesByLawyer = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(p => {
      counts[p.advogado_responsavel] = (counts[p.advogado_responsavel] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [filteredData]);

  // Dados Gráfico: Por Tipo
  const processesByType = useMemo(() => {
    const n1 = filteredData.filter(p => p.tipo_processo === 'Nível 1').length;
    const cont = filteredData.filter(p => p.tipo_processo === 'Honorários Contratuais').length;
    const suc = filteredData.filter(p => p.tipo_processo === 'Honorários Sucumbenciais').length;
    const total = filteredData.length || 1;
    return [
      { label: 'Nível 1', value: n1, color: 'bg-purple-500', pct: (n1/total)*100 },
      { label: 'Contratuais', value: cont, color: 'bg-blue-500', pct: (cont/total)*100 },
      { label: 'Sucumbenciais', value: suc, color: 'bg-amber-500', pct: (suc/total)*100 },
    ];
  }, [filteredData]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Header & Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#8B1538] leading-tight">Dashboard de Processos</h1>
          <p className="text-[#2D3748] mt-1 font-medium text-[15px] opacity-70">Controle estratégico de honorários e monitoramento de inércia</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm">
            <Users size={16} className="text-[#8B1538]" />
            <select 
              value={lawyerFilter} 
              onChange={(e) => setLawyerFilter(e.target.value)}
              className="text-[11px] font-black text-gray-600 uppercase tracking-widest bg-transparent outline-none cursor-pointer"
            >
              <option value="Todos">Todos Advogados</option>
              {lawyers.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <ChevronDown size={14} className="text-gray-400" />
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm">
            <Calendar size={16} className="text-[#8B1538]" />
            <select 
              value={periodFilter} 
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="text-[11px] font-black text-gray-600 uppercase tracking-widest bg-transparent outline-none cursor-pointer"
            >
              <option value="Todos">Todo Período</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Cards de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg w-fit mb-4"><Briefcase size={20} /></div>
          <span className="block text-3xl font-serif font-bold text-[#2D3748]">{stats.activeCount}</span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Processos Ativos</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg w-fit mb-4"><Layers size={20} /></div>
          <span className="block text-3xl font-serif font-bold text-[#2D3748]">{stats.n1Count}</span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Nível 1 (Estratégicos)</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit mb-4"><DollarSign size={20} /></div>
          <span className="block text-xl font-serif font-bold text-[#2D3748] truncate">{formatCurrency(stats.contractual)}</span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Honorários Contratuais</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-b-4 border-b-[#8B1538]">
          <div className="p-2 bg-amber-50 text-[#8B1538] rounded-lg w-fit mb-4"><Scale size={20} /></div>
          <span className="block text-xl font-serif font-bold text-[#2D3748] truncate">{formatCurrency(stats.success)}</span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Honorários Sucumbenciais</span>
        </div>
      </div>

      {/* Seção de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Gráfico 1: Por Advogado */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-8">Processos por Advogado</h3>
          <div className="space-y-6">
            {processesByLawyer.map(([name, count]) => {
              const max = Math.max(...processesByLawyer.map(i => i[1])) || 1;
              const pct = (count / max) * 100;
              return (
                <div key={name} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                    <span>{name}</span>
                    <span className="bg-gray-50 px-2 py-0.5 rounded text-[#8B1538]">{count} processos</span>
                  </div>
                  <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#8B1538] rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico 2: Por Tipo (Pizza Custom) */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
          <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-8 text-center">Distribuição por Tipo</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
             <div className="relative w-40 h-40 mb-8">
               {/* Representação visual simplificada de "Pizza" com círculos e strokes */}
               <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                 <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f3f4f6" strokeWidth="4"></circle>
                 {processesByType.map((item, i) => {
                   let offset = 0;
                   for(let j=0; j<i; j++) offset += processesByType[j].pct;
                   return (
                    <circle 
                      key={item.label}
                      cx="18" cy="18" r="16" 
                      fill="transparent" 
                      stroke={item.color === 'bg-purple-500' ? '#a855f7' : item.color === 'bg-blue-500' ? '#3b82f6' : '#f59e0b'}
                      strokeWidth="4" 
                      strokeDasharray={`${item.pct} 100`} 
                      strokeDashoffset={-offset}
                    />
                   )
                 })}
               </svg>
               <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-serif font-bold text-[#2D3748]">{filteredData.length}</span>
                  <span className="text-[8px] font-black text-gray-400 uppercase">Total</span>
               </div>
             </div>
             
             <div className="w-full space-y-3">
                {processesByType.map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                      <span className="text-xs font-bold text-gray-500">{item.label}</span>
                    </div>
                    <span className="text-xs font-black text-[#2D3748]">{item.value} ({item.pct.toFixed(0)}%)</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Gráfico 3: Evolução Honorários (Linha Custom) */}
      <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm mb-10">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Evolução Estimada de Honorários (Ano Vigente)</h3>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-tight">
            <div className="flex items-center gap-1 text-blue-500"><div className="w-3 h-1 bg-blue-500 rounded"></div> Contratuais</div>
            <div className="flex items-center gap-1 text-amber-500"><div className="w-3 h-1 bg-amber-500 rounded"></div> Sucumbenciais</div>
          </div>
        </div>
        <div className="h-48 w-full flex items-end gap-1 relative pt-8">
           {/* Mockup de evolução mensal */}
           {Array.from({length: 12}).map((_, i) => {
             const h1 = 20 + Math.random() * 60;
             const h2 = 10 + Math.random() * 40;
             return (
               <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full flex justify-center gap-0.5">
                    <div className="w-2 bg-blue-100 group-hover:bg-blue-500 transition-colors rounded-t" style={{ height: `${h1}px` }}></div>
                    <div className="w-2 bg-amber-100 group-hover:bg-amber-500 transition-colors rounded-t" style={{ height: `${h2}px` }}></div>
                  </div>
                  <span className="text-[8px] font-black text-gray-300 uppercase mt-2">Mes {i+1}</span>
               </div>
             )
           })}
           {/* Grid lines */}
           <div className="absolute inset-0 flex flex-col justify-between opacity-5 pointer-events-none">
             {[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-gray-800"></div>)}
           </div>
        </div>
      </div>

      {/* Seção de Alertas e Riscos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tabela de Alertas de Inércia */}
        <div className="bg-white rounded-3xl border border-red-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-red-50 bg-red-50/30 flex items-center justify-between">
            <h3 className="text-[11px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
              <Clock size={16} /> Alerta de Inércia (>30 dias)
            </h3>
            <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full">{inertiaAlerts.length} casos</span>
          </div>
          <div className="flex-1 max-h-[400px] overflow-y-auto scrollbar-hide">
             {inertiaAlerts.length > 0 ? (
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-gray-50/30 border-b border-gray-50">
                     <th className="px-8 py-3 text-[9px] font-black text-gray-400 uppercase">Processo</th>
                     <th className="px-8 py-3 text-[9px] font-black text-gray-400 uppercase">Advogado</th>
                     <th className="px-8 py-3 text-[9px] font-black text-gray-400 uppercase text-right">Dias Parado</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {inertiaAlerts.map(p => (
                      <tr key={p.id} className="hover:bg-red-50/10 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-mono font-bold text-gray-800">{p.numero_processo}</span>
                            <span className="text-[10px] text-gray-400 font-serif">{p.cliente}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-xs font-bold text-gray-600 font-serif">{p.advogado_responsavel}</span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <span className="text-sm font-black text-red-500">{p.daysWithoutUpdate} dias</span>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             ) : (
               <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                  <CheckCircle2 size={32} className="text-green-500 mb-2" />
                  <p className="text-xs font-serif italic">Todos os processos estratégicos em dia.</p>
               </div>
             )}
          </div>
        </div>

        {/* Tabela de Riscos Identificados */}
        <div className="bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-orange-50 bg-orange-50/30 flex items-center justify-between">
            <h3 className="text-[11px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={16} /> Riscos Estratégicos Detectados
            </h3>
            <span className="text-[10px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full">{riskAlerts.length} alertas</span>
          </div>
          <div className="flex-1 max-h-[400px] overflow-y-auto scrollbar-hide">
            {riskAlerts.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {riskAlerts.map(p => (
                  <div key={p.id} className="p-8 hover:bg-orange-50/10 transition-colors space-y-3">
                    <div className="flex justify-between items-start">
                       <div>
                         <span className="block text-xs font-mono font-bold text-gray-800">{p.numero_processo}</span>
                         <span className="text-[10px] text-gray-400 font-serif font-bold uppercase">{p.cliente}</span>
                       </div>
                       <div className="bg-orange-100 text-orange-700 text-[8px] font-black px-2 py-0.5 rounded uppercase">Risco de Perda</div>
                    </div>
                    <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100/30">
                       <span className="block text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">Última Observação do Advogado</span>
                       <p className="text-xs text-orange-900 font-medium leading-relaxed italic">"{p.timeline[0]?.riscos_identificados}"</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                  <TrendingUp size={32} className="text-blue-500 mb-2" />
                  <p className="text-xs font-serif italic">Nenhum risco crítico reportado pelos advogados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessDashboardView;
