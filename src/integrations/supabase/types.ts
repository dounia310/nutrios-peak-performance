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
      daily_tasks: {
        Row: {
          category: string
          completed: boolean
          completed_at: string | null
          created_at: string
          day_number: number
          icon: string
          id: string
          label: string
          plan_id: string
          task_id: string
          time_slot: string | null
          week_number: number
        }
        Insert: {
          category: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          day_number: number
          icon: string
          id?: string
          label: string
          plan_id: string
          task_id: string
          time_slot?: string | null
          week_number: number
        }
        Update: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          day_number?: number
          icon?: string
          id?: string
          label?: string
          plan_id?: string
          task_id?: string
          time_slot?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_tasks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "user_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostics: {
        Row: {
          age: number
          bmi: number | null
          bmr: number | null
          created_at: string
          email: string
          gender: string
          goal: string
          health_notes: string | null
          height: number
          id: string
          name: string
          plan_duration: number | null
          sport: string
          user_id: string | null
          weight: number
          whatsapp: string | null
        }
        Insert: {
          age: number
          bmi?: number | null
          bmr?: number | null
          created_at?: string
          email: string
          gender: string
          goal: string
          health_notes?: string | null
          height: number
          id?: string
          name: string
          plan_duration?: number | null
          sport: string
          user_id?: string | null
          weight: number
          whatsapp?: string | null
        }
        Update: {
          age?: number
          bmi?: number | null
          bmr?: number | null
          created_at?: string
          email?: string
          gender?: string
          goal?: string
          health_notes?: string | null
          height?: number
          id?: string
          name?: string
          plan_duration?: number | null
          sport?: string
          user_id?: string | null
          weight?: number
          whatsapp?: string | null
        }
        Relationships: []
      }
      progress_history: {
        Row: {
          id: string
          plan_id: string
          progress_percentage: number
          recorded_at: string
          tasks_completed: number
          tasks_total: number
          user_id: string
          week_key: string
          week_number: number
        }
        Insert: {
          id?: string
          plan_id: string
          progress_percentage?: number
          recorded_at?: string
          tasks_completed?: number
          tasks_total?: number
          user_id: string
          week_key: string
          week_number: number
        }
        Update: {
          id?: string
          plan_id?: string
          progress_percentage?: number
          recorded_at?: string
          tasks_completed?: number
          tasks_total?: number
          user_id?: string
          week_key?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "progress_history_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "user_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_plans: {
        Row: {
          created_at: string
          current_week: number
          diagnostic_id: string
          end_date: string
          goal: string
          id: string
          start_date: string
          status: string
          total_weeks: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_week?: number
          diagnostic_id: string
          end_date: string
          goal: string
          id?: string
          start_date: string
          status?: string
          total_weeks: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_week?: number
          diagnostic_id?: string
          end_date?: string
          goal?: string
          id?: string
          start_date?: string
          status?: string
          total_weeks?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_plans_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics"
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
