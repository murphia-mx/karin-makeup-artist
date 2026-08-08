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
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
      
      {/* iOS Segmented Control */}
      <div className="flex p-1 bg-[#EBDDE2]/40 rounded-[1.25rem] w-full lg:w-auto overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={clsx(
                "relative px-6 py-2.5 rounded-2xl text-[13px] font-medium transition-colors duration-300 whitespace-nowrap",
                isActive ? "text-[#301C27]" : "text-[#765E68] hover:text-[#301C27]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabModeration"
                  className="absolute inset-0 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
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
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-[#765E68]/60 group-focus-within:text-[#CF7F9B] transition-colors" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar reseña o clienta..."
          className="w-full pl-11 pr-4 py-3 rounded-[1.25rem] border border-[#EBDDE2]/50 bg-white text-[13px] font-light text-[#301C27] focus:outline-none focus:border-[#EBDDE2] focus:shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all placeholder-[#765E68]/50"
        />
      </div>
    </div>
  );
};
