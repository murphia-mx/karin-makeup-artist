import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ReviewService } from '../services/ReviewService';
import type { ReviewFormData } from '../schemas/review.schema';
import { toast } from 'sonner';

const reviewService = new ReviewService();

export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReviewFormData) => {
      return await reviewService.submitReview({
        service_id: data.service_id,
        client_name: data.client_name,
        rating: data.rating,
        review_text: data.review,
        invitation_id: data.invitation_id || undefined,
        // photoFiles: data.photo_url ? [file] : [] // To be implemented when photo uploader handles Files
      });
    },
    onSuccess: () => {
      // Optimistically invalidate public reviews if necessary
      queryClient.invalidateQueries({ queryKey: ['publicReviews'] });
      queryClient.invalidateQueries({ queryKey: ['pendingReviews'] });
    },
    onError: (error) => {
      console.error('Failed to submit review:', error);
      toast.error('Ocurrió un error al enviar tu reseña. Por favor intenta de nuevo.');
    },
  });
};
