import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock, Loader2 } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

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
  INITIAL_PROCESS_SCORE_CONFIG,
  INITIAL_DAILY_CATEGORIES,
  INITIAL_DAILY_TYPES,
  INITIAL_POINT_RULES,
  INITIAL_OFFICE_INDICATORS,
  DRE_RUBRICS_STRUCTURE,
  PRODUCTIVITY_RULE,
  COLORS,
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
  FinanceMonthlyBalance,
  FinanceBank,
  FinanceCategory,
  FinanceSubcategory,
  Processo,
  OfficeIndicator,
} from './types';

// Bootstrap admin emails
const ADMIN_EMAILS = ['diegociatos@gmail.com', 'diego.garcia@grupociatos.com.br'];

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');

  // Finance State
  const [financeBanks, setFinanceBanks] = useState<FinanceBank[]>([]);
  const [financeCategories, setFinanceCategories] = useState<FinanceCategory[]>([]);
  const [financeSubcategories, setFinanceSubcategories] = useState<FinanceSubcategory[]>([]);
  const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>([]);
  const [monthlyBalances, setMonthlyBalances] = useState<FinanceMonthlyBalance[]>([]);

  const [dreRubrics, setDreRubrics] = useState<DRERubric[]>(DRE_RUBRICS_STRUCTURE);

  const [historicalData, setHistoricalData] = useState<HistoricalYearData[]>([]);

  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<ClientContract[]>([]);
  const [billingEntries, setBillingEntries] = useState<MonthlyBillingEntry[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [processes, setProcesses] = useState<Processo[]>([]);

  const [pointRules, setPointRules] = useState<PointRule[]>([]);
  const [dailyTypes, setDailyTypes] = useState<DailyEntryType[]>([]);
  const [dailyCategories, setDailyCategories] = useState<DailyCategory[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [scoreEvents, setScoreEvents] = useState<ScoreEvent[]>([]);
  const [processScoreConfig, setProcessScoreConfig] = useState<ProcessScoreConfig>(INITIAL_PROCESS_SCORE_CONFIG);
  const [officeIndicator, setOfficeIndicator] = useState<OfficeIndicator>(INITIAL_OFFICE_INDICATORS);
  const [indicators, setIndicators] = useState<MonthlyIndicator[]>([]);

  const [notifications, setNotifications] = useState<CiatosNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // ===================================================================
  // Firebase Auth listener
  // ===================================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        const uid = firebaseUser.uid;

        // Try to get user profile from Firestore
        const userDocRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const userData = userSnap.data() as UserProfile;
          setCurrentUser(userData);
        } else {
          // Bootstrap admin user if not in Firestore
          const isAdmin = ADMIN_EMAILS.includes(email);
          const newUser: UserProfile = {
            id: uid,
            nome: firebaseUser.displayName || email.split('@')[0],
            email: email,
            cargo: isAdmin ? 'Administrador' : 'Advogado',
            status: 'Ativo',
            dataCadastro: new Date().toISOString().split('T')[0],
            notificacoesEmail: true,
            exibirNoRanking: true,
            requiresPasswordChange: false,
          };
          try {
            await setDoc(userDocRef, newUser);
            setCurrentUser(newUser);
          } catch (err) {
            console.error('Failed to create user profile:', err);
            await signOut(auth);
            setIsAuthLoading(false);
            return;
          }
        }
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ===================================================================
  // Firestore listeners (only when authenticated)
  // ===================================================================
  useEffect(() => {
    if (!isLoggedIn) return;

    const unsubscribers: (() => void)[] = [];

    // Users
    unsubscribers.push(
      onSnapshot(collection(db, 'users'), (snap) => {
        setUsers(snap.docs.map(d => ({ ...d.data(), id: d.id } as UserProfile)));
      })
    );

    // Clients
    unsubscribers.push(
      onSnapshot(collection(db, 'clients'), (snap) => {
        setClients(snap.docs.map(d => ({ ...d.data(), id: d.id } as Client)));
      })
    );

    // Contracts
    unsubscribers.push(
      onSnapshot(collection(db, 'contracts'), (snap) => {
        setContracts(snap.docs.map(d => ({ ...d.data(), id: d.id } as ClientContract)));
      })
    );

    // Billing Entries
    unsubscribers.push(
      onSnapshot(collection(db, 'billing_entries'), (snap) => {
        setBillingEntries(snap.docs.map(d => ({ ...d.data(), id: d.id } as MonthlyBillingEntry)));
      })
    );

    // Processes
    unsubscribers.push(
      onSnapshot(collection(db, 'processes'), (snap) => {
        setProcesses(snap.docs.map(d => ({ ...d.data(), id: d.id } as Processo)));
      })
    );

    // Assignments
    unsubscribers.push(
      onSnapshot(collection(db, 'assignments'), (snap) => {
        setAssignments(snap.docs.map(d => ({ ...d.data(), id: d.id } as Assignment)));
      })
    );

    // Finance Transactions
    unsubscribers.push(
      onSnapshot(collection(db, 'finance_transactions'), (snap) => {
        setFinanceTransactions(snap.docs.map(d => ({ ...d.data(), id: d.id } as FinanceTransaction)));
      })
    );

    // Finance Banks
    unsubscribers.push(
      onSnapshot(collection(db, 'finance_banks'), (snap) => {
        const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as FinanceBank));
        setFinanceBanks(data.length > 0 ? data : INITIAL_FINANCE_BANKS);
      })
    );

    // Finance Categories
    unsubscribers.push(
      onSnapshot(collection(db, 'finance_categories'), (snap) => {
        const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as FinanceCategory));
        setFinanceCategories(data.length > 0 ? data : INITIAL_FINANCE_CATEGORIES);
      })
    );

    // Finance Subcategories
    unsubscribers.push(
      onSnapshot(collection(db, 'finance_subcategories'), (snap) => {
        const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as FinanceSubcategory));
        setFinanceSubcategories(data.length > 0 ? data : INITIAL_FINANCE_SUBCATEGORIES);
      })
    );

    // Monthly Balances
    unsubscribers.push(
      onSnapshot(collection(db, 'finance_monthly_balances'), (snap) => {
        setMonthlyBalances(snap.docs.map(d => ({ ...d.data(), id: d.id } as FinanceMonthlyBalance)));
      })
    );

    // Historical Data
    unsubscribers.push(
      onSnapshot(collection(db, 'historical_data'), (snap) => {
        setHistoricalData(snap.docs.map(d => d.data() as HistoricalYearData).sort((a, b) => a.year - b.year));
      })
    );

    // Point Rules
    unsubscribers.push(
      onSnapshot(collection(db, 'point_rules'), (snap) => {
        const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as PointRule));
        setPointRules(data.length > 0 ? data : INITIAL_POINT_RULES);
      })
    );

    // Daily Types
    unsubscribers.push(
      onSnapshot(collection(db, 'daily_types'), (snap) => {
        const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as DailyEntryType));
        setDailyTypes(data.length > 0 ? data : INITIAL_DAILY_TYPES);
      })
    );

    // Daily Categories
    unsubscribers.push(
      onSnapshot(collection(db, 'daily_categories'), (snap) => {
        const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as DailyCategory));
        setDailyCategories(data.length > 0 ? data : INITIAL_DAILY_CATEGORIES);
      })
    );

    // Daily Entries
    unsubscribers.push(
      onSnapshot(collection(db, 'daily_entries'), (snap) => {
        setDailyEntries(snap.docs.map(d => ({ ...d.data(), id: d.id } as DailyEntry)));
      })
    );

    // Score Events
    unsubscribers.push(
      onSnapshot(collection(db, 'score_events'), (snap) => {
        setScoreEvents(snap.docs.map(d => ({ ...d.data(), id: d.id } as ScoreEvent)));
      })
    );

    // Indicators
    unsubscribers.push(
      onSnapshot(collection(db, 'indicators'), (snap) => {
        setIndicators(snap.docs.map(d => d.data() as MonthlyIndicator));
      })
    );

    // Audit Logs
    unsubscribers.push(
      onSnapshot(collection(db, 'audit_logs'), (snap) => {
        setAuditLogs(snap.docs.map(d => ({ ...d.data(), id: d.id } as AuditLog)));
      })
    );

    // Notifications
    unsubscribers.push(
      onSnapshot(collection(db, 'notifications'), (snap) => {
        setNotifications(snap.docs.map(d => ({ ...d.data(), id: d.id } as CiatosNotification)));
      })
    );

    // Config single docs
    const configRef = doc(db, 'config', 'processScoreConfig');
    unsubscribers.push(
      onSnapshot(configRef, (snap) => {
        if (snap.exists()) setProcessScoreConfig(snap.data() as ProcessScoreConfig);
      })
    );

    const officeRef = doc(db, 'config', 'officeIndicator');
    unsubscribers.push(
      onSnapshot(officeRef, (snap) => {
        if (snap.exists()) setOfficeIndicator(snap.data() as OfficeIndicator);
      })
    );

    return () => unsubscribers.forEach(unsub => unsub());
  }, [isLoggedIn]);

  // ===================================================================
  // Firestore write helpers
  // ===================================================================
  const firestoreAdd = async (collectionName: string, data: any) => {
    const { id, ...rest } = data;
    if (id) {
      await setDoc(doc(db, collectionName, id), data);
    } else {
      const ref = await addDoc(collection(db, collectionName), rest);
      await updateDoc(ref, { id: ref.id });
    }
  };

  const firestoreUpdate = async (collectionName: string, docId: string, data: any) => {
    await setDoc(doc(db, collectionName, docId), data, { merge: true });
  };

  const firestoreDelete = async (collectionName: string, docId: string) => {
    await deleteDoc(doc(db, collectionName, docId));
  };

  // ===================================================================
  // Handlers that write to Firestore
  // ===================================================================
  const handleAddClient = (c: Client) => firestoreAdd('clients', c);
  const handleUpdateClient = (c: Client) => firestoreUpdate('clients', c.id, c);

  const handleAddContract = (c: ClientContract) => firestoreAdd('contracts', c);
  const handleUpdateContract = (c: ClientContract) => firestoreUpdate('contracts', c.id, c);

  const handleAddBillingEntry = (e: MonthlyBillingEntry) => firestoreAdd('billing_entries', e);
  const handleUpdateBillingEntry = (e: MonthlyBillingEntry) => firestoreUpdate('billing_entries', e.id, e);

  const handleAddProcess = (p: Processo) => {
    const newProcess = { ...p, id: p.id || `proc_${Date.now()}`, data_cadastro: new Date().toISOString(), timeline: p.timeline || [] };
    firestoreAdd('processes', newProcess);
  };
  const handleEditProcess = (p: Processo) => firestoreUpdate('processes', p.id, p);
  const handleDeleteProcess = (id: string) => firestoreDelete('processes', id);
  const handleUpdateProcessTimeline = (pid: string, upd: any) => {
    const proc = processes.find(p => p.id === pid);
    if (proc) {
      firestoreUpdate('processes', pid, { ...proc, timeline: [upd, ...proc.timeline] });
    }
  };
  const handleValidateProcessUpdate = (pid: string, uid: string, pts: number) => {
    const proc = processes.find(p => p.id === pid);
    if (proc) {
      const updatedTimeline = proc.timeline.map(u =>
        u.id === uid ? { ...u, status_validacao: 'VALIDADO', data_validacao: new Date().toISOString(), pontos_atribuidos: pts } : u
      );
      firestoreUpdate('processes', pid, { ...proc, timeline: updatedTimeline });
    }
  };

  const handleAddAssignment = (a: Assignment) => firestoreAdd('assignments', a);
  const handleUpdateAssignment = (a: Assignment) => firestoreUpdate('assignments', a.id, a);
  const handleDeleteAssignment = (id: string) => firestoreDelete('assignments', id);
  const handleAuditAssignment = (id: string, dec: string, reason?: string) => {
    const a = assignments.find(x => x.id === id);
    if (a) firestoreUpdate('assignments', id, { ...a, status: dec, motivoReprovacao: reason });
  };

  const handleCompleteAssignment = (id: string, evidence: string) => {
    const a = assignments.find(x => x.id === id);
    if (a) {
      firestoreUpdate('assignments', id, { ...a, status: 'AGUARDANDO_VALIDACAO', evidenciaAdvogado: evidence, concluidoEm: new Date().toISOString() });
      alert("Compromisso enviado para validação da gestora!");
    }
  };

  const handleAddTransaction = (t: FinanceTransaction) => firestoreAdd('finance_transactions', t);
  const handleUpdateTransaction = (t: FinanceTransaction) => firestoreUpdate('finance_transactions', t.id, t);
  const handleDeleteTransaction = (id: string) => firestoreDelete('finance_transactions', id);

  const handleAddUser = (u: UserProfile) => firestoreAdd('users', u);
  const handleUpdateUser = (u: UserProfile) => firestoreUpdate('users', u.id, u);
  const handleResetPassword = (id: string) => {
    const u = users.find(x => x.id === id);
    if (u) firestoreUpdate('users', id, { ...u, status: 'Aguardando Primeiro Acesso', requiresPasswordChange: true });
  };

  const handleLogAudit = (log: AuditLog) => firestoreAdd('audit_logs', log);

  const handleUpdateMonthlyBalance = (bancoId: string, mesAno: string, novoSaldo: number) => {
    const existing = monthlyBalances.find(b => b.bancoId === bancoId && b.mesAno === mesAno);
    if (existing) {
      firestoreUpdate('finance_monthly_balances', existing.id, { ...existing, saldoAbertura: novoSaldo });
    } else {
      const newBal = { id: `bal_${Date.now()}`, bancoId, mesAno, saldoAbertura: novoSaldo };
      firestoreAdd('finance_monthly_balances', newBal);
    }
  };

  const handleSavePointRules = (rules: PointRule[]) => {
    rules.forEach(r => firestoreUpdate('point_rules', r.id, r));
  };
  const handleSaveDailyTypes = (types: DailyEntryType[]) => {
    types.forEach(t => firestoreUpdate('daily_types', t.id, t));
  };
  const handleSaveDailyCategories = (cats: DailyCategory[]) => {
    cats.forEach(c => firestoreUpdate('daily_categories', c.id, c));
  };
  const handleSaveProcessScoreConfig = (config: ProcessScoreConfig) => {
    setDoc(doc(db, 'config', 'processScoreConfig'), config);
  };

  const handleSaveIndicator = (ind: MonthlyIndicator) => {
    const docId = `${ind.advogado}_${ind.mes}_${ind.ano}`;
    setDoc(doc(db, 'indicators', docId), ind);
  };

  const handleUpdateDailyEntries = (entries: DailyEntry[]) => {
    entries.forEach(e => {
      if (e.id) firestoreUpdate('daily_entries', e.id, e);
      else firestoreAdd('daily_entries', e);
    });
  };

  const handleUpdateFinanceBanks = (banks: FinanceBank[]) => {
    banks.forEach(b => setDoc(doc(db, 'finance_banks', b.id), b));
  };
  const handleUpdateFinanceCategories = (cats: FinanceCategory[]) => {
    cats.forEach(c => setDoc(doc(db, 'finance_categories', c.id), c));
  };
  const handleUpdateFinanceSubcategories = (subs: FinanceSubcategory[]) => {
    subs.forEach(s => setDoc(doc(db, 'finance_subcategories', s.id), s));
  };
  const handleUpdateDreRubrics = (rubrics: DRERubric[]) => {
    setDoc(doc(db, 'config', 'dreRubrics'), { items: rubrics });
    setDreRubrics(rubrics);
  };

  const handleImportHistorical = (newData: HistoricalYearData) => {
    setDoc(doc(db, 'historical_data', String(newData.year)), newData);
  };

  const handleBulkImport = (newContracts: ClientContract[], newEntries: MonthlyBillingEntry[]) => {
    newContracts.forEach(c => firestoreAdd('contracts', c));
    newEntries.forEach(e => firestoreAdd('billing_entries', e));
  };

  const handleProvisionFromPreviousMonth = (currentMonth: string, previousMonth: string) => {
    const previousMonthEntries = billingEntries.filter(e => e.month === previousMonth && (e.status === 'FINALIZADO' || e.status === 'PAGO'));

    if (previousMonthEntries.length === 0) {
      alert("Não foram encontrados lançamentos finalizados no mês anterior para clonagem.");
      return;
    }

    let count = 0;
    previousMonthEntries.forEach(prev => {
      const exists = billingEntries.some(e => e.clientId === prev.clientId && e.month === currentMonth);
      if (!exists) {
        const contract = contracts.find(c => c.id === prev.contractId);
        if (contract) {
          const newEntry: MonthlyBillingEntry = {
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
          };
          firestoreAdd('billing_entries', newEntry);
          count++;
        }
      }
    });

    if (count > 0) {
      alert(`${count} rascunhos de faturamento foram gerados com base no mês anterior!`);
      setCurrentView('faturamento_simplificado');
    } else {
      alert("Todos os clientes do mês anterior já possuem lançamentos iniciados no mês atual.");
    }
  };

  const handleUpdateBillingEntries = (updated: MonthlyBillingEntry[]) => {
    updated.forEach(e => firestoreUpdate('billing_entries', e.id, e));
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  // ===================================================================
  // Render view
  // ===================================================================
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
        return <ClientsView clients={clients} users={users} onAddClient={handleAddClient} onUpdateClient={handleUpdateClient} currentUser={currentUser} processes={processes} billingEntries={billingEntries} onLogAudit={handleLogAudit} />;

      case 'faturamento':
        return <BillingEntriesView
          entries={billingEntries}
          contracts={contracts}
          clients={clients}
          onAddEntry={handleAddBillingEntry}
          onUpdateEntry={handleUpdateBillingEntry}
          onBulkImport={handleBulkImport}
          currentUser={currentUser}
          onLogAudit={handleLogAudit}
          onNavigateToSimplified={() => setCurrentView('faturamento_simplificado')}
          onAutoProvision={handleProvisionFromPreviousMonth}
        />;

      case 'faturamento_simplificado':
        return <BillingSimplifiedListView
          entries={billingEntries}
          contracts={contracts}
          onUpdateEntries={handleUpdateBillingEntries}
          currentUser={currentUser}
          onBack={() => setCurrentView('faturamento')}
        />;

      case 'inadimplencia':
        return <InadimplenciaView entries={billingEntries} contracts={contracts} onUpdateEntry={handleUpdateBillingEntry} currentUser={currentUser} onLogAudit={handleLogAudit} />;

      case 'recorrencia':
        return <BillingTemplatesView templates={[]} contracts={contracts} onAddTemplate={() => { }} onUpdateTemplate={() => { }} onDeleteTemplate={() => { }} onBulkGenerate={() => { }} currentUser={currentUser} />;

      case 'contratos':
        return <ContractsView contracts={contracts} clients={clients} onAddContract={handleAddContract} onUpdateContract={handleUpdateContract} currentUser={currentUser} />;

      case 'processos':
        if (isFinanceiro) return <RestrictedAccess />;
        return <ProcessosView processes={processes} onUpdateProcess={handleUpdateProcessTimeline} onAddProcess={handleAddProcess} onEditProcess={handleEditProcess} onDeleteProcess={handleDeleteProcess} onValidateUpdate={handleValidateProcessUpdate} scoreConfig={processScoreConfig} clients={clients} users={users} currentUser={currentUser} />;

      case 'compromissos_equipe':
        if (isFinanceiro) return <RestrictedAccess />;
        if (isAdvogado) {
          return <MyAssignmentsView assignments={assignments.filter(a => a.advogadoId === currentUser.id)} onComplete={handleCompleteAssignment} />;
        }
        return <AssignmentManagementView assignments={assignments} users={users} onAddAssignment={handleAddAssignment} onUpdateAssignment={handleUpdateAssignment} onDeleteAssignment={handleDeleteAssignment} onAuditAssignment={handleAuditAssignment} currentUser={currentUser} />;

      case 'meritocracia':
        if (isFinanceiro) return <RestrictedAccess />;
        return (isAdmin || isGestor) ? <ActivityEntryView activities={[]} indicators={indicators} dailyEntries={dailyEntries} dailyEntryTypes={dailyTypes} dailyCategories={dailyCategories} rules={pointRules} scoreEvents={scoreEvents} onAdd={() => { }} onValidate={() => { }} onSaveIndicator={handleSaveIndicator} onUpdateDailyEntries={handleUpdateDailyEntries} /> : <RankingView indicators={indicators} qualifiedActivities={[]} dailyEntries={dailyEntries} dailyEntryTypes={dailyTypes} dailyCategories={dailyCategories} scoreEvents={scoreEvents} currentUser={currentUser} appointments={[]} />;

      case 'kpis':
        if (isFinanceiro) return <RestrictedAccess />;
        return <KPIsView currentUser={currentUser} />;

      case 'gente_gestao':
        if (isFinanceiro) return <RestrictedAccess />;
        return <PeopleView sectors={officeIndicator.gestao_pessoais} currentUser={currentUser} />;

      case 'usuarios':
        if (isFinanceiro || isGestor) return <RestrictedAccess />;
        return <UsersView users={users} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onResetPassword={handleResetPassword} />;

      case 'qa':
        if (isFinanceiro || isGestor) return <RestrictedAccess />;
        return <QADashboardView contracts={contracts} entries={billingEntries} auditLogs={auditLogs} clients={clients} currentUser={currentUser} />;

      case 'fluxo_caixa':
        if (isGestor) return <RestrictedAccess />;
        return <CashFlowView
          transactions={financeTransactions}
          billingEntries={billingEntries}
          currentUser={currentUser}
          onAddTransaction={handleAddTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
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
        return <HistoricalAnalysisView historicalData={historicalData} onImportHistorical={handleImportHistorical} categories={financeCategories} subcategories={financeSubcategories} dreRubrics={dreRubrics} />;

      case 'configuracao':
        if (isFinanceiro) return <RestrictedAccess />;
        return <ConfigPointsView rules={pointRules} onSaveRules={handleSavePointRules} dailyTypes={dailyTypes} onSaveDailyTypes={handleSaveDailyTypes} categories={dailyCategories} onSaveCategories={handleSaveDailyCategories} processScoreConfig={processScoreConfig} onSaveProcessScoreConfig={handleSaveProcessScoreConfig} currentUser={currentUser} />;

      case 'finance_settings':
        if (isGestor) return <RestrictedAccess />;
        return <FinanceSettingsView
          banks={financeBanks}
          categories={financeCategories}
          subcategories={financeSubcategories}
          onUpdateBanks={handleUpdateFinanceBanks}
          onUpdateCategories={handleUpdateFinanceCategories}
          onUpdateSubcategories={handleUpdateFinanceSubcategories}
          dreRubrics={dreRubrics}
          onUpdateDreRubrics={handleUpdateDreRubrics}
        />;

      default:
        return <DashboardView indicator={officeIndicator} appointments={[]} indicators={indicators} processes={processes} clients={clients} currentUser={currentUser} assignments={assignments} billingEntries={billingEntries} contracts={contracts} dailyEntries={dailyEntries} dailyEntryTypes={dailyTypes} scoreEvents={scoreEvents} />;
    }
  };

  // Loading screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#8B1538] mx-auto mb-4" />
          <p className="text-gray-500 font-serif italic">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return <LoginView onLogin={() => { }} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeItem={currentView} onNavigate={setCurrentView} currentUser={currentUser} />
      <div className="flex-1 ml-[240px] flex flex-col h-full overflow-hidden">
        <TopHeader
          user={currentUser}
          onEditProfile={() => setIsProfileModalOpen(true)}
          onLogout={handleLogout}
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
      <ProfileEditModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={currentUser} onSave={(u) => { setCurrentUser(u); firestoreUpdate('users', u.id, u); }} />
      <ForcePasswordChangeModal isOpen={currentUser.requiresPasswordChange} onPasswordChanged={() => { const updated = { ...currentUser, requiresPasswordChange: false }; setCurrentUser(updated); firestoreUpdate('users', updated.id, updated); }} />
    </div>
  );
};

export default App;
