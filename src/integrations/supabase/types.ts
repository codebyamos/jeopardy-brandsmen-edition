export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      completed_games: {
        Row: {
          id: string
          game_date: string
          created_at: string
          winner_name: string | null
          winner_score: number | null
        }
        Insert: {
          id?: string
          game_date?: string
          created_at?: string
          winner_name?: string | null
          winner_score?: number | null
        }
        Update: {
          id?: string
          game_date?: string
          created_at?: string
          winner_name?: string | null
          winner_score?: number | null
        }
        Relationships: []
      }
      completed_game_players: {
        Row: {
          id: string
          game_id: string
          player_name: string
          player_score: number
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          player_name: string
          player_score: number
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          player_name?: string
          player_score?: number
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "completed_game_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "completed_games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_categories: {
        Row: {
          category_name: string
          created_at: string
          description: string | null
          game_id: string
          id: string
        }
        Insert: {
          category_name: string
          created_at?: string
          description?: string | null
          game_id: string
          id?: string
        }
        Update: {
          category_name?: string
          created_at?: string
          description?: string | null
          game_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_categories_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_passcode: {
        Row: {
          created_at: string
          id: number
          passcode: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          passcode?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          passcode?: string
          updated_at?: string
        }
        Relationships: []
      }
      game_players: {
        Row: {
          avatar_url: string | null
          created_at: string
          game_id: string
          id: string
          player_name: string
          player_score: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          game_id: string
          id?: string
          player_name: string
          player_score?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          game_id?: string
          id?: string
          player_name?: string
          player_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_questions: {
        Row: {
          answer: string
          bonus_points: number | null
          category: string
          created_at: string
          game_id: string
          id: string
          image_url: string | null
          is_answered: boolean
          media_assignment: string | null
          points: number
          question: string
          question_id: number
          video_url: string | null
        }
        Insert: {
          answer: string
          bonus_points?: number | null
          category: string
          created_at?: string
          game_id: string
          id?: string
          image_url?: string | null
          is_answered?: boolean
          media_assignment?: string | null
          points: number
          question: string
          question_id: number
          video_url?: string | null
        }
        Update: {
          answer?: string
          bonus_points?: number | null
          category?: string
          created_at?: string
          game_id?: string
          id?: string
          image_url?: string | null
          is_answered?: boolean
          media_assignment?: string | null
          points?: number
          question?: string
          question_id?: number
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_questions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          game_date: string
          id: string
        }
        Insert: {
          created_at?: string
          game_date?: string
          id?: string
        }
        Update: {
          created_at?: string
          game_date?: string
          id?: string
        }
        Relationships: []
      }
      timer_settings: {
        Row: {
          created_at: string
          id: number
          timer_duration: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          timer_duration?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          timer_duration?: number
          updated_at?: string
        }
        Relationships: []
      }
      voice_settings: {
        Row: {
          api_key: string | null
          created_at: string
          id: number
          selected_voice: string | null
          updated_at: string
          voice_enabled: boolean | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          id?: number
          selected_voice?: string | null
          updated_at?: string
          voice_enabled?: boolean | null
        }
        Update: {
          api_key?: string | null
          created_at?: string
          id?: number
          selected_voice?: string | null
          updated_at?: string
          voice_enabled?: boolean | null
        }
        Relationships: []
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
    Enums: {},
  },
} as const
