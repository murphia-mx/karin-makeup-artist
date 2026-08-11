import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share, X, QrCode, MessageCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface InvitationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationUrl: string;
  clientName: string;
  serviceName: string;
  serviceDate: string;
  isNew?: boolean;
}

export const InvitationDetailsModal = ({ 
  isOpen, 
  onClose, 
  invitationUrl, 
  clientName, 
  serviceName,
  serviceDate,
  isNew = false
}: InvitationDetailsModalProps) => {
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<SVGSVGElement>(null);

  if (!isOpen) return null;

  const generatedMessage = `Hola ${clientName} 💕\n\nMuchas gracias por confiar en mí para un momento tan especial. ✨\n\nMe encantaría conocer cómo fue tu experiencia con Karin Makeup Artist.\n\nPuedes compartir tu opinión aquí:\n\n${invitationUrl}\n\nGracias por tu confianza y por permitirme ser parte de tu día. 🤍\n\n— Karin Makeup Artist`;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      toast.success('Mensaje copiado al portapapeles');
    } catch (err) {
      toast.error('Error al copiar el mensaje');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl);
      toast.success('Enlace copiado al portapapeles');
    } catch (err) {
      toast.error('Error al copiar el enlace');
    }
  };

  const handleWhatsApp = () => {
    const encodedMessage = encodeURIComponent(generatedMessage);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Deja tu reseña - Karin Makeup Artist',
          text: generatedMessage,
          url: invitationUrl,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      handleCopyMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-bg/50 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-lg bg-admin-surface rounded-[2rem] shadow-[0_8px_40px_rgba(45,32,37,0.12)] border border-admin-neutral/50 overflow-hidden flex flex-col max-h-[90vh] font-admin-sans"
          >
            <div className="flex justify-between items-center p-7 border-b border-admin-neutral/40 shrink-0">
              <h2 className="text-2xl font-bold text-admin-text tracking-tight">
                {isNew ? 'Invitación Creada' : 'Detalles de Invitación'}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 text-admin-text-muted hover:text-admin-text hover:bg-admin-surface-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-7 overflow-y-auto">
              <div className="mb-8 bg-admin-surface-2 p-5 rounded-2xl border border-admin-neutral/50">
                <h3 className="text-[17px] font-medium text-admin-text mb-1 tracking-wide">{clientName}</h3>
                <p className="text-[15px] font-light text-admin-text-muted">{serviceName}</p>
                <p className="text-[11px] font-bold text-admin-accent-dark tracking-[0.15em] uppercase mt-2">
                  {format(new Date(serviceDate), "d 'de' MMMM, yyyy", { locale: es })}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[13px] font-bold text-admin-text-muted uppercase tracking-[0.15em]">Mensaje sugerido</h4>
                  <button onClick={handleCopyMessage} className="text-xs text-admin-accent-dark hover:text-admin-text font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                    <Copy className="w-3.5 h-3.5" strokeWidth={2} /> Copiar
                  </button>
                </div>
                <div className="bg-admin-surface p-5 rounded-2xl border border-admin-neutral/40 text-[14px] text-admin-text-muted font-light whitespace-pre-wrap leading-relaxed">
                  {generatedMessage}
                </div>
              </div>

              {showQR && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex justify-center mb-8 overflow-hidden"
                >
                  <div className="p-6 bg-white border border-admin-neutral/50 rounded-[2rem] shadow-sm">
                    <QRCodeSVG 
                      value={invitationUrl}
                      size={160}
                      bgColor={"#FFFFFF"}
                      fgColor={"#301C27"}
                      level={"Q"}
                      includeMargin={false}
                      ref={qrRef}
                    />
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col gap-3.5">
                <button 
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#25D366] text-white text-[14px] font-medium rounded-[1.25rem] hover:bg-[#20BD5A] transition-colors shadow-sm tracking-wide"
                >
                  <MessageCircle className="w-5 h-5" strokeWidth={1.5} /> Compartir por WhatsApp
                </button>
                <div className="flex gap-3.5">
                  <button 
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-admin-surface-2 text-admin-text border border-admin-neutral/50 text-[14px] font-medium rounded-[1.25rem] hover:bg-admin-surface hover:border-admin-neutral transition-colors"
                  >
                    <Copy className="w-4 h-4" strokeWidth={1.5} /> Enlace
                  </button>
                  <button 
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-admin-surface-2 text-admin-text border border-admin-neutral/50 text-[14px] font-medium rounded-[1.25rem] hover:bg-admin-surface hover:border-admin-neutral transition-colors"
                  >
                    <Share className="w-4 h-4" strokeWidth={1.5} /> Opciones
                  </button>
                </div>
                
                <button 
                  onClick={() => setShowQR(!showQR)}
                  className="w-full mt-3 py-3 text-[12px] font-bold text-admin-text-muted hover:text-admin-text uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-4 h-4" strokeWidth={1.5} />
                  {showQR ? 'Ocultar código QR' : 'Mostrar código QR'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
