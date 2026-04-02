
import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Appointment } from '../types';

interface RescheduleModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onConfirm: (appointmentId: string, newDate: string, reason: string) => void;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({ isOpen, appointment, onClose, onConfirm }) => {
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) {
      setError(true);
      return;
    }
    onConfirm(appointment.id, newDate, reason);
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[#8B1538] rounded-full"></div>
              <h2 className="text-xl font-bold text-[#8B1538]">Reagendar</h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-[#8B1538] transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Você está reagendando o compromisso: <br/>
              {/* Fixed: changed description to descricao to match Appointment type */}
              <span className="text-gray-800 font-bold">"{appointment.descricao}"</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nova Data <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => {
                    setNewDate(e.target.value);
                    setError(false);
                  }}
                  className={`w-full border rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all pr-12
                    ${error ? 'border-red-300 bg-red-50' : 'border-gray-100 bg-gray-50 focus:ring-4 focus:ring-[#8B1538]/5 focus:border-[#8B1538]/30'}`}
                />
                <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Motivo do Reagendamento</label>
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Opcional: Descreva o motivo..."
                className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-5 py-4 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-[#8B1538]/5 focus:border-[#8B1538]/30 h-28 resize-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 hover:text-gray-600 transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white bg-[#8B1538] rounded-2xl shadow-lg shadow-[#8B1538]/20 hover:bg-[#72112d] transition-all active:scale-95"
              >
                Confirmar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
