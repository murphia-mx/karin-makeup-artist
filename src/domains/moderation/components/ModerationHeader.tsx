import { Search } from 'lucide-react';
import { clsx } from 'clsx';
import { type Review, REVIEW_STATUS } from '../../reviews/types/Review';
import { motion } from 'framer-motion';

interface ModerationHeaderProps {
  currentTab: Review['status'] | 'all';
  onTabChange: (tab: Review['status'] | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ModerationHeader = ({ currentTab, onTabChange, searchQuery, onSearchChange }: ModerationHeaderProps) => {
  const tabs: { value: Review['status'] | 'all'; label: string }[] = [
    { value: REVIEW_STATUS.PENDING, label: 'Pendientes' },
    { value: REVIEW_STATUS.APPROVED, label: 'Aprobadas' },
    { value: REVIEW_STATUS.REJECTED, label: 'Rechazadas' },
    { value: REVIEW_STATUS.SPAM, label: 'Spam' },
    { value: 'all', label: 'Todas' },
  ];

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 font-admin-sans">
      
      {/* Segmented Control */}
      <div className="flex p-1.5 bg-admin-surface-2/60 rounded-[1.25rem] w-full lg:w-auto overflow-x-auto hide-scrollbar border border-admin-neutral/40">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={clsx(
                "relative px-6 py-2.5 rounded-[1rem] text-[13px] font-medium transition-colors duration-300 whitespace-nowrap tracking-wide shrink-0",
                isActive ? "text-admin-text" : "text-admin-text-muted hover:text-admin-text"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabModeration"
                  className="absolute inset-0 bg-admin-surface rounded-[1rem] shadow-[0_2px_10px_rgba(45,32,37,0.04)] border border-admin-neutral/40"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative w-full lg:w-80 group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-admin-text-muted/60 group-focus-within:text-admin-accent-dark transition-colors" strokeWidth={1.5} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar reseña o clienta..."
          className="w-full pl-12 pr-5 py-3.5 rounded-2xl border border-admin-neutral/40 bg-admin-surface text-[14px] font-light text-admin-text focus:outline-none focus:border-admin-neutral focus:shadow-[0_4px_20px_rgba(45,32,37,0.03)] transition-all placeholder-admin-text-muted/50"
        />
      </div>
    </div>
  );
};
