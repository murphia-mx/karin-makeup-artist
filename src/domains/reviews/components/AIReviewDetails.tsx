import { Sparkles, TrendingUp, AlertCircle, Quote } from 'lucide-react';
import type { AIReviewAnalysis } from '../types/Review';

interface AIReviewDetailsProps {
  analysis: AIReviewAnalysis;
}

export const AIReviewDetails = ({ analysis }: AIReviewDetailsProps) => {
  const getSentimentMessage = () => {
    switch (analysis.sentiment) {
      case 'highly_positive':
        return 'Tus clientas están muy satisfechas con la experiencia.';
      case 'positive':
        return 'A tus clientas les gustó el servicio.';
      case 'neutral':
        return 'Tus clientas tuvieron una experiencia promedio.';
      case 'negative':
        return 'Hay algunas áreas de oportunidad en esta cita.';
      case 'highly_negative':
        return 'Atención: Esta experiencia no cumplió las expectativas.';
      default:
        return 'Hemos analizado esta reseña para ayudarte a mejorar.';
    }
  };

  const getSentimentColor = () => {
    switch (analysis.sentiment) {
      case 'highly_positive':
      case 'positive':
        return 'bg-[#F4E8E9] text-[#D99AA8] border-[#D99AA8]/30';
      case 'neutral':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      case 'negative':
      case 'highly_negative':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-brand-surface text-brand-text border-brand-border';
    }
  };

  return (
    <div className="mt-6 pt-5 border-t border-brand-border-light flex flex-col gap-4">
      {/* Sentiment Summary */}
      <div className={`flex items-start gap-3 p-4 rounded-2xl border ${getSentimentColor()} transition-colors`}>
        <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm font-medium leading-relaxed">
          {getSentimentMessage()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {/* Keywords */}
        {analysis.keywords && analysis.keywords.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#7A6B67] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5" />
              Lo que más mencionan
            </p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.keywords.map((kw, i) => (
                <span key={i} className="px-2.5 py-1 bg-white border border-brand-border-light text-[#5A4A4A] text-xs rounded-full shadow-sm">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Areas of Improvement (Negative Aspects) */}
        {analysis.negative_aspects && analysis.negative_aspects.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-amber-700/80 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Aspectos que podrías mejorar
            </p>
            <div className="flex flex-col gap-1.5">
              {analysis.negative_aspects.map((aspect, i) => (
                <div key={i} className="text-xs text-amber-800 bg-amber-50/50 px-2.5 py-1.5 rounded-lg border border-amber-100/50">
                  • {aspect}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Strengths (Positive Aspects) */}
      {analysis.positive_aspects && analysis.positive_aspects.length > 0 && (
        <div className="mt-1">
          <p className="text-xs font-semibold text-[#7A6B67] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Lo que hiciste genial
          </p>
          <div className="flex flex-col gap-1.5">
            {analysis.positive_aspects.map((aspect, i) => (
              <div key={i} className="text-xs text-[#5A4A4A] bg-[#FDFBFB] px-2.5 py-1.5 rounded-lg border border-[#D99AA8]/10">
                • {aspect}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
