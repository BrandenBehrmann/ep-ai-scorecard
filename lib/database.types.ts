// Database types for Revenue Friction Diagnostic
// Generated for Supabase PostgreSQL
// Updated: December 2025 - v2 pivot

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
          status: 'not_started' | 'in_progress' | 'submitted' | 'pending_review' | 'report_ready' | 'released';
          current_step: number;
          responses: Json | null;
          scores: Json | null;
          insights: Json | null;
          // v2 Revenue Friction Diagnostic fields
          version: 'v1_legacy' | 'v2_revenue_friction';
          constraint_result: Json | null;
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
          status?: 'not_started' | 'in_progress' | 'submitted' | 'pending_review' | 'report_ready' | 'released';
          current_step?: number;
          responses?: Json | null;
          scores?: Json | null;
          insights?: Json | null;
          // v2 Revenue Friction Diagnostic fields
          version?: 'v1_legacy' | 'v2_revenue_friction';
          constraint_result?: Json | null;
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
          status?: 'not_started' | 'in_progress' | 'submitted' | 'pending_review' | 'report_ready' | 'released';
          current_step?: number;
          responses?: Json | null;
          scores?: Json | null;
          insights?: Json | null;
          // v2 Revenue Friction Diagnostic fields
          version?: 'v1_legacy' | 'v2_revenue_friction';
          constraint_result?: Json | null;
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

// v2 Revenue Friction Diagnostic Types
export type AssessmentVersion = 'v1_legacy' | 'v2_revenue_friction';
export type AssessmentStatus = 'not_started' | 'in_progress' | 'submitted' | 'pending_review' | 'report_ready' | 'released';

export type ConstraintCategory =
  | 'intake_friction'
  | 'followup_leakage'
  | 'visibility_gaps'
  | 'human_dependency'
  | 'decision_redundancy';

export interface ConstraintResult {
  primaryConstraint: {
    category: ConstraintCategory;
    label: string;
    ownerStatement: string;  // Their exact words from tradeoff-1
    supportingEvidence: string[];  // Quotes from earlier sections
  };
  deprioritized: {
    statement: string;  // Their exact words from tradeoff-2
  };
  categorySignals: Record<ConstraintCategory, string[]>;  // All evidence by category
  patternAnalysis: PatternAnalysis;  // Pattern synthesis for AI analysis
}

// ============================================================================
// PATTERN ANALYSIS TYPES
// Used to pre-process answers BEFORE AI generation
// This enables pattern synthesis (not judgment) - connecting dots across answers
// ============================================================================

export interface PatternAnalysis {
  // Entities that appear across multiple answers (structural dependencies)
  repeatedEntities: Array<{
    entity: string;                                       // e.g., "email", "owner", "spreadsheet"
    occurrences: Array<{ questionId: string; context: string }>;  // Where it appeared with context
    significance: string;                                 // Why this repetition matters
  }>;

  // Statements that logically conflict with each other
  contradictions: Array<{
    statement1: { questionId: string; text: string };
    statement2: { questionId: string; text: string };
    tension: string;                                      // Description of the conflict
  }>;

  // Numbers extracted from answers that can be annualized/quantified
  quantifiableData: Array<{
    questionId: string;
    rawText: string;                                      // Their exact words
    number: string;                                       // Extracted number
    unit: string;                                         // hours/week, times/month, etc.
    annualized?: string;                                  // Calculated annual impact
  }>;

  // What fixing the primary constraint will expose next
  secondOrderEffects: Array<{
    ifFixed: string;                                      // The constraint being fixed
    thenExposed: string;                                  // What becomes the next problem
  }>;
}

// Category labels for display
export const CONSTRAINT_CATEGORY_LABELS: Record<ConstraintCategory, string> = {
  intake_friction: 'Intake Friction',
  followup_leakage: 'Follow-Up Leakage',
  visibility_gaps: 'Visibility Gaps',
  human_dependency: 'Human Dependency',
  decision_redundancy: 'Decision Redundancy',
};

// EP System Lanes (the ONLY 4 allowed)
export const EP_SYSTEM_LANES = {
  intake_friction: {
    name: 'Intake Normalization System',
    description: 'Fixes how work enters, gets structured, and gets owned.',
  },
  followup_leakage: {
    name: 'Follow-Up Enforcement System',
    description: 'Prevents revenue and work from going dark.',
  },
  visibility_gaps: {
    name: 'Visibility & Control System',
    description: 'Gives owners real-time awareness without meetings.',
  },
  human_dependency: {
    name: 'Human Dependency Reduction System',
    description: 'Removes single points of failure and manual re-entry.',
  },
  decision_redundancy: null, // No fixed lane for this category
} as const;
