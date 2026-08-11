import { Send, Inbox, Star, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

const actions = [
  { label: 'Invitar clienta', icon: Send, href: '/admin/invitations', primary: true },
  { label: 'Leer opiniones', icon: Inbox, href: '/admin/moderation' },
  { label: 'Lo mejor de ti', icon: Star, href: '/admin/moderation?filter=featured' },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      {actions.map((action, i) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => navigate(action.href)}
          className={clsx(
            "group flex items-center justify-between p-5 rounded-2xl transition-all duration-300 w-full min-h-[64px] active:scale-[0.98]",
            action.primary 
              ? "bg-gradient-to-r from-admin-accent to-admin-accent-light text-white shadow-[0_8px_24px_rgba(217,95,134,0.3)] hover:shadow-[0_12px_32px_rgba(217,95,134,0.4)] hover:-translate-y-0.5 border border-admin-accent-light/50" 
              : "bg-admin-surface border border-admin-border hover:border-admin-accent-soft hover:bg-admin-surface-2 text-admin-text"
          )}
        >
          <div className="flex items-center gap-4">
            <div className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              action.primary ? "bg-white/10 text-white group-hover:bg-white/20" : "bg-admin-surface-2 text-admin-text-muted group-hover:text-admin-accent-dark"
            )}>
              <action.icon className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <span className="text-[14px] font-medium tracking-wide">{action.label}</span>
          </div>
          <ChevronRight className={clsx(
            "w-4 h-4 transition-transform group-hover:translate-x-1",
            action.primary ? "text-white/50" : "text-admin-text-muted/40"
          )} strokeWidth={1.5} />
        </motion.button>
      ))}
    </div>
  );
};
