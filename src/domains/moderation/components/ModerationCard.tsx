import { useState } from 'react';
import { Check, X, MessageSquare, Star, Pencil, Save, Reply, Sparkles } from 'lucide-react';
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
  
  const handleApprove = () => approve.mutate(review.id);
  const handleReject = (isSpam = false) => reject.mutate({ id: review.id, isSpam });
  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    reply.mutate({ id: review.id, reply: replyText });
    setIsReplying(false);
  };
  const handleFeatureToggle = () => toggleFeatured.mutate({ id: review.id, featured: !review.featured });
  
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
      "bg-admin-surface rounded-[2rem] border transition-all duration-500 relative flex flex-col group",
      review.featured ? "border-admin-warning/30 shadow-[0_8px_40px_rgba(217,160,91,0.06)]" : "border-admin-neutral/40 hover:border-admin-neutral hover:shadow-[0_8px_30px_rgba(45,32,37,0.03)]"
    )}>
      
      {/* Featured Ribbon */}
      {review.featured && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-admin-warning/80 to-transparent opacity-80" />
      )}

      {/* Action Hover Header */}
      {!isEditing && (
        <div className="absolute top-6 right-6 transition-opacity duration-300 z-10 flex gap-2">
          {review.featured && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-admin-surface-2 text-admin-warning rounded-full text-[10px] font-semibold tracking-widest uppercase border border-admin-neutral/40">
              <Star className="w-3 h-3 fill-current" /> Destacada
            </div>
          )}
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 text-admin-text-muted hover:text-admin-text bg-admin-surface-2 hover:bg-admin-accent-soft/50 rounded-full transition-colors border border-admin-neutral/40"
            title="Editar reseña"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Body */}
      <div className="p-8 md:p-10 flex-1">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Avatar Area */}
          <div className="shrink-0 flex flex-col items-center md:items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-admin-surface-2 border border-admin-neutral/40 flex items-center justify-center text-2xl font-bold text-admin-text shadow-sm">
              {review.client_name.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex flex-col items-center md:items-start">
              <div className="flex gap-0.5 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={clsx(
                      "w-3.5 h-3.5",
                      i < (isEditing ? editRating : review.rating) ? "text-admin-text fill-current" : "text-admin-neutral"
                    )} 
                  />
                ))}
              </div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-admin-text-muted/60 mt-2">
                {format(new Date(review.created_at), "MMM yyyy", { locale: es })}
              </p>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-4 max-w-2xl">
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xl font-bold text-admin-text border-b border-admin-neutral pb-2 focus:outline-none focus:border-admin-accent-dark bg-transparent"
                  placeholder="Nombre del cliente"
                />
                
                <textarea
                  value={editReviewText}
                  onChange={(e) => setEditReviewText(e.target.value)}
                  className="w-full min-h-[140px] p-4 text-admin-text text-[15px] font-light border border-admin-neutral rounded-2xl focus:outline-none focus:border-admin-accent-dark resize-none bg-admin-surface-2 leading-relaxed"
                  placeholder="Escribe la reseña..."
                />
                
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    onClick={handleCancelEdit}
                    className="px-5 py-2.5 text-[13px] font-medium text-admin-text-muted hover:bg-admin-surface-2 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    disabled={edit.isPending}
                    className="flex items-center gap-2 px-6 py-2.5 bg-admin-text text-admin-bg text-[13px] font-medium rounded-xl hover:bg-admin-accent-dark transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" strokeWidth={1.5} /> Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-2xl font-bold text-admin-text">{review.client_name}</h3>
                  {review.verified && (
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-admin-text-muted bg-admin-surface-2 px-3 py-1.5 rounded-full border border-admin-neutral/40">
                      <Check className="w-3.5 h-3.5 text-admin-success" strokeWidth={2} /> Verificada
                    </span>
                  )}
                </div>
                
                <p className={clsx(
                  "text-admin-text font-light leading-relaxed whitespace-pre-wrap text-[17px] md:text-[19px] tracking-tight",
                  !isExpanded && "line-clamp-4"
                )}>
                  "{review.review_text}"
                </p>
                
                {review.review_text.length > 200 && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-5 text-[11px] uppercase tracking-widest font-bold text-admin-accent-dark hover:text-admin-text transition-colors flex items-center gap-1"
                  >
                    {isExpanded ? 'Leer Menos' : 'Leer Completa'}
                  </button>
                )}
              </div>
            )}

            {/* Media */}
            {!isEditing && review.review_media && review.review_media.length > 0 && (
              <div className="flex gap-4 mt-8 overflow-x-auto pb-4 hide-scrollbar">
                {review.review_media.map((media) => (
                  <img 
                    key={media.id} 
                    src={media.url} 
                    alt="Review attached" 
                    className="w-32 h-32 object-cover rounded-2xl border border-admin-neutral/40 shadow-sm hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                  />
                ))}
              </div>
            )}

            {/* AI Analysis (Collapsible) */}
            {!isEditing && review.ai_review_analysis && (
              <div className="mt-8 border-t border-admin-neutral/40 pt-6">
                <div className="flex items-center gap-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-admin-text-muted mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} /> IA Sentimiento
                    </span>
                    <span className="text-sm font-medium text-admin-text capitalize">{review.ai_review_analysis.sentiment || 'N/A'}</span>
                  </div>
                  <div className="w-px h-10 bg-admin-neutral/40" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-admin-text-muted mb-2">Tópicos Clave</span>
                    <span className="text-sm font-light text-admin-text">{review.ai_review_analysis.topics?.join(', ') || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Reply Section */}
            {!isEditing && (review.admin_reply || isReplying) && (
              <div className="mt-10 bg-admin-surface-2/50 rounded-[1.5rem] p-6 md:p-8 border border-admin-neutral/40 relative group">
                <div className="flex gap-5">
                  <div className="w-10 h-10 rounded-full bg-admin-text flex items-center justify-center shrink-0 shadow-md">
                    <span className="text-sm font-bold text-admin-bg">K</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[15px] font-bold tracking-wide text-admin-text">Karin Makeup Artist</span>
                      {review.admin_reply && !isReplying && (
                        <button 
                          onClick={() => {
                            setReplyText(review.admin_reply || '');
                            setIsReplying(true);
                          }}
                          className="text-admin-text-muted hover:text-admin-accent-dark transition-all text-xs font-medium uppercase tracking-widest"
                        >
                          Editar respuesta
                        </button>
                      )}
                    </div>
                    
                    {isReplying ? (
                      <div className="space-y-5">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Escribe tu respuesta pública..."
                          className="w-full min-h-[100px] p-5 text-[15px] font-light text-admin-text border border-admin-neutral/50 rounded-2xl focus:outline-none focus:border-admin-accent-dark resize-none bg-admin-surface leading-relaxed"
                          autoFocus
                        />
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => {
                              setIsReplying(false);
                              setReplyText(review.admin_reply || '');
                            }}
                            className="px-6 py-2.5 text-[13px] font-medium text-admin-text-muted hover:text-admin-text transition-colors"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={handleReplySubmit}
                            disabled={reply.isPending || !replyText.trim()}
                            className="px-7 py-2.5 bg-admin-text text-admin-bg text-[13px] font-medium rounded-[1rem] hover:bg-admin-accent-dark transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                          >
                            <Reply className="w-4 h-4" strokeWidth={1.5} />
                            {review.admin_reply ? 'Actualizar' : 'Responder'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[15px] text-admin-text-muted font-light leading-relaxed whitespace-pre-wrap">
                        {review.admin_reply}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contextual Footer Toolbar */}
      {!isEditing && (
        <div className="px-5 py-5 sm:px-8 sm:py-6 border-t border-admin-neutral/40 flex flex-col sm:flex-row justify-between items-center gap-5 sm:gap-6 bg-admin-surface-2/30 rounded-b-[2rem]">
          
          <div className="flex items-center justify-center w-full sm:w-auto gap-3">
            {isPending && (
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-admin-accent-dark flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-admin-accent-dark animate-pulse" /> Requiere revisión
              </span>
            )}
            {isApproved && (
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-admin-text flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-admin-text" strokeWidth={2} /> Publicada
              </span>
            )}
            {review.status === REVIEW_STATUS.REJECTED && (
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-admin-text-muted flex items-center gap-2">
                <X className="w-3.5 h-3.5 text-admin-text-muted" strokeWidth={2} /> Oculta
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-3 sm:gap-4">
            {isPending && (
              <>
                <button 
                  onClick={() => handleReject()}
                  disabled={reject.isPending}
                  className="w-full sm:w-auto px-6 py-3.5 sm:py-3 min-h-[48px] sm:min-h-[44px] text-admin-text-muted hover:text-admin-text text-[13px] font-medium rounded-xl hover:bg-admin-neutral/30 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  Ocultar
                </button>
                <button 
                  onClick={() => handleApprove()}
                  disabled={approve.isPending}
                  className="w-full sm:w-auto px-7 py-3.5 sm:py-3 min-h-[48px] sm:min-h-[44px] bg-admin-text text-admin-bg text-[13px] font-medium rounded-[1.25rem] hover:bg-admin-accent-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(45,32,37,0.1)] hover:shadow-[0_4px_16px_rgba(45,32,37,0.15)]"
                >
                  <Check className="w-4 h-4" strokeWidth={1.5} /> Aprobar y Publicar
                </button>
              </>
            )}

            {isApproved && (
              <>
                {!review.admin_reply && !isReplying && (
                  <button 
                    onClick={() => setIsReplying(true)}
                    className="w-full sm:w-auto px-6 py-3.5 sm:py-3 min-h-[48px] sm:min-h-[44px] text-admin-text-muted hover:text-admin-text bg-admin-surface border border-admin-neutral/40 hover:border-admin-neutral rounded-[1.25rem] transition-all flex items-center justify-center gap-2 text-[13px] font-medium shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" strokeWidth={1.5} /> Escribir respuesta
                  </button>
                )}
                <button 
                  onClick={handleFeatureToggle}
                  disabled={toggleFeatured.isPending}
                  className={clsx(
                    "w-full sm:w-auto px-6 py-3.5 sm:py-3 min-h-[48px] sm:min-h-[44px] rounded-[1.25rem] border transition-all flex items-center justify-center gap-2 text-[13px] font-medium",
                    review.featured 
                      ? "bg-admin-surface-2 text-admin-warning border-admin-warning/30 hover:bg-admin-surface" 
                      : "bg-admin-surface text-admin-text-muted hover:text-admin-text border-admin-neutral/40 hover:border-admin-neutral shadow-sm"
                  )}
                >
                  <Star className={clsx("w-4 h-4", review.featured && "fill-current")} strokeWidth={1.5} /> 
                  {review.featured ? 'Quitar destacada' : 'Hacer destacada'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
