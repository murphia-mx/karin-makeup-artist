import { X } from 'lucide-react';
import { useState } from 'react';
import { useServicesQuery } from '../hooks/useServicesQuery';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { clientName: string; serviceId: string; serviceDate: string }) => void;
  isPending: boolean;
  error?: Error | null;
}

export const CreateInvitationModal = ({ isOpen, onClose, onSubmit, isPending, error }: CreateInvitationModalProps) => {
  const [clientName, setClientName] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  
  const { data: services } = useServicesQuery();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !serviceId || !serviceDate) return;
    onSubmit({ clientName, serviceId, serviceDate });
  };

  // Reset form when closed
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-admin-bg/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-admin-surface rounded-t-[2rem] sm:rounded-[2rem] shadow-[0_8px_40px_rgba(45,32,37,0.12)] border border-admin-neutral/50 overflow-hidden font-admin-sans flex flex-col h-[90dvh] sm:h-auto sm:max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-6 sm:p-7 pt-[max(1.5rem,env(safe-area-inset-top))] border-b border-admin-neutral/40 shrink-0 bg-admin-surface">
              <h2 className="text-2xl font-bold text-admin-text tracking-tight">Nueva invitación</h2>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 text-admin-text-muted hover:text-admin-text hover:bg-admin-surface-2 rounded-full transition-colors active:scale-95"
              >
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>

            <form id="create-invitation-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 sm:space-y-7">
              
              {error && (
                <div className="p-4 bg-admin-error/10 border border-admin-error/20 rounded-2xl">
                  <p className="text-sm text-admin-error font-medium mb-1">No pudimos crear la invitación. Intenta nuevamente.</p>
                  <p className="text-xs text-admin-error/80 font-light">{error.message}</p>
                </div>
              )}
              
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em]">
                  Nombre de la clienta
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej. María López"
                  className="w-full px-5 py-4 bg-admin-surface-2 border border-admin-neutral/50 rounded-2xl text-[15px] font-light text-admin-text focus:outline-none focus:border-admin-accent-dark transition-colors placeholder:text-admin-text-muted/50"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em]">
                  Servicio
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-5 py-4 bg-admin-surface-2 border border-admin-neutral/50 rounded-2xl text-[15px] font-light text-admin-text focus:outline-none focus:border-admin-accent-dark transition-colors appearance-none"
                  required
                >
                  <option value="" disabled>Selecciona un servicio</option>
                  {services?.map((svc: any) => (
                    <option key={svc.id} value={svc.id}>{svc.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em]">
                  Fecha
                </label>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full px-5 py-4 bg-admin-surface-2 border border-admin-neutral/50 rounded-2xl text-[15px] font-light text-admin-text focus:outline-none focus:border-admin-accent-dark transition-colors"
                  required
                />
              </div>
            </form>

            <div className="p-4 sm:p-7 border-t border-admin-neutral/40 bg-admin-surface shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="submit"
                form="create-invitation-form"
                disabled={isPending || !clientName || !serviceId || !serviceDate}
                className={clsx(
                  "w-full py-4 min-h-[48px] sm:min-h-[44px] rounded-[1.25rem] text-[14px] font-medium transition-all shadow-sm flex items-center justify-center gap-2",
                  isPending 
                    ? "bg-admin-neutral/50 text-admin-text-muted cursor-not-allowed" 
                    : "bg-admin-text text-admin-bg hover:bg-admin-accent-dark hover:shadow-[0_4px_16px_rgba(45,32,37,0.15)] active:scale-[0.98]"
                )}
              >
                {isPending ? 'Generando...' : 'Generar invitación'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
