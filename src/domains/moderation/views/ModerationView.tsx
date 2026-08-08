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
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <p>Ocurrió un error al cargar las reseñas.</p>
        <p className="text-sm opacity-70">{error?.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-brand-text mb-2 tracking-wide">Centro de Moderación</h1>
        <p className="text-brand-text-muted font-light">
          Administra las reseñas, responde a clientes y destaca las mejores opiniones.
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
        <div className="space-y-6">
          {data.data.map(review => (
            <ModerationCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-brand-border shadow-sm">
          <div className="w-16 h-16 bg-brand-surface rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-brand-text-muted" />
          </div>
          <h3 className="text-xl font-medium text-brand-text mb-2">Bandeja Vacía</h3>
          <p className="text-brand-text-muted font-light text-center max-w-sm">
            No hay reseñas que coincidan con tu búsqueda actual o filtro seleccionado. ¡Todo está al día!
          </p>
        </div>
      )}
    </div>
  );
};
