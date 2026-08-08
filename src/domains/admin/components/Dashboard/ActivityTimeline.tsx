import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Clock, CheckCircle2, XCircle, Sparkles, Send, TicketCheck } from 'lucide-react';
import { useRecentActivity } from '../../hooks/useRecentActivity';

const TimelineSkeleton = () => (
  <div className="bg-white rounded-[1.5rem] p-8 border border-[#EFE7E4] shadow-[0_4px_20px_rgba(0,0,0,0.01)] h-full animate-pulse mt-8 xl:mt-0 flex flex-col">
    <div className="w-32 h-4 bg-[#EFE7E4] rounded mb-8" />
    <div className="space-y-8 flex-1">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-[#FDFBFB] border border-[#EFE7E4] shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="w-20 h-2 bg-[#EFE7E4] rounded" />
            <div className="w-40 h-3 bg-[#EFE7E4] rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ActivityTimeline = () => {
  const { data: recentActivity, isLoading } = useRecentActivity();

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'review_created': return <MessageSquare className="w-4 h-4" />;
      case 'review_approved': return <CheckCircle2 className="w-4 h-4" />;
      case 'review_rejected': return <XCircle className="w-4 h-4" />;
      case 'review_featured': return <Sparkles className="w-4 h-4" />;
      case 'review_replied': return <MessageSquare className="w-4 h-4" />;
      case 'invitation_sent': return <Send className="w-4 h-4" />;
      case 'invitation_used': return <TicketCheck className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'review_created': return 'bg-blue-50/50 text-blue-500 border-blue-100';
      case 'review_approved': return 'bg-emerald-50/50 text-emerald-500 border-emerald-100';
      case 'review_rejected': return 'bg-rose-50/50 text-rose-400 border-rose-100';
      case 'review_featured': return 'bg-[#D99AA8]/5 text-[#D99AA8] border-[#D99AA8]/20';
      case 'review_replied': return 'bg-purple-50/50 text-purple-500 border-purple-100';
      case 'invitation_sent': return 'bg-amber-50/50 text-amber-500 border-amber-100';
      case 'invitation_used': return 'bg-teal-50/50 text-teal-500 border-teal-100';
      default: return 'bg-[#FDFBFB] text-[#7A6B67] border-[#EFE7E4]';
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
          <TimelineSkeleton />
        </motion.div>
      ) : (
        <motion.div 
          key="content" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.3 }}
          className="bg-white rounded-[1.5rem] p-8 border border-[#EFE7E4] shadow-[0_4px_20px_rgba(0,0,0,0.01)] h-full mt-8 xl:mt-0 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8 shrink-0">
            <h3 className="text-lg font-medium text-[#3D2C2C]">Lo que acaba de pasar</h3>
          </div>
          
          {!recentActivity || recentActivity.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#EFE7E4] rounded-2xl bg-[#FDFBFB]">
              <Sparkles className="w-8 h-8 text-[#D99AA8]/30 mb-4" />
              <p className="text-sm font-medium text-[#3D2C2C] mb-1">Todo tranquilo por ahora</p>
              <p className="text-xs text-[#7A6B67] font-light max-w-xs leading-relaxed">
                Aquí verás un registro de las nuevas opiniones, invitaciones y todo lo que ocurre con tus clientas.
              </p>
            </div>
          ) : (
            <div 
              className="relative flex-1 overflow-y-auto pr-4 custom-scrollbar" 
              style={{ 
                maxHeight: 'calc(100vh - 280px)',
                maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
              }}
            >
              <div className="absolute left-[19px] top-4 bottom-12 w-px bg-[#EFE7E4]" />
              
              <div className="space-y-6 pb-12">
                {recentActivity.map((item, i) => {
                  const colorClass = getEventColor(item.type);
                  return (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.25, ease: "easeOut" }}
                      className="flex gap-4 relative group cursor-pointer"
                    >
                      <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border z-10 transition-all duration-300 ${colorClass} group-hover:shadow-sm group-hover:scale-110 group-hover:bg-white`}>
                        {getEventIcon(item.type)}
                      </div>
                      <div className="pt-2 pb-2 flex-1 border-b border-transparent group-hover:border-[#EFE7E4]/50 transition-colors">
                        <div className="text-[10px] font-medium tracking-wider text-[#D99AA8] uppercase mb-1">
                          {new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-sm font-medium text-[#3D2C2C] mb-0.5 group-hover:text-[#D99AA8] transition-colors">
                          {item.title}
                        </div>
                        <div className="text-sm text-[#5A4A4A] font-light">
                          {item.description || 'Evento registrado en el sistema.'}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
