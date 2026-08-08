import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Clock, CheckCircle2, XCircle, Sparkles, Send, TicketCheck } from 'lucide-react';
import { useRecentActivity } from '../../hooks/useRecentActivity';

const TimelineSkeleton = () => (
  <div className="flex flex-col animate-pulse">
    <div className="space-y-6 flex-1">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-[#EBDDE2]/30 shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="w-16 h-2 bg-[#EBDDE2]/50 rounded" />
            <div className="w-32 h-3 bg-[#EBDDE2]/50 rounded" />
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
      case 'review_created': return <MessageSquare className="w-3.5 h-3.5" />;
      case 'review_approved': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'review_rejected': return <XCircle className="w-3.5 h-3.5" />;
      case 'review_featured': return <Sparkles className="w-3.5 h-3.5" />;
      case 'review_replied': return <MessageSquare className="w-3.5 h-3.5" />;
      case 'invitation_sent': return <Send className="w-3.5 h-3.5" />;
      case 'invitation_used': return <TicketCheck className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'review_created': return 'bg-[#301C27]/5 text-[#301C27] border-[#301C27]/10';
      case 'review_approved': return 'bg-white text-[#CF7F9B] border-[#EBDDE2]/50 shadow-[0_2px_8px_rgba(207,127,155,0.05)]';
      case 'review_rejected': return 'bg-white text-[#765E68] border-[#EBDDE2]/50 shadow-[0_2px_8px_rgba(118,94,104,0.05)]';
      case 'review_featured': return 'bg-[#FDFBFB] text-[#D9A05B] border-[#D9A05B]/10';
      case 'review_replied': return 'bg-[#FAF7F7] text-[#301C27] border-[#EBDDE2]/50';
      case 'invitation_sent': return 'bg-[#F3E4E9]/50 text-[#CF7F9B] border-[#F3E4E9]';
      case 'invitation_used': return 'bg-[#FAF7F7] text-[#765E68] border-[#EBDDE2]/50';
      default: return 'bg-[#FAF7F7] text-[#765E68] border-[#EBDDE2]/50';
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <TimelineSkeleton />
        </motion.div>
      ) : (
        <motion.div 
          key="content" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.3 }}
        >
          
          {!recentActivity || recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <Sparkles className="w-6 h-6 text-[#EBDDE2] mb-3" />
              <p className="text-[11px] uppercase tracking-widest font-semibold text-[#765E68]/60 mb-1">Sin Actividad</p>
              <p className="text-xs text-[#765E68]/80 font-light max-w-[200px] leading-relaxed">
                Los eventos de tus clientas aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="relative overflow-y-auto pr-4 custom-scrollbar" style={{ maxHeight: '500px' }}>
              <div className="absolute left-[15px] top-2 bottom-6 w-px bg-gradient-to-b from-[#EBDDE2]/50 via-[#EBDDE2]/30 to-transparent" />
              
              <div className="space-y-6 pb-6">
                {recentActivity.map((item, i) => {
                  const colorClass = getEventColor(item.type);
                  return (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.25, ease: "easeOut" }}
                      className="flex gap-4 relative group"
                    >
                      <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border z-10 transition-transform duration-300 ${colorClass} group-hover:scale-110`}>
                        {getEventIcon(item.type)}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-medium tracking-widest text-[#765E68]/60 uppercase">
                            {new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[13px] font-medium text-[#301C27] mb-0.5 leading-snug">
                          {item.title}
                        </div>
                        <div className="text-[13px] text-[#765E68] font-light leading-snug">
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
