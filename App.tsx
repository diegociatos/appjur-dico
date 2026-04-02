
import React, { useState } from 'react';
import { ShieldAlert, Lock } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import DashboardView from './components/DashboardView';
import CashFlowView from './components/CashFlowView';
import BillingEntriesView from './components/BillingEntriesView';
import InadimplenciaView from './components/InadimplenciaView';
import ContractsView from './components/ContractsView';
import FinanceSettingsView from './components/FinanceSettingsView';
import ClientsView from './components/ClientsView';
import ProcessosView from './components/ProcessosView';
import AssignmentManagementView from './components/AssignmentManagementView';
import RankingView from './components/RankingView';
import KPIsView from './components/KPIsView';
import PeopleView from './components/PeopleView';
import UsersView from './components/UsersView';
import QADashboardView from './components/QADashboardView';
import ConfigPointsView from './components/ConfigPointsView';
import LoginView from './components/LoginView';
import ForcePasswordChangeModal from './components/ForcePasswordChangeModal';
import ProfileEditModal from './components/ProfileEditModal';
import MyAssignmentsView from './components/MyAssignmentsView';
import ActivityEntryView from './components/ActivityEntryView';
import HistoricalAnalysisView from './components/HistoricalAnalysisView';
import BillingTemplatesView from './components/BillingTemplatesView';
import BillingSimplifiedListView from './components/BillingSimplifiedListView';

import { 
  INITIAL_FINANCE_BANKS, 
  INITIAL_FINANCE_CATEGORIES, 
  INITIAL_FINANCE_SUBCATEGORIES,
  INITIAL_CLIENTS, 
  INITIAL_CONTRACTS, 
  INITIAL_BILLING_ENTRIES, 
  INITIAL_ASSIGNMENTS,
  INITIAL_PROCESSES, 
  INITIAL_POINT_RULES, 
  INITIAL_DAILY_TYPES, 
  INITIAL_DAILY_CATEGORIES,
  INITIAL_PROCESS_SCORE_CONFIG, 
  INITIAL_OFFICE_INDICATORS,
  INITIAL_INDICATORS 
} from './constants';

import { 
  UserProfile, 
  FinanceTransaction, 
  Client, 
  ClientContract, 
  MonthlyBillingEntry, 
  Assignment, 
  AuditLog, 
  CiatosNotification, 
  DailyEntry, 
  DailyEntryType, 
  DailyCategory, 
  PointRule, 
  ProcessScoreConfig, 
  MonthlyIndicator, 
  ScoreEvent,
  HistoricalYearData,
  DRERubric,
  FinanceMonthlyBalance
} from './types';

