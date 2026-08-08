import type { Review, ReviewInsertPayload, ReviewMedia } from '../types/Review';

export interface IReviewRepository {
  /**
   * Retrieves paginated public (approved) reviews
   */
  getPublicReviews(limit?: number, offset?: number): Promise<Review[]>;
  
  /**
   * Retrieves pending reviews for admin moderation
   */
  getPendingReviews(): Promise<Review[]>;

  /**
   * Retrieves reviews for the moderation dashboard with pagination, status, and search filters.
   */
  getModerationReviews(
    status: Review['status'] | 'all',
    options?: { limit?: number; offset?: number; search?: string }
  ): Promise<{ data: Review[]; count: number }>;
  
  /**
   * Retrieves a single review by ID
   */
  getReviewById(id: string): Promise<Review | null>;
  
  /**
   * Creates a new review with strict normalized payload
   */
  createReview(review: ReviewInsertPayload): Promise<Review>;
  
  /**
   * Updates an existing review
   */
  updateReview(id: string, updates: Partial<Review>): Promise<Review>;

  /**
   * Bulk insert media associated with a review
   */
  addReviewMedia(media: Omit<ReviewMedia, 'id' | 'created_at'>[]): Promise<void>;
}
