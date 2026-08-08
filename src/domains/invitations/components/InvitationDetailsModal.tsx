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

  const generatedMessage = `Hola ${clientName} 💕

Muchas gracias por confiar en mí para un momento tan especial. ✨

Me encantaría conocer cómo fue tu experiencia con Karin Makeup Artist.

Puedes compartir tu opinión aquí:

${invitationUrl}

Gracias por tu confianza y por permitirme ser parte de tu día. 🤍

— Karin Makeup Artist`;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#301C27]/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-lg bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-6 border-b border-[#EBDDE2]/30 shrink-0">
              <h2 className="text-xl font-display font-medium text-[#301C27]">
                {isNew ? 'Invitación Creada' : 'Detalles de Invitación'}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 text-[#765E68] hover:text-[#301C27] hover:bg-[#FAF7F7] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="mb-6 bg-[#FAF7F7] p-4 rounded-2xl border border-[#EBDDE2]/50">
                <h3 className="text-base font-medium text-[#301C27]">{clientName}</h3>
                <p className="text-sm font-light text-[#765E68]">{serviceName}</p>
                <p className="text-[11px] font-medium text-[#CF7F9B] tracking-wider uppercase mt-1">
                  {format(new Date(serviceDate), "d 'de' MMMM, yyyy", { locale: es })}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-[#301C27]">Mensaje para tu clienta</h4>
                  <button onClick={handleCopyMessage} className="text-xs text-[#CF7F9B] hover:text-[#D97C98] font-medium flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Copiar
                  </button>
                </div>
                <div className="bg-[#FDF9FA] p-4 rounded-2xl border border-[#EBDDE2]/30 text-sm text-[#765E68] font-light whitespace-pre-wrap leading-relaxed">
                  {generatedMessage}
                </div>
              </div>

              {showQR && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex justify-center mb-6 overflow-hidden"
                >
                  <div className="p-6 bg-white border border-[#EBDDE2]/50 rounded-[2rem] shadow-sm">
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

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] text-white text-sm font-medium rounded-xl hover:bg-[#20BD5A] transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" /> Compartir por WhatsApp
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#FAF7F7] text-[#301C27] border border-[#EBDDE2]/50 text-sm font-medium rounded-xl hover:bg-white hover:border-[#EBDDE2] transition-colors"
                  >
                    <Copy className="w-4 h-4" /> Copiar enlace
                  </button>
                  <button 
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#FAF7F7] text-[#301C27] border border-[#EBDDE2]/50 text-sm font-medium rounded-xl hover:bg-white hover:border-[#EBDDE2] transition-colors"
                  >
                    <Share className="w-4 h-4" /> Más opciones
                  </button>
                </div>
                
                <button 
                  onClick={() => setShowQR(!showQR)}
                  className="w-full mt-2 py-2 text-xs font-medium text-[#A8929D] hover:text-[#765E68] transition-colors flex items-center justify-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
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
