import { motion, AnimatePresence } from 'framer-motion';
import { useAnalyticsKPIs } from '../../hooks/useAnalytics';
import { Star, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { REVIEW_STATUS } from '../../../../domains/reviews/types/Review';
import { useNavigate } from 'react-router-dom';
import { AnimatedCounter } from '../../../../components/ui/AnimatedCounter';
import { clsx } from 'clsx';

const KpiSkeleton = () => (
  <div className="flex flex-col gap-3 p-5 rounded-2xl border border-admin-border bg-admin-surface">
    <div className="w-8 h-8 rounded-full bg-admin-surface-2 animate-pulse mb-2" />
    <div className="w-16 h-8 rounded bg-admin-surface-2 animate-pulse" />
    <div className="w-24 h-4 rounded bg-admin-surface-2 animate-pulse" />
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
      subtitle: `${kpis.reviews.approved} opiniones validadas`,
      icon: <Star className="w-4 h-4" strokeWidth={2} />,
      iconBg: 'bg-[#FAF3D9] text-[#B38600]',
      cardStyle: 'bg-gradient-to-b from-[#FFFCF0] to-white border-[#F0E5BC]',
      onClick: () => handleNavigateToModeration(REVIEW_STATUS.APPROVED),
    },
    {
      title: 'Clientas Reales',
      value: kpis.reviews.verified,
      decimals: 0,
      subtitle: 'Servicios verificados',
      icon: <ShieldCheck className="w-4 h-4" strokeWidth={2} />,
      iconBg: 'bg-admin-accent-soft/40 text-admin-accent',
      cardStyle: 'bg-gradient-to-b from-admin-surface-2 to-white border-admin-accent-soft',
    },
    {
      title: 'Por Moderar',
      value: kpis.reviews.pending,
      decimals: 0,
      subtitle: kpis.reviews.pending === 0 ? 'Al día' : 'Requieren tu atención',
      icon: <Heart className="w-4 h-4" strokeWidth={2} />,
      iconBg: 'bg-admin-accent-dark/10 text-admin-accent-dark',
      cardStyle: 'bg-gradient-to-b from-admin-accent-soft/20 to-white border-admin-accent-dark/20',
      onClick: () => handleNavigateToModeration(REVIEW_STATUS.PENDING),
    },
    {
      title: 'Top Servicio',
      value: kpis.services.topRated || 'N/A',
      decimals: 0,
      subtitle: 'Mejor calificado',
      icon: <Sparkles className="w-4 h-4" strokeWidth={2} />,
      iconBg: 'bg-[#F2E5F5] text-[#915B9E]',
      cardStyle: 'bg-gradient-to-b from-[#FDF8FF] to-white border-[#E6D4EB]',
      isString: true
    }
  ] : [];

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full">
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full">
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={metric.onClick}
                className={clsx(
                  "flex flex-col p-5 rounded-3xl border shadow-[0_4px_16px_rgba(45,32,37,0.03)] transition-all duration-300",
                  metric.cardStyle,
                  metric.onClick ? "cursor-pointer hover:shadow-[0_8px_24px_rgba(45,32,37,0.06)] hover:-translate-y-0.5 active:scale-[0.98]" : ""
                )}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className={clsx("w-9 h-9 flex items-center justify-center rounded-xl", metric.iconBg)}>
                    {metric.icon}
                  </div>
                  <span className="text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em]">{metric.title}</span>
                </div>
                
                <div className="flex items-baseline gap-2 mb-1 mt-auto">
                  <span className="text-[32px] md:text-[42px] font-bold text-admin-text tracking-tighter leading-none">
                    {metric.isString ? (
                      <span className="text-[24px] md:text-[22px] tracking-tight truncate max-w-[200px] md:max-w-[140px] block">{metric.value}</span>
                    ) : (
                      <AnimatedCounter value={metric.value as number} decimals={metric.decimals} />
                    )}
                  </span>
                </div>

                <p className="text-[13px] text-admin-text-muted font-light mt-1">{metric.subtitle}</p>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
