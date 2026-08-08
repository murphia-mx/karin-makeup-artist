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
            className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white rounded-2xl border border-[#EBDDE2]/50 hover:border-[#EBDDE2] hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 gap-4 relative"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F7] border border-[#EBDDE2]/50 flex items-center justify-center text-lg font-display text-[#301C27] shrink-0">
                {inv.client_name.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <h4 className="text-[15px] font-medium text-[#301C27]">{inv.client_name}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-[13px] font-light text-[#765E68]">
                    {inv.service_name || 'Servicio General'}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#EBDDE2]" />
                  <span className="text-[13px] font-light text-[#765E68]">
                    {inv.service_date 
                      ? format(new Date(inv.service_date), "d MMM yyyy", { locale: es })
                      : format(new Date(inv.created_at), "d MMM yyyy", { locale: es })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:ml-auto">
              {isUsed ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-[#FAF7F7] text-[#301C27] border border-[#EBDDE2]/50 rounded-full text-[10px] font-semibold tracking-widest uppercase">
                  <Check className="w-3 h-3" /> Reseña recibida
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F3E4E9]/30 text-[#CF7F9B] border border-[#CF7F9B]/20 rounded-full text-[10px] font-semibold tracking-widest uppercase">
                  <Clock className="w-3 h-3" /> Pendiente
                </span>
              )}
              
              <div className="relative">
                <button 
                  onClick={() => setOpenMenuId(openMenuId === inv.id ? null : inv.id)}
                  className="p-2 text-[#765E68] hover:text-[#301C27] hover:bg-[#FAF7F7] rounded-full transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {openMenuId === inv.id && (
                  <div 
                    ref={menuRef}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#EBDDE2]/50 py-1 z-10"
                  >
                    <button
                      onClick={() => {
                        onOpenDetails(inv);
                        setOpenMenuId(null);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#301C27] hover:bg-[#FAF7F7] transition-colors"
                    >
                      <Eye className="w-4 h-4 text-[#CF7F9B]" /> Ver invitación
                    </button>
                    <button
                      onClick={() => handleCopyLink(inv)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#301C27] hover:bg-[#FAF7F7] transition-colors"
                    >
                      <Link className="w-4 h-4 text-[#CF7F9B]" /> Copiar enlace
                    </button>
                    <button
                      onClick={() => handleCopyMessage(inv)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#301C27] hover:bg-[#FAF7F7] transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-[#CF7F9B]" /> Copiar mensaje
                    </button>
                    {navigator.share && (
                      <button
                        onClick={() => handleShare(inv)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#301C27] hover:bg-[#FAF7F7] transition-colors"
                      >
                        <Share className="w-4 h-4 text-[#CF7F9B]" /> Compartir
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
