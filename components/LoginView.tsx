
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ChevronRight, Scale, ShieldCheck } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import ForgotPasswordModal from './ForgotPasswordModal';

interface LoginViewProps {
  onLogin: (email: string) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onLogin(email.trim());
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Credenciais inválidas. Por favor, verifique seu e-mail e senha.');
      } else if (code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
      } else {
        setError('Erro ao autenticar. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const LOGO_URL = "https://cdn.abacus.ai/images/2f20f120-949f-4315-bb81-525502e9b98c.png";

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FDFDFD] font-serif-elegant overflow-hidden">
      
      {/* LADO ESQUERDO: BRANDING (TOP NO MOBILE) */}
      <div className="w-full lg:w-[55%] bg-[#801538] relative flex flex-col items-center justify-center p-12 lg:p-24 overflow-hidden">
        {/* Textura de fundo sutil */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
          <Scale size={800} className="absolute -bottom-40 -left-40 rotate-12 text-white/20" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center animate-in fade-in zoom-in duration-1000">
           <div className="mb-10 transform hover:scale-105 transition-transform duration-500">
             <img 
               src={LOGO_URL} 
               alt="Ciatos Jurídico" 
               className="w-48 md:w-64 lg:w-80 h-auto drop-shadow-[0_20px_35px_rgba(0,0,0,0.3)] filter brightness-110"
             />
           </div>
           
           <div className="max-w-md">
             <h1 className="text-white text-2xl md:text-3xl font-serif font-semibold tracking-tight mb-4">
               Gestão Estratégica de Alta Performance
             </h1>
             <div className="w-16 h-0.5 bg-white/40 mx-auto mb-6 rounded-full"></div>
             <p className="text-white/60 text-base md:text-lg italic leading-relaxed">
               Unificando inteligência jurídica e eficiência operacional em uma única central de comando.
             </p>
           </div>
        </div>

        {/* Footer do painel esquerdo */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-2 text-white/20 text-[9px] font-black uppercase tracking-[0.4em]">
          <ShieldCheck size={12} />
          Protocolo de Segurança Ciatos Intelligence
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 md:p-12 lg:p-20 bg-[#FDFDFD]">
        <div className="w-full max-w-md animate-in slide-in-from-right-12 duration-700">
          
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#2D3748] mb-3 tracking-tight font-serif-elegant">Acesso à Banca</h2>
            <p className="text-gray-400 italic text-sm">Insira suas credenciais para prosseguir.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_15px_45px_rgba(139,21,56,0.05)] p-8 md:p-12 transition-all hover:shadow-[0_20px_60px_rgba(139,21,56,0.08)]">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-red-600 leading-tight">{error}</span>
                </div>
              )}

              <div className="space-y-6">
                {/* Campo E-mail */}
                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                  <div className="relative group">
                    <input 
                      type="email" 
                      required 
                      disabled={isLoading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.nome@ciatos.com.br"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4.5 text-sm font-bold outline-none focus:ring-4 focus:ring-[#801538]/5 focus:border-[#801538]/30 transition-all pl-14 placeholder:text-gray-300 disabled:opacity-50"
                    />
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#801538] transition-colors" size={20} />
                  </div>
                </div>

                {/* Campo Senha */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-end mb-1 px-1">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Senha de Acesso</label>
                    <button 
                      type="button" 
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-[10px] font-black text-[#801538] uppercase tracking-tighter hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <div className="relative group">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      disabled={isLoading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4.5 text-sm font-bold outline-none focus:ring-4 focus:ring-[#801538]/5 focus:border-[#801538]/30 transition-all pl-14 pr-14 placeholder:text-gray-300 disabled:opacity-50"
                    />
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#801538] transition-colors" size={20} />
                    <button 
                      type="button"
                      disabled={isLoading}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#801538] transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    type="button" 
                    disabled={isLoading}
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${rememberMe ? 'bg-[#801538] border-[#801538]' : 'bg-gray-50 border-gray-200 hover:border-[#801538]/30'}`}
                  >
                    {rememberMe && <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>}
                  </button>
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-tight cursor-pointer select-none" onClick={() => setRememberMe(!rememberMe)}>
                    Lembrar neste dispositivo
                  </span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-gradient-to-r from-[#801538] to-[#921a42] text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.25em] shadow-xl shadow-[#801538]/20 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#801538]/30 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ChevronRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-12 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
            © 2026 Ciatos Jurídico. Direitos Reservados.
          </p>
        </div>
      </div>

      <ForgotPasswordModal 
        isOpen={isForgotModalOpen} 
        onClose={() => setIsForgotModalOpen(false)} 
      />
    </div>
  );
};

export default LoginView;
