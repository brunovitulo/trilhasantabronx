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
      daily_review_completions: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          module_ids: string[]
          review_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          module_ids: string[]
          review_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          module_ids?: string[]
          review_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exam_permission_requests: {
        Row: {
          created_at: string
          decided_at: string | null
          decided_by: string | null
          expires_at: string | null
          id: string
          status: Database["public"]["Enums"]["exam_permission_status"]
          subtask_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          expires_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["exam_permission_status"]
          subtask_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          expires_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["exam_permission_status"]
          subtask_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      open_evaluation_answers: {
        Row: {
          answer_text: string
          created_at: string
          feedback: string | null
          id: string
          is_correct: boolean | null
          question_index: number
          question_text: string
          submission_id: string
          updated_at: string
        }
        Insert: {
          answer_text?: string
          created_at?: string
          feedback?: string | null
          id?: string
          is_correct?: boolean | null
          question_index: number
          question_text: string
          submission_id: string
          updated_at?: string
        }
        Update: {
          answer_text?: string
          created_at?: string
          feedback?: string | null
          id?: string
          is_correct?: boolean | null
          question_index?: number
          question_text?: string
          submission_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "open_evaluation_answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "open_evaluation_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      open_evaluation_submissions: {
        Row: {
          created_at: string
          general_feedback: string | null
          id: string
          retry_allowed: boolean
          reviewed_at: string | null
          reviewer_id: string | null
          score: number | null
          status: string
          subtask_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          general_feedback?: string | null
          id?: string
          retry_allowed?: boolean
          reviewed_at?: string | null
          reviewer_id?: string | null
          score?: number | null
          status?: string
          subtask_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          general_feedback?: string | null
          id?: string
          retry_allowed?: boolean
          reviewed_at?: string | null
          reviewer_id?: string | null
          score?: number | null
          status?: string
          subtask_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      practice_attempts: {
        Row: {
          answers: Json
          correct_count: number
          created_at: string
          id: string
          subtask_id: string
          total: number
          user_id: string
        }
        Insert: {
          answers: Json
          correct_count: number
          created_at?: string
          id?: string
          subtask_id: string
          total: number
          user_id: string
        }
        Update: {
          answers?: Json
          correct_count?: number
          created_at?: string
          id?: string
          subtask_id?: string
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          blocked: boolean
          blocked_reason: string | null
          created_at: string
          full_name: string | null
          id: string
          onboarding_completed_at: string | null
          progress_reset_at: string | null
          updated_at: string
        }
        Insert: {
          blocked?: boolean
          blocked_reason?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          onboarding_completed_at?: string | null
          progress_reset_at?: string | null
          updated_at?: string
        }
        Update: {
          blocked?: boolean
          blocked_reason?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed_at?: string | null
          progress_reset_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subtask_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          score: number | null
          subtask_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          score?: number | null
          subtask_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          score?: number | null
          subtask_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      theme_performance: {
        Row: {
          accuracy: number
          created_at: string
          id: string
          last_reviewed_at: string | null
          last_wrong_at: string | null
          module_id: string
          theme: string
          total_answered: number
          total_correct: number
          total_wrong: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy?: number
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          last_wrong_at?: string | null
          module_id: string
          theme: string
          total_answered?: number
          total_correct?: number
          total_wrong?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy?: number
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          last_wrong_at?: string | null
          module_id?: string
          theme?: string
          total_answered?: number
          total_correct?: number
          total_wrong?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "atendente"
      exam_permission_status:
        | "pending"
        | "approved"
        | "rejected"
        | "expired"
        | "consumed"
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
      app_role: ["admin", "atendente"],
      exam_permission_status: [
        "pending",
        "approved",
        "rejected",
        "expired",
        "consumed",
      ],
    },
  },
} as const
