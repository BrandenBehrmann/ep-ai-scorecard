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
          created_at: string;
          name: string;
          email: string;
          company: string;
          phone: string | null;
          status: 'not_started' | 'in_progress' | 'submitted' | 'report_ready';
          current_step: number;
          responses: Json | null;
          scores: Json | null;
          stripe_session_id: string | null;
          report_url: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          email: string;
          company: string;
          phone?: string | null;
          status: 'not_started' | 'in_progress' | 'submitted' | 'report_ready';
          current_step: number;
          responses?: Json | null;
          scores?: Json | null;
          stripe_session_id?: string | null;
          report_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          email?: string;
          company?: string;
          phone?: string | null;
          status?: 'not_started' | 'in_progress' | 'submitted' | 'report_ready';
          current_step?: number;
          responses?: Json | null;
          scores?: Json | null;
          stripe_session_id?: string | null;
          report_url?: string | null;
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
