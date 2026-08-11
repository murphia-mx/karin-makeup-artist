export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'moderator'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: 'admin' | 'moderator'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'moderator'
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          slug: string
          name: string
          short_name: string | null
          description: string | null
          short_description: string | null
          icon: string | null
          cover_image: string | null
          duration_minutes: number | null
          price_from: number | null
          featured: boolean
          popular: boolean
          display_order: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          short_name?: string | null
          description?: string | null
          short_description?: string | null
          icon?: string | null
          cover_image?: string | null
          duration_minutes?: number | null
          price_from?: number | null
          featured?: boolean
          popular?: boolean
          display_order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          short_name?: string | null
          description?: string | null
          short_description?: string | null
          icon?: string | null
          cover_image?: string | null
          duration_minutes?: number | null
          price_from?: number | null
          featured?: boolean
          popular?: boolean
          display_order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      review_invitations: {
        Row: {
          id: string
          client_name: string
          client_email: string | null
          service_id: string
          service_date: string | null
          used: boolean
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          client_name: string
          client_email?: string | null
          service_id: string
          service_date?: string | null
          used?: boolean
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          client_email?: string | null
          service_id?: string
          service_date?: string | null
          used?: boolean
          expires_at?: string
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          service_id: string
          invitation_id: string | null
          client_name: string
          rating: number
          review_text: string
          status: 'pending' | 'approved' | 'rejected' | 'spam' | 'flagged'
          verified: boolean
          featured: boolean
          admin_reply: string | null
          admin_reply_at: string | null
          published_at: string | null
          edited_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_id: string
          invitation_id?: string | null
          client_name: string
          rating: number
          review_text: string
          status?: 'pending' | 'approved' | 'rejected' | 'spam' | 'flagged'
          verified?: boolean
          featured?: boolean
          admin_reply?: string | null
          admin_reply_at?: string | null
          published_at?: string | null
          edited_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          invitation_id?: string | null
          client_name?: string
          rating?: number
          review_text?: string
          status?: 'pending' | 'approved' | 'rejected' | 'spam' | 'flagged'
          verified?: boolean
          featured?: boolean
          admin_reply?: string | null
          admin_reply_at?: string | null
          published_at?: string | null
          edited_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      review_media: {
        Row: {
          id: string
          review_id: string
          storage_path: string
          url: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          storage_path: string
          url: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          storage_path?: string
          url?: string
          order_index?: number
          created_at?: string
        }
      }
      ai_analysis: {
        Row: {
          id: string
          review_id: string
          provider: string
          model: string
          version: string
          processed_at: string
          processing_time_ms: number
          sentiment: string | null
          summary: string | null
          emotion: string | null
          language: string | null
          topics: Json | null
          keywords: Json | null
          spam_score: number | null
          toxicity_score: number | null
          confidence_score: number | null
          requires_human_review: boolean
          final_decision: 'pending' | 'approved' | 'rejected' | 'spam' | 'flagged' | null
        }
        Insert: {
          id?: string
          review_id: string
          provider: string
          model: string
          version: string
          processed_at?: string
          processing_time_ms: number
          sentiment?: string | null
          summary?: string | null
          emotion?: string | null
          language?: string | null
          topics?: Json | null
          keywords?: Json | null
          spam_score?: number | null
          toxicity_score?: number | null
          confidence_score?: number | null
          requires_human_review?: boolean
          final_decision?: 'pending' | 'approved' | 'rejected' | 'spam' | 'flagged' | null
        }
        Update: {
          id?: string
          review_id?: string
          provider?: string
          model?: string
          version?: string
          processed_at?: string
          processing_time_ms?: number
          sentiment?: string | null
          summary?: string | null
          emotion?: string | null
          language?: string | null
          topics?: Json | null
          keywords?: Json | null
          spam_score?: number | null
          toxicity_score?: number | null
          confidence_score?: number | null
          requires_human_review?: boolean
          final_decision?: 'pending' | 'approved' | 'rejected' | 'spam' | 'flagged' | null
        }
      }
      review_keywords: {
        Row: {
          id: string
          review_id: string
          keyword: string
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          keyword: string
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          keyword?: string
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          payload: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          payload?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          payload?: Json | null
          created_at?: string
        }
      }
      system_events: {
        Row: {
          id: string
          type: string
          title: string
          description: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          title: string
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          title?: string
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      analytics_snapshots: {
        Row: {
          id: string
          snapshot_date: string
          total_reviews: number
          average_rating: number
          pending_reviews: number
          verified_percentage: number
          processed_at: string
        }
        Insert: {
          id?: string
          snapshot_date: string
          total_reviews?: number
          average_rating?: number
          pending_reviews?: number
          verified_percentage?: number
          processed_at?: string
        }
        Update: {
          id?: string
          snapshot_date?: string
          total_reviews?: number
          average_rating?: number
          pending_reviews?: number
          verified_percentage?: number
          processed_at?: string
        }
      }
    }
    Views: {
      dashboard_analytics_view: {
        Row: {
          total_reviews: number | null
          approved_reviews: number | null
          pending_reviews: number | null
          spam_reviews: number | null
          average_rating: number | null
          verified_percentage: number | null
          last_review_at: string | null
        }
      }
      popular_services_view: {
        Row: {
          service_id: string | null
          service_name: string | null
          total_reviews: number | null
          average_rating: number | null
        }
      }
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_dashboard_kpis: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
