import { motion, AnimatePresence } from 'framer-motion';
import { useAnalyticsKPIs } from '../../hooks/useAnalytics';
import { Star, ShieldCheck, Heart, Info } from 'lucide-react';
import { REVIEW_STATUS } from '../../../../domains/reviews/types/Review';
import { useNavigate } from 'react-router-dom';
import { AnimatedCounter } from '../../../../components/ui/AnimatedCounter';

const KpiSkeleton = () => (
  <div className="bg-white rounded-[1.5rem] p-6 h-[142px] border border-[#EFE7E4] shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between">
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-xl bg-[#FDFBFB] border border-[#EFE7E4] animate-pulse" />
      <div className="w-20 h-3 rounded bg-brand-gray-light animate-pulse" />
    </div>
    <div>
      <div className="w-16 h-8 rounded bg-brand-gray-light animate-pulse mb-2" />
      <div className="w-32 h-3 rounded bg-brand-gray-light animate-pulse" />
    </div>
  </div>
);

export const BusinessKPIs = () => {
  const { data: kpis, isLoading } = useAnalyticsKPIs();
  const navigate = useNavigate();

  const handleNavigateToModeration = (filter?: string) => {
    navigate('/admin/moderation', { state: { filter } });
  };

  const cards = kpis ? [
    {
      title: 'Nuevas opiniones',
      value: kpis.reviews.pending,
      suffix: '',
      decimals: 0,
      subtitle: kpis.reviews.pending === 0 ? 'Todo está al día' : (kpis.reviews.pending === 1 ? 'Tienes 1 opinión esperando revisión' : `Tienes ${kpis.reviews.pending} opiniones esperando revisión`),
      icon: <Heart className="w-5 h-5" />,
      color: 'text-[#D99AA8]',
      bg: 'bg-[#FDFBFB]',
      border: 'border-[#D99AA8]/20',
      tooltip: 'Opiniones pendientes de moderación',
      onClick: () => handleNavigateToModeration(REVIEW_STATUS.PENDING)
    },
    {
      title: 'Satisfacción',
      value: kpis.rating.average,
      suffix: '',
      decimals: 1,
      subtitle: `De ${kpis.reviews.approved} reseñas aprobadas`,
      icon: <Star className="w-5 h-5" />,
      color: 'text-amber-500',
      bg: 'bg-amber-50/50',
      border: 'border-amber-100',
      tooltip: 'Calificación promedio del negocio',
      onClick: () => handleNavigateToModeration(REVIEW_STATUS.APPROVED)
    },
    {
      title: 'Clientas reales',
      value: kpis.reviews.verified,
      suffix: '',
      decimals: 0,
      subtitle: 'Visitas comprobadas',
      icon: <ShieldCheck className="w-5 h-5" />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-100',
      tooltip: 'Clientas que dejaron su reseña a través de una invitación válida de su cita.',
      onClick: () => {}
    }
  ] : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AnimatePresence mode="wait">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <motion.div
              key={`skeleton-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <KpiSkeleton />
            </motion.div>
          ))
        ) : (
          cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" }}
              onClick={card.onClick}
              className={`group bg-white rounded-[1.5rem] p-6 border shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between transition-all duration-300 cursor-pointer hover:shadow-[0_12px_60px_rgba(61,44,44,0.08)] hover:-translate-y-1 ${card.border}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl border ${card.bg} ${card.color} ${card.border} transition-colors group-hover:bg-white`}>
                  {card.icon}
                </div>
                
                <div className="flex items-center gap-1.5 relative">
                  <span className="text-[10px] font-medium text-[#7A6B67] uppercase tracking-wider">{card.title}</span>
                  <div className="group/tooltip relative">
                    <Info className="w-3 h-3 text-[#EFE7E4] cursor-help transition-colors group-hover:text-[#D99AA8]/50" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-white border border-[#EFE7E4] text-[#5A4A4A] text-xs font-light leading-relaxed rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 shadow-xl z-10 pointer-events-none">
                      {card.tooltip}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-light text-[#3D2C2C] mb-1">
                    <AnimatedCounter value={card.value} decimals={card.decimals} suffix={card.suffix} />
                  </div>
                  <div className="text-xs text-[#7A6B67] font-light">{card.subtitle}</div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
};
