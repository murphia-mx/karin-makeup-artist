import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAIExecutiveMetrics } from '../../../analytics/hooks/useAIAnalytics';

export const BusinessHealth = () => {
  const navigate = useNavigate();
  const { data: metrics, isLoading } = useAIExecutiveMetrics();

  if (isLoading) {
    return (
      <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-[#EFE7E4] animate-pulse h-[280px]" />
    );
  }

  // Lógica conversacional basada en datos reales
  let mainGreeting = "Hola Karin 🌸";
  let statusMessage = "Hoy todo marcha muy bien.";
  let highlightsMessage = "";
  let suggestionMessage = "Te sugerimos enviar invitaciones a tus clientas más recientes para seguir escuchándolas.";

  if (metrics && metrics.total_analyzed > 0) {
    const hasNegative = metrics.top_negative_aspects && metrics.top_negative_aspects.length > 0;
    const hasPositive = metrics.top_positive_aspects && metrics.top_positive_aspects.length > 0;
    const words = metrics.top_keywords && metrics.top_keywords.length > 0 ? metrics.top_keywords.slice(0, 2).map(k => k.keyword.toLowerCase()) : [];

    if (hasNegative && hasPositive) {
      statusMessage = "En general el negocio va muy bien.";
      highlightsMessage = words.length > 0 ? `La mayoría destaca tu ${words.join(' y ')}.` : "Tus clientas están satisfechas.";
      const negativeAspect = metrics.top_negative_aspects[0].aspect.toLowerCase();
      suggestionMessage = `Sin embargo, una clienta comentó que el aspecto de "${negativeAspect}" podría mejorar. Vale la pena revisarlo para que todas las experiencias sean igual de buenas.`;
    } else if (hasNegative && !hasPositive) {
      statusMessage = "Hay detalles importantes que requieren tu atención.";
      highlightsMessage = "Tus clientas recientes han dejado comentarios que debes leer.";
      const negativeAspect = metrics.top_negative_aspects[0].aspect.toLowerCase();
      suggestionMessage = `Se ha mencionado el aspecto de "${negativeAspect}". Sugerimos poner especial cuidado en este detalle en tus próximas citas para mejorar la experiencia.`;
    } else if (hasPositive && !hasNegative) {
      statusMessage = "Hoy todo marcha de maravilla.";
      highlightsMessage = words.length > 0 ? `Las clientas siguen hablando maravillas de tu ${words.join(' y ')}.` : "Tus clientas aman tu trabajo.";
      suggestionMessage = "No hemos detectado quejas recientes. Todo fluye perfectamente, sigue manteniendo esa excelencia.";
    }
  } else {
    statusMessage = "Aún estamos esperando que tus clientas comiencen a dejar sus reseñas.";
    highlightsMessage = "En cuanto tengamos algunas, aquí verás exactamente qué es lo que más aman de tu trabajo y en qué puedes mejorar.";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.02)] border border-[#EFE7E4] relative overflow-hidden"
    >
      {/* Subtle Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D99AA8]/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#FDFBFB] flex items-center justify-center border border-[#D99AA8]/20">
            <Sparkles className="w-5 h-5 text-[#D99AA8]" />
          </div>
          <h2 className="text-xl md:text-2xl font-light text-[#3D2C2C]">{mainGreeting}</h2>
        </div>

        <div className="space-y-6 max-w-3xl">
          <p className="text-[#5A4A4A] font-light leading-relaxed text-lg">
            {statusMessage} <span className="font-medium text-[#3D2C2C]">{highlightsMessage}</span>
          </p>

          <div className="bg-[#FDFBFB] rounded-2xl p-6 border border-[#EFE7E4] flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8">
            <div>
              <h4 className="text-sm font-medium text-[#7A6B67] mb-1 flex items-center gap-2">
                Una sugerencia para hoy
              </h4>
              <p className="text-[#5A4A4A] font-light text-sm leading-relaxed max-w-lg">
                {suggestionMessage}
              </p>
            </div>
            <button 
              onClick={() => navigate('/admin/invitations')}
              className="whitespace-nowrap flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#EFE7E4] rounded-xl text-[#3D2C2C] text-sm hover:bg-[#FDFBFB] transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Invitar a una clienta
              <ArrowRight className="w-4 h-4 text-[#D99AA8]" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
