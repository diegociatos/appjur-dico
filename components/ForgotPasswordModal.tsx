
import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2, ArrowLeft } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de envio
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        {!submitted ? (
          <div className="p-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif font-bold text-[#801538]">Recuperar Acesso</h2>
              <button onClick={onClose} className="text-gray-300 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 font-serif italic mb-10 leading-relaxed">
              Informe seu e-mail corporativo para receber as instruções de redefinição de senha.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">E-mail Institucional</label>
                <div className="relative group">
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@ciatos.com.br"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-[#801538]/5 focus:border-[#801538]/30 transition-all pl-14"
                  />
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#801538]" size={20} />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-[#801538] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[#801538]/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Send size={18} /> Enviar Instruções
              </button>
            </form>
          </div>
        ) : (
          <div className="p-12 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-gray-800 mb-4">E-mail Enviado!</h3>
            <p className="text-sm text-gray-500 font-serif italic mb-10 leading-relaxed">
              Verifique sua caixa de entrada em <strong>{email}</strong>. Se não encontrar, verifique a pasta de spam.
            </p>
            <button 
              onClick={() => { setSubmitted(false); onClose(); }}
              className="flex items-center justify-center gap-2 mx-auto text-[11px] font-black text-[#801538] uppercase tracking-widest hover:underline"
            >
              <ArrowLeft size={16} /> Voltar ao Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
