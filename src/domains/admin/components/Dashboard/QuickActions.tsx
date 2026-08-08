import { Send, Inbox, Star, Settings, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

const actions = [
  { label: 'Invitar clienta', icon: Send, href: '/admin/invitations', primary: true },
  { label: 'Leer opiniones', icon: Inbox, href: '/admin/moderation' },
  { label: 'Lo mejor de ti', icon: Star, href: '/admin/moderation?filter=featured' },
  { label: 'Configuración', icon: Settings, href: '/admin/settings' },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3">
      {actions.map((action, i) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          onClick={() => navigate(action.href)}
          className={clsx(
            "group flex items-center justify-between p-4 rounded-[1.25rem] transition-all duration-300 w-full",
            action.primary 
              ? "bg-[#301C27] text-white hover:bg-[#CF7F9B] hover:shadow-[0_4px_16px_rgba(207,127,155,0.2)]" 
              : "bg-white border border-[#EBDDE2]/50 hover:border-[#EBDDE2] text-[#301C27] hover:bg-[#FAF7F7]"
          )}
        >
          <div className="flex items-center gap-4">
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              action.primary ? "bg-white/10 text-white group-hover:bg-white/20" : "bg-[#FAF7F7] text-[#765E68] group-hover:text-[#CF7F9B]"
            )}>
              <action.icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-[13px] font-medium tracking-wide">{action.label}</span>
          </div>
          <ChevronRight className={clsx(
            "w-4 h-4 transition-transform group-hover:translate-x-1",
            action.primary ? "text-white/50" : "text-[#765E68]/30"
          )} />
        </motion.button>
      ))}
    </div>
  );
};
