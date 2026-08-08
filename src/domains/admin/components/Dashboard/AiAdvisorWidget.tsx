import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, CheckCircle2, RefreshCw, Search, BrainCircuit, Clock } from 'lucide-react';
import { useAiAdvisor, useGenerateAdvisorReport } from '../../../analytics/hooks/useAIAnalytics';
import type { AdvisorObservation } from '../../../analytics/hooks/useAIAnalytics';
import { clsx } from 'clsx';

const LOADING_STEPS = [
  { icon: BrainCircuit, text: "Leyendo opiniones de tus clientas..." },
  { icon: Search, text: "Buscando patrones y tendencias..." },
  { icon: Clock, text: "Consultando memoria histórica..." },
  { icon: Lightbulb, text: "Preparando recomendaciones de hoy..." },
  { icon: CheckCircle2, text: "Asesoría lista" }
];

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "hace un momento";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `hace ${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "ayer";
  if (diffInDays < 7) return `hace ${diffInDays} días`;
  
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
};

const renderIcon = (type: string) => {
  switch (type) {
    case 'good_news': return <TrendingUp className="w-[18px] h-[18px] text-[#CF7F9B]" />; 
    case 'needs_review': return <AlertCircle className="w-[18px] h-[18px] text-[#D9A05B]" />; 
    case 'opportunity': return <Lightbulb className="w-[18px] h-[18px] text-[#301C27]" />; 
    default: return <Sparkles className="w-[18px] h-[18px] text-[#CF7F9B]" />;
  }
};

const renderPriority = (priority: string) => {
  switch (priority) {
    case 'low': return 'Observación';
    case 'medium': return 'Recomendación';
    case 'high': return 'Prioridad';
    default: return 'Insight';
  }
};

export const AiAdvisorWidget = () => {
  const { data: report, isLoading, refetch } = useAiAdvisor();
  const generateMutation = useGenerateAdvisorReport();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex(prev => {
          if (prev < LOADING_STEPS.length - 2) return prev + 1;
          return prev;
        });
      }, 2500); 
    } else {
      setLoadingStepIndex(LOADING_STEPS.length - 1);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateMutation.mutateAsync();
      setLoadingStepIndex(LOADING_STEPS.length - 1);
      setTimeout(async () => {
        await refetch();
        setIsGenerating(false);
      }, 1000);
    } catch (error) {
      console.error("Error generating report:", error);
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 bg-[#EBDDE2]/30 w-1/4 rounded-full" />
        <div className="h-24 bg-[#FAF7F7] rounded-[2rem] border border-[#EBDDE2]/50" />
      </div>
    );
  }

  const payload = report?.observations;
  const hasReport = !!payload && !!payload.items && payload.items.length > 0;
  const isStale = report?.is_stale || false;

  const isStateA = report?.status === 'insufficient_data';
  const isStateB = !hasReport && !isStateA;
  const isStateC = hasReport && !isStale;
  const isStateD = hasReport && isStale;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-8 border-b border-[#EBDDE2]/50 pb-4">
        <h2 className="text-[10px] font-semibold text-[#765E68]/60 uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#CF7F9B]" />
          Inteligencia Artificial
        </h2>
        {hasReport && (
          <p className="text-[10px] uppercase tracking-widest text-[#765E68]/60 font-medium">
            Actualizado {getRelativeTime(report.created_at || new Date().toISOString())}
          </p>
        )}
      </div>

      <AnimatePresence mode="wait">
        
        {/* GENERATING STATE */}
        {isGenerating && (
          <motion.div 
            key="generating" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="py-16 text-center flex flex-col items-center justify-center min-h-[300px]"
          >
            {(() => {
              const currentStep = LOADING_STEPS[loadingStepIndex];
              const Icon = currentStep.icon;
              return (
                <motion.div 
                  key={loadingStepIndex}
                  initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-full bg-[#FAF7F7] flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-[#F3E4E9] rounded-full animate-ping opacity-70" />
                    <Icon className={clsx(
                      "w-8 h-8 relative z-10 transition-colors duration-500",
                      loadingStepIndex === LOADING_STEPS.length - 1 ? 'text-[#301C27]' : 'text-[#CF7F9B] animate-pulse'
                    )} />
                  </div>
                  <h3 className="text-xl font-display font-medium text-[#301C27] tracking-wide">{currentStep.text}</h3>
                </motion.div>
              );
            })()}
          </motion.div>
        )}

        {/* ESTADO A: Insufficient Data */}
        {isStateA && !isGenerating && (
          <motion.div 
            key="stateA" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="bg-[#FAF7F7] rounded-[2rem] p-12 border border-[#EBDDE2]/50 text-center flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border border-[#EBDDE2]">
              <Sparkles className="w-6 h-6 text-[#CF7F9B]" />
            </div>
            <h3 className="text-2xl font-display font-medium text-[#301C27] mb-3">
              Conociendo a tus clientas
            </h3>
            <p className="text-[#765E68] text-sm max-w-md mx-auto font-light leading-relaxed mb-8">
              Hemos analizado {report.current_reviews} {report.current_reviews === 1 ? 'opinión' : 'opiniones'}. 
              Con {report.minimum_required! - report.current_reviews!} más podré entregarte un análisis cualitativo preciso de tu estudio.
            </p>
            
            <div className="w-full max-w-xs bg-white rounded-2xl p-6 border border-[#EBDDE2]/50 text-left shadow-sm">
              <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] font-semibold text-[#765E68] uppercase tracking-widest">Progreso</span>
                <span className="text-xs font-semibold text-[#CF7F9B]">
                  {report.current_reviews} / {report.minimum_required}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#F3E4E9] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(((report.current_reviews || 0) / (report.minimum_required || 3)) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-[#CF7F9B] rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* ESTADO B: Ready for first generation */}
        {isStateB && !isGenerating && (
          <motion.div 
            key="stateB" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="bg-[#FAF7F7] rounded-[2rem] p-12 border border-[#EBDDE2]/50 text-center flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border border-[#EBDDE2]">
              <Sparkles className="w-6 h-6 text-[#CF7F9B]" />
            </div>
            <h3 className="text-2xl font-display font-medium text-[#301C27] mb-3">
              Todo listo para el primer análisis
            </h3>
            <p className="text-[#765E68] text-sm max-w-md mx-auto font-light leading-relaxed mb-8">
              Contamos con suficientes reseñas para preparar tu primera asesoría cualitativa basada en la voz de tus clientas.
            </p>
            <button 
              onClick={handleGenerate}
              className="flex items-center gap-3 px-8 py-3.5 rounded-2xl text-sm tracking-wide font-medium transition-all duration-300 bg-[#301C27] text-white hover:bg-[#CF7F9B] shadow-[0_8px_20px_rgba(48,28,39,0.1)] hover:shadow-[0_8px_20px_rgba(207,127,155,0.2)]"
            >
              <Sparkles className="w-4 h-4" />
              Generar Asesoría
            </button>
          </motion.div>
        )}

        {/* ESTADO D: Stale Report */}
        {isStateD && !isGenerating && (
          <motion.div key="stateD" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-12">
            <div className="bg-[#FAF7F7] border border-[#EBDDE2]/50 rounded-[2rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <h4 className="text-lg font-display text-[#301C27] mb-2">Hay nuevas opiniones disponibles</h4>
                <p className="text-[#765E68] font-light text-sm max-w-xl leading-relaxed">
                  Actualiza el análisis para obtener insights cualitativos precisos basados en las últimas reseñas que has recibido hoy.
                </p>
              </div>
              <button 
                onClick={handleGenerate}
                className="shrink-0 bg-white border border-[#EBDDE2] text-[#301C27] px-6 py-3 rounded-2xl text-sm font-medium hover:bg-[#FAF7F7] transition-all shadow-sm flex items-center gap-3"
              >
                <RefreshCw className="w-4 h-4 text-[#CF7F9B]" />
                Actualizar Análisis
              </button>
            </div>
          </motion.div>
        )}

        {/* ESTADO C: Active Report */}
        {isStateC && !isGenerating && (
          <motion.div key="stateC" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            
            {/* HERO INSIGHT */}
            <div className="mb-12">
              <h3 className="text-3xl md:text-4xl font-display font-light text-[#301C27] leading-tight mb-8">
                {payload?.hero_greeting}
              </h3>
              
              <div className="bg-[#FAF7F7] rounded-[2rem] p-8 md:p-10 border border-[#EBDDE2]/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-full bg-white shadow-sm border border-[#EBDDE2] flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-[#CF7F9B]" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#765E68]">La sugerencia de hoy</span>
                </div>
                <p className="text-xl md:text-2xl font-light text-[#301C27] leading-relaxed">
                  {payload?.hero_action}
                </p>
              </div>
            </div>

            {/* SECONDARY OBSERVATIONS GRID (Sutil) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {payload?.items?.map((obs: AdvisorObservation, idx: number) => (
                <div 
                  key={idx} 
                  className="group rounded-[2rem] p-8 bg-white border border-[#EBDDE2]/50 hover:border-[#EBDDE2] hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300 flex flex-col h-full"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#FAF7F7] border border-[#EBDDE2]/50 flex items-center justify-center shrink-0">
                      {renderIcon(obs.type)}
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-[#301C27] leading-tight">
                        {obs.title}
                      </h4>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-6">
                    <div>
                      <p className="text-[#765E68] font-light leading-relaxed text-sm">
                        {obs.what_we_saw}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-[#EBDDE2]/30">
                      <h5 className="text-[10px] font-semibold uppercase tracking-widest text-[#CF7F9B] mb-3">Qué deberías hacer</h5>
                      <p className="text-[#301C27] font-medium leading-relaxed text-sm">
                        {obs.what_we_recommend}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
