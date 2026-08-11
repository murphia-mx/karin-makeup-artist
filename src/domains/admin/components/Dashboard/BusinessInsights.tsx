import { motion, AnimatePresence } from 'framer-motion';
import { useBusinessInsights } from '../../hooks/useAnalytics';
import { TrendingUp, TrendingDown, PieChart, Star, AlertCircle, Info, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

const InsightSkeleton = () => (
  <div className="bg-admin-surface rounded-3xl p-6 md:p-8 border border-admin-neutral/40 animate-pulse h-[140px] flex flex-col">
    <div className="flex items-center gap-4 mb-5">
      <div className="w-10 h-10 rounded-full bg-admin-surface-2" />
      <div className="w-24 h-3 rounded bg-admin-surface-2" />
    </div>
    <div className="space-y-3">
      <div className="w-full h-2 bg-admin-surface-2 rounded" />
      <div className="w-4/5 h-2 bg-admin-surface-2 rounded" />
    </div>
  </div>
);

export const BusinessInsights = () => {
  const { data: insights, isLoading } = useBusinessInsights();

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'trending-up': return <TrendingUp className="w-4 h-4" strokeWidth={1.5} />;
      case 'trending-down': return <TrendingDown className="w-4 h-4" strokeWidth={1.5} />;
      case 'pie-chart': return <PieChart className="w-4 h-4" strokeWidth={1.5} />;
      case 'star': return <Star className="w-4 h-4" strokeWidth={1.5} />;
      case 'alert-circle': return <AlertCircle className="w-4 h-4" strokeWidth={1.5} />;
      default: return <Info className="w-4 h-4" strokeWidth={1.5} />;
    }
  };

  const getInsightStyle = (importance: string, type: string) => {
    if (type === 'alert') {
      return 'bg-admin-accent-soft/30 text-admin-accent-dark border-transparent';
    }
    
    switch (importance) {
      case 'high': return 'bg-admin-surface-2 text-admin-text border-transparent';
      case 'medium': return 'bg-admin-surface-3/30 text-admin-warning border-transparent';
      case 'low': return 'bg-admin-neutral/30 text-admin-text-muted border-transparent';
      default: return 'bg-admin-surface-2 text-admin-text-muted border-transparent';
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <InsightSkeleton />
            <InsightSkeleton />
            <InsightSkeleton />
          </motion.div>
        ) : !insights || insights.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-12 text-center bg-admin-surface-2/30 rounded-3xl border border-admin-neutral/40 border-dashed">
            <Sparkles className="w-6 h-6 text-admin-accent-dark/40 mb-4" strokeWidth={1.5} />
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-admin-text-muted mb-2">Análisis Pendiente</h4>
            <p className="text-[13px] text-admin-text-muted font-light max-w-[250px] leading-relaxed">
              En cuanto tengas más citas y reseñas, aquí te daremos consejos personalizados.
            </p>
          </motion.div>
        ) : (
          <motion.div key="content" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="bg-admin-surface rounded-3xl p-6 md:p-8 border border-admin-neutral/40 hover:border-admin-neutral hover:shadow-[0_4px_30px_rgba(45,32,37,0.03)] transition-all duration-300 group flex flex-col"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center border transition-colors", getInsightStyle(insight.importance, insight.type))}>
                    {renderIcon(insight.icon)}
                  </div>
                  <h4 className="font-medium text-admin-text text-[14px] leading-tight tracking-wide">{insight.title}</h4>
                </div>
                
                <p className="text-[13px] font-light text-admin-text-muted leading-relaxed flex-1">
                  {insight.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
