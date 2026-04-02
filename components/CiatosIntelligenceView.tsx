
import React, { useState, useMemo } from 'react';
import { 
  Sparkles, Search, TrendingUp, TrendingDown, DollarSign, BrainCircuit, 
  Activity, Zap, ShieldCheck, RefreshCcw, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { FinanceTransaction, MonthlyBillingEntry, HistoricalYearData, FinanceCategory, FinanceSubcategory } from '../types';

interface CiatosIntelligenceViewProps {
  transactions: FinanceTransaction[];
  billingEntries: MonthlyBillingEntry[];
  historicalData: HistoricalYearData[];
  categories: FinanceCategory[];
  subcategories: FinanceSubcategory[];
}

const CiatosIntelligenceView: React.FC<CiatosIntelligenceViewProps> = ({
  transactions, billingEntries, subcategories
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Cálculos de KPI Reais (Baseados nos dados carregados no estado)
  const stats = useMemo(() => {
    const totalTransactionsIncome = transactions
      .filter(t => t.tipo === 'RECEITA')
      .reduce((acc, t) => acc + t.valor, 0);
    
    const totalBillingIncome = billingEntries
      .filter(e => e.isPaid)
      .reduce((acc, e) => acc + e.totalAmount, 0);

    const totalExpenses = transactions
      .filter(t => t.tipo === 'DESPESA')
      .reduce((acc, t) => acc + t.valor, 0);

    const maxExpenseTx = [...transactions]
      .filter(t => t.tipo === 'DESPESA')
      .sort((a, b) => b.valor - a.valor)[0];

    return {
      income: totalTransactionsIncome + totalBillingIncome,
      expenses: totalExpenses,
      balance: (totalTransactionsIncome + totalBillingIncome) - totalExpenses,
      maxExpense: maxExpenseTx || null
    };
  }, [transactions, billingEntries]);

  // Busca Inteligente Local (Simples e Rápida)
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    const queryAsNumber = parseFloat(query.replace(/[^\d.,]/g, '').replace(',', '.'));

    return transactions.filter(t => {
      const matchName = t.descricao.toLowerCase().includes(lowerQuery);
      const matchValue = !isNaN(queryAsNumber) && (t.valor >= queryAsNumber - 10 && t.valor <= queryAsNumber + 10);
      const sub = subcategories.find(s => s.id === t.subcategoriaId);
      const matchSub = sub?.nome.toLowerCase().includes(lowerQuery);
      return matchName || matchValue || matchSub;
    }).slice(0, 15);
  }, [query, transactions, subcategories]);

  // Função de análise via IA (Chamada sob demanda)
  const runAIAnalysis = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = {
        resumo: stats,
        ultimas_cinco: transactions.slice(0, 5).map(t => ({ desc: t.descricao, valor: t.valor }))
      };

      const prompt = `Analise a saúde financeira desta banca jurídica. Dados: ${JSON.stringify(context)}. Forneça um diagnóstico de 3 frases sobre liquidez, maior gasto e uma recomendação.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setAiInsight(response.text || "Análise concluída com sucesso.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiInsight("Serviço de análise IA temporariamente indisponível. Utilize os KPIs manuais abaixo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20 font-serif-elegant">
      <div className="mb-12">
         <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-[#8B1538] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#8B1538]/20">
               <Sparkles size={32} />
            </div>
            <div>
               <h1 className="text-4xl font-bold text-[#8B1538] leading-tight">Ciatos Intelligence</h1>
               <p className="text-[#2D3748] opacity-60 italic text-lg">Análise executiva e busca tática</p>
            </div>
         </div>
         
         <div className="relative group max-w-4xl">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
               <Search className="text-gray-300 group-focus-within:text-[#8B1538] transition-colors" size={24} />
            </div>
            <input 
               type="text" 
               value={query}
               onChange={e => setQuery(e.target.value)}
               placeholder="Pesquisar despesa por nome ou valor (ex: Aluguel ou 2500)..."
               className="w-full bg-white border-2 border-gray-100 rounded-[1.5rem] pl-16 pr-6 py-6 text-lg font-medium outline-none focus:ring-8 focus:ring-[#8B1538]/5 focus:border-[#8B1538]/20 shadow-sm transition-all"
            />
         </div>
      </div>

      {/* KPI DASHBOARD SIMPLIFICADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 animate-in slide-in-from-bottom-4 duration-500">
         <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4"><TrendingUp size={20}/></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Receita Mensal</span>
            <span className="text-2xl font-black text-gray-800">{formatCurrency(stats.income)}</span>
         </div>
         <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4"><TrendingDown size={20}/></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Despesa Total</span>
            <span className="text-2xl font-black text-gray-800">{formatCurrency(stats.expenses)}</span>
         </div>
         <div className="bg-white p-8 rounded-[2rem] border border-[#8B1538]/20 shadow-lg border-b-4 border-b-[#8B1538]">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><DollarSign size={20}/></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Saldo Líquido</span>
            <span className={`text-2xl font-black ${stats.balance >= 0 ? 'text-[#8B1538]' : 'text-red-500'}`}>{formatCurrency(stats.balance)}</span>
         </div>
         <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100 shadow-sm">
            <div className="w-10 h-10 bg-white text-amber-500 rounded-xl flex items-center justify-center mb-4 shadow-sm"><AlertCircle size={20}/></div>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-1">Gasto Mais Alto</span>
            <span className="text-lg font-bold text-amber-800 truncate block">{stats.maxExpense?.descricao || 'Nenhum'}</span>
            <span className="text-xs font-black text-amber-600/60 uppercase">{stats.maxExpense ? formatCurrency(stats.maxExpense.valor) : '—'}</span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* RESULTADOS DA BUSCA FILTRADA */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Registros Localizados</h3>
                  <span className="text-[10px] font-black text-[#8B1538] uppercase">{searchResults.length} itens</span>
               </div>
               <div className="divide-y divide-gray-50">
                  {searchResults.map(res => (
                    <div key={res.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${res.tipo === 'RECEITA' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                             {res.tipo === 'RECEITA' ? <ArrowUpRight size={18}/> : <TrendingDown size={18}/>}
                          </div>
                          <div>
                             <span className="text-sm font-bold text-gray-700">{res.descricao}</span>
                             <p className="text-[9px] text-gray-400 font-black uppercase mt-0.5">{res.data.split('-').reverse().join('/')}</p>
                          </div>
                       </div>
                       <span className={`text-sm font-black ${res.tipo === 'RECEITA' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {res.tipo === 'RECEITA' ? '+' : '-'}{formatCurrency(res.valor)}
                       </span>
                    </div>
                  ))}
                  {query && searchResults.length === 0 && (
                    <div className="p-20 text-center text-gray-400 italic text-sm font-serif">Nenhum resultado para "{query}" na base de transações.</div>
                  )}
                  {!query && (
                    <div className="p-20 text-center opacity-30 flex flex-col items-center">
                       <Search size={40} className="mb-4 text-gray-300"/>
                       <p className="text-sm font-serif italic">Use a barra acima para filtrar por nome ou valor.</p>
                    </div>
                  )}
               </div>
            </div>
         </div>

         {/* IA DIAGNÓSTICO */}
         <div className="space-y-8">
            <div className="bg-[#8B1538] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col h-full min-h-[400px]">
               <div className="absolute top-0 right-0 p-8 opacity-5"><BrainCircuit size={180}/></div>
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-10">
                     <div className="flex items-center gap-3">
                        <Zap size={20} fill="white"/>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-white/50">Diretoria IA</h3>
                     </div>
                  </div>

                  {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                       <RefreshCcw size={32} className="animate-spin text-white/40"/>
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Sincronizando base financeira...</p>
                    </div>
                  ) : aiInsight ? (
                    <div className="animate-in fade-in duration-700">
                       <p className="text-lg font-serif font-medium leading-relaxed italic opacity-90 mb-10">
                         "{aiInsight}"
                       </p>
                       <button onClick={() => setAiInsight(null)} className="text-[9px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">Solicitar Nova Análise</button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center space-y-8">
                       <p className="text-sm font-serif italic text-white/50 leading-relaxed px-4">
                          Clique abaixo para que nossa inteligência audite o fluxo de caixa atual e gere recomendações táticas.
                       </p>
                       <button 
                        onClick={runAIAnalysis}
                        className="w-full py-5 bg-white text-[#8B1538] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                       >
                          Gerar Diagnóstico Estratégico
                       </button>
                    </div>
                  )}
                  
                  <div className="mt-12 pt-10 border-t border-white/10 opacity-30 flex items-center gap-2">
                     <ShieldCheck size={14}/>
                     <span className="text-[8px] font-black uppercase">Ambiente de Inteligência Privado</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CiatosIntelligenceView;
