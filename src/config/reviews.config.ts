/**
 * Centralized configuration for the Reviews domain.
 * Defines boundaries, defaults, and feature flags.
 */
export const reviewsConfig = {
  pagination: {
    publicFeedLimit: 20,
    adminTableLimit: 50,
  },
  validation: {
    minReviewLength: 10,
    maxReviewLength: 800,
    maxNameLength: 50,
  },
  features: {
    enablePhotoUploads: true,
    enablePublicReplies: true,
    requireVerificationForSubmit: false, // If true, only invited users can submit
  },
  display: {
    maxFeaturedReviews: 5,
  }
};
