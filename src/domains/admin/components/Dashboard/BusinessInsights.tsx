import { motion, AnimatePresence } from 'framer-motion';
import { useBusinessInsights } from '../../hooks/useAnalytics';
import { TrendingUp, TrendingDown, PieChart, Star, AlertCircle, Info, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

const InsightSkeleton = () => (
  <div className="bg-[#FAF7F7] rounded-3xl p-6 border border-[#EBDDE2]/50 animate-pulse h-[140px] flex flex-col">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-[#EBDDE2]/50" />
      <div className="w-24 h-3 rounded bg-[#EBDDE2]/50" />
    </div>
    <div className="space-y-2">
      <div className="w-full h-2 bg-[#EBDDE2]/30 rounded" />
      <div className="w-4/5 h-2 bg-[#EBDDE2]/30 rounded" />
    </div>
  </div>
);

export const BusinessInsights = () => {
  const { data: insights, isLoading } = useBusinessInsights();

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'trending-up': return <TrendingUp className="w-4 h-4" />;
      case 'trending-down': return <TrendingDown className="w-4 h-4" />;
      case 'pie-chart': return <PieChart className="w-4 h-4" />;
      case 'star': return <Star className="w-4 h-4" />;
      case 'alert-circle': return <AlertCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getInsightStyle = (importance: string, type: string) => {
    if (type === 'alert') {
      return 'bg-[#CF7F9B]/10 text-[#CF7F9B] border-transparent';
    }
    
    switch (importance) {
      case 'high': return 'bg-[#301C27]/5 text-[#301C27] border-transparent';
      case 'medium': return 'bg-[#D9A05B]/10 text-[#D9A05B] border-transparent';
      case 'low': return 'bg-[#765E68]/10 text-[#765E68] border-transparent';
      default: return 'bg-[#FAF7F7] text-[#765E68] border-transparent';
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InsightSkeleton />
            <InsightSkeleton />
            <InsightSkeleton />
          </motion.div>
        ) : !insights || insights.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-10 text-center bg-[#FAF7F7] rounded-3xl border border-[#EBDDE2]/50 border-dashed">
            <Sparkles className="w-6 h-6 text-[#CF7F9B]/40 mb-3" />
            <h4 className="text-[11px] uppercase tracking-widest font-semibold text-[#765E68]/60 mb-2">Análisis Pendiente</h4>
            <p className="text-xs text-[#765E68] font-light max-w-[250px] leading-relaxed">
              En cuanto tengas más citas y reseñas, aquí te daremos consejos personalizados.
            </p>
          </motion.div>
        ) : (
          <motion.div key="content" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1, ease: "easeOut" }}
                className="bg-white rounded-3xl p-6 md:p-8 border border-[#EBDDE2]/50 hover:border-[#EBDDE2] hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 group flex flex-col"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center border transition-colors", getInsightStyle(insight.importance, insight.type))}>
                    {renderIcon(insight.icon)}
                  </div>
                  <h4 className="font-medium text-[#301C27] text-[13px] leading-tight">{insight.title}</h4>
                </div>
                
                <p className="text-[13px] font-light text-[#765E68] leading-relaxed flex-1">
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
