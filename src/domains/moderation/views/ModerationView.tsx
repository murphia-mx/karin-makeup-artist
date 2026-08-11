import { useState } from 'react';
import { ModerationHeader } from '../components/ModerationHeader';
import { ModerationCard } from '../components/ModerationCard';
import { useModerationQuery } from '../hooks/useModerationQuery';
import { Inbox } from 'lucide-react';
import { REVIEW_STATUS } from '../../reviews/types/Review';
import type { Review } from '../../reviews/types/Review';
import { DashboardSkeleton } from '../../../components/ui/Skeletons/DashboardSkeleton';

export const ModerationView = () => {
  const [activeTab, setActiveTab] = useState<Review['status'] | 'all'>(REVIEW_STATUS.PENDING);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, error } = useModerationQuery(activeTab, { 
    search: searchQuery,
    limit: 20,
    offset: 0
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-admin-accent-dark">
        <p>Ocurrió un error al cargar las reseñas.</p>
        <p className="text-[13px] opacity-70">{error?.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto font-admin-sans">
      <div className="mb-14">
        <h1 className="text-4xl md:text-5xl font-bold text-admin-text mb-4 tracking-tight leading-tight">Centro de Moderación</h1>
        <p className="text-admin-text-muted font-light text-[17px] tracking-wide">
          Administra las reseñas, responde a clientas y destaca las mejores opiniones.
        </p>
      </div>

      <ModerationHeader 
        currentTab={activeTab} 
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {isLoading ? (
        <div className="space-y-6">
          <DashboardSkeleton />
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="space-y-10">
          {data.data.map(review => (
            <ModerationCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-admin-surface-2/30 rounded-[2.5rem] border border-admin-neutral/40 border-dashed">
          <div className="w-20 h-20 bg-admin-surface rounded-full flex items-center justify-center mb-6 shadow-sm border border-admin-neutral/40">
            <Inbox className="w-8 h-8 text-admin-neutral" strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-bold text-admin-text mb-3">Bandeja Vacía</h3>
          <p className="text-admin-text-muted font-light text-center max-w-md leading-relaxed tracking-wide text-[15px]">
            No hay reseñas que coincidan con tu búsqueda actual o filtro seleccionado. ¡Todo está al día!
          </p>
        </div>
      )}
    </div>
  );
};
