import { Search } from 'lucide-react';
import { clsx } from 'clsx';
import { type Review, REVIEW_STATUS } from '../../reviews/types/Review';

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
    <div className="bg-white p-6 rounded-3xl border border-brand-border flex flex-col md:flex-row justify-between items-center gap-4 mb-8 shadow-sm">
      <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={clsx(
              "px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200",
              currentTab === tab.value
                ? "bg-brand-text text-white shadow-md"
                : "bg-brand-surface text-brand-text-muted hover:bg-brand-border/30 hover:text-brand-text"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative w-full md:w-72">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-brand-text-muted" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por cliente o contenido..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-border bg-brand-surface/50 text-sm font-light text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-text transition-all"
        />
      </div>
    </div>
  );
};
