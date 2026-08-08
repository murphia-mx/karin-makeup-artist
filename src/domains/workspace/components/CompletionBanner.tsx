import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { CompletionItem } from '../types/WorkspaceConfig';

interface CompletionBannerProps {
  percent: number;
  pendingItems: CompletionItem[];
}

export const CompletionBanner = ({ percent, pendingItems }: CompletionBannerProps) => {
  if (percent === 100) return null;

  const visibleItems = pendingItems.filter(i => !i.completed).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white border border-[#EFE7E4] rounded-[1.5rem] p-6 mb-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#EFE7E4" strokeWidth="3" />
                <motion.circle
                  cx="18" cy="18" r="15.9"
                  fill="none"
                  stroke="#D99AA8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${percent} ${100 - percent}`}
                  strokeDashoffset="0"
                  initial={{ strokeDasharray: '0 100' }}
                  animate={{ strokeDasharray: `${percent} ${100 - percent}` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-[#3D2C2C]">
                {percent}%
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#3D2C2C]">
                Tu negocio está listo al {percent}%
              </p>
              <p className="text-xs font-light text-[#7A6B67]">
                {pendingItems.filter(i => !i.completed).length === 1
                  ? 'Solo falta un detalle más'
                  : `${pendingItems.filter(i => !i.completed).length} detalles para completar tu perfil`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {visibleItems.map((item) => (
              <Link
                key={item.field}
                to={item.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FDFBFB] border border-[#EFE7E4] text-xs font-light text-[#7A6B67] hover:border-[#D99AA8]/40 hover:text-[#3D2C2C] transition-all duration-200 group"
              >
                <span className="w-1 h-1 rounded-full bg-amber-300" />
                {item.label}
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1 bg-[#EFE7E4] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#D99AA8] to-[#C9A98A] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </motion.div>
  );
};
