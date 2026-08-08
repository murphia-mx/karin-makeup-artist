import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, Scissors, ImageIcon, Globe, Tag, Palette, 
  CalendarClock, Star, ChevronRight
} from 'lucide-react';

export interface WorkspaceSection {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeType?: 'neutral' | 'success' | 'warning';
}

interface WorkspaceCardProps {
  section: WorkspaceSection;
  index: number;
}

const ICON_COLORS: Record<string, string> = {
  'business':   'text-[#D99AA8] bg-[#FDF8F8]',
  'services':   'text-[#C9A98A] bg-[#FDF9F5]',
  'gallery':    'text-[#B58EA0] bg-[#FAF7FA]',
  'landing':    'text-[#6B7B8D] bg-[#F7F8FA]',
  'promotions': 'text-amber-500 bg-amber-50/50',
  'appearance': 'text-[#8DAA91] bg-[#F5FAF6]',
  'bookings':   'text-indigo-400 bg-indigo-50/50',
  'reviews':    'text-[#D99AA8] bg-[#FDF8F8]',
};

const BADGE_STYLES: Record<string, string> = {
  neutral: 'bg-[#F3EDE8] text-[#7A6B67]',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
};

export const WorkspaceCard = ({ section, index }: WorkspaceCardProps) => {
  const Icon = section.icon;
  const colorClass = ICON_COLORS[section.id] || ICON_COLORS['business'];
  const badgeStyle = BADGE_STYLES[section.badgeType || 'neutral'];
  const location = useLocation();
  const isActive = location.pathname.startsWith(section.href);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: 'easeOut' }}
    >
      <Link
        to={section.href}
        className={`
          group block bg-white rounded-[1.5rem] p-6 
          border transition-all duration-300
          hover:shadow-[0_12px_48px_rgba(61,44,44,0.07)]
          hover:-translate-y-0.5
          ${isActive 
            ? 'border-[#D99AA8]/40 shadow-[0_4px_20px_rgba(217,154,168,0.1)]' 
            : 'border-[#EFE7E4] shadow-[0_4px_20px_rgba(0,0,0,0.01)]'}
        `}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          {section.badge && (
            <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${badgeStyle}`}>
              {section.badge}
            </span>
          )}
        </div>

        <h3 className="text-sm font-medium text-[#3D2C2C] mb-1">{section.name}</h3>
        <p className="text-xs font-light text-[#7A6B67] leading-relaxed">{section.description}</p>

        <div className="mt-4 flex items-center gap-1 text-[#D99AA8] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-xs font-medium">Editar</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </Link>
    </motion.div>
  );
};

export const WORKSPACE_SECTIONS: WorkspaceSection[] = [
  {
    id: 'business',
    name: 'Mi Negocio',
    description: 'Nombre, descripción, contacto y redes sociales',
    icon: Building2,
    href: '/admin/workspace/business',
  },
  {
    id: 'services',
    name: 'Servicios',
    description: 'Crea, edita y reordena lo que ofreces',
    icon: Scissors,
    href: '/admin/workspace/services',
  },
  {
    id: 'gallery',
    name: 'Galería',
    description: 'Tus mejores trabajos, organizados',
    icon: ImageIcon,
    href: '/admin/workspace/gallery',
  },
  {
    id: 'landing',
    name: 'Landing',
    description: 'El contenido de tu página pública',
    icon: Globe,
    href: '/admin/workspace/landing',
  },
  {
    id: 'promotions',
    name: 'Promociones',
    description: 'Crea y activa ofertas especiales',
    icon: Tag,
    href: '/admin/workspace/promotions',
  },
  {
    id: 'appearance',
    name: 'Apariencia',
    description: 'Tema, colores y foto de portada',
    icon: Palette,
    href: '/admin/workspace/appearance',
  },
  {
    id: 'bookings',
    name: 'Reservas',
    description: 'Horarios, descansos y disponibilidad',
    icon: CalendarClock,
    href: '/admin/workspace/bookings',
  },
  {
    id: 'reviews',
    name: 'Reseñas',
    description: 'Cómo se muestran las opiniones',
    icon: Star,
    href: '/admin/workspace/reviews-settings',
  },
];
