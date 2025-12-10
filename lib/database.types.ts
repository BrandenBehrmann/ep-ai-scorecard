export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
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
        Insert: Omit<Database['public']['Tables']['assessments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['assessments']['Insert']>;
      };
    };
  };
}
