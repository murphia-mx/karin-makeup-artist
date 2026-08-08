import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageCircleHeart, Sparkles } from 'lucide-react';
import { ReviewList } from './ReviewList';
import { ReviewStepper } from './ReviewStepper/ReviewStepper';
// import { EmptyState } from '../../../components/ui/States/EmptyState'; // Assuming we handle empty states here or ignore if they aren't needed, but user wants them.

interface ReviewsSectionProps {
  testimonials?: any;
}

export const ReviewsSection = ({ testimonials }: ReviewsSectionProps) => {
  const [isStepperOpen, setIsStepperOpen] = useState(false);

  // Fallbacks & Unique combination logic
  const featured = testimonials?.featuredReviews || [];
  const reviews = testimonials?.allReviews || [];
  const allUniqueReviews = [...featured, ...reviews.filter((r: any) => !featured.some((f: any) => f.id === r.id))].slice(0, 6);
  const featuredIds = featured.map((f: any) => f.id);

  return (
    <section id="testimonios" className="w-full py-28 md:py-36 overflow-hidden relative" style={{ backgroundColor: "rgb(255, 254, 253)" }}>
      <div className="w-full max-w-[1300px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        
        {/* Header Editorial */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 md:mb-16 gap-8">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex-1"
          >
            <div className="flex items-center gap-4 mb-6">
              <div style={{ width: 24, height: 1.5, background: "rgba(210,110,135,0.8)" }} />
              <span className="font-sans font-semibold uppercase tracking-[0.25em]" style={{ fontSize: "10px", color: "rgb(210,110,135)" }}>
                {testimonials?.eyebrow || "Clientas Felices"}
              </span>
            </div>
            <h2 className="font-display font-light tracking-tight" style={{ fontSize: "clamp(2.8rem, 4.5vw, 4.5rem)", lineHeight: 1.05, color: "rgb(74, 36, 50)" }}>
              {testimonials?.title || "Historias"}{" "}
              <em className="italic" style={{ color: "rgb(210,110,135)" }}>
                {testimonials?.italicWord || "reales."}
              </em>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-shrink-0"
          >
            <button
              onClick={() => setIsStepperOpen(true)}
              className="group flex items-center justify-center h-[52px] px-8 rounded-full cursor-pointer outline-none relative overflow-hidden"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid rgba(217, 124, 152, 0.4)",
                color: "rgb(74,36,50)",
                transition: "all 280ms cubic-bezier(0.22, 0.61, 0.36, 1)",
                boxShadow: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#D97C98";
                e.currentTarget.style.borderColor = "#D97C98";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(217,124,152,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.borderColor = "rgba(217, 124, 152, 0.4)";
                e.currentTarget.style.color = "rgb(74,36,50)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Plus 
                className="w-[22px] h-[22px] transition-all duration-280 mr-[14px]"
                style={{ 
                  transitionTimingFunction: "cubic-bezier(0.22, 0.61, 0.36, 1)",
                  color: "currentColor" 
                }}
                strokeWidth={2} 
              />
              <span
                className="font-sans"
                style={{ fontSize: "16px", fontWeight: 600, letterSpacing: "normal" }}
              >
                Dejar una reseña
              </span>
              <style>{`
                .group:hover svg {
                  transform: rotate(90deg);
                }
              `}</style>
            </button>
          </motion.div>
        </div>

        {/* Lista de Reseñas */}
        {allUniqueReviews.length > 0 ? (
          <ReviewList reviews={allUniqueReviews} featuredIds={featuredIds} />
        ) : (
          <div className="w-full flex justify-center items-center pt-8 pb-16 md:pt-10 md:pb-24 relative">
            {/* Glow radial súper tenue detrás de la card */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="w-[500px] h-[500px] bg-[#D97C98] opacity-[0.035] blur-[80px] rounded-full" />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 16, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-[540px] bg-gradient-to-b from-[#FFFFFF] to-[#FFFDFE] border border-[rgba(242,232,235,0.8)] rounded-[32px] p-12 md:p-14 flex flex-col items-center text-center shadow-[0_20px_60px_rgba(217,124,152,0.04)]"
            >
              <div className="w-[48px] h-[48px] rounded-full bg-[#FFF5F7] flex items-center justify-center mb-6 relative">
                <MessageCircleHeart className="w-[24px] h-[24px] text-[#D97C98] relative z-10" strokeWidth={1.5} />
                <div className="absolute inset-0 bg-[#D97C98] opacity-10 blur-[10px] rounded-full" />
              </div>

              <h3 className="font-sans text-[20px] md:text-[22px] font-semibold text-[#1D1D1F] tracking-tight mb-3">
                Las primeras historias empiezan aquí
              </h3>
              
              <p className="font-sans text-[15px] text-[#8E8E93] leading-relaxed max-w-[320px]">
                Tu experiencia puede ayudar a futuras clientas a elegir con confianza.
              </p>
            </motion.div>
          </div>
        )}

      </div>

      <AnimatePresence>
        {isStepperOpen && (
          <ReviewStepper isOpen={isStepperOpen} onClose={() => setIsStepperOpen(false)} />
        )}
      </AnimatePresence>
    </section>
  );
};
