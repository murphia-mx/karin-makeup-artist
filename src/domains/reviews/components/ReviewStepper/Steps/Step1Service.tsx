import { useFormContext } from 'react-hook-form';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import type { ReviewFormData } from '../../../schemas/review.schema';
import { ServiceService } from '../../../../services/services/ServiceService';

const serviceService = new ServiceService();

interface Step1ServiceProps {
  onNext: () => void;
}

import { memo } from 'react';

export const Step1Service = memo(({ onNext }: Step1ServiceProps) => {
  const { setValue, watch, formState: { errors } } = useFormContext<ReviewFormData>();
  const selectedServiceId = watch('service_id');

  const { data: services, isLoading, error } = useQuery({
    queryKey: ['activeServices'],
    queryFn: () => serviceService.getActiveServices(),
  });

  const handleSelect = (serviceId: string) => {
    setValue('service_id', serviceId, { shouldValidate: true });
    // Small delay to allow the user to see the selection before moving to the next step
    setTimeout(() => {
      onNext();
    }, 400);
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="mb-10 text-center mt-2">
        <h2 className="font-sans font-semibold tracking-tight text-[22px] text-[#1D1D1F] mb-2">
          ¿Qué experiencia viviste?
        </h2>
        <p className="font-sans text-[15px] text-[#8E8E93] max-w-[280px] mx-auto">
          Ayúdanos a identificar el servicio para personalizar tu reseña.
        </p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#8E8E93] animate-spin" />
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-400 font-sans text-sm">
          No se pudieron cargar los servicios. Por favor intenta más tarde.
        </div>
      ) : services && services.length > 0 ? (
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-premium pb-4">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => handleSelect(service.id)}
              className={clsx(
                'w-full text-left px-6 py-5 rounded-[24px] border transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] relative focus:outline-none flex items-center justify-between group/service',
                selectedServiceId === service.id
                  ? 'border-[rgb(74,36,50)] bg-[rgba(198,130,145,0.03)] shadow-[0_4px_24px_rgba(198,130,145,0.08)]'
                  : 'border-transparent bg-white hover:bg-[#FAFAFB] hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]'
              )}
            >
              <div className="flex flex-col pr-4">
                <span className={clsx(
                  "font-sans text-[15px] font-medium tracking-tight transition-colors duration-300",
                  selectedServiceId === service.id ? "text-[rgb(74,36,50)]" : "text-[#1D1D1F]"
                )}>
                  {service.name}
                </span>
                {/* Fallback to a delicate subtitle if no description exists in DB for aesthetics */}
                <span className="font-sans text-[13px] text-[#8E8E93] mt-1 leading-snug">
                  {(service as any).description || 'Selecciona para valorar esta experiencia.'}
                </span>
              </div>
              <div className={clsx(
                "w-[22px] h-[22px] rounded-full flex shrink-0 items-center justify-center transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
                selectedServiceId === service.id 
                  ? "bg-[rgb(74,36,50)] shadow-[0_2px_8px_rgba(74,36,50,0.3)] scale-100" 
                  : "border-[1.5px] border-[#E5E5EA] group-hover/service:border-[#D1BCC4] bg-white scale-100"
              )}>
                <AnimatePresence>
                  {selectedServiceId === service.id && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center justify-center w-full h-full"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
           <div className="text-center">
             <div className="w-12 h-12 rounded-full bg-[#F5F5F7] mx-auto flex items-center justify-center mb-4 text-[#8E8E93]">
               <span className="text-xl">!</span>
             </div>
             <p className="font-sans font-medium text-[13px] text-[#3A2A31] mb-1">Sin servicios</p>
             <p className="text-[13px] font-sans text-[#8E8E93]">No hay servicios configurados actualmente.</p>
           </div>
        </div>
      )}
      
      {errors.service_id && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 font-sans text-[11px] font-medium tracking-wide uppercase mt-4 text-center shrink-0">
          {errors.service_id.message}
        </motion.p>
      )}
    </div>
  );
});
