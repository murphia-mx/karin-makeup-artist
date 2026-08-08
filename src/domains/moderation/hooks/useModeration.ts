import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ModerationService } from '../services/ModerationService';
import { toast } from 'sonner';
import { type Review, REVIEW_STATUS } from '../../reviews/types/Review';

const moderationService = new ModerationService();

type ModerationReviewsData = { data: Review[]; count: number };

export const useModeration = () => {
  const queryClient = useQueryClient();

  const updateCacheOptimistically = (id: string, updates: Partial<Review>) => {
    // 1. Cancel related queries
    queryClient.cancelQueries({ queryKey: ['moderation-reviews'] });

    // 2. Iterate over all cached moderation queries and update them
    const queries = queryClient.getQueriesData<ModerationReviewsData>({ queryKey: ['moderation-reviews'] });
    
    queries.forEach(([queryKey, oldData]) => {
      if (oldData) {
        const queryStatus = queryKey[1] as string; // 'pending', 'approved', 'all'
        
        // Si la reseña cambia de estado, sacarla de la lista (ej. de pending -> approved)
        // O simplemente actualizarla si es 'all'
        let newData = oldData.data.map(review => 
          review.id === id ? { ...review, ...updates } : review
        );

        if (updates.status && queryStatus !== 'all' && updates.status !== queryStatus) {
          newData = newData.filter(review => review.id !== id);
        }

        queryClient.setQueryData(queryKey, {
          ...oldData,
          data: newData,
          count: newData.length
        });
      }
    });
  };

  const invalidateAll = () => {
    // Ya no es estrictamente necesario gracias a Supabase Realtime (useGlobalRealtime),
    // pero lo mantenemos como capa de seguridad en caso de fallo del WebSocket.
    queryClient.invalidateQueries({ queryKey: ['moderation-reviews'] });
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => moderationService.approveReview(id),
    onMutate: async (id) => {
      toast.loading('Aprobando reseña...', { id: 'approve' });
      updateCacheOptimistically(id, { status: REVIEW_STATUS.APPROVED, published_at: new Date().toISOString() });
    },
    onSuccess: () => {
      toast.success('Reseña aprobada exitosamente', { id: 'approve' });
      invalidateAll();
    },
    onError: (error: Error) => {
      toast.error(`Error al aprobar: ${error.message}`, { id: 'approve' });
      invalidateAll(); // Rollback via refetch
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, isSpam }: { id: string; isSpam: boolean }) => 
      moderationService.rejectReview(id, isSpam),
    onMutate: async ({ id, isSpam }) => {
      toast.loading('Rechazando reseña...', { id: 'reject' });
      updateCacheOptimistically(id, { status: isSpam ? REVIEW_STATUS.SPAM : REVIEW_STATUS.REJECTED });
    },
    onSuccess: (_, variables) => {
      toast.success(variables.isSpam ? 'Marcada como spam' : 'Reseña rechazada', { id: 'reject' });
      invalidateAll();
    },
    onError: (error: Error) => {
      toast.error(`Error al rechazar: ${error.message}`, { id: 'reject' });
      invalidateAll();
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) => 
      moderationService.replyToReview(id, reply),
    onMutate: async ({ id, reply }) => {
      toast.loading('Enviando respuesta...', { id: 'reply' });
      updateCacheOptimistically(id, { admin_reply: reply, admin_reply_at: new Date().toISOString() });
    },
    onSuccess: () => {
      toast.success('Respuesta publicada exitosamente', { id: 'reply' });
      invalidateAll();
    },
    onError: (error: Error) => {
      toast.error(`Error al responder: ${error.message}`, { id: 'reply' });
      invalidateAll();
    },
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) => 
      moderationService.toggleFeaturedStatus(id, featured),
    onMutate: async ({ id, featured }) => {
      toast.loading('Actualizando estado...', { id: 'feature' });
      updateCacheOptimistically(id, { featured });
    },
    onSuccess: (_, variables) => {
      toast.success(variables.featured ? 'Reseña destacada' : 'Reseña removida de destacados', { id: 'feature' });
      invalidateAll();
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar estado: ${error.message}`, { id: 'feature' });
      invalidateAll();
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Review> }) => 
      moderationService.editReview(id, updates),
    onMutate: async ({ id, updates }) => {
      toast.loading('Guardando cambios...', { id: 'edit' });
      updateCacheOptimistically(id, updates);
    },
    onSuccess: () => {
      toast.success('Reseña actualizada exitosamente', { id: 'edit' });
      invalidateAll();
    },
    onError: (error: Error) => {
      toast.error(`Error al guardar: ${error.message}`, { id: 'edit' });
      invalidateAll();
    },
  });

  return {
    approve: approveMutation,
    reject: rejectMutation,
    reply: replyMutation,
    toggleFeatured: featureMutation,
    edit: editMutation,
  };
};
