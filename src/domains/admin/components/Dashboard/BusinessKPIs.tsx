import { motion, AnimatePresence } from 'framer-motion';
import { useAnalyticsKPIs } from '../../hooks/useAnalytics';
import { Star, ShieldCheck, Heart } from 'lucide-react';
import { REVIEW_STATUS } from '../../../../domains/reviews/types/Review';
import { useNavigate } from 'react-router-dom';
import { AnimatedCounter } from '../../../../components/ui/AnimatedCounter';
import { clsx } from 'clsx';

const KpiSkeleton = () => (
  <div className="flex flex-col gap-2">
    <div className="w-8 h-8 rounded-full bg-[#EBDDE2]/30 animate-pulse mb-2" />
    <div className="w-16 h-10 rounded-lg bg-[#EBDDE2]/30 animate-pulse" />
    <div className="w-24 h-4 rounded-md bg-[#EBDDE2]/30 animate-pulse" />
  </div>
);

export const BusinessKPIs = () => {
  const { data: kpis, isLoading } = useAnalyticsKPIs();
  const navigate = useNavigate();

  const handleNavigateToModeration = (filter?: string) => {
    navigate('/admin/moderation', { state: { filter } });
  };

  const metrics = kpis ? [
    {
      title: 'Satisfacción',
      value: kpis.rating.average,
      decimals: 1,
      subtitle: `Promedio de ${kpis.reviews.approved} opiniones`,
      icon: <Star className="w-4 h-4" />,
      color: 'text-[#D9A05B]',
      onClick: () => handleNavigateToModeration(REVIEW_STATUS.APPROVED),
      isPrimary: true
    },
    {
      title: 'Por Moderar',
      value: kpis.reviews.pending,
      decimals: 0,
      subtitle: kpis.reviews.pending === 0 ? 'Al día' : `${kpis.reviews.pending} esperando`,
      icon: <Heart className="w-4 h-4" />,
      color: 'text-[#CF7F9B]',
      onClick: () => handleNavigateToModeration(REVIEW_STATUS.PENDING),
      isPrimary: false
    },
    {
      title: 'Clientas Reales',
      value: kpis.reviews.verified,
      decimals: 0,
      subtitle: 'Servicios validados',
      icon: <ShieldCheck className="w-4 h-4" />,
      color: 'text-[#765E68]',
      onClick: () => {},
      isPrimary: false
    }
  ] : [];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-end gap-12 md:gap-16">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="flex gap-12 w-full">
            <KpiSkeleton />
            <KpiSkeleton />
          </div>
        ) : (
          <>
            {/* Primary Metric */}
            {metrics.filter(m => m.isPrimary).map((metric, i) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
                onClick={metric.onClick}
                className="flex flex-col group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={clsx("w-6 h-6 flex items-center justify-center rounded-full bg-[#FAF7F7] border border-[#EBDDE2]/50", metric.color)}>
                    {metric.icon}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-[#765E68] font-medium">{metric.title}</span>
                </div>
                
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-7xl md:text-8xl font-display font-light text-[#301C27] tracking-tighter leading-none">
                    <AnimatedCounter value={metric.value} decimals={metric.decimals} />
                  </span>
                </div>

                <p className="text-sm text-[#765E68]/80 font-light mt-2 tracking-wide">{metric.subtitle}</p>
              </motion.div>
            ))}

            {/* Divider */}
            <div className="hidden md:block w-[1px] self-stretch bg-gradient-to-b from-transparent via-[#EBDDE2] to-transparent mx-4" />

            {/* Secondary Metrics */}
            <div className="flex flex-col md:flex-row gap-10 md:gap-16 md:pb-2">
              {metrics.filter(m => !m.isPrimary).map((metric, i) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i + 1) * 0.1, duration: 0.4, ease: "easeOut" }}
                  onClick={metric.onClick}
                  className="flex flex-col group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={clsx("transition-transform duration-300 group-hover:scale-110", metric.color)}>
                      {metric.icon}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-[#765E68] font-medium">{metric.title}</span>
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-display font-light text-[#301C27] tracking-tight">
                      <AnimatedCounter value={metric.value} decimals={metric.decimals} />
                    </span>
                  </div>

                  <p className="text-xs text-[#765E68]/60 font-light mt-1 tracking-wide">{metric.subtitle}</p>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
