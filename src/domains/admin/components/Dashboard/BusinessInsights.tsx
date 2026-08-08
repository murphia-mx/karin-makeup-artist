import { motion, AnimatePresence } from 'framer-motion';
import { useBusinessInsights } from '../../hooks/useAnalytics';
import { TrendingUp, TrendingDown, PieChart, Star, AlertCircle, Info, Sparkles } from 'lucide-react';

const InsightSkeleton = () => (
  <div className="bg-[#FDFBFB] rounded-2xl p-6 border border-[#EFE7E4] animate-pulse h-[160px] flex flex-col">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-[#EFE7E4]" />
      <div className="w-24 h-4 rounded bg-[#EFE7E4]" />
    </div>
    <div className="space-y-2 mb-4">
      <div className="w-full h-3 rounded bg-[#EFE7E4]" />
      <div className="w-4/5 h-3 rounded bg-[#EFE7E4]" />
    </div>
  </div>
);

export const BusinessInsights = () => {
  const { data: insights, isLoading } = useBusinessInsights();

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'trending-up': return <TrendingUp className="w-5 h-5" />;
      case 'trending-down': return <TrendingDown className="w-5 h-5" />;
      case 'pie-chart': return <PieChart className="w-5 h-5" />;
      case 'star': return <Star className="w-5 h-5" />;
      case 'alert-circle': return <AlertCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getInsightStyle = (importance: string, type: string) => {
    if (type === 'alert') {
      return 'bg-rose-50/50 text-rose-500 border-rose-100';
    }
    
    switch (importance) {
      case 'high': return 'bg-[#D99AA8]/5 text-[#D99AA8] border-[#D99AA8]/20';
      case 'medium': return 'bg-amber-50/50 text-amber-500 border-amber-100';
      case 'low': return 'bg-blue-50/50 text-blue-500 border-blue-100';
      default: return 'bg-[#FDFBFB] text-[#7A6B67] border-[#EFE7E4]';
    }
  };

  return (
    <div className="bg-white rounded-[1.5rem] p-8 border border-[#EFE7E4] shadow-[0_4px_20px_rgba(0,0,0,0.01)] mt-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2 bg-[#FDFBFB] rounded-lg border border-[#EFE7E4]">
          <Sparkles className="w-4 h-4 text-[#D99AA8]" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-[#3D2C2C]">Lo más importante de este mes</h3>
          <p className="text-sm font-light text-[#7A6B67]">Lo que descubrimos analizando tus citas y reseñas recientes</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InsightSkeleton />
            <InsightSkeleton />
            <InsightSkeleton />
          </motion.div>
        ) : !insights || insights.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-12 text-center bg-[#FDFBFB] rounded-2xl border border-[#EFE7E4] border-dashed">
            <Sparkles className="w-8 h-8 text-[#D99AA8]/30 mb-4" />
            <h4 className="text-sm font-medium text-[#3D2C2C] mb-1">Aún estamos conociendo a tus clientas</h4>
            <p className="text-xs text-[#7A6B67] font-light max-w-sm leading-relaxed">
              En cuanto tengas más citas y reseñas, aquí te daremos consejos personalizados para mejorar tu servicio.
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
                className="bg-white rounded-2xl p-6 border border-[#EFE7E4] hover:border-[#D99AA8]/30 hover:shadow-[0_12px_40px_rgba(217,154,168,0.06)] hover:-translate-y-1 transition-all duration-300 group flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-xl border ${getInsightStyle(insight.importance, insight.type)} transition-colors`}>
                    {renderIcon(insight.icon)}
                  </div>
                  <h4 className="font-medium text-[#3D2C2C] text-sm leading-tight">{insight.title}</h4>
                </div>
                
                <p className="text-sm font-light text-[#5A4A4A] leading-relaxed flex-1">
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
