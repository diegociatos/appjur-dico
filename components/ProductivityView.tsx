
import React, { useMemo } from 'react';
import { 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Calendar,
  ChevronDown,
  Star
} from 'lucide-react';
import { Appointment, MonthlyIndicator } from '../types';
import { calculatePoints } from '../utils/productivity';

interface ProductivityViewProps {
  appointments: Appointment[];
  indicators: MonthlyIndicator[];
}

const ProductivityView: React.FC<ProductivityViewProps> = ({ appointments, indicators }) => {
  const metrics = useMemo(() => {
    const completed = appointments.filter(a => a.status === 'CONCLUÍDO');
    const tacticalPoints = completed.reduce((acc, a) => acc + calculatePoints(a), 0);
    
    const onTime = completed.filter(a => {
      if (!a.prazo || !a.data_conclusao) return true;
      return new Date(a.data_conclusao) <= new Date(a.prazo + 'T23:59:59');
    }).length;

    const urgentCompleted = completed.filter(a => a.urgente).length;
    const punctualityRate = completed.length > 0 ? (onTime / completed.length) * 100 : 0;

    const lawyerData: Record<string, { points: number, completed: number, delays: number }> = {};
    
    appointments.forEach(a => {
      if (!lawyerData[a.advogado]) {
        lawyerData[a.advogado] = { points: 0, completed: 0, delays: 0 };
      }
      
      if (a.status === 'CONCLUÍDO') {
        lawyerData[a.advogado].points += calculatePoints(a);
        lawyerData[a.advogado].completed += 1;
        
        if (a.prazo && a.data_conclusao) {
          if (new Date(a.data_conclusao) > new Date(a.prazo + 'T23:59:59')) {
            lawyerData[a.advogado].delays += 1;
          }
        }
      }
    });

    const sortedLawyers = Object.entries(lawyerData)
      .map(([name, data]) => ({
        name,
        ...data,
        punctuality: data.completed > 0 ? ((data.completed - data.delays) / data.completed) * 100 : 100
      }))
      .sort((a, b) => b.points - a.points);

    return {
      totalPoints: tacticalPoints,
      completedCount: completed.length,
      punctualityRate,
      urgentCompleted,
      lawyers: sortedLawyers
    };
  }, [appointments]);

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#8B1538] leading-tight">Produtividade</h1>
          <p className="text-[#2D3748] mt-1 font-medium text-[15px] opacity-70">Indicadores de performance e eficiência operacional</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-[#8B1538]/30 text-[#8B1538] px-5 py-2.5 rounded-lg font-bold text-sm transition-all hover:bg-[#8B1538] hover:text-white active:scale-95 shadow-sm">
          <Download size={18} />
          Relatório Completo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-purple-50">
              <Star size={20} className="text-[#6F42C1]" fill="currentColor" />
            </div>
            <span className="text-[10px] text-green-600 font-black uppercase tracking-widest">+12%</span>
          </div>
          <div>
            <span className="block text-3xl font-serif font-bold text-[#2D3748] leading-none">{metrics.totalPoints.toFixed(1)}</span>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Pontos Táticos</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="p-2 rounded-lg bg-green-50 w-fit">
            <CheckCircle2 size={20} className="text-[#28A745]" />
          </div>
          <div>
            <span className="block text-3xl font-serif font-bold text-[#2D3748] leading-none">{metrics.completedCount}</span>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Tarefas Concluídas</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="p-2 rounded-lg bg-blue-50 w-fit">
            <TrendingUp size={20} className="text-blue-500" />
          </div>
          <div>
            <span className="block text-3xl font-serif font-bold text-[#2D3748] leading-none">{metrics.punctualityRate.toFixed(0)}%</span>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Taxa de Pontualidade</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="p-2 rounded-lg bg-red-50 w-fit">
            <Zap size={20} className="text-[#DC3545]" fill="currentColor" />
          </div>
          <div>
            <span className="block text-3xl font-serif font-bold text-[#2D3748] leading-none">{metrics.urgentCompleted}</span>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Urgências Atendidas</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/20">
            <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Performance Individual</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Advogado</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Pontos</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Entregas</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Qualidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metrics.lawyers.map((lawyer) => (
                  <tr key={lawyer.name} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#8B1538] font-serif font-bold text-xs border border-gray-100">
                          {lawyer.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[14px] font-serif font-semibold text-[#2D3748]">{lawyer.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-[15px] font-serif font-bold text-[#8B1538]">{lawyer.points.toFixed(1)}</span>
                    </td>
                    <td className="px-8 py-5 text-center text-[13px] font-medium text-gray-600 font-serif">{lawyer.completed}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${lawyer.punctuality > 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                            style={{ width: `${lawyer.punctuality}%` }}
                          />
                        </div>
                        <span className="text-[12px] font-bold text-gray-700 w-10">{lawyer.punctuality.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
          <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] mb-8">Insights de Gestão</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600 h-fit">
                <AlertTriangle size={16} />
              </div>
              <div>
                <h4 className="text-[12px] font-bold text-[#2D3748] mb-1">Concentração de Carga</h4>
                <p className="text-[12px] text-gray-500 leading-relaxed">Stephanie e Renan concentram 65% das tarefas concluídas do mês.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-2 bg-green-50 rounded-lg text-green-600 h-fit">
                <TrendingUp size={16} />
              </div>
              <div>
                <h4 className="text-[12px] font-bold text-[#2D3748] mb-1">Qualidade Ascendente</h4>
                <p className="text-[12px] text-gray-500 leading-relaxed">O índice de revisão reduziu em 15% comparado ao mês anterior.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-10 pt-10 border-t border-gray-50">
            <button className="w-full py-3 border border-dashed border-gray-200 rounded-lg text-[11px] font-black uppercase tracking-widest text-gray-400 hover:border-[#8B1538] hover:text-[#8B1538] transition-all">
              Configurar Metas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityView;
