import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';
import { usePublicSubmitReview } from '../hooks/usePublicSubmitReview';

interface PublicReviewFormProps {
  invitationId: string;
  clientName: string;
  serviceId: string;
  onSuccess: () => void;
}

export const PublicReviewForm = ({ invitationId, clientName, serviceId, onSuccess }: PublicReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  
  const submitMutation = usePublicSubmitReview();

  const handleSubmit = async () => {
    if (rating === 0) return;
    if (reviewText.trim().length < 5) return; // Minimal validation

    await submitMutation.mutateAsync(
      {
        invitation_id: invitationId,
        client_name: clientName,
        service_id: serviceId,
        rating,
        review_text: reviewText.trim(),
      },
      {
        onSuccess: () => {
          onSuccess();
        }
      }
    );
  };

  const isSubmitDisabled = rating === 0 || reviewText.trim().length < 5 || submitMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <h1 className="text-[28px] font-display text-[#301C27] tracking-tight mb-2 text-center">
        Hola {clientName} <span className="text-[#D97C98]">♡</span>
      </h1>
      <p className="text-[15px] font-light text-[#765E68] text-center mb-10">
        ¿Cómo fue tu experiencia con Karin?
      </p>

      {/* Star Rating */}
      <div className="flex justify-center gap-2 mb-10">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1 transition-transform hover:scale-110 active:scale-95"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          >
            <Star
              className={clsx(
                "w-10 h-10 transition-colors duration-300",
                (hoverRating || rating) >= star
                  ? "fill-[#D97C98] text-[#D97C98]"
                  : "fill-transparent text-[#EBDDE2]"
              )}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {rating > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4">
              <label className="block text-[14px] font-medium text-[#301C27]">
                Cuéntanos un poquito más sobre tu experiencia.
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Me encantó el maquillaje, duró toda la noche..."
                className="w-full h-32 px-4 py-3 bg-[#FAF7F7] border border-[#EBDDE2] rounded-xl text-[#301C27] placeholder:text-[#A8929D] focus:outline-none focus:ring-2 focus:ring-[#D97C98]/20 focus:border-[#D97C98] transition-all resize-none font-light"
              />
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className="w-full py-3.5 bg-[#301C27] text-white rounded-xl font-medium tracking-wide hover:bg-[#4A2B3D] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {submitMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar mi reseña'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
