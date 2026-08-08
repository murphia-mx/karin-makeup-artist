import { useQuery } from '@tanstack/react-query';
import { SupabaseReviewRepository } from '../../reviews/repositories/SupabaseReviewRepository';
import type { Review } from '../../reviews/types/Review';

const reviewRepo = new SupabaseReviewRepository();

export const useModerationQuery = (
  status: Review['status'] | 'all',
  options?: { limit?: number; offset?: number; search?: string }
) => {
  return useQuery({
    queryKey: ['moderation-reviews', status, options?.limit, options?.offset, options?.search],
    queryFn: async () => {
      return await reviewRepo.getModerationReviews(status, options);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true, // Auto-refetch so dashboard is always fresh
  });
};
