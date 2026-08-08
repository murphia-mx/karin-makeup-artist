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
  if (diffInMinutes < 60) return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "ayer";
  if (diffInDays < 7) return `hace ${diffInDays} días`;
  
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
};

const renderIcon = (type: string) => {
  switch (type) {
    case 'good_news': return <TrendingUp className="w-5 h-5 text-[#34C759]" />; // Apple Green
    case 'needs_review': return <AlertCircle className="w-5 h-5 text-[#FF3B30]" />; // Apple Red
    case 'opportunity': return <Lightbulb className="w-5 h-5 text-[#007AFF]" />; // Apple Blue
    default: return <Sparkles className="w-5 h-5 text-[#D99AA8]" />;
  }
};

const renderCardStyle = (type: string) => {
  switch (type) {
    case 'good_news': return 'bg-gradient-to-b from-[#34C759]/[0.03] to-transparent border-[#34C759]/10 hover:border-[#34C759]/30';
    case 'needs_review': return 'bg-gradient-to-b from-[#FF3B30]/[0.03] to-transparent border-[#FF3B30]/10 hover:border-[#FF3B30]/30';
    case 'opportunity': return 'bg-gradient-to-b from-[#007AFF]/[0.03] to-transparent border-[#007AFF]/10 hover:border-[#007AFF]/30';
    default: return 'bg-white border-[#EFE7E4]';
  }
};

