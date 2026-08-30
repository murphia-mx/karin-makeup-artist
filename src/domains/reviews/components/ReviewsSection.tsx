import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageCircleHeart, ChevronLeft, ChevronRight } from "lucide-react";
import { ReviewList } from "./ReviewList";
import { ReviewStepper } from "./ReviewStepper/ReviewStepper";

interface ReviewsSectionProps {
  testimonials?: any;
}

const REVIEWS_PER_PAGE = 6;

function getPageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages];
  } else if (currentPage >= totalPages - 2) {
    return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  } else {
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }
}

export const ReviewsSection = ({ testimonials }: ReviewsSectionProps) => {
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

  const featured = testimonials?.featuredReviews || [];
  const reviews = testimonials?.allReviews || [];
  
  const allUniqueReviews = useMemo(() => {
    // 1. Los destacados primero, manteniendo su orden actual.
    const featuredItems = [...featured];
    
    // 2. Filtrar los normales (que no estén en los destacados)
    const normalItems = reviews.filter((r: any) => !featuredItems.some((f: any) => f.id === r.id));
    
    // 3. Ordenar los normales por fecha DESC (más reciente primero)
    normalItems.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
    
    // 4. Unir ambos arrays
    return [
      ...featuredItems,
      ...normalItems,
    ];
  }, [featured, reviews]);
  
  const featuredIds = useMemo(() => featured.map((f: any) => f.id), [featured]);

  const totalPages = Math.ceil(allUniqueReviews.length / REVIEWS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const currentReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
    return allUniqueReviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);
  }, [allUniqueReviews, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (sectionRef.current) {
      const yOffset = -80; // Ajuste para header fijo si existe
      const y = sectionRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <section
      id="testimonios"
      ref={sectionRef}
      className="w-full py-28 md:py-36 overflow-hidden relative"
      style={{ backgroundColor: "rgb(255, 254, 253)" }}
    >
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
              <div
                style={{
                  width: 24,
                  height: 1.5,
                  background: "rgba(210,110,135,0.8)",
                }}
              />
              <span
                className="font-sans font-semibold uppercase tracking-[0.25em]"
                style={{ fontSize: "10px", color: "rgb(210,110,135)" }}
              >
                {testimonials?.eyebrow || "Clientas Felices"}
              </span>
            </div>
            <h2
              className="font-display font-light tracking-tight"
              style={{
                fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
                lineHeight: 1.05,
                color: "rgb(74, 36, 50)",
              }}
            >
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
            <motion.button
              onClick={() => setIsStepperOpen(true)}
              className="group flex items-center justify-center h-[52px] px-8 rounded-full cursor-pointer outline-none relative overflow-hidden"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid rgba(217, 124, 152, 0.4)",
                color: "rgb(74,36,50)",
                boxShadow: "none",
              }}
              whileHover={{
                backgroundColor: "#D97C98",
                borderColor: "#D97C98",
                color: "#ffffff",
                boxShadow: "0 8px 24px rgba(217,124,152,0.25)",
                transition: { duration: 0.28, ease: [0.22, 0.61, 0.36, 1] },
              }}
              whileTap={{ scale: 0.96 }}
            >
              <Plus
                className="w-[22px] h-[22px] transition-all duration-280 mr-[14px]"
                style={{
                  transitionTimingFunction: "cubic-bezier(0.22, 0.61, 0.36, 1)",
                  color: "currentColor",
                }}
                strokeWidth={2}
              />
              <span
                className="font-sans"
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  letterSpacing: "normal",
                }}
              >
                Dejar una reseña
              </span>
              <style>{`
  .reviews-section .group:hover svg {
    transform: rotate(90deg);
  }
`}</style>
            </motion.button>
          </motion.div>
        </div>

        {/* Lista de Reseñas */}
        {allUniqueReviews.length > 0 ? (
          <ReviewList reviews={currentReviews} featuredIds={featuredIds} />
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
                <MessageCircleHeart
                  className="w-[24px] h-[24px] text-[#D97C98] relative z-10"
                  strokeWidth={1.5}
                />
                <div className="absolute inset-0 bg-[#D97C98] opacity-10 blur-[10px] rounded-full" />
              </div>

              <h3 className="font-sans text-[20px] md:text-[22px] font-semibold text-[#1D1D1F] tracking-tight mb-3">
                Las primeras historias empiezan aquí
              </h3>

              <p className="font-sans text-[15px] text-[#8E8E93] leading-relaxed max-w-[320px]">
                Tu experiencia puede ayudar a futuras clientas a elegir con
                confianza.
              </p>
            </motion.div>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 md:gap-2 mt-14 w-full">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Página anterior"
              className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full text-[rgb(74,36,50)] disabled:opacity-30 transition-colors hover:bg-[rgba(210,110,135,0.08)] disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(210,110,135)]"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {pages.map((p, i) => (
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="w-6 md:w-8 flex items-center justify-center text-[rgba(74,36,50,0.4)] font-sans">
                  &hellip;
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePageChange(p as number)}
                  aria-label={`Ir a página ${p}`}
                  aria-current={currentPage === p ? "page" : undefined}
                  className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full font-sans text-[13px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(210,110,135)]
                    ${currentPage === p 
                      ? "bg-[rgb(210,110,135)] text-white font-medium shadow-[0_4px_12px_rgba(210,110,135,0.25)]" 
                      : "text-[rgb(74,36,50)] hover:bg-[rgba(210,110,135,0.08)]"
                    }`}
                >
                  {p}
                </button>
              )
            ))}

            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Página siguiente"
              className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full text-[rgb(74,36,50)] disabled:opacity-30 transition-colors hover:bg-[rgba(210,110,135,0.08)] disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(210,110,135)]"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isStepperOpen && (
          <ReviewStepper
            isOpen={isStepperOpen}
            onClose={() => setIsStepperOpen(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};
