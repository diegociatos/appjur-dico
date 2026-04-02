
import React, { useMemo } from 'react';
import { 
  Target, 
  Zap, 
  DollarSign, 
  ShieldAlert, 
  TrendingUp, 
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
// Fix: Added missing types for Props and getLawyerScore call
import { Appointment, MonthlyIndicator, QualifiedActivity, DailyEntry, DailyEntryType, DailyCategory } from '../types';
import { getLawyerScore } from '../utils/productivity';

interface ScoreDetailViewProps {
  appointments: Appointment[];
  indicators: MonthlyIndicator[];
  qualifiedActivities: QualifiedActivity[];
  // Fix: Added missing props to match getLawyerScore requirements
  dailyEntries: DailyEntry[];
  dailyEntryTypes: DailyEntryType[];
  dailyCategories: DailyCategory[];
}

const ScoreDetailView: React.FC<ScoreDetailViewProps> = ({ 
  appointments, 
  indicators, 
  qualifiedActivities,
  dailyEntries,
  dailyEntryTypes,
  dailyCategories
}) => {
  // Fix: Explicitly cast to string[] to avoid 'unknown' type inference issues
  const lawyers = Array.from(new Set(appointments.map(a => a.advogado))) as string[];
  
  const scores = useMemo(() => {
    return lawyers.map(name => ({
      name,
      // Fix: Passed all 7 required arguments to getLawyerScore
      ...getLawyerScore(name, appointments, indicators, qualifiedActivities, dailyEntries, dailyEntryTypes, dailyCategories)
    })).sort((a, b) => b.total - a.total);
  }, [lawyers, appointments, indicators, qualifiedActivities, dailyEntries, dailyEntryTypes, dailyCategories]);

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#8B1538] leading-tight text-shadow-sm">Modelo de Meritocracia</h1>
          <p className="text-[#2D3748] mt-1 font-medium text-[15px] opacity-70">A transparência que impulsiona a alta performance jurídica</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 text-amber-700">
          <Award size={18} fill="currentColor" />
          <span className="text-[10px] font-black uppercase tracking-widest">Score de Excelência</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {scores.map((s, idx) => (
          <div key={s.name} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
            <div className="p-10 flex flex-col xl:flex-row gap-12 items-center">
              
              {/* Profile & Total Score */}
              <div className="flex flex-col items-center text-center space-y-4 shrink-0">
                <div className="relative">
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-serif font-bold border-4 border-white shadow-xl 
                    ${idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : 'bg-gray-50 text-[#8B1538]'}`}>
                    {s.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white px-3 py-1.5 rounded-full shadow-lg border border-gray-50 flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-gray-400 uppercase">Pos</span>
                    <span className="text-sm font-black text-[#8B1538]">{idx + 1}º</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-[#2D3748]">{s.name}</h3>
                  <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {s.total > 800 ? '⭐ Elite' : s.total > 400 ? '🔹 Performance' : '🔸 Em Evolução'}
                  </div>
                </div>
                <div className="pt-4">
                  <span className="text-5xl font-serif font-bold text-[#8B1538]">{s.total.toFixed(0)}</span>
                  <span className="block text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mt-1">Pontos Consolidados</span>
                </div>
              </div>

              {/* Composition Grid */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-6 w-full">
                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center text-center group-hover:bg-white group-hover:shadow-md transition-all">
                  <div className="p-3 bg-purple-50 text-[#6F42C1] rounded-2xl mb-4"><Zap size={24} fill="currentColor" /></div>
                  <span className="text-2xl font-serif font-bold">{s.breakdown.impact.toFixed(0)}</span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Impacto (40%)</span>
                </div>
                
                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center text-center group-hover:bg-white group-hover:shadow-md transition-all">
                  <div className="p-3 bg-green-50 text-[#28A745] rounded-2xl mb-4"><DollarSign size={24} /></div>
                  <span className="text-2xl font-serif font-bold">{s.breakdown.result.toFixed(0)}</span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Resultado (25%)</span>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center text-center group-hover:bg-white group-hover:shadow-md transition-all">
                  <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl mb-4"><Target size={24} /></div>
                  <span className="text-2xl font-serif font-bold">{s.breakdown.tactical.toFixed(0)}</span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Tático (20%)</span>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center text-center group-hover:bg-white group-hover:shadow-md transition-all">
                  <div className="p-3 bg-red-50 text-red-500 rounded-2xl mb-4"><ShieldAlert size={24} /></div>
                  <span className="text-2xl font-serif font-bold text-red-600">-{s.breakdown.penalty}</span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Penalidade</span>
                </div>
              </div>

              {/* Action */}
              <div className="shrink-0 flex flex-col gap-3">
                <button className="flex items-center gap-2 px-6 py-4 bg-[#8B1538] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#8B1538]/20 hover:bg-[#72112d] transition-all">
                  Plano de Carreira
                  <ChevronRight size={18} />
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-4 border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50">
                  <Info size={14} /> Detalhar KPI
                </button>
              </div>

            </div>
            
            {/* Visual Feedback Bar */}
            <div className="h-2 w-full bg-gray-50 flex">
              <div className="h-full bg-[#6F42C1] opacity-60" style={{ width: `${(s.breakdown.impact / (s.total || 1)) * 100}%` }}></div>
              <div className="h-full bg-[#28A745] opacity-60" style={{ width: `${(s.breakdown.result / (s.total || 1)) * 100}%` }}></div>
              <div className="h-full bg-blue-500 opacity-60" style={{ width: `${(s.breakdown.tactical / (s.total || 1)) * 100}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h4 className="text-xl font-serif font-bold text-[#8B1538] mb-8 flex items-center gap-3">
          <TrendingUp className="text-[#8B1538]" size={24} />
          Interpretando o Modelo de Score
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Volume vs Qualidade</span>
            <p className="text-sm text-gray-500 leading-relaxed font-serif italic">
              "Um volume excessivo de peças táticas sem impacto estratégico limita o crescimento do score. O Ciatos prioriza a inteligência sobre a repetição."
            </p>
          </div>
          <div className="space-y-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Responsabilidade Técnica</span>
            <p className="text-sm text-gray-500 leading-relaxed font-serif italic">
              "Peças marcadas para revisão ou prazos fatais perdidos geram penalidades severas que anulam ganhos táticos do mês."
            </p>
          </div>
          <div className="space-y-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Geração de Valor</span>
            <p className="text-sm text-gray-500 leading-relaxed font-serif italic">
              "Honorários de êxito e acordos favoráveis são os maiores alavancadores de pontuação, pois representam o sucesso financeiro direto da banca."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreDetailView;