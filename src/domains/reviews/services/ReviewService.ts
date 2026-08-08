import type { IReviewRepository } from '../repositories/IReviewRepository';
import { SupabaseReviewRepository } from '../repositories/SupabaseReviewRepository';
import type { IStorageRepository } from '../repositories/IStorageRepository';
import { SupabaseStorageRepository } from '../repositories/SupabaseStorageRepository';
import { type Review, type ReviewInsertPayload, type ReviewMedia, REVIEW_STATUS } from '../types/Review';
import { logger } from '../../../lib/observability/logger';
import { v4 as uuidv4 } from 'uuid';

export class ReviewService {
  private reviewRepo: IReviewRepository;
  private storageRepo: IStorageRepository;
  private readonly BUCKET_NAME = 'review-media';

  // In a real DI setup, these would be injected.
  constructor(
    reviewRepo: IReviewRepository = new SupabaseReviewRepository(),
    storageRepo: IStorageRepository = new SupabaseStorageRepository()
  ) {
    this.reviewRepo = reviewRepo;
    this.storageRepo = storageRepo;
  }

  async getPublicReviews(limit?: number, offset?: number): Promise<Review[]> {
    return this.reviewRepo.getPublicReviews(limit, offset);
  }

  async getPendingReviews(): Promise<Review[]> {
    return this.reviewRepo.getPendingReviews();
  }

  /**
   * Compresses an image in the browser and returns a Blob.
   * This is a placeholder for the actual canvas compression logic.
   */
  private async compressImage(file: File): Promise<{ blob: Blob; width: number; height: number; thumbnail: string }> {
    // TODO: Implement actual WebP compression via Canvas.
    // For now, return the raw file as a blob and dummy metadata.
    return {
      blob: file,
      width: 1080,
      height: 1920,
      thumbnail: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==' // 1x1 transparent gif
    };
  }

  /**
   * Full pipeline: Insert DB -> Compress -> Upload -> Insert Media DB
   */
  async submitReview(data: {
    service_id: string;
    client_name: string;
    rating: number;
    review_text: string;
    invitation_id?: string;
    photoFiles?: File[];
  }): Promise<Review> {
    const logContext = { domain: 'REVIEWS' as const, action: 'submitReview' };
    
    logger.info('Processing new review submission', logContext);

    let insertedReview: Review;

    // 1. Database Insert (Strict Payload matching SQL Schema)
    try {
      const reviewId = uuidv4();
      const reviewPayload: ReviewInsertPayload = {
        id: reviewId,
        service_id: data.service_id,
        client_name: data.client_name,
        rating: data.rating,
        review_text: data.review_text,
        invitation_id: data.invitation_id || null,
        status: REVIEW_STATUS.PENDING,
        featured: false,
        verified: !!data.invitation_id,
      };

      insertedReview = await this.reviewRepo.createReview(reviewPayload);
      logger.info('Review inserted successfully into database', logContext);
    } catch (error) {
      logger.error('Failed to insert review into database', { ...logContext, metadata: { error } });
      throw error;
    }

    // 2. Storage & Media Pipeline
    if (data.photoFiles && data.photoFiles.length > 0) {
      const mediaList: Omit<ReviewMedia, 'id' | 'created_at'>[] = [];
      let orderIndex = 0;

      for (const file of data.photoFiles) {
        try {
          logger.info(`Compressing file ${file.name}`, logContext);
          const { blob } = await this.compressImage(file);
          
          const fileName = `${uuidv4()}.webp`; // WebP forced
          const storagePath = `raw/${fileName}`;
          
          logger.info(`Uploading file ${fileName}`, logContext);
          const url = await this.storageRepo.uploadFile(this.BUCKET_NAME, storagePath, blob, 'image/webp');
          
          mediaList.push({
            review_id: insertedReview.id,
            storage_path: storagePath,
            url,
            order_index: orderIndex++
          });
        } catch (error) {
          logger.error(`Failed to process photo ${file.name}`, { ...logContext, metadata: { error } });
          // If a photo fails to upload, we just skip inserting that specific media record
        }
      }

      // 3. Insert Media Records
      if (mediaList.length > 0) {
        try {
          await this.reviewRepo.addReviewMedia(mediaList);
          logger.info(`Inserted ${mediaList.length} media records`, logContext);
        } catch (error) {
          logger.error('Failed to insert media records into database', { ...logContext, metadata: { error } });
          // Don't fail the whole submission if only the media insertion failed.
        }
      }
    }

    // AI Trigger happens implicitly via Supabase Database Webhook (AFTER INSERT ON reviews)
    return insertedReview;
  }

  async updateReviewStatus(id: string, status: Review['status']): Promise<Review> {
    const logContext = { domain: 'REVIEWS' as const, action: 'updateReviewStatus' };
    logger.info(`Updating review ${id} status to ${status}`, logContext);
    
    try {
      return await this.reviewRepo.updateReview(id, { status });
    } catch (error) {
      logger.error('Failed to update review status', { ...logContext, metadata: { error } });
      throw error;
    }
  }
}
