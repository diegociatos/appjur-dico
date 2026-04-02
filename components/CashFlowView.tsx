import React, { useState, useMemo } from 'react';
import { 
  Plus, Calendar, Building2, Wallet, BarChart3, Info, X, Save, Upload,
  ChevronDown, ChevronRight, UserCircle2, TrendingUp, BrainCircuit, Landmark,
  ArrowUpRight, ArrowDownRight, Calculator, PieChart, ShieldCheck, Tag,
  CalendarDays, Filter, AlertCircle, RefreshCw, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { FinanceTransaction, FinanceTransactionType, MonthlyBillingEntry, UserProfile, FinanceBank, FinanceCategory, FinanceSubcategory, Client, DRERubric, FinanceMonthlyBalance } from '../types';
import FinanceImportModal from './FinanceImportModal';

interface CashFlowViewProps {
  transactions: FinanceTransaction[];
  billingEntries: MonthlyBillingEntry[];
  currentUser: UserProfile;
  onAddTransaction: (t: FinanceTransaction) => void;
  onUpdateTransaction?: (t: FinanceTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  banks: FinanceBank[];
  categories: FinanceCategory[];
  subcategories: FinanceSubcategory[];
  clients: Client[];
  onNavigateToSettings: () => void;
  dreRubrics: DRERubric[];
  monthlyBalances: FinanceMonthlyBalance[];
  onUpdateMonthlyBalance: (bancoId: string, mesAno: string, novoSaldo: number) => void;
}

type PeriodType = 'MONTHLY' | 'SEMIANNUAL' | 'ANNUAL';

const CashFlowView: React.FC<CashFlowViewProps> = ({ 
  transactions = [], billingEntries = [], currentUser, onAddTransaction, onUpdateTransaction, onDeleteTransaction,
  banks = [], categories = [], subcategories = [], clients = [], onNavigateToSettings, dreRubrics,
  monthlyBalances = [], onUpdateMonthlyBalance
}) => {
  const [periodType, setPeriodType] = useState<PeriodType>('MONTHLY');
  const [selectedMonth, setSelectedMonth] = useState('2026-02');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedSemester, setSelectedSemester] = useState<'1' | '2'>('1');
  const [selectedBankId, setSelectedBankId] = useState(banks[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'flow' | 'dre'>('flow');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const [newTx, setNewTx] = useState<Partial<FinanceTransaction>>({
    tipo: 'DESPESA',
    subcategoriaId: '',
    categoriaId: '',
    data: new Date().toISOString().split('T')[0],
    pago: true,
    bancoId: selectedBankId || banks[0]?.id || '',
  });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Lógica de Datas para Filtragem com Memoização
  const dateRange = useMemo(() => {
    if (periodType === 'MONTHLY') return { type: 'month', value: selectedMonth };
    if (periodType === 'ANNUAL') return { type: 'year', value: selectedYear };
    return { type: 'semester', year: selectedYear, semester: selectedSemester };
  }, [periodType, selectedMonth, selectedYear, selectedSemester]);

  const isDateInRange = (date: string) => {
    if (!date) return false;
    if (dateRange.type === 'month') return date.startsWith(dateRange.value);
    if (dateRange.type === 'year') return date.startsWith(dateRange.value);
    const parts = date.split('-');
    if (parts.length < 2) return false;
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    if (y !== Number(dateRange.year)) return false;
    return dateRange.semester === '1' ? m <= 6 : m >= 7;
  };

  // CÁLCULO DO SALDO DE ABERTURA MATEMÁTICO (ESPERADO)
  const expectedOpeningBalance = useMemo(() => {
    const bank = banks.find(b => b.id === selectedBankId);
    if (!bank) return 0;

    // Soma todas as transações pagas ANTERIORES ao mês selecionado
    const previousTxs = transactions.filter(t => t.bancoId === selectedBankId && t.pago && (t.competencia || '').localeCompare(selectedMonth) < 0);
    const totalPreviousIncome = previousTxs.filter(t => t.tipo === 'RECEITA').reduce((acc, t) => acc + t.valor, 0);
    const totalPreviousExpense = previousTxs.filter(t => t.tipo === 'DESPESA').reduce((acc, t) => acc + t.valor, 0);

    return bank.saldoInicial + totalPreviousIncome - totalPreviousExpense;
  }, [selectedBankId, selectedMonth, transactions, banks]);

  // SALDO DE ABERTURA EFETIVO (O QUE O USUÁRIO DEFINIU OU O ESPERADO)
  const effectiveOpeningBalance = useMemo(() => {
    const override = monthlyBalances.find(b => b.bancoId === selectedBankId && b.mesAno === selectedMonth);
    return override ? override.saldoAbertura : expectedOpeningBalance;
  }, [monthlyBalances, selectedBankId, selectedMonth, expectedOpeningBalance]);

  const hasDivergence = effectiveOpeningBalance !== expectedOpeningBalance;

  // Fluxo de Caixa Processado
  const processedFlow = useMemo(() => {
    const monthTxs = transactions.filter(t => t.competencia === selectedMonth && t.bancoId === selectedBankId);
    
    // Provisões de faturamento (Apenas ilustrativas no fluxo)
    const billingProvisions = (billingEntries || [])
      .filter(e => e.status === 'FINALIZADO' && !e.isPaid && e.month === selectedMonth)
      .map(e => ({
        id: `prov_${e.id}`,
        data: `${e.month}-10`,
        descricao: `[PROVISÃO] Faturamento: ${e.clientName}`,
        valor: e.totalAmount,
        tipo: 'RECEITA' as FinanceTransactionType,
        pago: false,
        runningBalance: 0,
        isIncrease: true,
        subcategoriaId: 'sub_1'
      }));

    const allItems = [...monthTxs, ...billingProvisions].sort((a, b) => (a.data || '').localeCompare(b.data || ''));

    let runningBalance = effectiveOpeningBalance;
    return allItems.map(t => {
      const isIncrease = t.tipo === 'RECEITA';
      if (t.pago) {
        if (isIncrease) runningBalance += t.valor;
        else runningBalance -= t.valor;
      }
      return { ...t, runningBalance, isIncrease };
    }).reverse();
  }, [transactions, billingEntries, selectedBankId, selectedMonth, effectiveOpeningBalance]);

  // DRE DINÂMICO
  const dreReport = useMemo(() => {
    const rangeTxs = transactions.filter(t => isDateInRange(t.data));
    const rangeBilling = billingEntries.filter(e => isDateInRange(`${e.month}-01`));
    const subTotals: Record<string, number> = {};
    rangeTxs.forEach(t => { subTotals[t.subcategoriaId] = (subTotals[t.subcategoriaId] || 0) + t.valor; });
    const rubricaTotals: Record<string, { total: number; subDetail: { name: string; value: number; type: 'client' | 'subcat' }[] }> = {};
    dreRubrics.forEach(line => {
      if (line.type === 'result') return;
      const rubricaCats = categories.filter(c => c.dreLine === line.id);
      let rubricaSum = 0;
      const details: { name: string; value: number; type: 'client' | 'subcat' }[] = [];
      rubricaCats.forEach(cat => {
        const subs = subcategories.filter(s => s.categoryId === cat.id);
        subs.forEach(sub => {
          const val = subTotals[sub.id] || 0;
          details.push({ name: sub.nome, value: val, type: 'subcat' });
          rubricaSum += val;
        });
      });
      if (line.id === 'RECEITA_BRUTA') {
        clients.forEach(c => {
           const paidAmount = rangeBilling.filter(e => e.clientId === c.id && e.isPaid).reduce((sum, e) => sum + e.totalAmount, 0);
           details.push({ name: c.nome, value: paidAmount, type: 'client' });
           rubricaSum += paidAmount;
        });
      }
      rubricaTotals[line.id] = { total: rubricaSum, subDetail: details };
    });
    const getVal = (id: string) => rubricaTotals[id]?.total || 0;
    const rb = getVal('RECEITA_BRUTA'), sn = getVal('SIMPLES_NACIONAL'), rl = rb - sn, cd = getVal('CUSTO_DIRETO'), lb = rl - cd, dAdm = getVal('DESPESA_ADMIN'), dCom = getVal('DESPESA_COMERCIAL'), dFin = getVal('DESPESA_FINANCEIRA'), ll = lb - (dAdm + dCom + dFin), inv = getVal('INVESTIMENTOS'), div = getVal('DIVIDENDOS'), rf = ll - (inv + div);
    return { rubricaTotals, resultsMap: { RECEITA_LIQUIDA: rl, LUCRO_BRUTO: lb, LUCRO_LIQUIDO: ll, RESULTADO_FINAL: rf } };
  }, [transactions, billingEntries, dateRange, categories, subcategories, clients, dreRubrics]);

  const handleSaveTx = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = subcategories.find(s => s.id === (newTx.subcategoriaId || ''));
    onAddTransaction({
      ...newTx,
      id: `tx_${Date.now()}`,
      valor: Number(newTx.valor),
      categoriaId: sub?.categoryId || '',
      competencia: newTx.data!.substring(0, 7),
      criadoPor: currentUser.nome,
      createdAt: new Date().toISOString(),
      pago: newTx.pago ?? true
    } as FinanceTransaction);
    setIsModalOpen(false);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20 font-serif-elegant">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
           <h1 className="text-4xl font-bold text-[#8B1538] leading-tight">Fluxo de Caixa & DRE</h1>
           <p className="text-[#2D3748] mt-2 font-medium text-[16px] opacity-70">Controle financeiro com governança de saldos e períodos</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
           <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 bg-white border-2 border-gray-100 text-gray-400 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-[#8B1538] transition-all shadow-sm"><Upload size={18}/> Importar</button>
           <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#8B1538] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#8B1538]/20 hover:scale-105 transition-all"><Plus size={18}/> Novo Lançamento</button>
        </div>
      </div>

      <div className="flex bg-white p-1.5 rounded-[1.5rem] shadow-sm border border-gray-100 w-fit mb-10">
        <button onClick={() => setActiveTab('flow')} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'flow' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>
          <Wallet size={16}/> Fluxo de Caixa (Banco)
        </button>
        <button onClick={() => setActiveTab('dre')} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'dre' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-400'}`}>
          <BarChart3 size={16}/> DRE (Resultado)
        </button>
      </div>

      {activeTab === 'flow' ? (
        <div className="space-y-10 animate-in slide-in-from-left duration-500">
           {/* BARRA DE FILTRO E SALDO INICIAL */}
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-10 items-center justify-between">
              <div className="flex items-center gap-8">
                 <div className="space-y-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Conciliação do Período</span>
                    <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl">
                       <Calendar size={18} className="text-[#8B1538]" />
                       <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-transparent border-none text-sm font-bold text-gray-700 outline-none" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Instituição Bancária</span>
                    <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl">
                       <Landmark size={18} className="text-[#8B1538]" />
                       <select value={selectedBankId} onChange={e => setSelectedBankId(e.target.value)} className="bg-transparent text-[11px] font-black text-gray-700 uppercase outline-none cursor-pointer">
                          {banks.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                       </select>
                    </div>
                 </div>
              </div>

              <div className="flex-1 max-w-sm space-y-2">
                 <div className="flex justify-between items-end mb-1 px-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldo de Abertura do Mês</span>
                    {hasDivergence && (
                      <span className="text-[9px] font-black text-red-500 uppercase flex items-center gap-1 animate-pulse">
                         {/* Corrected: Imported AlertTriangle from lucide-react to fix line 229 error */}
                         <AlertTriangle size={10}/> Divergência Detectada
                      </span>
                    )}
                 </div>
                 <div className={`relative flex items-center group transition-all rounded-2xl border-2 ${hasDivergence ? 'border-red-500 bg-red-50/30' : 'border-gray-100 bg-gray-50'}`}>
                    <span className={`pl-5 text-sm font-black ${hasDivergence ? 'text-red-600' : 'text-gray-400'}`}>R$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      value={effectiveOpeningBalance}
                      onChange={e => onUpdateMonthlyBalance(selectedBankId, selectedMonth, Number(e.target.value))}
                      className={`w-full bg-transparent border-none py-4 px-3 text-lg font-black outline-none ${hasDivergence ? 'text-red-700' : 'text-gray-700'}`}
                    />
                    <div className="pr-4">
                      {hasDivergence ? (
                        <div className="group/hint relative">
                           <AlertCircle size={20} className="text-red-500 cursor-help" />
                           <div className="absolute bottom-full right-0 mb-4 w-64 bg-red-600 text-white p-4 rounded-2xl text-[10px] font-serif italic shadow-xl opacity-0 group-hover/hint:opacity-100 transition-opacity pointer-events-none z-50">
                              O valor esperado conforme o histórico é {formatCurrency(expectedOpeningBalance)}. Retifique o saldo para igualar com o extrato bancário.
                           </div>
                        </div>
                      ) : (
                        /* Corrected: Imported CheckCircle2 from lucide-react to fix line 251 error */
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      )}
                    </div>
                 </div>
              </div>
           </div>

           {/* LISTA DE TRANSAÇÕES */}
           <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                   <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl border border-emerald-100">
                      <span className="block text-[9px] font-black uppercase mb-1 opacity-60">Saldo de Fechamento do Mês</span>
                      <span className="text-xl font-bold">{formatCurrency(processedFlow[0]?.runningBalance || effectiveOpeningBalance)}</span>
                   </div>
                </div>
             </div>
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase">Data</th>
                    <th className="px-6 py-5 text-[9px] font-black text-emerald-600 uppercase text-center">Entrada (+)</th>
                    <th className="px-6 py-5 text-[9px] font-black text-red-500 uppercase text-center">Saída (-)</th>
                    <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase">Referência</th>
                    <th className="px-10 py-5 text-[9px] font-black text-[#8B1538] uppercase text-right">Saldo Progressivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {processedFlow.map(t => (
                      <tr key={t.id} className={`hover:bg-gray-50/10 transition-colors ${!t.pago ? 'opacity-40 grayscale' : ''}`}>
                         <td className="px-10 py-6 text-xs font-bold text-gray-500">{t.data?.split('-').reverse().join('/')}</td>
                         <td className={`px-6 py-6 text-center text-xs font-black ${t.isIncrease ? 'text-emerald-600' : 'text-gray-200'}`}>{t.isIncrease ? formatCurrency(t.valor) : '—'}</td>
                         <td className={`px-6 py-6 text-center text-xs font-black ${!t.isIncrease ? 'text-red-500' : 'text-gray-200'}`}>{!t.isIncrease ? formatCurrency(t.valor) : '—'}</td>
                         <td className="px-8 py-6 text-sm font-bold text-gray-700">{t.descricao}</td>
                         <td className="px-10 py-6 text-right font-black text-gray-800">{formatCurrency(t.runningBalance)}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in zoom-in duration-500">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-wrap items-center gap-8">
             <div className="flex items-center gap-3">
                <CalendarDays size={18} className="text-[#8B1538]" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visão Temporal:</span>
             </div>
             <div className="flex bg-gray-100 p-1 rounded-xl">
                {['MONTHLY', 'SEMIANNUAL', 'ANNUAL'].map(p => (
                  <button 
                    key={p} onClick={() => setPeriodType(p as PeriodType)}
                    className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${periodType === p ? 'bg-white text-[#8B1538] shadow-sm' : 'text-gray-400'}`}
                  >
                    {p === 'MONTHLY' ? 'Mensal' : p === 'SEMIANNUAL' ? 'Semestral' : 'Anual'}
                  </button>
                ))}
             </div>

             <div className="flex items-center gap-4 animate-in fade-in">
                {periodType === 'MONTHLY' && (
                  <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-gray-50 border-none rounded-lg px-4 py-2 text-sm font-bold text-gray-700" />
                )}
                {(periodType === 'SEMIANNUAL' || periodType === 'ANNUAL') && (
                  <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="bg-gray-50 border-none rounded-lg px-4 py-2 text-sm font-bold text-gray-700">
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                )}
                {periodType === 'SEMIANNUAL' && (
                  <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value as any)} className="bg-gray-50 border-none rounded-lg px-4 py-2 text-sm font-bold text-gray-700">
                    <option value="1">1º Semestre (Jan-Jun)</option>
                    <option value="2">2º Semestre (Jul-Dez)</option>
                  </select>
                )}
             </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-10 border-b border-gray-50 bg-gray-50/20 flex justify-between items-center">
              <h3 className="text-xl font-serif font-bold text-[#8B1538]">Demonstrativo de Resultado (Período)</h3>
              <div className="flex items-center gap-3 px-4 py-1.5 bg-white rounded-full border border-gray-100 text-[10px] font-black text-[#8B1538] uppercase">
                 {periodType === 'MONTHLY' ? selectedMonth : periodType === 'ANNUAL' ? `Ano ${selectedYear}` : `${selectedSemester}º Sem. ${selectedYear}`}
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-12 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plano de Contas Gerencial</th>
                  <th className="px-12 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Consolidado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-serif">
                {dreRubrics.map(line => {
                  const isResult = line.type === 'result';
                  const value = isResult ? dreReport.resultsMap[line.id] : (dreReport.rubricaTotals[line.id]?.total || 0);
                  const details = dreReport.rubricaTotals[line.id]?.subDetail || [];

                  return (
                    <React.Fragment key={line.id}>
                      <tr className={`${isResult ? 'bg-[#8B1538]/5 font-black text-[#8B1538]' : 'text-gray-700'}`}>
                        <td className="px-12 py-6 text-sm font-bold uppercase tracking-tight flex items-center gap-3">
                           {!isResult && <ChevronDown size={14} className={`transition-all ${details.length > 0 ? 'text-[#8B1538]' : 'text-gray-200'}`} />}
                           {line.label}
                        </td>
                        <td className="px-12 py-6 text-right text-lg">{formatCurrency(value)}</td>
                      </tr>
                      {!isResult && details.map((detail, idx) => (
                        <tr key={`${line.id}_${idx}`} className="bg-gray-50/20 group">
                          <td className="px-24 py-3 text-xs font-serif font-medium text-gray-400 flex items-center gap-2">
                             {detail.type === 'client' ? <UserCircle2 size={12} className="opacity-40" /> : <Tag size={12} className="opacity-40" />}
                             {detail.name}
                          </td>
                          <td className={`px-12 py-3 text-right text-xs font-bold ${detail.value > 0 ? 'text-gray-600' : 'text-gray-200'} italic`}>
                             {formatCurrency(detail.value)}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            <div className="p-10 bg-[#8B1538]/[0.02] border-t border-gray-100 flex items-center gap-4">
               <ShieldCheck className="text-[#8B1538]" size={20}/>
               <p className="text-xs font-serif italic text-gray-500">
                  DRE Dinâmico ativo. Nomes das rubricas e períodos customizáveis via configurações.
               </p>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1500] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-10 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="text-2xl font-serif font-bold text-[#8B1538]">Lançamento Financeiro</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-red-500 p-2 transition-colors"><X size={32}/></button>
              </div>
              <form onSubmit={handleSaveTx} className="p-12 space-y-8">
                 <div className="flex bg-gray-100/50 p-1 rounded-2xl border border-gray-100">
                    <button type="button" onClick={() => setNewTx({...newTx, tipo: 'RECEITA'})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${newTx.tipo === 'RECEITA' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}>Entrada</button>
                    <button type="button" onClick={() => setNewTx({...newTx, tipo: 'DESPESA'})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${newTx.tipo === 'DESPESA' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}>Saída</button>
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Data Operação</label>
                       <input type="date" required value={newTx.data} onChange={e => setNewTx({...newTx, data: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-[#8B1538] uppercase tracking-widest block ml-1">Valor Total (R$)</label>
                       <input type="number" step="0.01" required value={newTx.valor} onChange={e => setNewTx({...newTx, valor: Number(e.target.value)})} className="w-full bg-white border-2 border-[#8B1538]/10 rounded-xl px-4 py-3 text-lg font-black" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Classificação do Plano de Contas</label>
                    <select required value={newTx.subcategoriaId} onChange={e => setNewTx({...newTx, subcategoriaId: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none">
                        <option value="">Selecione a Subcategoria...</option>
                        {subcategories.filter(s => categories.find(c => c.id === s.categoryId)?.tipo === newTx.tipo).map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.nome}</option>
                        ))}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">Referência / Descrição</label>
                    <input type="text" required placeholder="Ex: Pagamento Fornecedor X..." value={newTx.descricao} onChange={e => setNewTx({...newTx, descricao: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                 </div>
                 <button type="submit" className="w-full py-5 bg-[#8B1538] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all">
                    <Save size={18}/> Salvar no Caixa
                 </button>
              </form>
           </div>
        </div>
      )}

      {isImportModalOpen && (
        <FinanceImportModal 
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onConfirm={(txs) => txs.forEach(onAddTransaction)}
          banks={banks}
          subcategories={subcategories}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default CashFlowView;