
import React, { useState } from 'react';
import { GoogleGenAI, Type as GenAIType } from '@google/genai';
import { 
  Sparkles, 
  BrainCircuit, 
  AlertTriangle, 
  Target, 
  Search, 
  Download, 
  RefreshCcw, 
  CheckCircle2,
  Star,
  Users,
  TrendingUp,
  Coins
} from 'lucide-react';
import { Appointment, MonthlyIndicator, OfficeIndicator } from '../types';

interface ExecutiveReport {
  leitura_geral: string;
  destaques_positivos: string[];
  riscos: string[];
  sugestoes_bonificacao: string[];
  conversas_individuais: string[];
  pontos_atencao_proximo_mes: string[];
}

interface ReportsViewProps {
  appointments: Appointment[];
  indicators: MonthlyIndicator[];
  officeIndicator: OfficeIndicator;
}

const ReportsView: React.FC<ReportsViewProps> = ({ appointments, indicators, officeIndicator }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ExecutiveReport | null>(null);

  const generateAIReport = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const contents = `Aja como o Consultor Estratégico Sênior da banca Ciatos Jurídico. 
      Analise os dados abaixo e gere um relatório executivo de alta gestão.
      
      DADOS DO ESCRITÓRIO: ${JSON.stringify(officeIndicator)}
      PONTUAÇÃO TÁTICA: ${JSON.stringify(appointments.map(a => ({ status: a.status, advogado: a.advogado, tipo: a.tipo })))}
      PERFORMANCE INDIVIDUAL: ${JSON.stringify(indicators)}
      
      ESTRUTURA DO RELATÓRIO (JSON):
      1. leitura_geral: Um parágrafo executivo sobre a saúde da banca.
      2. destaques_positivos: Lista de advogados ou setores que brilharam.
      3. riscos: Alertas operacionais, financeiros ou humanos.
      4. sugestoes_bonificacao: Quem merece prêmio e por quê.
      5. conversas_individuais: Quem precisa de feedback e qual o foco.
      6. pontos_atencao_proximo_mes: O que o gestor deve focar agora.
      
      Tom: Executivo, direto, sem juridiquês.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: GenAIType.OBJECT,
            properties: {
              leitura_geral: { type: GenAIType.STRING },
              destaques_positivos: { type: GenAIType.ARRAY, items: { type: GenAIType.STRING } },
              riscos: { type: GenAIType.ARRAY, items: { type: GenAIType.STRING } },
              sugestoes_bonificacao: { type: GenAIType.ARRAY, items: { type: GenAIType.STRING } },
              conversas_individuais: { type: GenAIType.ARRAY, items: { type: GenAIType.STRING } },
              pontos_atencao_proximo_mes: { type: GenAIType.ARRAY, items: { type: GenAIType.STRING } },
            },
            required: ["leitura_geral", "destaques_positivos", "riscos", "sugestoes_bonificacao", "conversas_individuais", "pontos_atencao_proximo_mes"],
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setReport(result);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#8B1538] leading-tight flex items-center gap-3">
            Consultoria Estratégica
            <Sparkles className="text-amber-400" size={24} fill="currentColor" />
          </h1>
          <p className="text-[#2D3748] mt-1 font-medium text-[15px] opacity-70">Diagnóstico 360º de performance, pessoas e resultados</p>
        </div>
        
        {report && (
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-5 py-2.5 rounded-lg font-bold text-sm transition-all hover:bg-gray-50 active:scale-95 shadow-sm"
          >
            <Download size={18} />
            Imprimir Relatório
          </button>
        )}
      </div>

      {!report && !loading && (
        <div className="bg-white rounded-[2.5rem] p-20 border border-dashed border-gray-200 flex flex-col items-center text-center shadow-sm">
          <div className="w-24 h-24 bg-[#8B1538]/5 rounded-3xl flex items-center justify-center mb-8 rotate-3">
            <BrainCircuit size={48} className="text-[#8B1538]" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#2D3748] mb-4">Gerar Diagnóstico de Gestão</h2>
          <p className="text-gray-500 max-w-sm mb-12 text-[15px] leading-relaxed">
            Analise cruzada de métricas operacionais, financeiras e clima organizacional processada pela nossa inteligência executiva.
          </p>
          <button 
            onClick={generateAIReport}
            className="flex items-center gap-4 bg-[#8B1538] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#8B1538]/20 hover:bg-[#72112d] transition-all active:scale-95"
          >
            <Sparkles size={20} />
            Iniciar Análise Estratégica
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-[2.5rem] p-20 border border-gray-100 flex flex-col items-center text-center shadow-sm">
          <div className="w-20 h-20 bg-[#8B1538]/10 rounded-full flex items-center justify-center mb-8">
            <RefreshCcw size={40} className="text-[#8B1538] animate-spin" />
          </div>
          <h2 className="text-xl font-serif font-bold text-[#2D3748] mb-2">Auditoria de Dados em Curso...</h2>
          <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Identificando riscos humanos e gargalos operacionais</p>
        </div>
      )}

      {report && !loading && (
        <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
          {/* Leitura Geral */}
          <div className="bg-[#8B1538] rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <TrendingUp size={240} />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4 block">Visão do Consultor</span>
              <h3 className="text-2xl font-serif font-bold mb-6">Leitura Geral da Operação</h3>
              <p className="text-xl font-serif leading-relaxed opacity-90 max-w-4xl italic">
                "{report.leitura_geral}"
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Destaques Positivos */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm group">
              <h3 className="text-[11px] font-black uppercase tracking-widest mb-10 flex items-center gap-3 text-green-600">
                <CheckCircle2 size={18} /> Destaques & Eficiência
              </h3>
              <ul className="space-y-6">
                {report.destaques_positivos.map((item, i) => (
                  <li key={i} className="flex gap-5 text-sm font-serif font-medium text-gray-700 leading-relaxed">
                    <span className="shrink-0 w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-black text-xs">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Riscos */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-widest mb-10 flex items-center gap-3 text-red-500">
                <AlertTriangle size={18} /> Alertas de Risco
              </h3>
              <ul className="space-y-6">
                {report.riscos.map((item, i) => (
                  <li key={i} className="flex gap-5 text-sm font-serif font-bold text-gray-800 leading-relaxed">
                    <div className="shrink-0 w-2 h-2 mt-2 rounded-full bg-red-500"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Bonificação */}
            <div className="bg-amber-50/50 rounded-[2.5rem] p-10 border border-amber-100/50">
              <h3 className="text-[11px] font-black uppercase tracking-widest mb-8 flex items-center gap-3 text-amber-600">
                <Coins size={18} /> Sugestões de Bônus
              </h3>
              <div className="space-y-4">
                {report.sugestoes_bonificacao.map((item, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100 text-sm font-serif font-semibold text-gray-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Conversas Individuais */}
            <div className="bg-blue-50/50 rounded-[2.5rem] p-10 border border-blue-100/50">
              <h3 className="text-[11px] font-black uppercase tracking-widest mb-8 flex items-center gap-3 text-blue-600">
                <Users size={18} /> Feedbacks Recomendados
              </h3>
              <div className="space-y-6">
                {report.conversas_individuais.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <Search className="text-blue-300 shrink-0 mt-1" size={14} />
                    <p className="text-sm font-serif text-gray-600 italic leading-relaxed">"{item}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Próximo Mês */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm border-t-4 border-t-[#8B1538]">
              <h3 className="text-[11px] font-black uppercase tracking-widest mb-8 flex items-center gap-3 text-[#8B1538]">
                <Target size={18} /> Foco para Próximo Mês
              </h3>
              <ul className="space-y-5">
                {report.pontos_atencao_proximo_mes.map((item, i) => (
                  <li key={i} className="flex gap-4 text-xs font-black text-gray-500 uppercase tracking-tight">
                    <Star size={12} className="text-amber-400 shrink-0 mt-0.5" fill="currentColor" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
