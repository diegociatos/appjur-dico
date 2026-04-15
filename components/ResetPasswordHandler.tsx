import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Scale, ShieldCheck } from 'lucide-react';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase';

interface Props {
  oobCode: string;
  onDone: () => void;
}

const ResetPasswordHandler: React.FC<Props> = ({ oobCode, onDone }) => {
  const [email, setEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'verifying' | 'ready' | 'success' | 'expired'>('verifying');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    verifyPasswordResetCode(auth, oobCode)
      .then((userEmail) => {
        setEmail(userEmail);
        setStatus('ready');
      })
      .catch(() => {
        setStatus('expired');
      });
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPass.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPass !== confirmPass) {
      setError('As senhas não coincidem.');
      return;
    }

    setSaving(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPass);
      setStatus('success');
    } catch (err: any) {
      if (err?.code === 'auth/expired-action-code') {
        setStatus('expired');
      } else if (err?.code === 'auth/weak-password') {
        setError('Senha muito fraca. Use pelo menos 6 caracteres.');
      } else {
        setError('Erro ao redefinir senha. Tente novamente.');
      }
    } finally {
      setSaving(false);
    }
  };

  const LOGO_URL = "https://cdn.abacus.ai/images/2f20f120-949f-4315-bb81-525502e9b98c.png";

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FDFDFD] font-serif overflow-hidden">
      {/* Left branding */}
      <div className="w-full lg:w-[55%] bg-[#801538] relative flex flex-col items-center justify-center p-12 lg:p-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Scale size={800} className="absolute -bottom-40 -left-40 rotate-12 text-white/20" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-10">
            <img src={LOGO_URL} alt="Ciatos Jurídico" className="w-48 md:w-64 lg:w-80 h-auto drop-shadow-[0_20px_35px_rgba(0,0,0,0.3)]" />
          </div>
          <h1 className="text-white text-2xl md:text-3xl font-bold tracking-tight mb-4">Redefinição de Senha</h1>
          <div className="w-16 h-0.5 bg-white/40 mx-auto mb-6 rounded-full"></div>
          <p className="text-white/60 text-base md:text-lg italic leading-relaxed">Crie uma nova senha segura para acessar o sistema.</p>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-2 text-white/20 text-[9px] font-black uppercase tracking-[0.4em]">
          <ShieldCheck size={12} /> Protocolo de Segurança Ciatos Intelligence
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 lg:p-20">
        <div className="w-full max-w-md">
          {status === 'verifying' && (
            <div className="text-center py-20">
              <div className="animate-spin w-12 h-12 border-4 border-[#8B1538] border-t-transparent rounded-full mx-auto mb-6"></div>
              <p className="text-gray-500 italic">Verificando link...</p>
            </div>
          )}

          {status === 'expired' && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#8B1538] mb-4">Link Expirado</h2>
              <p className="text-gray-500 italic mb-8">Este link de redefinição expirou ou já foi utilizado.</p>
              <p className="text-gray-400 text-sm mb-6">Solicite um novo reset de senha ao administrador ou use "Esqueci minha senha" na tela de login.</p>
              <button onClick={onDone} className="bg-[#8B1538] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#6a1029] transition-colors">
                Ir para Login
              </button>
            </div>
          )}

          {status === 'ready' && (
            <div>
              <h2 className="text-3xl font-bold text-[#8B1538] mb-2">Nova Senha</h2>
              <p className="text-gray-500 italic mb-8">Defina uma nova senha para <strong>{email}</strong></p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                    <AlertCircle size={18} className="text-red-500 shrink-0" />
                    <span className="text-sm font-semibold text-red-600">{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Nova Senha</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      placeholder="Mínimo 6 caracteres..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/10 pr-14"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#8B1538]">
                      {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Confirmar Senha</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    placeholder="Repita a senha..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-[#8B1538]/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 bg-[#8B1538] text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-[#8B1538]/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  <Lock size={18} /> {saving ? 'Salvando...' : 'Redefinir Senha'}
                </button>
              </form>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#8B1538] mb-4">Senha Redefinida!</h2>
              <p className="text-gray-500 italic mb-8">Sua nova senha foi salva com sucesso. Agora você pode fazer login.</p>
              <button onClick={onDone} className="bg-[#8B1538] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#6a1029] transition-colors">
                Ir para Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordHandler;
