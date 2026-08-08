/**
 * Centralized Feature Flags
 * Controls the availability of major architectural components.
 * This file replaces hardcoded environment checks throughout the app.
 */

export const Features = {
  // AI & Background Processing
  enableAIModeration: import.meta.env.VITE_ENABLE_AI_MODERATION === 'true' || true,
  enableSentimentAnalysis: true,
  enableKeywordExtraction: true,

  // UI / UX Features
  enableReviewPhotos: true,
  enableReviewVideos: false, // Prepared for future
  enableOwnerReplies: true,
  enableVerifiedBadges: true,
  
  // System Architectures
  enableRealtimeRefresh: true,
  enableInvitationSystem: true,
  
  // Future Integrations
  integrations: {
    whatsapp: false,
    googleReviews: false,
    crm: false,
  }
} as const;

export type FeatureFlag = keyof typeof Features;