const RestrictedAccess = () => (
  <div className="p-20 text-center bg-white rounded-[3rem] border border-gray-100 font-serif-elegant animate-in fade-in zoom-in duration-500">
    <div className="w-24 h-24 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
      <Lock size={48} />
    </div>
    <h2 className="text-3xl font-bold text-[#8B1538] mb-4">Acesso Restrito</h2>
    <p className="text-gray-500 italic max-w-md mx-auto">Este módulo contém informações operacionais restritas à Gestão Jurídica. Seu perfil financeiro é focado na saúde econômica da banca.</p>
  </div>
);

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(({
    id: 'user_renan',
    nome: 'Renan Almeida',
    email: 'renan@ciatos.com.br',
    cargo: 'Administrador',
    status: 'Ativo',
    dataCadastro: '2026-01-01',
    notificacoesEmail: true,
    exibirNoRanking: true,
    requiresPasswordChange: false
  }) as UserProfile);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Finance State
  const [financeBanks, setFinanceBanks] = useState(INITIAL_FINANCE_BANKS);
  const [financeCategories, setFinanceCategories] = useState(INITIAL_FINANCE_CATEGORIES);
  const [financeSubcategories, setFinanceSubcategories] = useState(INITIAL_FINANCE_SUBCATEGORIES);
  const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>([]);
  const [monthlyBalances, setMonthlyBalances] = useState<FinanceMonthlyBalance[]>([]);
  
  const [dreRubrics, setDreRubrics] = useState<DRERubric[]>([
    { id: 'RECEITA_BRUTA', label: 'RECEITA OPERACIONAL BRUTA', type: 'header' },
    { id: 'SIMPLES_NACIONAL', label: '(-) IMPOSTOS (SIMPLES)', type: 'header' },
    { id: 'RECEITA_LIQUIDA', label: '(=) RECEITA OPERACIONAL LÍQUIDA', type: 'result' },
    { id: 'CUSTO_DIRETO', label: '(-) CUSTOS DE PRODUÇÃO / OPERAÇÃO', type: 'header' },
    { id: 'LUCRO_BRUTO', label: '(=) LUCRO BRUTO', type: 'result' },
    { id: 'DESPESA_ADMIN', label: '(-) DESPESAS ADMINISTRATIVAS', type: 'header' },
    { id: 'DESPESA_COMERCIAL', label: '(-) DESPESAS COMERCIAIS / MARKETING', type: 'header' },
    { id: 'DESPESA_FINANCEIRA', label: '(-) DESPESAS FINANCEIRAS / TAXAS', type: 'header' },
    { id: 'LUCRO_LIQUIDO', label: '(=) EBITDA / LUCRO OPERACIONAL', type: 'result' },
    { id: 'INVESTIMENTOS', label: '(-) INVESTIMENTOS (CAPEX)', type: 'header' },
    { id: 'DIVIDENDOS', label: '(-) DISTRIBUIÇÃO DE LUCROS / PLR', type: 'header' },
    { id: 'RESULTADO_FINAL', label: '(=) RESULTADO LÍQUIDO FINAL', type: 'result' },
  ]);
  
  const [historicalData, setHistoricalData] = useState<HistoricalYearData[]>([
    { year: 2020, lineTotals: {}, subcategoryTotals: { sub_1: 1800000, sub_4: 90000, sub_5: 400000, sub_9: 120000, sub_13: 5000 } },
    { year: 2021, lineTotals: {}, subcategoryTotals: { sub_1: 2200000, sub_4: 110000, sub_5: 500000, sub_9: 130000, sub_13: 6000 } },
    { year: 2022, lineTotals: {}, subcategoryTotals: { sub_1: 2800000, sub_4: 150000, sub_5: 700000, sub_9: 150000, sub_13: 8000 } },
    { year: 2023, lineTotals: {}, subcategoryTotals: { sub_1: 3200000, sub_4: 180000, sub_5: 800000, sub_9: 180000, sub_13: 10000 } },
    { year: 2024, lineTotals: {}, subcategoryTotals: { sub_1: 4100000, sub_4: 240000, sub_5: 1000000, sub_9: 200000, sub_13: 12000 } },
    { year: 2025, lineTotals: {}, subcategoryTotals: { sub_1: 4800000, sub_4: 280000, sub_5: 1200000, sub_9: 220000, sub_13: 15000 } }
  ]);
  
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [contracts, setContracts] = useState(INITIAL_CONTRACTS);
  const [billingEntries, setBillingEntries] = useState(INITIAL_BILLING_ENTRIES);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [processes, setProcesses] = useState(INITIAL_PROCESSES);
  
  const [pointRules, setPointRules] = useState(INITIAL_POINT_RULES);
  const [dailyTypes, setDailyTypes] = useState(INITIAL_DAILY_TYPES);
  const [dailyCategories, setDailyCategories] = useState(INITIAL_DAILY_CATEGORIES);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [scoreEvents, setScoreEvents] = useState<ScoreEvent[]>([]);
  const [processScoreConfig, setProcessScoreConfig] = useState(INITIAL_PROCESS_SCORE_CONFIG);
  const [officeIndicator, setOfficeIndicator] = useState(INITIAL_OFFICE_INDICATORS);
  const [indicators, setIndicators] = useState<MonthlyIndicator[]>(INITIAL_INDICATORS);
  
  const [notifications, setNotifications] = useState<CiatosNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([
    { id: 'user_renan', nome: 'Renan Almeida', email: 'renan@ciatos.com.br', cargo: 'Administrador', status: 'Ativo', dataCadastro: '2026-01-01', notificacoesEmail: true, exibirNoRanking: true, requiresPasswordChange: false },
    { id: 'u2', nome: 'Stephanie', email: 'stephanie@ciatos.com.br', cargo: 'Gestor', status: 'Ativo', dataCadastro: '2026-01-01', notificacoesEmail: true, exibirNoRanking: true, requiresPasswordChange: false },
    { id: 'u3', nome: 'Bruna Silva', email: 'bruna@ciatos.com.br', cargo: 'Advogado', status: 'Ativo', dataCadastro: '2026-01-01', notificacoesEmail: true, exibirNoRanking: true, requiresPasswordChange: false },
    { id: 'u4', nome: 'Sarah', email: 'sarah@ciatos.com.br', cargo: 'Advogado', status: 'Ativo', dataCadastro: '2026-01-01', notificacoesEmail: true, exibirNoRanking: true, requiresPasswordChange: false },
    { id: 'u5', nome: 'Financeiro Ciatos', email: 'financeiro@ciatos.com.br', cargo: 'Financeiro', status: 'Ativo', dataCadastro: '2026-01-01', notificacoesEmail: true, exibirNoRanking: false, requiresPasswordChange: false },
  ]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleCompleteAssignment = (id: string, evidence: string) => {
    setAssignments(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'AGUARDANDO_VALIDACAO', evidenciaAdvogado: evidence, concluidoEm: new Date().toISOString() } : a
    ));
    alert("Compromisso enviado para validação da gestora!");
  };

  const handleUpdateMonthlyBalance = (bancoId: string, mesAno: string, novoSaldo: number) => {
    setMonthlyBalances(prev => {
      const existing = prev.find(b => b.bancoId === bancoId && b.mesAno === mesAno);
      if (existing) {
        return prev.map(b => b.id === existing.id ? { ...b, saldoAbertura: novoSaldo } : b);
      }
      return [...prev, { id: `bal_${Date.now()}`, bancoId, mesAno, saldoAbertura: novoSaldo }];
    });
  };

  const handleProvisionFromPreviousMonth = (currentMonth: string, previousMonth: string) => {
    const previousMonthEntries = billingEntries.filter(e => e.month === previousMonth && (e.status === 'FINALIZADO' || e.status === 'PAGO'));
    
    if (previousMonthEntries.length === 0) {
      alert("Não foram encontrados lançamentos finalizados no mês anterior para clonagem.");
      return;
    }

    const newDrafts: MonthlyBillingEntry[] = [];
    let count = 0;

    previousMonthEntries.forEach(prev => {
      const exists = billingEntries.some(e => e.clientId === prev.clientId && e.month === currentMonth);
      if (!exists) {
        const contract = contracts.find(c => c.id === prev.contractId);
        if (contract) {
          newDrafts.push({
            id: `bill_auto_${Date.now()}_${count}`,
            contractId: contract.id,
            clientId: contract.clientId,
            clientName: contract.clientName,
            month: currentMonth,
            fixedMonthlyValue: contract.monthlyFee,
            totalReportedProcesses: 0,
            billableProcessCount: 0,
            billableProcessValue: 0,
            hoursSenior: 0,
            hoursPleno: 0,
            hoursJunior: 0,
            totalExecutedHours: 0,
            hourlyRateType: 'pleno',
            hourlyRateUsed: contract.hourlyRates.pleno,
            totalHoursValue: 0,
            performanceBaseValue: 0,
            performancePercentage: contract.performanceFeeBands[0]?.percentage || 0,
            performanceFeeValue: 0,
            otherFees: 0,
            totalAmount: contract.monthlyFee,
            status: 'RASCUNHO',
            attachments: [],
            createdBy: `Auto-Provisionamento (${currentUser?.nome})`,
            createdAt: new Date().toISOString()
          });
          count++;
        }
      }
    });

    if (newDrafts.length > 0) {
      setBillingEntries(prev => [...newDrafts, ...prev]);
      alert(`${newDrafts.length} rascunhos de faturamento foram gerados com base no mês anterior!`);
      setCurrentView('faturamento_simplificado');
    } else {
      alert("Todos os clientes do mês anterior já possuem lançamentos iniciados no mês atual.");
    }
  };

  const renderView = () => {
    if (!currentUser) return null;
    const role = currentUser.cargo;
    const isAdmin = role === 'Administrador';
    const isGestor = role === 'Gestor';
    const isFinanceiro = role === 'Financeiro';
    const isAdvogado = role === 'Advogado';
    
    switch (currentView) {
      case 'dashboard':
        return <DashboardView indicator={officeIndicator} appointments={[]} indicators={indicators} processes={processes} clients={clients} currentUser={currentUser} assignments={assignments} billingEntries={billingEntries} contracts={contracts} dailyEntries={dailyEntries} dailyEntryTypes={dailyTypes} scoreEvents={scoreEvents} />;
      
      case 'clientes':
        return <ClientsView clients={clients} users={users} onAddClient={(c) => setClients([c, ...clients])} onUpdateClient={(c) => setClients(clients.map(cl => cl.id === c.id ? c : cl))} currentUser={currentUser} processes={processes} billingEntries={billingEntries} onLogAudit={(log) => setAuditLogs([log, ...auditLogs])} />;
      
      case 'faturamento':
        return <BillingEntriesView 
          entries={billingEntries} 
          contracts={contracts} 
          clients={clients} 
          onAddEntry={(e) => setBillingEntries([e, ...billingEntries])} 
          onUpdateEntry={(e) => setBillingEntries(billingEntries.map(entry => entry.id === e.id ? e : entry))} 
          onBulkImport={(c, e) => { setContracts(c); setBillingEntries(e); }} 
          currentUser={currentUser} 
          onLogAudit={(log) => setAuditLogs([log, ...auditLogs])} 
          onNavigateToSimplified={() => setCurrentView('faturamento_simplificado')}
          onAutoProvision={handleProvisionFromPreviousMonth}
        />;

      case 'faturamento_simplificado':
        return <BillingSimplifiedListView 
          entries={billingEntries} 
          contracts={contracts} 
          onUpdateEntries={(updated) => {
            const ids = updated.map(u => u.id);
            setBillingEntries(prev => [...updated, ...prev.filter(e => !ids.includes(e.id))]);
          }}
          currentUser={currentUser}
          onBack={() => setCurrentView('faturamento')}
        />;
      
      case 'inadimplencia':
        return <InadimplenciaView entries={billingEntries} contracts={contracts} onUpdateEntry={(e) => setBillingEntries(billingEntries.map(entry => entry.id === e.id ? e : entry))} currentUser={currentUser} onLogAudit={(log) => setAuditLogs([log, ...auditLogs])} />;
      
      case 'recorrencia':
        return <BillingTemplatesView templates={[]} contracts={contracts} onAddTemplate={()=>{}} onUpdateTemplate={()=>{}} onDeleteTemplate={()=>{}} onBulkGenerate={()=>{}} currentUser={currentUser} />;
      
      case 'contratos':
        return <ContractsView contracts={contracts} clients={clients} onAddContract={(c) => setContracts([...contracts, c])} onUpdateContract={(c) => setContracts(contracts.map(cont => cont.id === c.id ? c : cont))} currentUser={currentUser} />;
      
      case 'processos':
        if (isFinanceiro) return <RestrictedAccess />;
        return <ProcessosView processes={processes} onUpdateProcess={(pid, upd) => setProcesses(processes.map(p => p.id === pid ? { ...p, timeline: [upd, ...p.timeline] } : p))} onAddProcess={(p) => setProcesses([{ ...p, id: `proc_${Date.now()}`, data_cadastro: new Date().toISOString(), timeline: [] } as any, ...processes])} onEditProcess={(p) => setProcesses(processes.map(proc => proc.id === p.id ? p : proc))} onDeleteProcess={(id) => setProcesses(processes.filter(p => p.id !== id))} onValidateUpdate={(pid, uid, pts) => setProcesses(processes.map(p => p.id === pid ? { ...p, timeline: p.timeline.map(u => u.id === uid ? { ...u, status_validacao: 'VALIDADO', data_validacao: new Date().toISOString(), pontos_atribuidos: pts } : u) } : p))} scoreConfig={processScoreConfig} clients={clients} users={users} currentUser={currentUser} />;
      
      case 'compromissos_equipe':
        if (isFinanceiro) return <RestrictedAccess />;
        if (isAdvogado) {
          return <MyAssignmentsView assignments={assignments.filter(a => a.advogadoId === currentUser.id)} onComplete={handleCompleteAssignment} />;
        }
        return <AssignmentManagementView assignments={assignments} users={users} onAddAssignment={(a) => setAssignments([...assignments, a])} onUpdateAssignment={(a) => setAssignments(assignments.map(as => as.id === a.id ? a : as))} onDeleteAssignment={(id) => setAssignments(assignments.filter(a => a.id !== id))} onAuditAssignment={(id, dec, reason) => setAssignments(assignments.map(a => a.id === id ? { ...a, status: dec, motivoReprovacao: reason } : a))} currentUser={currentUser} />;
      
      case 'meritocracia':
        if (isFinanceiro) return <RestrictedAccess />;
        return (isAdmin || isGestor) ? <ActivityEntryView activities={[]} indicators={indicators} dailyEntries={dailyEntries} dailyEntryTypes={dailyTypes} dailyCategories={dailyCategories} rules={pointRules} scoreEvents={scoreEvents} onAdd={() => {}} onValidate={() => {}} onSaveIndicator={(ind) => setIndicators(indicators.map(i => i.advogado === ind.advogado ? ind : i))} onUpdateDailyEntries={setDailyEntries} /> : <RankingView indicators={indicators} qualifiedActivities={[]} dailyEntries={dailyEntries} dailyEntryTypes={dailyTypes} dailyCategories={dailyCategories} scoreEvents={scoreEvents} currentUser={currentUser} appointments={[]} />;
      
      case 'kpis':
        if (isFinanceiro) return <RestrictedAccess />;
        return <KPIsView currentUser={currentUser} />;
      
      case 'gente_gestao':
        if (isFinanceiro) return <RestrictedAccess />;
        return <PeopleView sectors={officeIndicator.gestao_pessoais} currentUser={currentUser} />;
      
      case 'usuarios':
        if (isFinanceiro || isGestor) return <RestrictedAccess />;
        return <UsersView users={users} onAddUser={(u) => setUsers([...users, u])} onUpdateUser={(u) => setUsers(users.map(user => user.id === u.id ? u : user))} onResetPassword={(id) => setUsers(users.map(u => u.id === id ? { ...u, status: 'Aguardando Primeiro Acesso', requiresPasswordChange: true } : u))} />;
      
      case 'qa':
        if (isFinanceiro || isGestor) return <RestrictedAccess />;
        return <QADashboardView contracts={contracts} entries={billingEntries} auditLogs={auditLogs} clients={clients} currentUser={currentUser} />;
      
      case 'fluxo_caixa':
        if (isGestor) return <RestrictedAccess />;
        return <CashFlowView 
          transactions={financeTransactions} 
          billingEntries={billingEntries} 
          currentUser={currentUser} 
          onAddTransaction={(t) => setFinanceTransactions([t, ...financeTransactions])} 
          onUpdateTransaction={(t) => setFinanceTransactions(financeTransactions.map(item => item.id === t.id ? t : item))}
          onDeleteTransaction={(id) => setFinanceTransactions(financeTransactions.filter(t => t.id !== id))} 
          banks={financeBanks} 
          categories={financeCategories} 
          subcategories={financeSubcategories} 
          clients={clients} 
          onNavigateToSettings={() => setCurrentView('finance_settings')}
          dreRubrics={dreRubrics}
          monthlyBalances={monthlyBalances}
          onUpdateMonthlyBalance={handleUpdateMonthlyBalance}
        />;
      
      case 'analise_historica':
        if (isGestor) return <RestrictedAccess />;
        return <HistoricalAnalysisView historicalData={historicalData} onImportHistorical={(newData) => setHistoricalData([...historicalData.filter(d => d.year !== newData.year), newData].sort((a,b)=>a.year - b.year))} categories={financeCategories} subcategories={financeSubcategories} dreRubrics={dreRubrics} />;
      
      case 'configuracao':
        if (isFinanceiro) return <RestrictedAccess />;
        return <ConfigPointsView rules={pointRules} onSaveRules={setPointRules} dailyTypes={dailyTypes} onSaveDailyTypes={setDailyTypes} categories={dailyCategories} onSaveCategories={setDailyCategories} processScoreConfig={processScoreConfig} onSaveProcessScoreConfig={setProcessScoreConfig} currentUser={currentUser} />;
      
      case 'finance_settings':
        if (isGestor) return <RestrictedAccess />;
        return <FinanceSettingsView 
          banks={financeBanks} 
          categories={financeCategories} 
          subcategories={financeSubcategories} 
          onUpdateBanks={setFinanceBanks} 
          onUpdateCategories={setFinanceCategories} 
          onUpdateSubcategories={setFinanceSubcategories} 
          dreRubrics={dreRubrics}
          onUpdateDreRubrics={setDreRubrics}
        />;
      
      default:
        return <DashboardView indicator={officeIndicator} appointments={[]} indicators={indicators} processes={processes} clients={clients} currentUser={currentUser} assignments={assignments} billingEntries={billingEntries} contracts={contracts} dailyEntries={dailyEntries} dailyEntryTypes={dailyTypes} scoreEvents={scoreEvents} />;
    }
  };

  if (!isLoggedIn || !currentUser) {
    return <LoginView onLogin={(email) => { setIsLoggedIn(true); }} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeItem={currentView} onNavigate={setCurrentView} currentUser={currentUser} />
      <div className="flex-1 ml-[240px] flex flex-col h-full overflow-hidden">
        <TopHeader 
          user={currentUser} 
          onEditProfile={() => setIsProfileModalOpen(true)} 
          onLogout={() => setIsLoggedIn(false)} 
          onSimulateProfile={(role) => {
            if (currentUser) {
              setCurrentUser({ ...currentUser, cargo: role });
              setCurrentView('dashboard');
            }
          }} 
          notifications={notifications} 
          onMarkAllRead={() => setNotifications(notifications.map(n => ({ ...n, lida: true })))} 
        />
        <main className="flex-1 p-8 md:p-12 overflow-y-auto scrollbar-hide">
          <div className="max-w-[1600px] mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
      <ProfileEditModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={currentUser} onSave={setCurrentUser} />
      <ForcePasswordChangeModal isOpen={currentUser.requiresPasswordChange} onPasswordChanged={() => setCurrentUser({ ...currentUser, requiresPasswordChange: false })} />
    </div>
  );
};

export default App;
