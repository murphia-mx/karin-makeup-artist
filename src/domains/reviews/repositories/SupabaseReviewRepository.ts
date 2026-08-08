import { supabase } from '../../../lib/supabase';
import type { IReviewRepository } from './IReviewRepository';
import { REVIEW_STATUS, type Review, type ReviewInsertPayload, type ReviewMedia } from '../types/Review';

export class SupabaseReviewRepository implements IReviewRepository {
  async getPublicReviews(limit = 10, offset = 0): Promise<Review[]> {
    const { data, error } = await (supabase as any)
      .from('reviews')
      .select('*, services(name, slug), review_media(*)')
      .eq('status', REVIEW_STATUS.APPROVED)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch public reviews: ${error.message}`);
    return data as unknown as Review[];
  }

  async getPendingReviews(): Promise<Review[]> {
    const { data, error } = await (supabase as any)
      .from('reviews')
      .select('*, services(name, slug), review_media(*), ai_review_analysis(*, ai_telemetry(*))')
      .eq('status', REVIEW_STATUS.PENDING)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch pending reviews: ${error.message}`);
    return data as unknown as Review[];
  }

  async getModerationReviews(
    status: Review['status'] | 'all',
    options?: { limit?: number; offset?: number; search?: string }
  ): Promise<{ data: Review[]; count: number }> {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    const search = options?.search || '';

    let query = (supabase as any)
      .from('reviews')
      .select('*, services(name, slug), review_media(*), ai_review_analysis(*, ai_telemetry(*))', { count: 'exact' });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      // Búsqueda por nombre de cliente o texto de reseña
      query = query.or(`client_name.ilike.%${search}%,review_text.ilike.%${search}%`);
    }

    // Ordenar: pendientes primero las más antiguas, el resto las más recientes
    if (status === REVIEW_STATUS.PENDING) {
      query = query.order('created_at', { ascending: true });
    } else {
      query = query.order('updated_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to fetch moderation reviews: ${error.message}`);
    return { data: data as unknown as Review[], count: count || 0 };
  }

  async createReview(reviewPayload: ReviewInsertPayload): Promise<Review> {
    const { error } = await (supabase as any)
      .from('reviews')
      .insert([reviewPayload as any]);

    if (error) throw new Error(`Failed to create review: ${error.message}`);
    // We return the payload as Review since .select() is not used (due to RLS pending status)
    return reviewPayload as unknown as Review;
  }

  async addReviewMedia(mediaList: Omit<ReviewMedia, 'id' | 'created_at'>[]): Promise<void> {
    if (!mediaList || mediaList.length === 0) return;
    
    const { error } = await (supabase as any)
      .from('review_media')
      .insert(mediaList as any[]);

    if (error) throw new Error(`Failed to insert review media: ${error.message}`);
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review> {
    // Prevent updating relational structures directly
    const safeUpdates = { ...updates };
    delete safeUpdates.services;
    delete safeUpdates.review_media;
    delete safeUpdates.ai_review_analysis;

    const { data, error } = await (supabase as any)
      .from('reviews')
      .update(safeUpdates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update review: ${error.message}`);
    return data as unknown as Review;
  }

  async getReviewById(id: string): Promise<Review | null> {
    const { data, error } = await (supabase as any)
      .from('reviews')
      .select('*, services(name, slug), review_media(*), ai_review_analysis(*, ai_telemetry(*))')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch review: ${error.message}`);
    }
    return data as unknown as Review;
  }
}
