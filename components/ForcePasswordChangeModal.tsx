
import React, { useState } from 'react';
import { Lock, ShieldCheck, AlertCircle, Eye, EyeOff, Save } from 'lucide-react';

interface ForcePasswordChangeModalProps {
  isOpen: boolean;
  onPasswordChanged: () => void;
}

const ForcePasswordChangeModal: React.FC<ForcePasswordChangeModalProps> = ({ isOpen, onPasswordChanged }) => {
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPass.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (newPass !== confirmPass) {
      setError('As senhas não coincidem.');
      return;
    }

    // Sucesso
    onPasswordChanged();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
        <div className="bg-[#8B1538] p-12 text-white text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
              <Lock size={200} className="-translate-x-1/2 -translate-y-1/2 rotate-12" />
           </div>
           <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ShieldCheck size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-serif font-bold mb-3">Segurança Obrigatória</h2>
              <p className="text-sm font-serif italic text-white/70 leading-relaxed">
                Detectamos que este é seu primeiro acesso ou suas credenciais foram redefinidas. Por segurança, crie uma nova senha pessoal.
              </p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
           {error && (
             <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-pulse">
                <AlertCircle size={18} className="text-red-500 shrink-0" />
                <span className="text-[11px] font-black text-red-600 uppercase tracking-tight">{error}</span>
             </div>
           )}

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Nova Senha</label>
                 <div className="relative">
                    <input 
                      type={showPass ? 'text' : 'password'}
                      required
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      placeholder="Mínimo 8 caracteres..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5 pr-14"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#8B1538] transition-colors"
                    >
                      {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Confirmar Nova Senha</label>
                 <input 
                   type={showPass ? 'text' : 'password'}
                   required
                   value={confirmPass}
                   onChange={e => setConfirmPass(e.target.value)}
                   className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/5"
                 />
              </div>
           </div>

           <div className="space-y-4 pt-4">
              <button 
                type="submit"
                className="w-full py-5 bg-[#8B1538] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#8B1538]/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Save size={18} /> Definir Nova Senha
              </button>
              <p className="text-center text-[9px] font-black text-gray-300 uppercase tracking-widest">
                Esta ação é necessária para acessar as funcionalidades.
              </p>
           </div>
        </form>
      </div>
    </div>
  );
};

export default ForcePasswordChangeModal;
