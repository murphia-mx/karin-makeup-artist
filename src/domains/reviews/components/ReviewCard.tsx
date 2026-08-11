import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, MoreHorizontal } from 'lucide-react';
import type { Review } from '../types/Review';
import { clsx } from 'clsx';

interface ReviewCardProps {
  review: Review;
  index: number;
  isFeatured?: boolean;
}

// Fallback date formatter
function formatDate(dateStr?: string) {
  if (!dateStr) return "Hace poco";
  try {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Hace poco";
  }
}

export const ReviewCard = ({ review, index, isFeatured }: ReviewCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      setIsOverflowing(textRef.current.scrollHeight > textRef.current.clientHeight);
    }
  }, [review.review_text]);

  const animationProps: any = isFeatured
    ? {
        initial: { opacity: 0, y: 15, scale: 0.98 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.6, delay: (index % 3) * 0.1, ease: "easeOut" }
      }
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: (index % 3) * 0.1, ease: "easeOut" }
      };

  return (
    <motion.article
      {...animationProps}
      viewport={{ once: true, margin: "-50px" }}
      whileTap={{ scale: 0.985 }}
      className={clsx(
        "group relative flex flex-col p-6 sm:p-8 rounded-[24px] transition-all h-full",
        isFeatured 
          ? "bg-gradient-to-b from-[#FFFFFF] via-[#FFF9FB] to-[#FFFFFF] shadow-[0_0_20px_rgba(217,124,152,0.06)] hover:shadow-[0_0_35px_rgba(217,124,152,0.12)] hover:-translate-y-[8px]" 
          : "bg-white border border-[rgba(242,232,235,0.8)] shadow-[0_2px_15px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_40px_rgba(217,124,152,0.06)] hover:-translate-y-[6px]"
      )}
      style={{ transitionDuration: "350ms" }}
    >
      {/* Featured Gradient Border */}
      {isFeatured && (
        <div className="absolute inset-0 rounded-[24px] pointer-events-none z-0" style={{
            padding: '1.5px',
            background: 'linear-gradient(135deg, #E6C8B5, #D97C98, #E6C8B5)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude'
        }} />
      )}

      {/* Floating Badge Halo */}
      {isFeatured && (
        <div className="absolute -top-3 right-10 w-32 h-20 bg-[#D97C98] opacity-15 blur-[20px] pointer-events-none z-0" />
      )}

      {/* Background decorations container (clipped) */}
      <div className="absolute inset-0 overflow-hidden rounded-[24px] pointer-events-none z-0">
        <span className="absolute -top-3 -left-3 text-[70px] font-serif text-[#D97C98] opacity-[0.03] leading-none select-none">
          ❝
        </span>
        {isFeatured && (
          <span className="absolute bottom-6 right-3 text-[32px] font-display font-light text-[#D97C98] opacity-[0.06] select-none tracking-tight leading-none rotate-[-4deg]">
            Karin's Choice
          </span>
        )}
      </div>

      {/* Floating Badge */}
      {isFeatured && (
        <div className="absolute -top-[14px] right-6 bg-gradient-to-r from-[#D97C98] to-[#C66A86] px-4 py-[5px] rounded-full shadow-[0_4px_12px_rgba(217,124,152,0.25)] group-hover:shadow-[0_6px_16px_rgba(217,124,152,0.35)] transition-shadow duration-300 z-30 overflow-hidden flex items-center gap-1.5 border border-white/20">
          <span className="text-[11px] font-bold text-white tracking-[0.05em] uppercase mt-[1px] leading-none">
            ❤️ Favorita de Karin
          </span>
          {/* Sheen Effect */}
          <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/70 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
        </div>
      )}

      {/* 1. Header: Avatar & Info */}
      <div className="flex items-start justify-between mb-5 relative z-10 pt-1">
        <div className="flex gap-4 items-center">
          <div className="w-[46px] h-[46px] shrink-0 rounded-full flex items-center justify-center font-sans text-[17px] font-medium text-[#3A222E] bg-[#FFFBF9] border border-[#F2E8EB]">
            {review.client_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h3 className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight truncate font-sans">
              {review.client_name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {review.verified && (
                <div className="flex items-center gap-0.5 text-[#8E8E93] text-[11px] font-medium">
                  <Check className="w-[11px] h-[11px] text-[#D97C98]" strokeWidth={3} />
                  <span className="mt-[1px] font-sans">Verificada</span>
                </div>
              )}
              <span className="w-[3px] h-[3px] rounded-full bg-[#E5E5EA]"></span>
              <span className="text-[11px] text-[#8E8E93] font-sans mt-[1px]">
                {formatDate(review.created_at)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Right Corner Menu */}
        {!isFeatured && (
          <button 
            type="button"
            aria-label="Opciones de reseña"
            className="flex items-center justify-center w-[44px] h-[44px] min-w-[44px] min-h-[44px] rounded-full bg-transparent hover:bg-[#FFF5F7] active:bg-[#FCECF0] text-[#C7C7CC] hover:text-[#D97C98] active:text-[#C66A86] transition-colors duration-200 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#D97C98]/40 focus-visible:ring-offset-1 -mt-1.5 -mr-2"
            style={{ writingMode: 'horizontal-tb' }}
          >
            <MoreHorizontal 
              className="w-5 h-5 shrink-0" 
              strokeWidth={1.5} 
              style={{ transform: 'none', rotate: 'none', display: 'block', minWidth: '20px', minHeight: '20px' }} 
            />
          </button>
        )}
      </div>

      {/* 2. Servicio & Estrellas */}
      <div className="flex flex-col gap-3 mb-5 relative z-10">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-[2px]">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} viewBox="0 0 24 24" className={clsx("w-[17px] h-[17px]", review.rating >= star ? "text-[#E5C158]" : "text-[#E5E5EA]")}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
              </svg>
            ))}
          </div>
          <span className="text-[13px] font-semibold text-[#1D1D1F] font-sans ml-1">
            5.0
          </span>
        </div>
        <div className="inline-flex items-center self-start bg-[#FFF5F7] px-2.5 py-1 rounded-md border border-[rgba(245,225,230,0.6)]">
          <span className="text-[11px] font-medium text-[#D97C98] font-sans tracking-wide">
            {review.services?.name || 'Maquillaje Social'}
          </span>
        </div>
      </div>

      {/* 3. El Comentario */}
      <div className="relative mb-2 flex-1 flex flex-col justify-start z-10">
        <p 
          ref={textRef}
          className={clsx(
            "text-[15.5px] text-[#1D1D1F] leading-[1.65] font-sans font-normal",
            !isExpanded && "line-clamp-4"
          )}
          style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
        >
          {review.review_text}
        </p>

        <AnimatePresence>
          {isOverflowing && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 py-2 inline-flex items-center self-start gap-1 text-[13px] font-medium text-[#D97C98] hover:text-[#AF6476] transition-colors font-sans"
            >
              {isExpanded ? 'Ver menos' : 'Leer más'}
              <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-180")} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Respuesta de Karin o Estado Pendiente */}
      <div className="mt-5 pt-5 border-t border-[rgba(242,232,235,0.7)] w-full relative z-10 shrink-0">
        <div className={clsx(
          "rounded-[14px] rounded-tl-none py-3.5 px-4 w-full border-l-[3px]",
          review.admin_reply ? "bg-[#FDF9FA] border-[#D97C98]" : "bg-[#FDFCFD] border-[rgba(234,216,221,0.6)]"
        )}>
          <div className="flex items-center gap-1.5 mb-2">
            <span className={clsx("text-[11px]", !review.admin_reply && "opacity-50 grayscale")}>❤️</span>
            <h4 className={clsx("text-[13px] font-semibold tracking-tight font-sans", review.admin_reply ? "text-[#1D1D1F]" : "text-[#8E8E93]")}>
              {review.admin_reply ? "Respuesta de Karin" : "Respuesta pendiente"}
            </h4>
          </div>
          {review.admin_reply ? (
            <>
              <p className="text-[14px] font-normal text-[#4A3B40] leading-[1.6] font-sans mb-3">
                {review.admin_reply}
              </p>
              <span className="text-[12px] text-[#D97C98] font-medium font-sans">Con cariño,<br/>Karin Makeup Artist</span>
            </>
          ) : (
            <p className="text-[13.5px] font-normal text-[#8E8E93] leading-[1.6] font-sans">
              Estamos revisando esta experiencia para responder personalmente muy pronto.
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
};
