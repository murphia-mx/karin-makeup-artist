import { motion } from 'framer-motion';
import { Sparkles, Activity } from 'lucide-react';
import { useAIExecutiveMetrics } from '../../../analytics/hooks/useAIAnalytics';

export const AiSummaryWidget = () => {
  const { data: metrics, isLoading } = useAIExecutiveMetrics();

  const getSentimentMessage = () => {
    if (!metrics || metrics.total_analyzed === 0) return 'Conociendo a tus clientas...';
    
    const hasNegative = metrics.top_negative_aspects && metrics.top_negative_aspects.length > 0;
    const hasPositive = metrics.top_positive_aspects && metrics.top_positive_aspects.length > 0;

    if (hasNegative && hasPositive) {
      return 'En general tus clientas están satisfechas con el servicio, pero hay áreas que requieren tu atención.';
    }
    if (hasNegative && !hasPositive) {
      return 'Tus clientas recientes han dejado áreas de oportunidad importantes que debes revisar.';
    }
    return 'Tus clientas están muy satisfechas y teniendo una experiencia excelente.';
  };

  const getKeywordsMessage = () => {
    if (!metrics || metrics.total_analyzed === 0) return null;
    
    const hasNegative = metrics.top_negative_aspects && metrics.top_negative_aspects.length > 0;
    const hasPositive = metrics.top_positive_aspects && metrics.top_positive_aspects.length > 0;

    let message = '';
    
    if (hasPositive) {
      const posWords = metrics.top_positive_aspects.slice(0, 2).map(k => k.aspect.toLowerCase());
      message += `La calidad de tu ${posWords.join(' y ')} recibe excelentes comentarios. `;
    }

    if (hasNegative) {
      const negWords = metrics.top_negative_aspects.slice(0, 2).map(k => k.aspect.toLowerCase());
      message += `También apareció una observación relacionada con tu ${negWords.join(' y ')}. Vale la pena revisarla para seguir ofreciendo una experiencia excelente.`;
    }

    if (!hasPositive && !hasNegative && metrics.top_keywords && metrics.top_keywords.length > 0) {
      const words = metrics.top_keywords.slice(0, 3).map(k => k.keyword.toLowerCase());
      message = `Últimamente han destacado mucho: ${words.join(', ')}.`;
    }

    return message;
  };

  if (isLoading) {
    return (
      <div className="bg-[#FDFBFB] rounded-[1.5rem] p-8 border border-[#EFE7E4] mt-8 animate-pulse h-[200px]" />
    );
  }

  const hasData = metrics && metrics.total_analyzed > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
      className="bg-gradient-to-br from-[#FDFBFB] to-[#F4E8E9] rounded-[1.5rem] p-8 border border-[#D99AA8]/30 shadow-[0_4px_30px_rgba(217,154,168,0.06)] relative overflow-hidden mt-8 group"
    >
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-white/60 to-transparent blur-3xl -translate-y-1/2 translate-x-1/4 rounded-full pointer-events-none group-hover:from-white/80 transition-colors duration-700" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-[#D99AA8]/20 text-[#D99AA8] relative">
          <Sparkles className="w-5 h-5 relative z-10" />
          {hasData && <div className="absolute inset-0 bg-[#D99AA8] rounded-xl animate-ping opacity-20" style={{ animationDuration: '3s' }} />}
        </div>
        <div>
          <h3 className="text-lg font-medium text-[#3D2C2C] flex items-center gap-2">
            ¿Cómo va tu negocio?
          </h3>
          <p className="text-sm font-light text-[#7A6B67]">
            {hasData ? `Lo que descubrimos leyendo ${metrics.total_analyzed} reseña${metrics.total_analyzed !== 1 ? 's' : ''}` : 'Esperando más opiniones'}
          </p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/60 relative z-10 transition-colors duration-500 hover:bg-white/80 hover:shadow-sm">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center text-center py-4">
            <Activity className="w-8 h-8 text-[#D99AA8] opacity-30 mb-4" />
            <p className="text-sm text-[#3D2C2C] font-medium mb-2">
              Estamos conociendo a tus clientas
            </p>
            <p className="text-sm text-[#7A6B67] font-light max-w-md leading-relaxed">
              Pronto leeremos entre líneas para decirte exactamente qué es lo que más les gusta de ti.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#D99AA8] shrink-0 mt-0.5" />
              <p className="text-[#3D2C2C] font-medium text-lg leading-snug">
                {getSentimentMessage()}
              </p>
            </div>
            
            {getKeywordsMessage() && (
              <div className="flex items-start gap-3 pl-8">
                <p className="text-[#5A4A4A] text-base font-light leading-relaxed">
                  {getKeywordsMessage()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
