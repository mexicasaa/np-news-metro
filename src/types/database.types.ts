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
      article_images: {
        Row: {
          id: string
          article_id: string | null
          storage_path: string
          public_url: string
          alt_text: string | null
          caption: string | null
          credit: string | null
          sort_order: number | null
          is_featured: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          article_id?: string | null
          storage_path: string
          public_url: string
          alt_text?: string | null
          caption?: string | null
          credit?: string | null
          sort_order?: number | null
          is_featured?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          article_id?: string | null
          storage_path?: string
          public_url?: string
          alt_text?: string | null
          caption?: string | null
          credit?: string | null
          sort_order?: number | null
          is_featured?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_images_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          }
        ]
      }
      article_revisions: {
        Row: {
          id: string
          article_id: string | null
          edited_by: string | null
          title: string | null
          content: string | null
          excerpt: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          article_id?: string | null
          edited_by?: string | null
          title?: string | null
          content?: string | null
          excerpt?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          article_id?: string | null
          edited_by?: string | null
          title?: string | null
          content?: string | null
          excerpt?: string | null
          status?: string | null
          created_at?: string | null
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
          }
        ]
      }
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
          created_at: string | null
        }
        Insert: {
          article_id: string
          tag_id: string
          created_at?: string | null
        }
        Update: {
          article_id?: string
          tag_id?: string
          created_at?: string | null
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
          }
        ]
      }
      articles: {
        Row: {
          id: string
          title: string
          title_hi: string | null
          slug: string
          excerpt: string | null
          dek_hi: string | null
          content: string | null
          author_id: string | null
          category_id: string | null
          status: string
          featured_image_url: string | null
          featured_image_alt: string | null
          featured_image_caption: string | null
          image_credit: string | null
          published_at: string | null
          scheduled_at: string | null
          seo_title: string | null
          meta_description: string | null
          canonical_url: string | null
          robots_index: boolean | null
          robots_follow: boolean | null
          is_featured: boolean | null
          is_lead: boolean | null
          is_breaking_news: boolean | null
          is_opinion: boolean | null
          is_sponsored: boolean | null
          sponsor_name: string | null
          reading_time_minutes: number | null
          view_count: number | null
          location: string | null
          blocks: Json | null
          key_takeaways: Json | null
          custom_author: Json | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          title_hi?: string | null
          slug: string
          excerpt?: string | null
          dek_hi?: string | null
          content?: string | null
          author_id?: string | null
          category_id?: string | null
          status?: string
          featured_image_url?: string | null
          featured_image_alt?: string | null
          featured_image_caption?: string | null
          image_credit?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          seo_title?: string | null
          meta_description?: string | null
          canonical_url?: string | null
          robots_index?: boolean | null
          robots_follow?: boolean | null
          is_featured?: boolean | null
          is_lead?: boolean | null
          is_breaking_news?: boolean | null
          is_opinion?: boolean | null
          is_sponsored?: boolean | null
          sponsor_name?: string | null
          reading_time_minutes?: number | null
          view_count?: number | null
          location?: string | null
          blocks?: Json | null
          key_takeaways?: Json | null
          custom_author?: Json | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          title_hi?: string | null
          slug?: string
          excerpt?: string | null
          dek_hi?: string | null
          content?: string | null
          author_id?: string | null
          category_id?: string | null
          status?: string
          featured_image_url?: string | null
          featured_image_alt?: string | null
          featured_image_caption?: string | null
          image_credit?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          seo_title?: string | null
          meta_description?: string | null
          canonical_url?: string | null
          robots_index?: boolean | null
          robots_follow?: boolean | null
          is_featured?: boolean | null
          is_lead?: boolean | null
          is_breaking_news?: boolean | null
          is_opinion?: boolean | null
          is_sponsored?: boolean | null
          sponsor_name?: string | null
          reading_time_minutes?: number | null
          view_count?: number | null
          location?: string | null
          blocks?: Json | null
          key_takeaways?: Json | null
          custom_author?: Json | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
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
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_id: string | null
          image_url: string | null
          is_active: boolean | null
          sort_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          parent_id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          parent_id?: string | null
          image_url?: string | null
          is_active?: boolean | null
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
          }
        ]
      }
      media: {
        Row: {
          id: string
          uploaded_by: string | null
          file_name: string
          storage_path: string
          public_url: string
          mime_type: string | null
          file_size: number | null
          width: number | null
          height: number | null
          alt_text: string | null
          caption: string | null
          media_type: string
          created_at: string | null
        }
        Insert: {
          id?: string
          uploaded_by?: string | null
          file_name: string
          storage_path: string
          public_url: string
          mime_type?: string | null
          file_size?: number | null
          width?: number | null
          height?: number | null
          alt_text?: string | null
          caption?: string | null
          media_type: string
          created_at?: string | null
        }
        Update: {
          id?: string
          uploaded_by?: string | null
          file_name?: string
          storage_path?: string
          public_url?: string
          mime_type?: string | null
          file_size?: number | null
          width?: number | null
          height?: number | null
          alt_text?: string | null
          caption?: string | null
          media_type?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          display_name: string | null
          avatar_url: string | null
          role: string
          bio: string | null
          department: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          role?: string
          bio?: string | null
          department?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          role?: string
          bio?: string | null
          department?: string | null
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      redirects: {
        Row: {
          id: string
          source_path: string
          destination_path: string
          status_code: number | null
          is_active: boolean | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          source_path: string
          destination_path: string
          status_code?: number | null
          is_active?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          source_path?: string
          destination_path?: string
          status_code?: number | null
          is_active?: boolean | null
          created_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "redirects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      site_settings: {
        Row: {
          id: string
          site_name: string | null
          site_description: string | null
          logo_url: string | null
          favicon_url: string | null
          default_author_id: string | null
          default_category_id: string | null
          contact_email: string | null
          timezone: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          site_name?: string | null
          site_description?: string | null
          logo_url?: string | null
          favicon_url?: string | null
          default_author_id?: string | null
          default_category_id?: string | null
          contact_email?: string | null
          timezone?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          site_name?: string | null
          site_description?: string | null
          logo_url?: string | null
          favicon_url?: string | null
          default_author_id?: string | null
          default_category_id?: string | null
          contact_email?: string | null
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
          }
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          id: string
          title: string
          slug: string
          youtube_url: string | null
          youtube_video_id: string | null
          description: string | null
          thumbnail_url: string | null
          channel_name: string | null
          channel_id: string | null
          published_at: string | null
          duration_seconds: number | null
          status: string
          category_id: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          youtube_url?: string | null
          youtube_video_id?: string | null
          description?: string | null
          thumbnail_url?: string | null
          channel_name?: string | null
          channel_id?: string | null
          published_at?: string | null
          duration_seconds?: number | null
          status?: string
          category_id?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          youtube_url?: string | null
          youtube_video_id?: string | null
          description?: string | null
          thumbnail_url?: string | null
          channel_name?: string | null
          channel_id?: string | null
          published_at?: string | null
          duration_seconds?: number | null
          status?: string
          category_id?: string | null
          created_by?: string | null
          updated_at?: string | null
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
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { user_id: string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_editor_or_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
