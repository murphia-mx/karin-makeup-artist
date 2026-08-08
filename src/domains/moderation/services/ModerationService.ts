import { SupabaseReviewRepository } from '../../reviews/repositories/SupabaseReviewRepository';
import { SupabaseSystemRepository } from '../../admin/repositories/SupabaseSystemRepository';
import { AuthService } from '../../auth/services/AuthService';
import { type Review, REVIEW_STATUS } from '../../reviews/types/Review';
import { logger } from '../../../lib/observability/logger';

export class ModerationService {
  private reviewRepo: SupabaseReviewRepository;
  private systemRepo: SupabaseSystemRepository;

  constructor() {
    this.reviewRepo = new SupabaseReviewRepository();
    this.systemRepo = new SupabaseSystemRepository();
  }

  private async getAdminUserId(): Promise<string> {
    const session = await AuthService.getSession();
    if (!session?.user) {
      throw new Error('Unauthorized: No admin session found');
    }
    return session.user.id;
  }

  async approveReview(reviewId: string): Promise<Review> {
    const logContext = { domain: 'MODERATION' as const, action: 'approveReview', reviewId };
    logger.info('Approving review', logContext);

    const adminId = await this.getAdminUserId();

    // Actualizar estado de la reseña
    const updatedReview = await this.reviewRepo.updateReview(reviewId, {
      status: REVIEW_STATUS.APPROVED,
      published_at: new Date().toISOString(),
    });

    // Registrar en logs de auditoría
    await this.systemRepo.logAuditAction(
      adminId,
      'approve_review',
      'review',
      reviewId,
      { previous_status: REVIEW_STATUS.PENDING, new_status: REVIEW_STATUS.APPROVED }
    );

    // Crear evento de sistema para el dashboard
    await this.systemRepo.createSystemEvent(
      'review_approved',
      'Reseña Aprobada',
      `La reseña de ${updatedReview.client_name} ha sido aprobada.`,
      { review_id: reviewId, admin_id: adminId }
    );

    return updatedReview;
  }

  async rejectReview(reviewId: string, isSpam: boolean = false): Promise<Review> {
    const logContext = { domain: 'MODERATION' as const, action: 'rejectReview', reviewId };
    logger.info('Rejecting review', logContext);

    const adminId = await this.getAdminUserId();
    const newStatus = isSpam ? REVIEW_STATUS.SPAM : REVIEW_STATUS.REJECTED;

    const updatedReview = await this.reviewRepo.updateReview(reviewId, {
      status: newStatus,
    });

    await this.systemRepo.logAuditAction(
      adminId,
      'reject_review',
      'review',
      reviewId,
      { previous_status: REVIEW_STATUS.PENDING, new_status: newStatus }
    );

    await this.systemRepo.createSystemEvent(
      'review_rejected',
      isSpam ? 'Reseña marcada como Spam' : 'Reseña Rechazada',
      `La reseña de ${updatedReview.client_name} ha sido rechazada.`,
      { review_id: reviewId, admin_id: adminId, reason: newStatus }
    );

    return updatedReview;
  }

  async replyToReview(reviewId: string, replyText: string): Promise<Review> {
    const logContext = { domain: 'MODERATION' as const, action: 'replyToReview', reviewId };
    logger.info('Replying to review', logContext);

    const adminId = await this.getAdminUserId();

    const updatedReview = await this.reviewRepo.updateReview(reviewId, {
      admin_reply: replyText,
      admin_reply_at: new Date().toISOString(),
    });

    await this.systemRepo.logAuditAction(
      adminId,
      'reply_review',
      'review',
      reviewId,
      { reply_text: replyText }
    );

    await this.systemRepo.createSystemEvent(
      'review_replied',
      'Respuesta Administrativa',
      `Se ha respondido a la reseña de ${updatedReview.client_name}.`,
      { review_id: reviewId, admin_id: adminId }
    );

    return updatedReview;
  }

  async toggleFeaturedStatus(reviewId: string, featured: boolean): Promise<Review> {
    const logContext = { domain: 'MODERATION' as const, action: 'toggleFeaturedStatus', reviewId };
    logger.info('Toggling featured status', logContext);

    const adminId = await this.getAdminUserId();

    const updatedReview = await this.reviewRepo.updateReview(reviewId, {
      featured,
    });

    await this.systemRepo.logAuditAction(
      adminId,
      'toggle_featured',
      'review',
      reviewId,
      { featured }
    );

    if (featured) {
      await this.systemRepo.createSystemEvent(
        'review_featured',
        'Reseña Destacada',
        `La reseña de ${updatedReview.client_name} ha sido destacada.`,
        { review_id: reviewId, admin_id: adminId }
      );
    }

    return updatedReview;
  }

  async editReview(reviewId: string, updates: Partial<Review>): Promise<Review> {
    const logContext = { domain: 'MODERATION' as const, action: 'editReview', reviewId };
    logger.info('Editing review', logContext);

    const adminId = await this.getAdminUserId();

    const updatedReview = await this.reviewRepo.updateReview(reviewId, {
      ...updates,
      edited_at: new Date().toISOString(),
    });

    await this.systemRepo.logAuditAction(
      adminId,
      'edit_review',
      'review',
      reviewId,
      { updates }
    );

    return updatedReview;
  }
}
