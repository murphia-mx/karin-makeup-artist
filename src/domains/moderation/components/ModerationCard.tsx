import { useState } from 'react';
import { Check, X, MessageSquare, Star, ChevronDown, ChevronUp, AlertTriangle, Pencil, Save, Reply, Sparkles } from 'lucide-react';
import type { Review } from '../../reviews/types/Review';
import { REVIEW_STATUS } from '../../reviews/types/Review';
import { useModeration } from '../hooks/useModeration';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

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
      "bg-white rounded-[2rem] border transition-all duration-500 relative flex flex-col group",
      review.featured ? "border-[#D9A05B]/30 shadow-[0_8px_40px_rgba(217,160,91,0.06)]" : "border-[#EBDDE2]/50 hover:border-[#EBDDE2] hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
    )}>
      
      {/* Featured Ribbon */}
      {review.featured && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D9A05B]/80 to-transparent opacity-80" />
      )}

      {/* Action Hover Header */}
      {!isEditing && (
        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex gap-2">
          {review.featured && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F7] text-[#D9A05B] rounded-full text-[10px] font-semibold tracking-widest uppercase border border-[#EBDDE2]/50">
              <Star className="w-3 h-3 fill-current" /> Destacada
            </div>
          )}
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 text-[#765E68] hover:text-[#301C27] bg-[#FAF7F7] hover:bg-[#F3E4E9]/50 rounded-full transition-colors border border-[#EBDDE2]/50"
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
            <div className="w-16 h-16 rounded-full bg-[#FAF7F7] border border-[#EBDDE2]/50 flex items-center justify-center text-2xl font-display text-[#301C27] shadow-sm">
              {review.client_name.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex flex-col items-center md:items-start">
              <div className="flex gap-0.5 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={clsx(
                      "w-3.5 h-3.5",
                      i < (isEditing ? editRating : review.rating) ? "text-[#301C27] fill-current" : "text-[#EBDDE2]"
                    )} 
                  />
                ))}
              </div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-[#765E68]/60 mt-2">
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
                  className="w-full text-lg font-display text-[#301C27] border-b border-[#EBDDE2] pb-2 focus:outline-none focus:border-[#CF7F9B] bg-transparent"
                  placeholder="Nombre del cliente"
                />
                
                <textarea
                  value={editReviewText}
                  onChange={(e) => setEditReviewText(e.target.value)}
                  className="w-full min-h-[140px] p-4 text-[#301C27] text-[15px] font-light border border-[#EBDDE2] rounded-2xl focus:outline-none focus:border-[#CF7F9B] resize-none bg-[#FAF7F7] leading-relaxed"
                  placeholder="Escribe la reseña..."
                />
                
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    onClick={handleCancelEdit}
                    className="px-5 py-2.5 text-[13px] font-medium text-[#765E68] hover:bg-[#FAF7F7] rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    disabled={edit.isPending}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#301C27] text-white text-[13px] font-medium rounded-xl hover:bg-[#CF7F9B] transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xl font-display font-medium text-[#301C27]">{review.client_name}</h3>
                  {review.is_verified && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-[#765E68] bg-[#FAF7F7] px-2 py-1 rounded-full border border-[#EBDDE2]/50">
                      <Check className="w-3 h-3 text-[#CF7F9B]" /> Verificada
                    </span>
                  )}
                </div>
                
                <p className={clsx(
                  "text-[#301C27] font-light leading-relaxed whitespace-pre-wrap text-[17px] md:text-[19px] tracking-tight",
                  !isExpanded && "line-clamp-4"
                )}>
                  "{review.review_text}"
                </p>
                
                {review.review_text.length > 200 && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 text-[11px] uppercase tracking-widest font-semibold text-[#CF7F9B] hover:text-[#301C27] transition-colors flex items-center gap-1"
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
                    className="w-32 h-32 object-cover rounded-2xl border border-[#EBDDE2]/50 shadow-sm hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                  />
                ))}
              </div>
            )}

            {/* AI Analysis (Collapsible) */}
            {!isEditing && review.ai_review_analysis && (
              <div className="mt-8 border-t border-[#EBDDE2]/30 pt-6">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest font-semibold text-[#765E68]/50 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> IA Sentimiento
                    </span>
                    <span className="text-sm font-medium text-[#301C27] capitalize">{review.ai_review_analysis.sentiment || 'N/A'}</span>
                  </div>
                  <div className="w-px h-8 bg-[#EBDDE2]/50" />
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest font-semibold text-[#765E68]/50 mb-1">Tópicos Clave</span>
                    <span className="text-sm font-light text-[#301C27]">{review.ai_review_analysis.topics?.join(', ') || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Reply Section */}
            {!isEditing && (review.admin_reply || isReplying) && (
              <div className="mt-10 bg-[#FAF7F7] rounded-[1.5rem] p-6 md:p-8 border border-[#EBDDE2]/50 relative group">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#301C27] flex items-center justify-center shrink-0 shadow-md">
                    <span className="text-xs font-bold text-white">K</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-[#301C27]">Karin Makeup Artist</span>
                      {review.admin_reply && !isReplying && (
                        <button 
                          onClick={() => {
                            setReplyText(review.admin_reply || '');
                            setIsReplying(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[#765E68] hover:text-[#CF7F9B] transition-all text-xs font-medium"
                        >
                          Editar respuesta
                        </button>
                      )}
                    </div>
                    
                    {isReplying ? (
                      <div className="space-y-4">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Escribe tu respuesta pública..."
                          className="w-full min-h-[100px] p-4 text-[15px] font-light text-[#301C27] border border-[#EBDDE2] rounded-2xl focus:outline-none focus:border-[#CF7F9B] resize-none bg-white leading-relaxed"
                          autoFocus
                        />
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => {
                              setIsReplying(false);
                              setReplyText(review.admin_reply || '');
                            }}
                            className="px-5 py-2 text-[13px] font-medium text-[#765E68] hover:text-[#301C27] transition-colors"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={handleReplySubmit}
                            disabled={reply.isPending || !replyText.trim()}
                            className="px-6 py-2 bg-[#301C27] text-white text-[13px] font-medium rounded-xl hover:bg-[#CF7F9B] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                          >
                            <Reply className="w-4 h-4" />
                            {review.admin_reply ? 'Actualizar' : 'Responder'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[15px] text-[#765E68] font-light leading-relaxed whitespace-pre-wrap">
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
        <div className="px-8 py-5 border-t border-[#EBDDE2]/30 flex flex-col sm:flex-row justify-between items-center gap-6 bg-[#FAF7F7]/50 rounded-b-[2rem]">
          
          <div className="flex items-center gap-3">
            {isPending && (
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#CF7F9B] flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#CF7F9B] animate-pulse" /> Requiere revisión
              </span>
            )}
            {isApproved && (
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#301C27] flex items-center gap-1.5">
                <Check className="w-3 h-3 text-[#301C27]" /> Publicada
              </span>
            )}
            {review.status === REVIEW_STATUS.REJECTED && (
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#765E68] flex items-center gap-1.5">
                <X className="w-3 h-3 text-[#765E68]" /> Oculta
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isPending && (
              <>
                <button 
                  onClick={() => handleReject()}
                  disabled={reject.isPending}
                  className="px-5 py-2.5 text-[#765E68] hover:text-[#301C27] text-[13px] font-medium rounded-xl hover:bg-[#EBDDE2]/30 transition-colors disabled:opacity-50"
                >
                  Ocultar
                </button>
                <button 
                  onClick={() => handleApprove()}
                  disabled={approve.isPending}
                  className="px-6 py-2.5 bg-[#301C27] text-white text-[13px] font-medium rounded-xl hover:bg-[#CF7F9B] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-[0_4px_12px_rgba(48,28,39,0.1)] hover:shadow-[0_4px_12px_rgba(207,127,155,0.2)]"
                >
                  <Check className="w-4 h-4" /> Aprobar y Publicar
                </button>
              </>
            )}

            {isApproved && (
              <>
                {!review.admin_reply && !isReplying && (
                  <button 
                    onClick={() => setIsReplying(true)}
                    className="px-5 py-2.5 text-[#765E68] hover:text-[#301C27] bg-white border border-[#EBDDE2]/50 hover:border-[#EBDDE2] rounded-xl transition-all flex items-center gap-2 text-[13px] font-medium shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" /> Escribir respuesta
                  </button>
                )}
                <button 
                  onClick={handleFeatureToggle}
                  disabled={toggleFeatured.isPending}
                  className={clsx(
                    "px-5 py-2.5 rounded-xl border transition-all flex items-center gap-2 text-[13px] font-medium",
                    review.featured 
                      ? "bg-[#FAF7F7] text-[#D9A05B] border-[#D9A05B]/30 hover:bg-white" 
                      : "bg-white text-[#765E68] hover:text-[#301C27] border-[#EBDDE2]/50 hover:border-[#EBDDE2] shadow-sm"
                  )}
                >
                  <Star className={clsx("w-4 h-4", review.featured && "fill-current")} /> 
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
