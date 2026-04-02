
import React, { useMemo, useState } from 'react';
import { 
  Trophy, Medal, Award, Zap, CheckCircle2, ChevronRight, X, ShieldAlert, 
  FileText, Activity, Target, Flame, TrendingUp, TrendingDown, Star, 
  Download, Gem, ArrowRight, Crown, Briefcase, Calendar, BarChart3, 
  Info, TrendingUpDown, PieChart
} from 'lucide-react';
import { Appointment, MonthlyIndicator, QualifiedActivity, PointRule, DailyEntry, DailyEntryType, DailyCategory, ScoreEvent, UserProfile } from '../types';
import { calculateAdvancedScore } from '../utils/productivity';
import { INITIAL_POINT_RULES } from '../constants';
import Avatar from './Avatar';

interface RankingViewProps {
  appointments: Appointment[];
  indicators: MonthlyIndicator[];
  qualifiedActivities: QualifiedActivity[];
  dailyEntries: DailyEntry[];
  dailyEntryTypes: DailyEntryType[];
  dailyCategories: DailyCategory[];
  scoreEvents: ScoreEvent[];
  rules?: PointRule[];
  currentUser: UserProfile;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const META_PRODUTIVIDADE = 500;

const RankingView: React.FC<RankingViewProps> = ({ 
  indicators, qualifiedActivities, dailyEntries, dailyEntryTypes, 
  dailyCategories, scoreEvents, rules = INITIAL_POINT_RULES, currentUser 
}) => {
  const [selectedLawyerName, setSelectedLawyerName] = useState<string | null>(null);

  const rankingData = useMemo(() => {
    const lawyerNames = indicators.length > 0 ? indicators.map(i => i.advogado) : ['Renan Almeida', 'Stephanie', 'Bruna Silva', 'Sarah', 'Deisinay'];

    return lawyerNames.map((name) => {
      const ind = indicators.find(i => i.advogado === name) || {
        advogado: name, mes: 'Fevereiro', ano: 2026,
        bloco_producao: {}, bloco_resultado: {}, bloco_organizacao: {}, bloco_comunicacao: {}, bloco_qualidade: { erros_ocorridos: 0 }, bloco_financeiro: {}
      } as any;

      const calculation = calculateAdvancedScore(ind, rules, qualifiedActivities, dailyEntries, dailyEntryTypes, dailyCategories, scoreEvents);
      
      return {
        name,
        score: calculation.score_total,
        calculation,
        fotoUrl: name === currentUser.nome ? currentUser.fotoUrl : undefined,
      };
    }).sort((a, b) => b.score - a.score);
  }, [indicators, rules, qualifiedActivities, dailyEntries, dailyEntryTypes, dailyCategories, scoreEvents, currentUser]);

  const podium = useMemo(() => rankingData.length >= 3 ? [rankingData[1], rankingData[0], rankingData[2]] : rankingData, [rankingData]);
  
  // Dados históricos para o gráfico da advogada selecionada
  const historyData = useMemo(() => {
    if (!selectedLawyerName) return null;

    return MESES.map(mes => {
      const ind = {
        advogado: selectedLawyerName, mes, ano: 2026,
        bloco_producao: {}, bloco_resultado: {}, bloco_organizacao: {}, bloco_comunicacao: {}, bloco_qualidade: { erros_ocorridos: 0 }, bloco_financeiro: {}
      } as any;

      const calculation = calculateAdvancedScore(ind, rules, qualifiedActivities, dailyEntries, dailyEntryTypes, dailyCategories, scoreEvents);
      return {
        mes,
        total: calculation.score_total,
        breakdown: calculation.breakdown
      };
    });
  }, [selectedLawyerName, rules, qualifiedActivities, dailyEntries, dailyEntryTypes, dailyCategories, scoreEvents]);

  const selectedLawyer = rankingData.find(l => l.name === selectedLawyerName);

  return (
    <div className="animate-in fade-in duration-700 pb-20 font-serif-elegant">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#8B1538] rounded-2xl flex items-center justify-center text-white shadow-2xl rotate-3"><Trophy size={32} /></div>
            <div>
              <h1 className="text-5xl font-serif font-bold text-[#8B1538] tracking-tight">Elite Ciatos</h1>
              <p className="text-[#2D3748] font-medium text-lg opacity-60 italic">Meritocracia, Performance e Reconhecimento</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-8 py-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Meta Individual</span>
            <div className="flex items-center gap-2"><Target size={20} className="text-[#8B1538]" /><span className="text-2xl font-serif font-bold text-[#2D3748]">{META_PRODUTIVIDADE} pts</span></div>
          </div>
          <button onClick={() => window.print()} className="p-5 bg-white border border-gray-100 text-[#8B1538] rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all group"><Download size={24}/></button>
        </div>
      </div>

      {/* PODIUM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24 items-end max-w-6xl mx-auto">
        {podium.map((lawyer, idx) => {
          const isFirst = lawyer.name === rankingData[0].name;
          return (
            <div key={lawyer.name} onClick={() => setSelectedLawyerName(lawyer.name)} className={`flex flex-col items-center group cursor-pointer transition-all duration-500 ${isFirst ? 'scale-110 mb-10' : ''}`}>
              <div className="relative mb-8">
                <div className={`rounded-full p-2 shadow-2xl bg-white relative transition-transform group-hover:rotate-6 ${isFirst ? 'ring-8 ring-amber-400/20' : 'ring-8 ring-slate-200/50'}`}>
                  <Avatar nome={lawyer.name} fotoUrl={lawyer.fotoUrl} size="xl" className="!w-44 !h-44 !text-5xl" />
                  {isFirst && <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce"><Crown size={40} fill="currentColor" /></div>}
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-serif font-bold text-[#2D3748] mb-1">{lawyer.name}</h3>
                <div className="mt-8 flex flex-col items-center">
                   <div className="flex items-baseline gap-1">
                     <span className={`text-6xl font-serif font-bold ${isFirst ? 'text-amber-500' : 'text-[#8B1538]'}`}>{lawyer.score.toFixed(0)}</span>
                     <span className="text-sm font-black text-gray-300 uppercase tracking-widest">pts</span>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* LISTA DO RANKING */}
      <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-10 py-6 text-[10px] font-black text-gray-300 uppercase tracking-widest">Pos</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-300 uppercase tracking-widest">Advogado</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-300 uppercase tracking-widest text-center">Score Atual</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-300 uppercase tracking-widest text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rankingData.map((lawyer, idx) => (
              <tr key={lawyer.name} onClick={() => setSelectedLawyerName(lawyer.name)} className="hover:bg-[#8B1538]/[0.02] group cursor-pointer transition-colors">
                <td className="px-10 py-8"><div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[15px] font-black shadow-sm ${idx < 3 ? 'bg-[#8B1538] text-white' : 'bg-gray-100 text-gray-400'}`}>{idx + 1}º</div></td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-4">
                    <Avatar nome={lawyer.name} fotoUrl={lawyer.fotoUrl} size="md" />
                    <span className="text-[19px] font-serif font-bold text-[#2D3748]">{lawyer.name}</span>
                  </div>
                </td>
                <td className="px-10 py-8 text-center"><span className="text-2xl font-serif font-bold text-[#8B1538]">{lawyer.score.toFixed(0)}</span></td>
                <td className="px-10 py-8 text-right"><button className="flex items-center gap-2 ml-auto text-[10px] font-black text-[#8B1538] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Ver Histórico <ChevronRight size={18}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE HISTÓRICO MENSAL */}
      {selectedLawyerName && historyData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4 overflow-y-auto">
           <div className="bg-white rounded-[3.5rem] w-full max-w-5xl shadow-2xl animate-in zoom-in duration-500 my-10 overflow-hidden flex flex-col lg:flex-row">
              {/* Sidebar do Modal */}
              <div className="lg:w-80 bg-gray-50 p-10 flex flex-col items-center text-center border-r border-gray-100">
                 <button onClick={() => setSelectedLawyerName(null)} className="self-start text-gray-300 hover:text-red-500 mb-8 transition-colors"><X size={28}/></button>
                 <Avatar nome={selectedLawyerName} fotoUrl={selectedLawyer?.fotoUrl} size="xl" className="mb-6 shadow-xl ring-4 ring-white" />
                 <h3 className="text-2xl font-serif font-bold text-gray-800">{selectedLawyerName}</h3>
                 <span className="text-[10px] font-black text-[#8B1538] uppercase tracking-widest bg-[#8B1538]/5 px-4 py-1.5 rounded-full mt-2 border border-[#8B1538]/10">Membro Elite</span>
                 
                 <div className="w-full space-y-6 mt-12 pt-10 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-gray-400 uppercase">Média do Ano</span>
                       <span className="text-sm font-bold text-gray-700">
                         {(historyData.reduce((acc, h) => acc + h.total, 0) / 12).toFixed(1)} pts
                       </span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-gray-400 uppercase">Melhor Mês</span>
                       <span className="text-sm font-bold text-green-600">
                         {Math.max(...historyData.map(h => h.total)).toFixed(0)} pts
                       </span>
                    </div>
                 </div>

                 <div className="mt-auto pt-10 w-full">
                    <button className="w-full py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-all"><Download size={16}/> Exportar Prontuário</button>
                 </div>
              </div>

              {/* Conteúdo Principal do Modal (GRÁFICO) */}
              <div className="flex-1 p-12 bg-white">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                    <div>
                       <h2 className="text-3xl font-serif font-bold text-[#2D3748]">Jornada de Performance</h2>
                       <p className="text-gray-400 font-serif italic text-sm mt-1">Histórico mensal de meritocracia — Exercício 2026</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">
                       <BarChart3 size={20} className="text-[#8B1538]" />
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Evolução Anual</span>
                    </div>
                 </div>

                 {/* Gráfico de Barras Customizado */}
                 <div className="h-80 w-full flex items-end gap-3 relative mb-16 px-4">
                    {historyData.map((item, i) => {
                      const maxScore = Math.max(...historyData.map(h => h.total), 500);
                      const height = (item.total / maxScore) * 250;
                      const isCurrent = item.mes === 'Fevereiro';
                      
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group relative">
                           <div className="w-full flex justify-center items-end">
                              <div 
                                className={`w-full max-w-[45px] rounded-t-2xl transition-all duration-1000 shadow-lg relative
                                  ${isCurrent ? 'bg-gradient-to-t from-[#8B1538] to-[#ab1a45] scale-x-110 z-10' : 'bg-gray-100 hover:bg-gray-200'}`} 
                                style={{ height: `${Math.max(15, height)}px` }}
                              >
                                 <div className={`absolute -top-12 left-1/2 -translate-x-1/2 text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-all
                                   ${isCurrent ? 'bg-[#8B1538] text-white opacity-100' : 'bg-gray-700 text-white opacity-0 group-hover:opacity-100'} shadow-xl`}>
                                    {item.total.toFixed(0)}
                                 </div>
                              </div>
                           </div>
                           <span className={`text-[9px] font-black uppercase tracking-tighter ${isCurrent ? 'text-[#8B1538]' : 'text-gray-300'}`}>
                             {item.mes.substring(0, 3)}
                           </span>
                        </div>
                      );
                    })}
                    {/* Linhas de Grade */}
                    <div className="absolute inset-0 flex flex-col justify-between opacity-[0.03] pointer-events-none border-b border-gray-300">
                       {[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-black"/>)}
                    </div>
                 </div>

                 {/* Breakdown do Último Mês */}
                 <div className="bg-gray-50/50 rounded-[2.5rem] p-10 border border-gray-100">
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-10 flex items-center gap-3">
                       <PieChart size={18} className="text-[#8B1538]" /> Composição Tática (Fev/26)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                       {[
                         { label: 'Produção', val: selectedLawyer?.calculation.breakdown.producao, color: 'bg-blue-500' },
                         { label: 'Resultados', val: selectedLawyer?.calculation.breakdown.resultado, color: 'bg-green-500' },
                         { label: 'Impacto', val: selectedLawyer?.calculation.breakdown.impacto, color: 'bg-purple-500' },
                         { label: 'Penalidades', val: -(selectedLawyer?.calculation.penalidades || 0), color: 'bg-red-500' },
                       ].map(b => (
                         <div key={b.label} className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                               <span>{b.label}</span>
                               <span className={b.val! < 0 ? 'text-red-500' : 'text-gray-700'}>{b.val?.toFixed(0)}</span>
                            </div>
                            <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-gray-100">
                               <div className={`h-full ${b.color} rounded-full`} style={{ width: `${Math.min(100, (Math.abs(b.val!) / (selectedLawyer?.score || 1)) * 100)}%` }} />
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="mt-10 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                    <Info className="text-amber-500 shrink-0 mt-0.5" size={18}/>
                    <p className="text-xs font-serif italic text-amber-800 leading-relaxed">
                       A pontuação histórica é consolidada após a validação final da gestora jurídica. Dados anteriores ao mês atual refletem auditorias já encerradas.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default RankingView;
