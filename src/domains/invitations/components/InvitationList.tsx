import { MoreHorizontal, Check, Clock, Eye, Link, MessageCircle, Share } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useRef, useEffect } from 'react';
import type { Invitation } from '../types/Invitation';
import { toast } from 'sonner';

interface InvitationListProps {
  invitations: Invitation[];
  onOpenDetails: (invitation: Invitation) => void;
}

export const InvitationList = ({ invitations, onOpenDetails }: InvitationListProps) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyLink = async (inv: Invitation) => {
    const url = `${window.location.origin}/leave-review?token=${inv.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado al portapapeles');
    } catch (err) {
      toast.error('Error al copiar el enlace');
    }
    setOpenMenuId(null);
  };

  const handleCopyMessage = async (inv: Invitation) => {
    const url = `${window.location.origin}/leave-review?token=${inv.id}`;
    const generatedMessage = `Hola ${inv.client_name} 💕\n\nMuchas gracias por confiar en mí para un momento tan especial. ✨\n\nMe encantaría conocer cómo fue tu experiencia con Karin Makeup Artist.\n\nPuedes compartir tu opinión aquí:\n\n${url}\n\nGracias por tu confianza y por permitirme ser parte de tu día. 🤍\n\n— Karin Makeup Artist`;
    
    try {
      await navigator.clipboard.writeText(generatedMessage);
      toast.success('Mensaje copiado al portapapeles');
    } catch (err) {
      toast.error('Error al copiar el mensaje');
    }
    setOpenMenuId(null);
  };

  const handleShare = async (inv: Invitation) => {
    const url = `${window.location.origin}/leave-review?token=${inv.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Deja tu reseña - Karin Makeup Artist',
          url,
        });
      } catch (err) {}
    } else {
      handleCopyLink(inv);
    }
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-4">
      {invitations.map((inv) => {
        const isUsed = inv.used;
        
        return (
          <div 
            key={inv.id} 
            className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-admin-surface rounded-2xl border border-admin-neutral/40 hover:border-admin-neutral hover:shadow-[0_4px_20px_rgba(45,32,37,0.03)] transition-all duration-300 gap-4 relative"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-admin-surface-2 border border-admin-neutral/40 flex items-center justify-center text-lg font-bold text-admin-text shrink-0">
                {inv.client_name.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <h4 className="text-[16px] font-medium text-admin-text tracking-wide">{inv.client_name}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="text-[14px] font-light text-admin-text-muted">
                    {inv.service_name || 'Servicio General'}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-admin-neutral" />
                  <span className="text-[14px] font-light text-admin-text-muted">
                    {inv.service_date 
                      ? format(new Date(inv.service_date), "d MMM yyyy", { locale: es })
                      : format(new Date(inv.created_at), "d MMM yyyy", { locale: es })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-admin-neutral/40 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                {isUsed ? (
                  <span className="flex items-center justify-center gap-2 px-3 py-1.5 bg-admin-surface-2 text-admin-text border border-admin-neutral/40 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase flex-1 sm:flex-none">
                    <Check className="w-3.5 h-3.5" strokeWidth={2} /> Reseña recibida
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 px-3 py-1.5 bg-admin-accent-soft/30 text-admin-accent-dark border border-admin-accent-soft/50 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase flex-1 sm:flex-none">
                    <Clock className="w-3.5 h-3.5" strokeWidth={2} /> Pendiente
                  </span>
                )}
              </div>
              
              {/* Desktop Dropdown / Mobile Action Row */}
              <div className="hidden sm:block relative">
                <button 
                  onClick={() => setOpenMenuId(openMenuId === inv.id ? null : inv.id)}
                  className="p-2 text-admin-text-muted hover:text-admin-text hover:bg-admin-surface-2 rounded-full transition-colors active:scale-95"
                >
                  <MoreHorizontal className="w-5 h-5" strokeWidth={1.5} />
                </button>

                {openMenuId === inv.id && (
                  <div 
                    ref={menuRef}
                    className="absolute right-0 top-full mt-2 w-52 bg-admin-surface rounded-2xl shadow-[0_8px_30px_rgba(45,32,37,0.12)] border border-admin-neutral/50 py-1.5 z-10"
                  >
                    <button
                      onClick={() => {
                        onOpenDetails(inv);
                        setOpenMenuId(null);
                      }}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-[14px] font-medium text-admin-text hover:bg-admin-surface-2 transition-colors"
                    >
                      <Eye className="w-4 h-4 text-admin-accent-dark" strokeWidth={1.5} /> Ver invitación
                    </button>
                    <button
                      onClick={() => handleCopyLink(inv)}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-[14px] font-medium text-admin-text hover:bg-admin-surface-2 transition-colors"
                    >
                      <Link className="w-4 h-4 text-admin-accent-dark" strokeWidth={1.5} /> Copiar enlace
                    </button>
                    <button
                      onClick={() => handleCopyMessage(inv)}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-[14px] font-medium text-admin-text hover:bg-admin-surface-2 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-admin-accent-dark" strokeWidth={1.5} /> Copiar mensaje
                    </button>
                    {typeof navigator.share === 'function' && (
                      <button
                        onClick={() => handleShare(inv)}
                        className="w-full flex items-center gap-3 px-5 py-2.5 text-[14px] font-medium text-admin-text hover:bg-admin-surface-2 transition-colors"
                      >
                        <Share className="w-4 h-4 text-admin-accent-dark" strokeWidth={1.5} /> Compartir
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Always-Visible Actions */}
              <div className="flex sm:hidden items-center justify-between gap-2 mt-2">
                <button
                  onClick={() => onOpenDetails(inv)}
                  className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] flex-1 rounded-xl bg-admin-surface-2 border border-admin-neutral/40 hover:bg-admin-neutral/20 text-admin-text transition-colors active:scale-95 py-2 gap-1"
                >
                  <Eye className="w-4 h-4" strokeWidth={2} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-admin-text-muted">Ver</span>
                </button>
                <button
                  onClick={() => handleCopyLink(inv)}
                  className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] flex-1 rounded-xl bg-admin-surface-2 border border-admin-neutral/40 hover:bg-admin-neutral/20 text-admin-text transition-colors active:scale-95 py-2 gap-1"
                >
                  <Link className="w-4 h-4" strokeWidth={2} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-admin-text-muted">Enlace</span>
                </button>
                <button
                  onClick={() => handleCopyMessage(inv)}
                  className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] flex-1 rounded-xl bg-admin-surface-2 border border-admin-neutral/40 hover:bg-admin-neutral/20 text-admin-text transition-colors active:scale-95 py-2 gap-1"
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={2} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-admin-text-muted">Msj</span>
                </button>
                {typeof navigator.share === 'function' && (
                  <button
                    onClick={() => handleShare(inv)}
                    className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] flex-1 rounded-xl bg-admin-surface-2 border border-admin-neutral/40 hover:bg-admin-neutral/20 text-admin-text transition-colors active:scale-95 py-2 gap-1"
                  >
                    <Share className="w-4 h-4" strokeWidth={2} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-admin-text-muted">Comp</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
