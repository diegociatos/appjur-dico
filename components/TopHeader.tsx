
import React, { useState } from 'react';
import { ChevronDown, User, Settings, LogOut, Bell, CheckCircle2, Cake, AlertCircle, X, Shield, UserCog, Briefcase, Wallet, TrendingUp } from 'lucide-react';
import { UserProfile, CiatosNotification } from '../types';
import Avatar from './Avatar';

interface TopHeaderProps {
  user: UserProfile;
  onEditProfile: () => void;
  onLogout: () => void;
  onSimulateProfile?: (role: 'Administrador' | 'Gestor' | 'Advogado' | 'Financeiro') => void;
  notifications?: CiatosNotification[];
  onMarkAllRead?: () => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ user, onEditProfile, onLogout, onSimulateProfile, notifications = [], onMarkAllRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.lida).length;

  return (
    <header className="h-20 bg-white border-b border-gray-100 px-12 flex items-center justify-between sticky top-0 z-[100] gap-8">
      
      <div className="flex items-center gap-2 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-100">
        <span className="text-[9px] font-black text-gray-400 uppercase px-3 tracking-widest">Simular:</span>
        <button 
          onClick={() => onSimulateProfile?.('Administrador')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${user.cargo === 'Administrador' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-500 hover:bg-white'}`}
        >
          <Shield size={12} /> Admin
        </button>
        <button 
          onClick={() => onSimulateProfile?.('Gestor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${user.cargo === 'Gestor' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-500 hover:bg-white'}`}
        >
          <UserCog size={12} /> Gestor
        </button>
        <button 
          onClick={() => onSimulateProfile?.('Financeiro')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${user.cargo === 'Financeiro' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-500 hover:bg-white'}`}
        >
          <Wallet size={12} /> Financeiro
        </button>
        <button 
          onClick={() => onSimulateProfile?.('Advogado')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${user.cargo === 'Advogado' ? 'bg-[#8B1538] text-white shadow-md' : 'text-gray-500 hover:bg-white'}`}
        >
          <Briefcase size={12} /> Advogado
        </button>
      </div>

      <div className="flex items-center gap-8 ml-auto">
        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-3 text-gray-300 hover:text-[#8B1538] relative transition-colors bg-gray-50/50 rounded-xl"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)} />
              <div className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-20 animate-in slide-in-from-top-4 duration-300">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">Notificações</h3>
                    <button onClick={onMarkAllRead} className="text-[10px] font-black text-[#8B1538] uppercase hover:underline">Limpar todas</button>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center text-gray-300 italic text-sm font-serif">Nenhuma nova notificação.</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-6 border-b border-gray-50 hover:bg-gray-50/50 transition-colors flex gap-4 ${!n.lida ? 'bg-blue-50/20' : ''}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            n.tipo === 'ANIVERSARIO' ? 'bg-amber-50 text-amber-500' : 
                            n.tipo === 'REAJUSTE' ? 'bg-amber-100 text-amber-600' :
                            n.tipo === 'PROCESSO' ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-400'
                          }`}>
                            {n.tipo === 'ANIVERSARIO' ? <Cake size={18}/> : 
                             n.tipo === 'REAJUSTE' ? <TrendingUp size={18}/> :
                             n.tipo === 'PROCESSO' ? <AlertCircle size={18}/> : <Bell size={18}/>}
                          </div>
                          <div className="space-y-1">
                              <p className="text-sm font-bold text-gray-800 font-serif">{n.titulo}</p>
                              <p className="text-xs text-gray-500 leading-relaxed font-serif">{n.mensagem}</p>
                              <p className="text-[9px] font-black text-gray-300 uppercase mt-2">{n.data}</p>
                          </div>
                        </div>
                      ))
                    )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-4 bg-gray-50/50 pl-2 pr-4 py-2 rounded-2xl hover:bg-gray-100 transition-all group"
          >
            <Avatar nome={user.nome} fotoUrl={user.fotoUrl} size="sm" />
            <div className="text-left hidden sm:block">
              <p className="text-sm font-serif font-bold text-[#2D3748] leading-none">{user.nome}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{user.cargo}</p>
            </div>
            <ChevronDown size={16} className={`text-gray-300 group-hover:text-[#8B1538] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
              <div className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-20 animate-in slide-in-from-top-4 duration-300 font-serif">
                <div className="p-6 border-b border-gray-50 bg-gray-50/20">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Conectado como</p>
                  <p className="text-sm font-bold text-[#2D3748]">{user.email}</p>
                </div>
                <div className="p-2">
                  <button onClick={() => {onEditProfile(); setIsOpen(false)}} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-[#8B1538]/5 hover:text-[#8B1538] rounded-xl transition-all group">
                    <User size={18} className="text-gray-300 group-hover:text-[#8B1538]" /> Meu Perfil
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-[#8B1538]/5 hover:text-[#8B1538] rounded-xl transition-all group">
                    <Settings size={18} className="text-gray-300 group-hover:text-[#8B1538]" /> Configurações
                  </button>
                </div>
                <div className="p-2 border-t border-gray-50">
                  <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all group">
                    <LogOut size={18} /> Sair do Sistema
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
