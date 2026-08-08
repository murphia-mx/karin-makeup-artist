import { Send, Inbox, Star, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const actions = [
  { label: 'Invitar clienta', icon: Send, href: '/admin/invitations', color: 'text-white', bg: 'bg-[#D99AA8]', border: 'border-transparent' },
  { label: 'Leer opiniones', icon: Inbox, href: '/admin/moderation', color: 'text-[#3D2C2C]', bg: 'bg-[#FDFBFB]', border: 'border-[#EFE7E4]' },
  { label: 'Lo mejor de ti', icon: Star, href: '/admin/moderation?filter=featured', color: 'text-[#E5B25D]', bg: 'bg-[#FDFBFB]', border: 'border-[#EFE7E4]' },
  { label: 'Configuración', icon: Settings, href: '/admin/settings', color: 'text-[#7A6B67]', bg: 'bg-[#FDFBFB]', border: 'border-[#EFE7E4]' },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, i) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => navigate(action.href)}
          className={`flex items-center gap-4 p-4 rounded-2xl border ${action.border} ${action.bg === 'bg-[#D99AA8]' ? 'bg-[#D99AA8] text-white hover:bg-[#C88A98]' : 'bg-white hover:border-[#D99AA8]/30'} shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group`}
        >
          <div className={`w-10 h-10 shrink-0 rounded-xl ${action.bg} flex items-center justify-center border ${action.border} group-hover:scale-110 transition-transform duration-300`}>
            <action.icon className={`w-5 h-5 ${action.color}`} />
          </div>
          <span className={`text-sm font-medium text-left ${action.bg === 'bg-[#D99AA8]' ? 'text-white' : 'text-[#3D2C2C]'}`}>{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
};