const renderPriority = (priority: string) => {
  switch (priority) {
    case 'low': return '🟢 Todo va muy bien';
    case 'medium': return '🟡 Vale la pena revisarlo';
    case 'high': return '🔴 Conviene actuar esta semana';
    default: return '🟢 Todo va muy bien';
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
      <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#EFE7E4] animate-pulse h-[400px] flex flex-col items-center justify-center">
        <Sparkles className="w-8 h-8 text-[#D99AA8]/30 mb-4" />
        <div className="w-48 h-4 bg-[#EFE7E4] rounded-full mb-3" />
        <div className="w-64 h-3 bg-[#EFE7E4] rounded-full" />
      </div>
    );
  }

  const payload = report?.observations;
  const hasReport = !!payload && !!payload.items && payload.items.length > 0;
  const isStale = report?.is_stale || false;

  // Determine Exact State
  const isStateA = report?.status === 'insufficient_data';
  const isStateB = !hasReport && !isStateA; // Report is null, but we have enough data
  const isStateC = hasReport && !isStale;
  const isStateD = hasReport && isStale;

  return (
    <div className="relative">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10 px-2">
        <div className="flex flex-col">
          <h2 className="text-xl md:text-2xl font-medium tracking-tight text-[#1D1D1F]">
            Asesoría de Negocio
          </h2>
          {hasReport && (
            <p className="text-sm text-[#86868B] font-light mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Analizado {getRelativeTime(report.created_at || new Date().toISOString())}
            </p>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* GENERATING STATE */}
        {isGenerating && (
          <motion.div 
            key="generating" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="bg-white rounded-3xl p-20 border border-[#EFE7E4] shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]"
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
                  <Icon className={clsx(
                    "w-12 h-12 mb-6 transition-colors duration-500",
                    loadingStepIndex === LOADING_STEPS.length - 1 ? 'text-[#34C759]' : 'text-[#D99AA8] animate-pulse'
                  )} />
                  <h3 className="text-xl font-medium tracking-tight text-[#1D1D1F]">{currentStep.text}</h3>
                </motion.div>
              );
            })()}
          </motion.div>
        )}

        {/* ESTADO A: Insufficient Data */}
        {isStateA && !isGenerating && (
          <motion.div 
            key="stateA" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }} 
            className="bg-white rounded-3xl p-12 border border-[#EFE7E4] shadow-sm text-center flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mb-6 border border-[#EFE7E4]">
              <Sparkles className="w-8 h-8 text-[#D99AA8]" />
            </div>
            <h3 className="text-2xl font-medium tracking-tight text-[#1D1D1F] mb-3">
              Estoy empezando a conocer cómo trabajan tus clientas 🌸
            </h3>
            <p className="text-[#86868B] text-lg max-w-lg mx-auto font-light leading-relaxed mb-8">
              Cada nueva opinión me ayuda a entender mejor tu negocio. 
              Hemos analizado {report.current_reviews} {report.current_reviews === 1 ? 'opinión' : 'opiniones'}. 
              Con {report.minimum_required! - report.current_reviews!} más podré comenzar a detectar patrones confiables para ti.
            </p>
            
            <div className="w-full max-w-sm bg-[#F5F5F7] rounded-2xl p-6 border border-[#EFE7E4] flex flex-col gap-4 text-left">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-[#1D1D1F]">Progreso de análisis</span>
                <span className="text-sm font-semibold text-[#D99AA8]">
                  {report.current_reviews} / {report.minimum_required}
                </span>
              </div>
              <div className="w-full h-3 bg-[#EFE7E4] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(((report.current_reviews || 0) / (report.minimum_required || 3)) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[#D99AA8] to-[#C88496] rounded-full"
                />
              </div>
              <p className="text-xs text-[#86868B] text-center mt-1">
                Recopilando impresiones de tus clientas
              </p>
            </div>
          </motion.div>
        )}

        {/* ESTADO B: Ready for first generation */}
        {isStateB && !isGenerating && (
          <motion.div 
            key="stateB" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }} 
            className="bg-white rounded-3xl p-12 border border-[#EFE7E4] shadow-sm text-center flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D99AA8]/20 to-[#D99AA8]/5 flex items-center justify-center mb-6 border border-[#D99AA8]/20">
              <Sparkles className="w-8 h-8 text-[#D99AA8]" />
            </div>
            <h3 className="text-2xl font-medium tracking-tight text-[#1D1D1F] mb-3">
              ¡Perfecto! ✨
            </h3>
            <p className="text-[#86868B] text-lg max-w-lg mx-auto font-light leading-relaxed mb-8">
              Ya tenemos suficiente información para preparar tu primera asesoría. Aprenderé de los patrones en tus reseñas y te daré recomendaciones claras para tomar decisiones hoy mismo.
            </p>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              className="flex items-center gap-2 px-8 py-4 rounded-full text-base font-medium transition-all duration-300 shadow-md bg-gradient-to-r from-[#2C2C2E] to-[#1D1D1F] text-white hover:from-[#1D1D1F] hover:to-[#000000]"
            >
              <Sparkles className="w-5 h-5" />
              Generar mi primera asesoría
            </motion.button>
          </motion.div>
        )}

        {/* ESTADO D: Stale Report */}
        {isStateD && !isGenerating && (
          <motion.div key="stateD" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="bg-[#1D1D1F] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg shadow-black/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#D99AA8]/20 to-transparent opacity-50" />
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-6 h-6 text-[#D99AA8]" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white mb-1">Tus opiniones cambiaron desde el último análisis.</h4>
                  <p className="text-[#86868B] font-light">
                    Se han detectado nuevas opiniones, modificaciones o eliminaciones. Actualiza la asesoría para obtener recomendaciones basadas en el estado real de tu negocio.
                  </p>
                </div>
              </div>
              <button 
                onClick={handleGenerate}
                className="relative z-10 shrink-0 bg-white text-[#1D1D1F] px-6 py-3 rounded-xl font-medium hover:bg-[#F5F5F7] transition-colors shadow-sm flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Actualizar asesoría
              </button>
            </div>
          </motion.div>
        )}

        {/* ESTADO C: Active Report */}
        {isStateC && !isGenerating && (
          <motion.div key="stateC" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            
            <div className="flex justify-end px-2">
              <p className="text-sm text-[#86868B] font-light flex items-center gap-1.5 bg-[#F5F5F7] px-3 py-1.5 rounded-full border border-[#EFE7E4]">
                <CheckCircle2 className="w-4 h-4 text-[#34C759]" /> 
                Este análisis representa el estado de tus opiniones al {report.snapshot_generated_at ? new Date(report.snapshot_generated_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : ''}
              </p>
            </div>

            {/* HERO CARD - The Emotional Heart */}
            <div className="bg-[#1D1D1F] text-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.1)] relative overflow-hidden group">
              {/* Mesh Gradient Background Effect */}
              <div className="absolute top-[-50%] right-[-10%] w-[80%] h-[150%] bg-gradient-to-bl from-[#D99AA8]/20 via-transparent to-transparent rounded-full blur-[100px] opacity-60 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <div className="relative z-10 max-w-3xl">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight leading-tight mb-8 text-[#F5F5F7]">
                  {payload?.hero_greeting}
                </h3>
                
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 mt-6">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60 mb-3">
                    <Sparkles className="w-3.5 h-3.5" /> Mi recomendación para hoy
                  </span>
                  <p className="text-xl md:text-2xl font-medium text-white leading-snug">
                    {payload?.hero_action}
                  </p>
                </div>
              </div>
              
              <div className="absolute bottom-6 right-8 text-white/40 text-xs font-light z-10">
                Basado en {report.total_reviews_analyzed} opiniones aprobadas del {new Date(report.period_start || new Date().toISOString()).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} al {new Date(report.period_end || new Date().toISOString()).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
              </div>
            </div>

            {/* SECONDARY OBSERVATIONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {payload?.items?.map((obs: AdvisorObservation, idx: number) => (
                <motion.div 
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  key={idx} 
                  className={clsx(
                    "rounded-[28px] p-8 border bg-white shadow-sm flex flex-col h-full",
                    renderCardStyle(obs.type)
                  )}
                >
                  {/* Card Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#EFE7E4] shadow-sm flex items-center justify-center shrink-0">
                      {renderIcon(obs.type)}
                    </div>
                    <h4 className="text-xl font-medium tracking-tight text-[#1D1D1F] leading-tight pt-1">
                      {obs.title}
                    </h4>
                  </div>
                  
                  {/* Card Body */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h5 className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] mb-2">Lo que vimos</h5>
                      <p className="text-[#1D1D1F] font-normal leading-relaxed text-[15px]">
                        {obs.what_we_saw}
                      </p>
                    </div>

                    <div>
                      <h5 className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] mb-2">Lo que recomendamos</h5>
                      <p className="text-[#1D1D1F] font-normal leading-relaxed text-[15px]">
                        {obs.what_we_recommend}
                      </p>
                    </div>
                  </div>
                  
                  {/* Card Footer */}
                  <div className="mt-8 pt-6 border-t border-black/[0.04] flex flex-col gap-3">
                    <span className="text-[13px] font-medium text-[#1D1D1F]">
                      {renderPriority(obs.priority)}
                    </span>
                    <span className="text-xs text-[#86868B] font-light">
                      {obs.evidence_count > 0 
                        ? `Basado en las últimas ${obs.evidence_count} opiniones aprobadas.` 
                        : 'Basado en patrones estadísticos.'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
