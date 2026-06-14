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
      decline_alerts: {
        Row: {
          category: string
          dismissed_at: string | null
          id: string
          resident_id: string
          triggered_at: string
        }
        Insert: {
          category: string
          dismissed_at?: string | null
          id?: string
          resident_id: string
          triggered_at?: string
        }
        Update: {
          category?: string
          dismissed_at?: string | null
          id?: string
          resident_id?: string
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "decline_alerts_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          facility_id: string | null
          id: string
          resident_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          token: string
          used: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          facility_id?: string | null
          id?: string
          resident_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          token?: string
          used?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          facility_id?: string | null
          id?: string
          resident_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
          used?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "invites_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_logs: {
        Row: {
          created_at: string
          id: string
          log_date: string
          logged_by: string | null
          mood: Database["public"]["Enums"]["mood_kind"]
          resident_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          log_date?: string
          logged_by?: string | null
          mood: Database["public"]["Enums"]["mood_kind"]
          resident_id: string
        }
        Update: {
          created_at?: string
          id?: string
          log_date?: string
          logged_by?: string | null
          mood?: Database["public"]["Enums"]["mood_kind"]
          resident_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_logs_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          caption: string | null
          created_at: string
          id: string
          photo_url: string | null
          resident_id: string
        }
        Insert: {
          author_id: string
          caption?: string | null
          created_at?: string
          id?: string
          photo_url?: string | null
          resident_id: string
        }
        Update: {
          author_id?: string
          caption?: string | null
          created_at?: string
          id?: string
          photo_url?: string | null
          resident_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          facility_id: string | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          facility_id?: string | null
          id: string
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          facility_id?: string | null
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      resident_family: {
        Row: {
          created_at: string
          resident_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          resident_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          resident_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resident_family_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      resident_staff: {
        Row: {
          created_at: string
          facility_id: string
          resident_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          facility_id: string
          resident_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          facility_id?: string
          resident_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resident_staff_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resident_staff_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      residents: {
        Row: {
          created_at: string
          date_of_birth: string | null
          dementia_type: string | null
          facility_id: string
          id: string
          name: string
          photo_url: string | null
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          dementia_type?: string | null
          facility_id: string
          id?: string
          name: string
          photo_url?: string | null
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          dementia_type?: string | null
          facility_id?: string
          id?: string
          name?: string
          photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "residents_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_requests: {
        Row: {
          created_at: string
          decided_at: string | null
          decided_by: string | null
          email: string
          facility_id: string
          id: string
          status: Database["public"]["Enums"]["staff_request_status"]
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          email: string
          facility_id: string
          id?: string
          status?: Database["public"]["Enums"]["staff_request_status"]
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          email?: string
          facility_id?: string
          id?: string
          status?: Database["public"]["Enums"]["staff_request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "staff_requests_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          facility_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          facility_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          facility_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_surveys: {
        Row: {
          behaviors: Database["public"]["Enums"]["behavior_rating"]
          created_at: string
          eating: Database["public"]["Enums"]["survey_rating"]
          id: string
          mobility: Database["public"]["Enums"]["survey_rating"]
          mood: Database["public"]["Enums"]["survey_rating"]
          notes: string | null
          resident_id: string
          social: Database["public"]["Enums"]["survey_rating"]
          staff_id: string | null
          week_of: string
        }
        Insert: {
          behaviors: Database["public"]["Enums"]["behavior_rating"]
          created_at?: string
          eating: Database["public"]["Enums"]["survey_rating"]
          id?: string
          mobility: Database["public"]["Enums"]["survey_rating"]
          mood: Database["public"]["Enums"]["survey_rating"]
          notes?: string | null
          resident_id: string
          social: Database["public"]["Enums"]["survey_rating"]
          staff_id?: string | null
          week_of: string
        }
        Update: {
          behaviors?: Database["public"]["Enums"]["behavior_rating"]
          created_at?: string
          eating?: Database["public"]["Enums"]["survey_rating"]
          id?: string
          mobility?: Database["public"]["Enums"]["survey_rating"]
          mood?: Database["public"]["Enums"]["survey_rating"]
          notes?: string | null
          resident_id?: string
          social?: Database["public"]["Enums"]["survey_rating"]
          staff_id?: string | null
          week_of?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_surveys_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_resident: { Args: { _resident_id: string }; Returns: boolean }
      can_view_resident: { Args: { _resident_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      user_facility: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "staff" | "family" | "super_admin"
      behavior_rating: "none" | "mild" | "significant"
      mood_kind: "good" | "mixed" | "hard"
      staff_request_status: "pending" | "approved" | "denied"
      survey_rating: "improved" | "stable" | "declined"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "family", "super_admin"],
      behavior_rating: ["none", "mild", "significant"],
      mood_kind: ["good", "mixed", "hard"],
      staff_request_status: ["pending", "approved", "denied"],
      survey_rating: ["improved", "stable", "declined"],
    },
  },
} as const
