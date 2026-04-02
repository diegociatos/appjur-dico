
import React, { useState } from 'react';
import { X, FileText, Download, CheckCircle2, AlertCircle, FileSpreadsheet, Database, ShieldCheck } from 'lucide-react';
import { Client, MonthlyBillingEntry, UserProfile } from '../types';
import { generateBillingCSV, downloadFile, createAuditLog, simulateBillingApiExport } from '../utils/exportUtils';

interface ExportBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  entries: MonthlyBillingEntry[];
  currentUser: UserProfile;
  onLogAudit: (log: any) => void;
}

const ExportBillingModal: React.FC<ExportBillingModalProps> = ({ isOpen, onClose, client, entries, currentUser, onLogAudit }) => {
  const [format, setFormat] = useState<'CSV' | 'XLSX' | 'API'>('CSV');
  const [isExporting, setIsExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    
    const fileName = `Faturamento_Ciatos_${client.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    
    try {
      if (format === 'CSV') {
        const csv = generateBillingCSV(entries, client.nome);
        downloadFile(csv, `${fileName}.csv`, 'text/csv;charset=utf-8;');
        
        onLogAudit(createAuditLog(currentUser, 'EXPORT_CSV', client.id, `Exportação de ${entries.length} lançamentos de faturamento.`));
      } else if (format === 'API') {
        await simulateBillingApiExport(entries, '2026-02');
        onLogAudit(createAuditLog(currentUser, 'API_EXPORT', client.id, `Integração via endpoint de faturamento.`));
      } else {
        // Mock XLSX - Na prática usaria bibliotecas como exceljs ou sheetjs
        const csvForXlsx = generateBillingCSV(entries, client.nome);
        downloadFile(csvForXlsx, `${fileName}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        onLogAudit(createAuditLog(currentUser, 'EXPORT_XLSX', client.id, `Exportação em formato planilha estruturada.`));
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (e) {
      alert("Erro ao processar exportação.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1500] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col font-serif-elegant">
        
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
              <Download size={24} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#8B1538]">Exportar Faturamento</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Consolidação de Honorários: {client.nome}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2"><X size={28} /></button>
        </div>

        <div className="p-10 space-y-8">
           <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Selecione o Formato de Saída</label>
              <div className="grid grid-cols-3 gap-4">
                 {[
                   { id: 'CSV', label: 'CSV Texto', icon: FileText },
                   { id: 'XLSX', label: 'Planilha XLSX', icon: FileSpreadsheet },
                   { id: 'API', label: 'Integração API', icon: Database },
                 ].map(opt => (
                   <button 
                    key={opt.id} 
                    onClick={() => setFormat(opt.id as any)}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all group
                      ${format === opt.id ? 'bg-[#8B1538]/5 border-[#8B1538] text-[#8B1538]' : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-200 text-gray-400'}`}
                   >
                      <opt.icon size={24} className={format === opt.id ? 'text-[#8B1538]' : 'text-gray-300 group-hover:text-gray-400'} />
                      <span className="text-[9px] font-black uppercase tracking-tighter">{opt.label}</span>
                   </button>
                 ))}
              </div>
           </div>

           <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-start gap-4">
              <ShieldCheck className="text-amber-600 shrink-0" size={20} />
              <div>
                <p className="text-[10px] font-black text-amber-800 uppercase mb-1">Governança de Dados</p>
                <p className="text-xs text-amber-700 italic font-medium leading-relaxed">
                   Esta operação será registrada no log de auditoria do sistema sob sua identidade corporativa ({currentUser.nome}).
                </p>
              </div>
           </div>

           <div className="pt-4 flex flex-col gap-4">
              <button 
                onClick={handleExport}
                disabled={isExporting || success}
                className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3
                  ${success ? 'bg-green-500 text-white' : 'bg-[#8B1538] text-white shadow-[#8B1538]/20 hover:bg-[#72112d] active:scale-95'}`}
              >
                {isExporting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : success ? (
                  <><CheckCircle2 size={18}/> Arquivo Gerado!</>
                ) : (
                  <><Download size={18}/> Processar Exportação</>
                )}
              </button>
              <button 
                onClick={onClose}
                className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
              >
                 Cancelar operação
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ExportBillingModal;
