export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ad_analytics_daily: {
        Row: {
          campaign_id: string | null
          clicks: number
          date: string
          id: string
          impressions: number
          placement_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicks?: number
          date?: string
          id?: string
          impressions?: number
          placement_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicks?: number
          date?: string
          id?: string
          impressions?: number
          placement_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_analytics_daily_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_analytics_daily_placement_id_fkey"
            columns: ["placement_id"]
            isOneToOne: false
            referencedRelation: "ad_placements"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_creatives: {
        Row: {
          alt_text: string | null
          campaign_id: string | null
          created_at: string | null
          destination_url: string
          headline: string | null
          id: string
          media_id: string | null
          type: string
        }
        Insert: {
          alt_text?: string | null
          campaign_id?: string | null
          created_at?: string | null
          destination_url: string
          headline?: string | null
          id?: string
          media_id?: string | null
          type?: string
        }
        Update: {
          alt_text?: string | null
          campaign_id?: string | null
          created_at?: string | null
          destination_url?: string
          headline?: string | null
          id?: string
          media_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_creatives_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_creatives_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_placements: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          is_active: boolean
          zone: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          zone: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          zone?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_placements_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_user_id: string
          created_at: string | null
          details: string | null
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_user_id: string
          created_at?: string | null
          details?: string | null
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_user_id?: string
          created_at?: string | null
          details?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      advertisers: {
        Row: {
          company: string
          contact_email: string | null
          created_at: string | null
          id: string
          name: string
          status: string
        }
        Insert: {
          company: string
          contact_email?: string | null
          created_at?: string | null
          id?: string
          name: string
          status?: string
        }
        Update: {
          company?: string
          contact_email?: string | null
          created_at?: string | null
          id?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      article_images: {
        Row: {
          alt_text: string | null
          article_id: string | null
          caption: string | null
          created_at: string | null
          credit: string | null
          id: string
          is_featured: boolean | null
          public_url: string
          sort_order: number | null
          storage_path: string
        }
        Insert: {
          alt_text?: string | null
          article_id?: string | null
          caption?: string | null
          created_at?: string | null
          credit?: string | null
          id?: string
          is_featured?: boolean | null
          public_url: string
          sort_order?: number | null
          storage_path: string
        }
        Update: {
          alt_text?: string | null
          article_id?: string | null
          caption?: string | null
          created_at?: string | null
          credit?: string | null
          id?: string
          is_featured?: boolean | null
          public_url?: string
          sort_order?: number | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_images_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_likes: {
        Row: {
          article_id: string | null
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_media: {
        Row: {
          article_id: string
          created_at: string | null
          media_id: string
          sort_order: number | null
          usage_type: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          media_id: string
          sort_order?: number | null
          usage_type?: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          media_id?: string
          sort_order?: number | null
          usage_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_media_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      article_metrics_daily: {
        Row: {
          article_id: string | null
          comments: number
          date: string
          id: string
          likes: number
          shares: number
          views: number
        }
        Insert: {
          article_id?: string | null
          comments?: number
          date?: string
          id?: string
          likes?: number
          shares?: number
          views?: number
        }
        Update: {
          article_id?: string | null
          comments?: number
          date?: string
          id?: string
          likes?: number
          shares?: number
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "article_metrics_daily_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_revisions: {
        Row: {
          article_id: string | null
          content: string | null
          content_length: number | null
          created_at: string | null
          edited_by: string | null
          excerpt: string | null
          id: string
          status: string | null
          title: string | null
        }
        Insert: {
          article_id?: string | null
          content?: string | null
          content_length?: number | null
          created_at?: string | null
          edited_by?: string | null
          excerpt?: string | null
          id?: string
          status?: string | null
          title?: string | null
        }
        Update: {
          article_id?: string | null
          content?: string | null
          content_length?: number | null
          created_at?: string | null
          edited_by?: string | null
          excerpt?: string | null
          id?: string
          status?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_revisions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_revisions_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_tags: {
        Row: {
          article_id: string
          created_at: string | null
          tag_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          tag_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_avatar: string | null
          author_bio: string | null
          author_id: string | null
          author_name: string | null
          author_role: string | null
          blocks: Json | null
          canonical_url: string | null
          category_id: string | null
          content: string | null
          created_at: string | null
          custom_author: Json | null
          dek_hi: string | null
          excerpt: string | null
          featured_image_alt: string | null
          featured_image_caption: string | null
          featured_image_url: string | null
          featured_media_id: string | null
          id: string
          image_credit: string | null
          is_breaking_news: boolean | null
          is_featured: boolean | null
          is_lead: boolean | null
          is_opinion: boolean | null
          is_sponsored: boolean | null
          key_takeaways: Json | null
          location: string | null
          meta_description: string | null
          metadata: Json | null
          published_at: string | null
          reading_time_minutes: number | null
          robots_follow: boolean | null
          robots_index: boolean | null
          scheduled_at: string | null
          seo_title: string | null
          slug: string
          sponsor_name: string | null
          status: string
          title: string
          title_hi: string | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_avatar?: string | null
          author_bio?: string | null
          author_id?: string | null
          author_name?: string | null
          author_role?: string | null
          blocks?: Json | null
          canonical_url?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          custom_author?: Json | null
          dek_hi?: string | null
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_caption?: string | null
          featured_image_url?: string | null
          featured_media_id?: string | null
          id?: string
          image_credit?: string | null
          is_breaking_news?: boolean | null
          is_featured?: boolean | null
          is_lead?: boolean | null
          is_opinion?: boolean | null
          is_sponsored?: boolean | null
          key_takeaways?: Json | null
          location?: string | null
          meta_description?: string | null
          metadata?: Json | null
          published_at?: string | null
          reading_time_minutes?: number | null
          robots_follow?: boolean | null
          robots_index?: boolean | null
          scheduled_at?: string | null
          seo_title?: string | null
          slug: string
          sponsor_name?: string | null
          status?: string
          title: string
          title_hi?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_avatar?: string | null
          author_bio?: string | null
          author_id?: string | null
          author_name?: string | null
          author_role?: string | null
          blocks?: Json | null
          canonical_url?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          custom_author?: Json | null
          dek_hi?: string | null
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_caption?: string | null
          featured_image_url?: string | null
          featured_media_id?: string | null
          id?: string
          image_credit?: string | null
          is_breaking_news?: boolean | null
          is_featured?: boolean | null
          is_lead?: boolean | null
          is_opinion?: boolean | null
          is_sponsored?: boolean | null
          key_takeaways?: Json | null
          location?: string | null
          meta_description?: string | null
          metadata?: Json | null
          published_at?: string | null
          reading_time_minutes?: number | null
          robots_follow?: boolean | null
          robots_index?: boolean | null
          scheduled_at?: string | null
          seo_title?: string | null
          slug?: string
          sponsor_name?: string | null
          status?: string
          title?: string
          title_hi?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_featured_media_id_fkey"
            columns: ["featured_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          advertiser_id: string | null
          created_at: string | null
          end_at: string | null
          id: string
          name: string
          start_at: string | null
          status: string
        }
        Insert: {
          advertiser_id?: string | null
          created_at?: string | null
          end_at?: string | null
          id?: string
          name: string
          start_at?: string | null
          status?: string
        }
        Update: {
          advertiser_id?: string | null
          created_at?: string | null
          end_at?: string | null
          id?: string
          name?: string
          start_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "advertisers"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          article_id: string | null
          author_email: string
          author_name: string
          body: string
          created_at: string | null
          id: string
          parent_id: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          article_id?: string | null
          author_email: string
          author_name: string
          body: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          article_id?: string | null
          author_email?: string
          author_name?: string
          body?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      deleted_articles: {
        Row: {
          article_data: Json | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          original_id: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          article_data?: Json | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          original_id?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          article_data?: Json | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          original_id?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deleted_articles_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          alt_text: string | null
          caption: string | null
          content_hash: string | null
          created_at: string | null
          file_name: string
          file_size: number | null
          height: number | null
          id: string
          media_type: string | null
          mime_type: string | null
          public_url: string
          r2_key: string | null
          storage_path: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          content_hash?: string | null
          created_at?: string | null
          file_name: string
          file_size?: number | null
          height?: number | null
          id?: string
          media_type?: string | null
          mime_type?: string | null
          public_url: string
          r2_key?: string | null
          storage_path: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          content_hash?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          height?: number | null
          id?: string
          media_type?: string | null
          mime_type?: string | null
          public_url?: string
          r2_key?: string | null
          storage_path?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          department: string | null
          designation: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          position: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          department?: string | null
          designation?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          position?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          department?: string | null
          designation?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          position?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      redirects: {
        Row: {
          created_at: string | null
          created_by: string | null
          destination_path: string
          id: string
          is_active: boolean | null
          source_path: string
          status_code: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          destination_path: string
          id?: string
          is_active?: boolean | null
          source_path: string
          status_code?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          destination_path?: string
          id?: string
          is_active?: boolean | null
          source_path?: string
          status_code?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "redirects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          contact_email: string | null
          created_at: string | null
          default_author_id: string | null
          default_category_id: string | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          site_description: string | null
          site_name: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string | null
          default_author_id?: string | null
          default_category_id?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          site_description?: string | null
          site_name?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string | null
          default_author_id?: string | null
          default_category_id?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          site_description?: string | null
          site_name?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_default_author_id_fkey"
            columns: ["default_author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_settings_default_category_id_fkey"
            columns: ["default_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriber_preferences: {
        Row: {
          created_at: string | null
          enabled: boolean
          id: string
          subscriber_id: string | null
          topic: string
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean
          id?: string
          subscriber_id?: string | null
          topic: string
        }
        Update: {
          created_at?: string | null
          enabled?: boolean
          id?: string
          subscriber_id?: string | null
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriber_preferences_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          confirmed_at: string | null
          created_at: string | null
          email: string
          id: string
          status: string
          unsubscribed_at: string | null
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          status?: string
          unsubscribed_at?: string | null
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          status?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          category_id: string | null
          channel_id: string | null
          channel_name: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          published_at: string | null
          slug: string
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          youtube_url: string | null
          youtube_video_id: string | null
        }
        Insert: {
          category_id?: string | null
          channel_id?: string | null
          channel_name?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          category_id?: string | null
          channel_id?: string | null
          channel_name?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { user_id: string }; Returns: string }
      increment_ad_metric: {
        Args: {
          p_campaign_id: string
          p_clicks?: number
          p_date: string
          p_impressions?: number
          p_placement_id: string
        }
        Returns: undefined
      }
      increment_article_metric: {
        Args: {
          p_article_id: string
          p_comments?: number
          p_date: string
          p_likes?: number
          p_shares?: number
          p_views?: number
        }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_editor_or_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
