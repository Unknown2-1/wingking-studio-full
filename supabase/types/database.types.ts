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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      Booking: {
        Row: {
          createdAt: string
          customerName: string
          customerPhone: string
          date: string
          durationHours: number
          id: string
          serviceId: string
          startTime: string
          status: string
        }
        Insert: {
          createdAt?: string
          customerName: string
          customerPhone: string
          date: string
          durationHours: number
          id: string
          serviceId: string
          startTime: string
          status?: string
        }
        Update: {
          createdAt?: string
          customerName?: string
          customerPhone?: string
          date?: string
          durationHours?: number
          id?: string
          serviceId?: string
          startTime?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "Booking_serviceId_fkey"
            columns: ["serviceId"]
            isOneToOne: false
            referencedRelation: "Service"
            referencedColumns: ["id"]
          },
        ]
      }
      Service: {
        Row: {
          createdAt: string
          id: string
          name: string
          pricePerHour: number
        }
        Insert: {
          createdAt?: string
          id: string
          name: string
          pricePerHour: number
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          pricePerHour?: number
        }
        Relationships: []
      }
      wk_bands: {
        Row: {
          accent: string
          archived_at: string | null
          city: string
          created_at: string
          deleted_at: string | null
          genre: string
          id: string
          instagram_url: string
          is_published: boolean
          name: string
          owner_id: string
          photo_url: string
          price_image_url: string
          rate_cards: Json
          review_note: string
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          spotify_url: string
          story: string
          tagline: string
          updated_at: string
        }
        Insert: {
          accent?: string
          archived_at?: string | null
          city?: string
          created_at?: string
          deleted_at?: string | null
          genre?: string
          id?: string
          instagram_url?: string
          is_published?: boolean
          name: string
          owner_id: string
          photo_url?: string
          price_image_url?: string
          rate_cards?: Json
          review_note?: string
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          spotify_url?: string
          story?: string
          tagline?: string
          updated_at?: string
        }
        Update: {
          accent?: string
          archived_at?: string | null
          city?: string
          created_at?: string
          deleted_at?: string | null
          genre?: string
          id?: string
          instagram_url?: string
          is_published?: boolean
          name?: string
          owner_id?: string
          photo_url?: string
          price_image_url?: string
          rate_cards?: Json
          review_note?: string
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          spotify_url?: string
          story?: string
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      wk_clips: {
        Row: {
          archived_at: string | null
          band_id: string
          caption: string
          created_at: string
          deleted_at: string | null
          id: string
          instagram_url: string
          is_published: boolean
          owner_id: string
          review_note: string
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          archived_at?: string | null
          band_id: string
          caption?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          instagram_url?: string
          is_published?: boolean
          owner_id: string
          review_note?: string
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          archived_at?: string | null
          band_id?: string
          caption?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          instagram_url?: string
          is_published?: boolean
          owner_id?: string
          review_note?: string
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "wk_clips_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "wk_bands"
            referencedColumns: ["id"]
          },
        ]
      }
      wk_content_activity: {
        Row: {
          action: string
          actor_id: string | null
          content_id: string
          created_at: string
          id: string
          label: string
          metadata: Json
          source: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          content_id: string
          created_at?: string
          id?: string
          label?: string
          metadata?: Json
          source: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          content_id?: string
          created_at?: string
          id?: string
          label?: string
          metadata?: Json
          source?: string
        }
        Relationships: []
      }
      wk_guest_posts: {
        Row: {
          accent: string
          archived_at: string | null
          city: string
          clip_caption: string
          clip_instagram_url: string
          clip_title: string
          clip_url: string
          created_at: string
          deleted_at: string | null
          genre: string
          id: string
          instagram_url: string
          is_visible: boolean
          name: string
          photo_url: string
          price_image_url: string
          rate_cards: Json
          release_caption: string
          release_cover_url: string
          release_kind: string
          release_listen_url: string
          release_title: string
          spotify_url: string
          story: string
          tagline: string
        }
        Insert: {
          accent?: string
          archived_at?: string | null
          city?: string
          clip_caption?: string
          clip_instagram_url?: string
          clip_title?: string
          clip_url?: string
          created_at?: string
          deleted_at?: string | null
          genre?: string
          id: string
          instagram_url?: string
          is_visible?: boolean
          name: string
          photo_url?: string
          price_image_url?: string
          rate_cards?: Json
          release_caption?: string
          release_cover_url?: string
          release_kind?: string
          release_listen_url?: string
          release_title?: string
          spotify_url?: string
          story?: string
          tagline?: string
        }
        Update: {
          accent?: string
          archived_at?: string | null
          city?: string
          clip_caption?: string
          clip_instagram_url?: string
          clip_title?: string
          clip_url?: string
          created_at?: string
          deleted_at?: string | null
          genre?: string
          id?: string
          instagram_url?: string
          is_visible?: boolean
          name?: string
          photo_url?: string
          price_image_url?: string
          rate_cards?: Json
          release_caption?: string
          release_cover_url?: string
          release_kind?: string
          release_listen_url?: string
          release_title?: string
          spotify_url?: string
          story?: string
          tagline?: string
        }
        Relationships: [
          {
            foreignKeyName: "wk_guest_posts_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "wk_guest_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      wk_guest_requests: {
        Row: {
          assets: Json
          created_at: string
          id: string
          ip_hash: string
          payload: Json
          receipt_hash: string
          review_note: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          assets?: Json
          created_at?: string
          id?: string
          ip_hash: string
          payload?: Json
          receipt_hash: string
          review_note?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          assets?: Json
          created_at?: string
          id?: string
          ip_hash?: string
          payload?: Json
          receipt_hash?: string
          review_note?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      wk_intake_events: {
        Row: {
          action: string
          id: number
          ip_hash: string
          occurred_at: string
        }
        Insert: {
          action: string
          id?: never
          ip_hash: string
          occurred_at?: string
        }
        Update: {
          action?: string
          id?: never
          ip_hash?: string
          occurred_at?: string
        }
        Relationships: []
      }
      wk_intake_tickets: {
        Row: {
          created_at: string
          expires_at: string
          file_kind: string
          file_size: number
          id: string
          ip_hash: string
          mime: string
          path: string
          request_key_hash: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          file_kind: string
          file_size: number
          id?: string
          ip_hash: string
          mime: string
          path: string
          request_key_hash: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          file_kind?: string
          file_size?: number
          id?: string
          ip_hash?: string
          mime?: string
          path?: string
          request_key_hash?: string
          used_at?: string | null
        }
        Relationships: []
      }
      wk_moderators: {
        Row: {
          added_at: string
          user_id: string
        }
        Insert: {
          added_at?: string
          user_id: string
        }
        Update: {
          added_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wk_public_submissions: {
        Row: {
          archived_at: string | null
          band_name: string
          city: string
          deleted_at: string | null
          description: string
          genre: string
          id: string
          instagram_url: string
          is_published: boolean
          kind: string
          music_url: string
          photo_url: string
          price_text: string
          receipt_hash: string
          review_note: string
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          submitted_at: string
          title: string
          video_url: string
        }
        Insert: {
          archived_at?: string | null
          band_name: string
          city?: string
          deleted_at?: string | null
          description?: string
          genre?: string
          id?: string
          instagram_url?: string
          is_published?: boolean
          kind: string
          music_url?: string
          photo_url?: string
          price_text?: string
          receipt_hash: string
          review_note?: string
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string
          title?: string
          video_url?: string
        }
        Update: {
          archived_at?: string | null
          band_name?: string
          city?: string
          deleted_at?: string | null
          description?: string
          genre?: string
          id?: string
          instagram_url?: string
          is_published?: boolean
          kind?: string
          music_url?: string
          photo_url?: string
          price_text?: string
          receipt_hash?: string
          review_note?: string
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string
          title?: string
          video_url?: string
        }
        Relationships: []
      }
      wk_releases: {
        Row: {
          archived_at: string | null
          band_id: string
          caption: string
          cover_url: string
          created_at: string
          deleted_at: string | null
          id: string
          is_published: boolean
          kind: string
          listen_url: string
          owner_id: string
          review_note: string
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          title: string
        }
        Insert: {
          archived_at?: string | null
          band_id: string
          caption?: string
          cover_url?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_published?: boolean
          kind?: string
          listen_url?: string
          owner_id: string
          review_note?: string
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          title: string
        }
        Update: {
          archived_at?: string | null
          band_id?: string
          caption?: string
          cover_url?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_published?: boolean
          kind?: string
          listen_url?: string
          owner_id?: string
          review_note?: string
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "wk_releases_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "wk_bands"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
