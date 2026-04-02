
import React from 'react';
import { 
  LayoutDashboard, Briefcase, Trophy, LogOut, Settings, Users, 
  Contact2, Receipt, TrendingUp, BrainCircuit, ShieldAlert,
  RotateCcw, FileText, CalendarCheck2, BarChart3, Heart, ShieldCheck,
  Landmark, Settings2, Wallet, PieChart
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import Avatar from './Avatar';

interface SidebarProps {
  activeItem: string;
  onNavigate?: (id: string) => void;
  currentUser: UserProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate, currentUser }) => {
  
  const role = currentUser.cargo;
  const isAdmin = role === 'Administrador';
  const isGestor = role === 'Gestor';
  const isFinanceiro = role === 'Financeiro';

  const renderAdminOrGestorMenu = () => (
    <>
      {/* SEÇÃO: ESTRATÉGIA - Acesso: Admin e Gestor */}
      <div className="mb-6">
        <p className="px-5 mb-2 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Estratégia</p>
        <div className="space-y-1">
          <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} activeItem={activeItem} onNavigate={onNavigate} />
          <NavItem id="kpis" label="KPIs Estratégicos" icon={BarChart3} activeItem={activeItem} onNavigate={onNavigate} />
          <NavItem id="gente_gestao" label="Gente & Gestão" icon={Heart} activeItem={activeItem} onNavigate={onNavigate} />
          <NavItem id="meritocracia" label="Meritocracia" icon={Trophy} activeItem={activeItem} onNavigate={onNavigate} />
          <NavItem id="configuracao" label="Configurações" icon={Settings} activeItem={activeItem} onNavigate={onNavigate} />
        </div>
      </div>

      {/* SEÇÃO: OPERAÇÃO JURÍDICA - Acesso: Admin e Gestor */}
      <div className="mb-6">
        <p className="px-5 mb-2 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Operação Jurídica</p>
        <div className="space-y-1">
          <NavItem id="processos" label="Gestão de Processos" icon={Briefcase} activeItem={activeItem} onNavigate={onNavigate} />
          <NavItem id="compromissos_equipe" label="Compromissos Equipe" icon={CalendarCheck2} activeItem={activeItem} onNavigate={onNavigate} />
        </div>
      </div>

      {/* SEÇÃO: CICLO DE RECEITA - Acesso: Admin e Gestor */}
      <div className="mb-6">
        <p className="px-5 mb-2 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Ciclo de Receita</p>
        <div className="space-y-1">
          <NavItem id="clientes" label="Clientes" icon={Contact2} activeItem={activeItem} onNavigate={onNavigate} />
          <NavItem id="faturamento" label="Lançamentos Mensais" icon={Receipt} activeItem={activeItem} onNavigate={onNavigate} />
          <NavItem id="contratos" label="Contratos & Planos" icon={FileText} activeItem={activeItem} onNavigate={onNavigate} />
          <NavItem id="recorrencia" label="Recorrência & Automat." icon={RotateCcw} activeItem={activeItem} onNavigate={onNavigate} />
          <NavItem id="inadimplencia" label="Inadimplência" icon={ShieldAlert} activeItem={activeItem} onNavigate={onNavigate} />
        </div>
      </div>

      {/* SEÇÃO: FINANCEIRO - Acesso: APENAS ADMINISTRADOR (Oculto para Gestor conforme imagem) */}
      {isAdmin && (
        <div className="mb-6 animate-in fade-in slide-in-from-left-2 duration-300">
          <p className="px-5 mb-2 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Financeiro</p>
          <div className="space-y-1">
            <NavItem id="fluxo_caixa" label="Fluxo de Caixa / DRE" icon={TrendingUp} activeItem={activeItem} onNavigate={onNavigate} />
            <NavItem id="analise_historica" label="Inteligência de Dados" icon={BrainCircuit} activeItem={activeItem} onNavigate={onNavigate} />
            <NavItem id="finance_settings" label="Plano de Contas" icon={Landmark} activeItem={activeItem} onNavigate={onNavigate} />
          </div>
        </div>
      )}

      {/* SEÇÃO: SISTEMA - Acesso: APENAS ADMINISTRADOR (Oculto para Gestor conforme imagem) */}
      {isAdmin && (
        <div className="mb-10 animate-in fade-in slide-in-from-left-2 duration-400">
          <p className="px-5 mb-2 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Sistema</p>
          <div className="space-y-1">
            <NavItem id="usuarios" label="Usuários" icon={Users} activeItem={activeItem} onNavigate={onNavigate} />
            <NavItem id="qa" label="Centro de QA (Audit)" icon={ShieldCheck} activeItem={activeItem} onNavigate={onNavigate} />
          </div>
        </div>
      )}
    </>
  );

  const renderFinanceMenu = () => (
    <>
      {/* SEÇÃO: PERFORMANCE FINANCEIRA */}
      <div className="mb-6">
        <p className="px-5 mb-2 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Estratégia</p>
        <div className="space-y-1">
          <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} activeItem={activeItem} onNavigate={onNavigate} />
          <NavItem id="analise_historica" label="Inteligência de Dados" icon={BrainCircuit} activeItem={activeItem} onNavigate={onNavigate} />
        </div>
      </div>

      {/* SEÇÃO: CAIXA E TESOURARIA */}
      <div className="mb-6">
        <p className="px-5 mb-2 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Tesouraria</p>
        <div className="space-y-1">
          <NavItem id="fluxo_caixa" label="Fluxo de Caixa / DRE" icon={TrendingUp} activeItem={activeItem} onNavigate={onNavigate} />
        </div>
      </div>

      {/* SEÇÃO: CICLO DE RECEITA */}
      <div className="mb-6">
        <p className="px-5 mb-2 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Ciclo de Receita</p>
        <div className="space-y-1">
          <NavItem id="faturamento" label="Lançamentos Mensais" icon={Receipt} activeItem={activeItem} onNavigate={onNavigate} />
          <NavItem id="contratos" label="Contratos & Planos" icon={FileText} activeItem={activeItem} onNavigate={onNavigate} />
          <NavItem id="recorrencia" label="Recorrência & Automat." icon={RotateCcw} activeItem={activeItem} onNavigate={onNavigate} />
          <NavItem id="inadimplencia" label="Inadimplência" icon={ShieldAlert} activeItem={activeItem} onNavigate={onNavigate} />
        </div>
      </div>

      {/* SEÇÃO: APOIO E CADASTRO */}
      <div className="mb-6">
        <p className="px-5 mb-2 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Apoio</p>
        <div className="space-y-1">
          <NavItem id="clientes" label="Clientes" icon={Contact2} activeItem={activeItem} onNavigate={onNavigate} />
        </div>
      </div>

      {/* SEÇÃO: GOVERNANÇA */}
      <div className="mb-10">
        <p className="px-5 mb-2 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Governança</p>
        <div className="space-y-1">
          <NavItem id="finance_settings" label="Plano de Contas" icon={Landmark} activeItem={activeItem} onNavigate={onNavigate} />
          <NavItem id="qa" label="Auditoria (QA)" icon={ShieldCheck} activeItem={activeItem} onNavigate={onNavigate} />
        </div>
      </div>
    </>
  );

  const renderLawyerMenu = () => (
    <div className="space-y-1">
      <NavItem id="dashboard" label="Meu Dashboard" icon={LayoutDashboard} activeItem={activeItem} onNavigate={onNavigate} />
      <NavItem id="processos" label="Meus Processos" icon={Briefcase} activeItem={activeItem} onNavigate={onNavigate} />
      <NavItem id="compromissos_equipe" label="Meus Compromissos" icon={CalendarCheck2} activeItem={activeItem} onNavigate={onNavigate} />
      <NavItem id="meritocracia" label="Ranking Elite" icon={Trophy} activeItem={activeItem} onNavigate={onNavigate} />
      <NavItem id="gente_gestao" label="Clima & Feedback" icon={Heart} activeItem={activeItem} onNavigate={onNavigate} />
    </div>
  );

  return (
    <aside className="w-[240px] bg-[#8B1538] h-screen flex flex-col fixed left-0 top-0 text-white/80 z-50 shadow-2xl font-serif-elegant overflow-hidden">
      <div className="p-10 pb-8 text-center shrink-0">
        <h1 className="text-3xl font-bold text-white tracking-tight leading-none">Ciatos</h1>
        <p className="text-[11px] text-white/40 font-black tracking-[0.3em] uppercase mt-2">Jurídico</p>
      </div>
      
      <nav className="flex-1 mt-4 px-4 overflow-y-auto scrollbar-hide pb-10">
        {isAdmin || isGestor ? renderAdminOrGestorMenu() : isFinanceiro ? renderFinanceMenu() : renderLawyerMenu()}
      </nav>

      <div className="p-8 mt-auto border-t border-white/10 shrink-0 bg-[#8B1538]">
        <div className="flex items-center gap-3 mb-6">
          <Avatar nome={currentUser.nome} size="sm" />
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold text-white truncate">{currentUser.nome}</span>
            <span className="text-[10px] text-white/40 uppercase font-black">{currentUser.cargo}</span>
          </div>
        </div>
        <button className="w-full flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white transition-colors" onClick={() => window.location.reload()}>
          <LogOut size={16} /> Sair
        </button>
      </div>
    </aside>
  );
};

const NavItem = ({ id, label, icon: Icon, activeItem, onNavigate }: { id: string, label: string, icon: any, activeItem: string, onNavigate?: (id: string) => void }) => {
  const isActive = id === activeItem;
  return (
    <button
      onClick={() => onNavigate?.(id)}
      className={`w-full flex items-center gap-4 px-5 py-3 text-[13px] font-semibold transition-all rounded-2xl group ${isActive ? 'bg-white text-[#8B1538] shadow-xl' : 'hover:bg-white/5 hover:text-white'}`}
    >
      <Icon size={17} className={`${isActive ? 'text-[#8B1538]' : 'text-white/60 group-hover:text-white'}`} />
      <span className="truncate">{label}</span>
    </button>
  );
};

export default Sidebar;
