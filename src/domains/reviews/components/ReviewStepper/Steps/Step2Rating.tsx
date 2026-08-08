import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomRating } from '../CustomRating';
import type { ReviewFormData } from '../../../schemas/review.schema';

interface Step2RatingProps {
  onNext: () => void;
}

const RATING_MESSAGES: Record<number, string> = {
  1: 'Muy mala',
  2: 'Regular',
  3: 'Buena',
  4: 'Excelente',
  5: 'Increíble',
};

export const Step2Rating = ({ onNext }: Step2RatingProps) => {
  const { setValue, watch, formState: { errors } } = useFormContext<ReviewFormData>();
  const rating = watch('rating');
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating || rating;

  const handleRatingChange = (val: number) => {
    setValue('rating', val, { shouldValidate: true });
    setTimeout(() => {
      onNext();
    }, 500);
  };

  return (
    <div className="flex flex-col h-full items-center justify-center text-center mt-2 relative">
      <div className="mb-12 text-center mt-2">
        <h2 className="font-sans font-semibold tracking-tight text-[22px] text-[#1D1D1F] mb-2">
          ¿Cómo calificarías tu experiencia?
        </h2>
        <p className="font-sans text-[15px] text-[#8E8E93] max-w-[280px] mx-auto">
          Tu opinión nos ayuda a seguir mejorando.
        </p>
      </div>

      <div className="mb-8 p-6 flex justify-center items-center">
        <CustomRating 
          value={rating} 
          onChange={handleRatingChange} 
          onHoverChange={setHoverRating}
          size="lg" 
        />
      </div>

      <div className="h-10 relative flex justify-center items-center w-full">
        <AnimatePresence mode="wait">
          {displayRating > 0 ? (
            <motion.div
              key={displayRating}
              initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -5, filter: 'blur(4px)' }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute font-sans text-[16px] font-medium tracking-tight text-[rgb(74,36,50)] bg-[rgba(198,130,145,0.06)] px-4 py-1.5 rounded-full"
            >
              {displayRating} — {RATING_MESSAGES[displayRating]}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute font-sans text-[14px] text-[#8E8E93]"
            >
              Selecciona una valoración
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {errors.rating && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 font-sans text-[12px] font-medium tracking-tight mt-6 text-center">
          {errors.rating.message}
        </motion.p>
      )}
    </div>
  );
};
