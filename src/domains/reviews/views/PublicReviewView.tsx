import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, XCircle, Clock, Heart } from 'lucide-react';
import { InvitationService } from '../../invitations/services/InvitationService';
import { PublicReviewForm } from '../components/PublicReviewForm';

type ValidationState = 'loading' | 'valid' | 'used' | 'expired' | 'invalid' | 'success';

export const PublicReviewView = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [state, setState] = useState<ValidationState>('loading');
  const [clientData, setClientData] = useState<{ client_name: string; service_id: string } | null>(null);

  useEffect(() => {
    if (!token) {
      setState('invalid');
      return;
    }

    const validate = async () => {
      try {
        const { status, data } = await InvitationService.validateToken(token);
        setState(status);
        if (data) {
          setClientData({
            client_name: data.client_name,
            service_id: data.service_id,
          });
        }
      } catch (err) {
        setState('invalid');
      }
    };

    validate();
  }, [token]);

  const handleSuccess = () => {
    setState('success');
  };

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center animate-pulse gap-4 text-[#D97C98]">
            <Heart className="w-8 h-8 animate-bounce" />
            <span className="text-xs tracking-[0.2em] uppercase font-semibold">Cargando...</span>
          </div>
        );
      
      case 'valid':
        if (!clientData) return null;
        return (
          <PublicReviewForm 
            invitationId={token!}
            clientName={clientData.client_name}
            serviceId={clientData.service_id}
            onSuccess={handleSuccess}
          />
        );

      case 'used':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-[#FAF7F7] rounded-full flex items-center justify-center mx-auto mb-6 text-[#D97C98]">
              <Heart className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-display text-[#301C27] mb-2">Esta invitación ya fue utilizada <span className="text-[#D97C98]">♡</span></h1>
            <p className="text-[#765E68] font-light">Gracias por compartir tu experiencia con Karin.</p>
          </motion.div>
        );

      case 'expired':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-[#FAF7F7] rounded-full flex items-center justify-center mx-auto mb-6 text-[#A8929D]">
              <Clock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-display text-[#301C27] mb-2">Esta invitación ha expirado</h1>
            <p className="text-[#765E68] font-light">Si necesitas ayuda, puedes contactar a Karin Makeup Artist.</p>
          </motion.div>
        );

      case 'invalid':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-[#FDF9FA] rounded-full flex items-center justify-center mx-auto mb-6 text-[#CF7F9B]">
              <XCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-display text-[#301C27] mb-2">Esta invitación no es válida</h1>
            <p className="text-[#765E68] font-light">El enlace parece ser incorrecto o estar dañado.</p>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-[#FAF7F7] rounded-full flex items-center justify-center mx-auto mb-6 text-[#D97C98]">
              <Check className="w-10 h-10" />
            </div>
            <h1 className="text-[32px] font-display text-[#301C27] mb-3">¡Gracias, {clientData?.client_name}! <span className="text-[#D97C98]">♡</span></h1>
            <p className="text-[17px] text-[#765E68] font-light">Tu experiencia significa muchísimo para Karin.</p>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <header className="py-8 px-6 text-center shrink-0">
        <h2 className="text-xl tracking-[0.2em] font-light text-[#301C27] uppercase">Karin Makeup Artist</h2>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        {renderContent()}
      </main>

      <footer className="py-8 text-center text-xs text-[#A8929D] font-light shrink-0">
        © {new Date().getFullYear()} Karin Makeup Artist
      </footer>
    </div>
  );
};
