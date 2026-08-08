import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { popVariant, fadeUpVariant, premiumTransition } from '../../../../../lib/framer/variants';

interface Step6SuccessProps {
  onClose: () => void;
}

export const Step6Success = ({ onClose }: Step6SuccessProps) => {
  return (
    <div className="flex flex-col h-full items-center justify-center text-center p-6 py-12">
      <motion.div
        variants={popVariant}
        initial="hidden"
        animate="visible"
        className="w-20 h-20 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-8"
      >
        <Heart className="w-8 h-8 text-[#1D1D1F] fill-[#1D1D1F]" />
      </motion.div>
      
      <motion.h2 
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1, ...premiumTransition }}
        className="font-sans font-semibold tracking-tight text-[22px] text-[#1D1D1F] mb-3"
      >
        ¡Gracias por compartir!
      </motion.h2>
      
      <motion.p 
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2, ...premiumTransition }}
        className="font-sans text-[15px] text-[#8E8E93] max-w-[280px] mx-auto mb-10 leading-relaxed"
      >
        Tu historia nos inspira a seguir creando resultados inolvidables. 
        Ha sido un placer atenderte.
      </motion.p>

      <motion.div
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3, ...premiumTransition }}
        className="w-full max-w-[200px]"
      >
        <button
          onClick={onClose}
          className="group inline-flex items-center justify-center h-[52px] w-full rounded-full border border-[#E5E5EA] bg-white text-[#1D1D1F] font-sans text-[15px] font-medium transition-all duration-300 hover:bg-[#FAFAFB] active:scale-98"
        >
          Finalizar
        </button>
      </motion.div>
    </div>
  );
};
