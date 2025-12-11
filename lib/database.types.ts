// Database types for Pragma Score
// Generated for Supabase PostgreSQL

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      assessments: {
        Row: {
          id: string;
          token: string;
          created_at: string;
          updated_at: string;
          name: string;
          email: string;
          company: string;
          phone: string | null;
          status: 'not_started' | 'in_progress' | 'submitted' | 'report_ready';
          current_step: number;
          responses: Json | null;
          scores: Json | null;
          insights: Json | null;
          stripe_session_id: string | null;
          stripe_payment_status: 'pending' | 'paid' | 'failed';
          amount_paid: number | null;
          is_demo: boolean;
          submitted_at: string | null;
        };
        Insert: {
          id?: string;
          token: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          email: string;
          company: string;
          phone?: string | null;
          status?: 'not_started' | 'in_progress' | 'submitted' | 'report_ready';
          current_step?: number;
          responses?: Json | null;
          scores?: Json | null;
          insights?: Json | null;
          stripe_session_id?: string | null;
          stripe_payment_status?: 'pending' | 'paid' | 'failed';
          amount_paid?: number | null;
          is_demo?: boolean;
          submitted_at?: string | null;
        };
        Update: {
          id?: string;
          token?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          email?: string;
          company?: string;
          phone?: string | null;
          status?: 'not_started' | 'in_progress' | 'submitted' | 'report_ready';
          current_step?: number;
          responses?: Json | null;
          scores?: Json | null;
          insights?: Json | null;
          stripe_session_id?: string | null;
          stripe_payment_status?: 'pending' | 'paid' | 'failed';
          amount_paid?: number | null;
          is_demo?: boolean;
          submitted_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Convenience types
export type Assessment = Database['public']['Tables']['assessments']['Row'];
export type AssessmentInsert = Database['public']['Tables']['assessments']['Insert'];
export type AssessmentUpdate = Database['public']['Tables']['assessments']['Update'];
