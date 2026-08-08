import { useState } from 'react';
import { Check, X, MessageSquare, Star, ChevronDown, ChevronUp, AlertTriangle, Pencil, Save, XCircle } from 'lucide-react';
import type { Review } from '../../reviews/types/Review';
import { REVIEW_STATUS } from '../../reviews/types/Review';
import { useModeration } from '../hooks/useModeration';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ModerationCardProps {
  review: Review;
}

export const ModerationCard = ({ review }: ModerationCardProps) => {
  const { approve, reject, reply, toggleFeatured, edit } = useModeration();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState(review.admin_reply || '');
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(review.client_name);
  const [editRating, setEditRating] = useState(review.rating);
  const [editReviewText, setEditReviewText] = useState(review.review_text);

  const isPending = review.status === REVIEW_STATUS.PENDING;
  const isApproved = review.status === REVIEW_STATUS.APPROVED;
  
  const handleApprove = () => {
    approve.mutate(review.id);
  };

  const handleReject = (isSpam = false) => {
    reject.mutate({ id: review.id, isSpam });
  };

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    reply.mutate({ id: review.id, reply: replyText });
    setIsReplying(false);
  };

  const handleFeatureToggle = () => {
    toggleFeatured.mutate({ id: review.id, featured: !review.featured });
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || !editReviewText.trim()) return;
    edit.mutate({
      id: review.id,
      updates: {
        client_name: editName.trim(),
        rating: editRating,
        review_text: editReviewText.trim(),
      }
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(review.client_name);
    setEditRating(review.rating);
    setEditReviewText(review.review_text);
    setIsEditing(false);
  };

  return (
    <div className={clsx(
      "bg-white rounded-2xl border transition-all duration-300 relative",
      review.featured ? "border-[#E5B25D]/50 shadow-[0_0_15px_rgba(229,178,93,0.1)]" : "border-brand-border hover:shadow-lg"
    )}>
      
      {/* Botón Flotante Editar */}
      {!isEditing && (
        <button 
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 p-2 text-brand-text-muted hover:text-brand-primary hover:bg-brand-surface rounded-full transition-colors z-10"
          title="Editar reseña"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

      {/* Header Info */}
      <div className="p-6 pb-4 border-b border-brand-border/30 flex justify-between items-start pt-12 sm:pt-6">
        <div className="flex items-start gap-4 w-full">
          <div className="w-12 h-12 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-lg font-light text-brand-text shrink-0">
            {review.client_name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3 pr-12">
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-sm font-medium text-brand-text border border-brand-border rounded-lg p-2 focus:outline-none focus:border-brand-primary"
                  placeholder="Nombre del cliente"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-brand-text-muted">Calificación:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        onClick={() => setEditRating(star)}
                        className="focus:outline-none"
                      >
                        <Star 
                          className={clsx(
                            "w-5 h-5 transition-colors cursor-pointer", 
                            star <= editRating ? "fill-[#E5B25D] text-[#E5B25D]" : "fill-brand-surface text-brand-border hover:fill-[#E5B25D]/50"
                          )} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h3 className="font-medium text-brand-text">{review.client_name}</h3>
                <p className="text-xs text-brand-text-muted mt-1 font-light">
                  {format(new Date(review.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                  {review.services && ` • ${review.services.name}`}
                </p>
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={clsx(
                        "w-4 h-4", 
                        i < review.rating ? "fill-[#E5B25D] text-[#E5B25D]" : "fill-brand-surface text-brand-border"
                      )} 
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Status Badge */}
        {!isEditing && (
          <div className={clsx(
            "px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider shrink-0 mt-2 sm:mt-0 ml-4",
            isPending && "bg-yellow-100 text-yellow-800",
            isApproved && "bg-green-100 text-green-800",
            review.status === REVIEW_STATUS.REJECTED && "bg-red-100 text-red-800",
            review.status === REVIEW_STATUS.SPAM && "bg-gray-100 text-gray-800"
          )}>
            {review.status}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {isEditing ? (
          <textarea
            value={editReviewText}
            onChange={(e) => setEditReviewText(e.target.value)}
            className="w-full h-32 p-3 text-sm text-brand-text font-light leading-relaxed border border-brand-border rounded-xl focus:outline-none focus:border-brand-primary resize-y"
            placeholder="Texto del testimonio..."
          />
        ) : (
          <p className="text-brand-text font-light leading-relaxed">
            {review.review_text}
          </p>
        )}
        
        {!isEditing && review.review_media && review.review_media.length > 0 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {review.review_media.map((media) => (
              <img 
                key={media.id} 
                src={media.url} 
                alt="Review attached" 
                className="w-24 h-24 object-cover rounded-xl border border-brand-border"
              />
            ))}
          </div>
        )}

        {/* AI Analysis (if exists) */}
        {!isEditing && review.ai_review_analysis && (
          <div className="mt-4 p-4 bg-brand-surface/50 rounded-xl border border-brand-border/50 text-sm font-light text-brand-text-muted">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-text-muted" />
                Análisis de Inteligencia Artificial
              </span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            {isExpanded && (
              <div className="mt-3 grid grid-cols-2 gap-4 border-t border-brand-border/30 pt-3">
                <div>
                  <span className="block text-xs uppercase tracking-wider mb-1">Sentimiento</span>
                  <span className="capitalize">{review.ai_review_analysis.sentiment || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider mb-1">Tópicos</span>
                  <span>{review.ai_review_analysis.topics?.join(', ') || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin Reply Section */}
      {!isEditing && (review.admin_reply || isReplying) && (
        <div className="px-6 py-4 bg-brand-surface/30 border-t border-brand-border/30">
          {review.admin_reply && !isReplying ? (
            <div>
              <p className="text-xs text-brand-text-muted font-medium mb-1 uppercase tracking-wider">Tu Respuesta</p>
              <p className="text-brand-text font-light text-sm italic border-l-2 border-[#E5B25D] pl-3 py-1">
                {review.admin_reply}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <textarea 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escribe tu respuesta pública..."
                className="w-full p-3 text-sm font-light rounded-xl border border-brand-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-text resize-none"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsReplying(false)} className="px-3 py-1.5 text-xs text-brand-text-muted hover:bg-brand-surface rounded-lg transition-colors">Cancelar</button>
                <button onClick={handleReplySubmit} disabled={reply.isPending} className="px-3 py-1.5 text-xs bg-brand-text text-white rounded-lg hover:bg-brand-text/90 transition-colors">Enviar Respuesta</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 bg-brand-surface/10 border-t border-brand-border/30 flex justify-between items-center rounded-b-2xl">
        {isEditing ? (
          <div className="flex gap-2 w-full justify-end">
            <button 
              onClick={handleCancelEdit}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-border text-brand-text-muted hover:bg-brand-surface rounded-xl text-sm font-medium transition-colors"
            >
              <XCircle className="w-4 h-4" /> Cancelar
            </button>
            <button 
              onClick={handleSaveEdit}
              disabled={edit.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-white hover:bg-brand-primary/90 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" /> Guardar Cambios
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              {isPending && (
                <>
                  <button 
                    onClick={handleApprove}
                    disabled={approve.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-700 hover:bg-green-500/20 rounded-xl text-sm font-medium transition-colors"
                  >
                    <Check className="w-4 h-4" /> Aprobar
                  </button>
                  <button 
                    onClick={() => handleReject(false)}
                    disabled={reject.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-700 hover:bg-red-500/20 rounded-xl text-sm font-medium transition-colors"
                  >
                    <X className="w-4 h-4" /> Rechazar
                  </button>
                </>
              )}
              {isApproved && (
                <button 
                  onClick={() => setIsReplying(!isReplying)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-surface text-brand-text hover:bg-brand-border/30 rounded-xl text-sm font-medium transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> Responder
                </button>
              )}
            </div>

            {isApproved && (
              <button 
                onClick={handleFeatureToggle}
                disabled={toggleFeatured.isPending}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                  review.featured 
                    ? "bg-[#E5B25D] text-white hover:bg-[#E5B25D]/90" 
                    : "bg-[#E5B25D]/10 text-[#E5B25D] hover:bg-[#E5B25D]/20"
                )}
              >
                <Star className={clsx("w-4 h-4", review.featured ? "fill-white" : "")} /> 
                {review.featured ? 'Destacada' : 'Destacar'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
