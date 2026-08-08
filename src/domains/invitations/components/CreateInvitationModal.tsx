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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#301C27]/20 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-[#EBDDE2]/50">
              <h2 className="text-xl font-display font-medium text-[#301C27]">Nueva invitación</h2>
              <button 
                onClick={onClose}
                className="p-2 text-[#765E68] hover:text-[#301C27] hover:bg-[#FAF7F7] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {error && (
                <div className="p-4 bg-[#FDFBFB] border border-[#CF7F9B]/30 rounded-xl">
                  <p className="text-sm text-[#301C27] font-medium mb-1">No pudimos crear la invitación. Intenta nuevamente.</p>
                  <p className="text-xs text-[#765E68] font-light">{error.message}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="block text-[13px] font-semibold text-[#765E68] uppercase tracking-widest">
                  Nombre de la clienta
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej. María López"
                  className="w-full px-4 py-3 bg-[#FAF7F7] border border-[#EBDDE2]/50 rounded-xl text-sm font-light text-[#301C27] focus:outline-none focus:border-[#CF7F9B] transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-semibold text-[#765E68] uppercase tracking-widest">
                  Servicio
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF7F7] border border-[#EBDDE2]/50 rounded-xl text-sm font-light text-[#301C27] focus:outline-none focus:border-[#CF7F9B] transition-colors appearance-none"
                  required
                >
                  <option value="" disabled>Selecciona un servicio</option>
                  {services?.map((svc) => (
                    <option key={svc.id} value={svc.id}>{svc.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-semibold text-[#765E68] uppercase tracking-widest">
                  Fecha
                </label>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF7F7] border border-[#EBDDE2]/50 rounded-xl text-sm font-light text-[#301C27] focus:outline-none focus:border-[#CF7F9B] transition-colors"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isPending || !clientName || !serviceId || !serviceDate}
                  className={clsx(
                    "w-full py-3.5 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2",
                    isPending 
                      ? "bg-[#EBDDE2] text-[#765E68]" 
                      : "bg-[#301C27] text-white hover:bg-[#CF7F9B]"
                  )}
                >
                  {isPending ? 'Generando...' : 'Generar invitación'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
