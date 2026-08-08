import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

interface PublicSubmitData {
  service_id: string;
  client_name: string;
  rating: number;
  review_text: string;
  invitation_id: string;
}

export const usePublicSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PublicSubmitData) => {
      // 1. Llamar a la operación atómica y segura
      const { data: reviewId, error } = await supabase.rpc('submit_review_for_invitation', {
        token_id: data.invitation_id,
        p_rating: data.rating,
        p_content: data.review_text
      });

      if (error) {
        throw error;
      }

      // Si el componente soportara fotos en el futuro, aquí se subirían
      // usando el `reviewId` retornado y llamando a ReviewService para insertarlas.
      
      return reviewId;
    },
    onSuccess: () => {
      toast.success('¡Reseña enviada con éxito!');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error) => {
      console.error('Error submitting public review:', error);
      toast.error('Ocurrió un error al enviar tu reseña. Por favor intenta de nuevo.');
    }
  });
};
