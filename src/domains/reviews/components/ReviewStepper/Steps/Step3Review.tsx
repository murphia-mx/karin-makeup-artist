import { useFormContext, useWatch } from 'react-hook-form';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { reviewsConfig } from '../../../../../config/reviews.config';
import type { ReviewFormData } from '../../../schemas/review.schema';

interface Step3ReviewProps {
  onNext: () => void;
}

export const Step3Review = ({ onNext }: Step3ReviewProps) => {
  const { register, control, formState: { errors } } = useFormContext<ReviewFormData>();
  
  // useWatch is more reliable for isolated component re-renders in deeply nested form contexts
  const reviewText = useWatch({ control, name: 'review' }) || '';
  
  const minLength = reviewsConfig.validation.minReviewLength || 20;
  const maxLength = 250;
  const currentLength = reviewText.length;
  const progress = Math.min((currentLength / minLength) * 100, 100);
  
  const isReady = currentLength >= minLength && currentLength <= maxLength;

  return (
    <div className="flex flex-col h-full relative">
      <div className="mb-10 text-center mt-2">
        <h2 className="font-sans font-semibold tracking-tight text-[22px] text-[#1D1D1F] mb-2">
          Cuéntanos más
        </h2>
        <p className="font-sans text-[15px] text-[#8E8E93] max-w-[280px] mx-auto">
          ¿Qué fue lo que más te gustó del servicio?
        </p>
      </div>

      <div className="flex-1 flex flex-col relative group mt-2">
        <textarea
          {...register('review', { 
            required: "La reseña es requerida.",
            minLength: { value: minLength, message: `Mínimo ${minLength} caracteres.` },
            maxLength: { value: maxLength, message: `Máximo ${maxLength} caracteres.` }
          })}
          maxLength={maxLength}
          placeholder="Me encantó el resultado, el servicio fue muy profesional..."
          className={clsx(
            "flex-1 w-full p-8 rounded-[24px] resize-none focus:outline-none focus:bg-white focus:shadow-[0_12px_40px_rgba(0,0,0,0.06)] focus:ring-1 focus:ring-[#D1BCC4] transition-all duration-300 font-sans text-[16px] leading-relaxed text-[#1D1D1F] bg-[#FAFAFB] placeholder-[#A1A1AA] border border-transparent hover:border-[#E5E5EA]",
            errors.review ? "ring-1 ring-red-300" : ""
          )}
        />
        
        {/* Progress indicator for min length */}
        <div className="absolute bottom-6 right-8 flex items-center gap-4 pointer-events-none">
          <span className={clsx(
            "font-sans text-[12px] font-medium transition-colors duration-300",
            currentLength >= maxLength ? "text-red-400" : "text-[#8E8E93]"
          )}>
            {currentLength} / {maxLength}
          </span>
          <div className="w-16 h-[2px] bg-[#E5E5EA] rounded-full overflow-hidden">
            <motion.div
              className={clsx(
                "h-full transition-colors duration-300",
                currentLength >= maxLength ? "bg-red-400" : "bg-[rgb(74,36,50)]"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {errors.review && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 font-sans text-[12px] font-medium tracking-tight mt-6 text-center">
          {errors.review.message}
        </motion.p>
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={!isReady}
        className={clsx(
          "group mt-8 inline-flex items-center justify-center gap-3 h-[52px] w-full rounded-full font-sans text-[15px] font-medium transition-all duration-300 active:scale-98",
          isReady 
            ? "bg-[rgb(74,36,50)] text-white hover:bg-[rgb(54,26,40)] shadow-[0_8px_24px_rgba(74,36,50,0.15)] hover:-translate-y-0.5 cursor-pointer" 
            : "bg-[#F5F5F7] text-[#A1A1AA] pointer-events-none"
        )}
      >
        Siguiente paso
      </button>
    </div>
  );
};
