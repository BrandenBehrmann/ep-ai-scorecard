# Pragma Score Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the EP AI Scorecard landing page into Pragma Score — a standalone 6-dimension assessment tool with AI Investment budgeting analysis.

**Architecture:** Migrate core assessment functionality from ep-jonas-web, rebrand to Pragma Score, add 6th dimension (AI Investment) with new questions and scoring logic, extend AI insights generation.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Supabase, Stripe, OpenAI API

---

## Phase 1: Core Infrastructure

### Task 1: Create lib directory structure

**Files:**
- Create: `lib/supabase.ts`
- Create: `lib/utils.ts` (already exists, verify)
- Create: `lib/database.types.ts`

**Step 1: Create Supabase client**

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side client with service role
export function createServerClient() {
  return createClient<Database>(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

**Step 2: Create database types placeholder**

```typescript
// lib/database.types.ts
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
```

**Step 3: Commit**

```bash
git add lib/supabase.ts lib/database.types.ts
git commit -m "feat: add Supabase client and database types"
```

---

### Task 2: Create scoring logic with 6 dimensions

**Files:**
- Create: `lib/scoring.ts`

**Step 1: Create scoring module with all 6 dimensions**

```typescript
// lib/scoring.ts
export interface DimensionScore {
  dimension: string;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  interpretation: 'critical' | 'needs-work' | 'stable' | 'strong';
}

export interface ScorecardResult {
  totalScore: number;
  maxTotal: number;
  percentage: number;
  band: 'critical' | 'at-risk' | 'stable' | 'optimized';
  bandLabel: string;
  dimensions: DimensionScore[];
  topPriorities: string[];
  strengths: string[];
}

// Scale questions: some need inversion (higher number = worse situation)
const scaleQuestionConfig: Record<string, { invert: boolean }> = {
  // Control
  'control-2': { invert: false },
  'control-4': { invert: true },
  'control-6': { invert: true },
  // Clarity
  'clarity-3': { invert: true },
  'clarity-6': { invert: true },
  // Leverage
  'leverage-2': { invert: true },
  'leverage-6': { invert: false },
  // Friction
  'friction-2': { invert: true },
  'friction-6': { invert: true },
  // Change Readiness
  'change-3': { invert: false },
  // AI Investment (NEW)
  'ai-invest-4': { invert: false },
};

// Select questions mapped to scores (1-5)
const selectScoreMap: Record<string, Record<string, number>> = {
  'control-3': {
    'Less than 1 week': 5,
    '1-4 weeks': 4,
    '1-3 months': 3,
    '3-6 months': 2,
    'More than 6 months': 1,
    'We might not recover': 0,
  },
  'clarity-1': {
    'Yes, within 5%': 5,
    'Roughly, within 20%': 4,
    "I'd need to check": 3,
    "I'm not sure where to look": 2,
    "We don't track this in real-time": 1,
  },
  'leverage-1': {
    'Over $500K/employee': 5,
    '$200K-$500K/employee': 4,
    '$100K-$200K/employee': 3,
    '$50K-$100K/employee': 2,
    'Under $50K/employee': 1,
    "I don't know": 2,
  },
  'leverage-4': {
    'Mostly strategic work': 5,
    '30% operations, 70% strategic': 4,
    '50/50 split': 3,
    '70% operations, 30% strategic': 2,
    '90%+ in daily operations': 1,
  },
  'friction-3': {
    'Less than 1 week': 5,
    '1-2 weeks': 4,
    '1 month': 3,
    '2-3 months': 2,
    'More than 3 months': 1,
    "We don't have a clear onboarding process": 1,
  },
  'friction-5': {
    'Less than 1 hour': 5,
    '1-3 hours': 4,
    '3-5 hours': 3,
    '5-10 hours': 2,
    'More than 10 hours': 1,
    'I have no idea': 2,
  },
  'change-1': {
    'Within the last 3 months': 5,
    '3-6 months ago': 4,
    '6-12 months ago': 3,
    '1-2 years ago': 2,
    'More than 2 years ago': 1,
    "We've never successfully implemented a major change": 0,
  },
  'change-4': {
    'Yes - dedicated person/role': 5,
    'Partially - someone does it part-time': 4,
    'It falls on me (the owner)': 3,
    'We outsource this entirely': 3,
    'No - no clear owner': 1,
  },
  'change-6': {
    "Immediately - we're ready": 5,
    'Within a month': 4,
    'Within a quarter': 3,
    '6+ months - need to plan/budget': 2,
    'Not sure - depends on many factors': 2,
  },
  // AI Investment (NEW)
  'ai-invest-1': {
    'Yes, we have detailed tracking': 5,
    'Partially - we know roughly what we spend': 3,
    "No, it's bundled with other software costs": 2,
    "We don't use any AI/automation tools yet": 1,
  },
  'ai-invest-2': {
    "$0 - We don't use AI tools yet": 2,
    'Under $500/month': 3,
    '$500-$2,000/month': 4,
    '$2,000-$10,000/month': 5,
    'Over $10,000/month': 5,
    "I don't know": 1,
  },
  'ai-invest-3': {
    'Yes, with approved budget for this year': 5,
    "We're planning to allocate budget next quarter": 4,
    'It comes from general IT/operations budget': 3,
    'We evaluate AI spending case-by-case': 2,
    'No dedicated budget': 1,
  },
  'ai-invest-5': {
    'Yes, we have detailed cost projections': 5,
    'We have rough estimates': 3,
    "We've researched but haven't estimated our specific costs": 2,
    "Not yet - we don't know where to start": 1,
  },
};

// Multiselect scoring
function scoreMultiselect(questionId: string, answers: string[]): number {
  if (questionId === 'clarity-5') {
    let score = 3;
    if (answers.includes('One centralized system')) score += 2;
    if (answers.includes('CRM system') || answers.includes('ERP/business software')) score += 1;
    if (answers.includes('Spreadsheets')) score -= 0.5;
    if (answers.includes('Email threads')) score -= 1;
    if (answers.includes('Paper/physical files')) score -= 1;
    if (answers.includes('Employee knowledge (not written)')) score -= 1;
    if (answers.includes('Multiple disconnected tools')) score -= 1;
    return Math.max(1, Math.min(5, Math.round(score)));
  }
  return 3;
}

function getDimension(questionId: string): string {
  if (questionId.startsWith('control')) return 'control';
  if (questionId.startsWith('clarity')) return 'clarity';
  if (questionId.startsWith('leverage')) return 'leverage';
  if (questionId.startsWith('friction')) return 'friction';
  if (questionId.startsWith('change')) return 'change-readiness';
  if (questionId.startsWith('ai-invest')) return 'ai-investment';
  return 'unknown';
}

export function calculateScores(
  responses: Record<string, string | string[] | number>
): ScorecardResult {
  const dimensionScores: Record<string, { total: number; count: number }> = {
    'control': { total: 0, count: 0 },
    'clarity': { total: 0, count: 0 },
    'leverage': { total: 0, count: 0 },
    'friction': { total: 0, count: 0 },
    'change-readiness': { total: 0, count: 0 },
    'ai-investment': { total: 0, count: 0 },
  };

  for (const [questionId, value] of Object.entries(responses)) {
    const dimension = getDimension(questionId);
    if (dimension === 'unknown') continue;

    let score: number | null = null;

    if (typeof value === 'number' && scaleQuestionConfig[questionId]) {
      const config = scaleQuestionConfig[questionId];
      score = config.invert ? (6 - value) : value;
    } else if (typeof value === 'string' && selectScoreMap[questionId]) {
      score = selectScoreMap[questionId][value] ?? null;
    } else if (Array.isArray(value)) {
      score = scoreMultiselect(questionId, value);
    }

    if (score !== null) {
      dimensionScores[dimension].total += score;
      dimensionScores[dimension].count += 1;
    }
  }

  const dimensionLabels: Record<string, string> = {
    'control': 'Control',
    'clarity': 'Clarity',
    'leverage': 'Leverage',
    'friction': 'Friction',
    'change-readiness': 'Change Readiness',
    'ai-investment': 'AI Investment',
  };

  const dimensions: DimensionScore[] = Object.entries(dimensionScores).map(
    ([key, { total, count }]) => {
      const maxScore = count * 5;
      const normalizedMax = 17; // 100 / 6 dimensions ≈ 16.67, round to 17
      const normalizedScore = maxScore > 0
        ? Math.round((total / maxScore) * normalizedMax)
        : 0;
      const percentage = maxScore > 0 ? Math.round((total / maxScore) * 100) : 0;

      let interpretation: DimensionScore['interpretation'];
      if (percentage >= 80) interpretation = 'strong';
      else if (percentage >= 60) interpretation = 'stable';
      else if (percentage >= 40) interpretation = 'needs-work';
      else interpretation = 'critical';

      return {
        dimension: key,
        label: dimensionLabels[key],
        score: normalizedScore,
        maxScore: normalizedMax,
        percentage,
        interpretation,
      };
    }
  );

  const totalScore = dimensions.reduce((sum, d) => sum + d.score, 0);
  const maxTotal = 100;
  const percentage = Math.round((totalScore / maxTotal) * 100);

  let band: ScorecardResult['band'];
  let bandLabel: string;
  if (percentage >= 80) {
    band = 'optimized';
    bandLabel = 'Optimized - Ready for advanced AI';
  } else if (percentage >= 60) {
    band = 'stable';
    bandLabel = 'Stable - Good foundation, targeted improvements needed';
  } else if (percentage >= 40) {
    band = 'at-risk';
    bandLabel = 'At Risk - Significant gaps to address';
  } else {
    band = 'critical';
    bandLabel = 'Critical - Foundational work needed first';
  }

  const sortedByScore = [...dimensions].sort((a, b) => a.percentage - b.percentage);
  const topPriorities = sortedByScore
    .slice(0, 2)
    .filter(d => d.interpretation !== 'strong')
    .map(d => d.label);

  const strengths = sortedByScore
    .reverse()
    .slice(0, 2)
    .filter(d => d.interpretation === 'strong' || d.interpretation === 'stable')
    .map(d => d.label);

  return {
    totalScore,
    maxTotal,
    percentage,
    band,
    bandLabel,
    dimensions,
    topPriorities,
    strengths,
  };
}
```

**Step 2: Commit**

```bash
git add lib/scoring.ts
git commit -m "feat: add scoring logic with 6 dimensions including AI Investment"
```

---

### Task 3: Create assessment questions data

**Files:**
- Create: `lib/assessment-questions.ts`

**Step 1: Create questions data structure**

```typescript
// lib/assessment-questions.ts
export type QuestionType = 'scale' | 'text' | 'select' | 'multiselect';

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  scaleLabels?: { low: string; high: string };
  placeholder?: string;
  helpText?: string;
}

export interface AssessmentSection {
  id: string;
  label: string;
  description: string;
  intro: string;
  questions: Question[];
}

export const assessmentSections: AssessmentSection[] = [
  {
    id: 'control',
    label: 'Control',
    description: 'How much of your business runs without specific individuals',
    intro: 'These questions help us understand how dependent your operations are on specific people, including yourself.',
    questions: [
      {
        id: 'control-1',
        question: 'If you took an unplanned 2-week vacation starting tomorrow, what would break?',
        type: 'text',
        placeholder: 'Describe what processes, decisions, or functions would stall...',
        helpText: 'Be specific about which areas depend on you personally',
      },
      {
        id: 'control-2',
        question: 'How much of your core business process is documented in a way that a new hire could follow?',
        type: 'scale',
        scaleLabels: { low: 'Nothing documented', high: 'Fully documented SOPs' },
      },
      {
        id: 'control-3',
        question: 'If your top performer quit today, how long would it take to recover their output?',
        type: 'select',
        options: ['Less than 1 week', '1-4 weeks', '1-3 months', '3-6 months', 'More than 6 months', 'We might not recover'],
      },
      {
        id: 'control-4',
        question: 'What percentage of decisions require owner/founder approval before moving forward?',
        type: 'scale',
        scaleLabels: { low: '0% - Team is empowered', high: '100% - Everything needs approval' },
      },
      {
        id: 'control-5',
        question: 'Which critical functions are currently bottlenecked by a single person?',
        type: 'text',
        placeholder: 'List the functions and who they depend on...',
        helpText: 'Examples: Sales quotes, customer support escalations, financial approvals',
      },
      {
        id: 'control-6',
        question: 'How often do projects stall because someone is unavailable or on vacation?',
        type: 'scale',
        scaleLabels: { low: 'Never - work continues', high: 'Constantly - creates major delays' },
      },
    ],
  },
  {
    id: 'clarity',
    label: 'Clarity',
    description: "Visibility into what's happening across your operations",
    intro: "These questions assess how clearly you can see what's working, what's not, and where your business stands at any moment.",
    questions: [
      {
        id: 'clarity-1',
        question: 'Right now, without checking any system, do you know your current monthly revenue pace?',
        type: 'select',
        options: ['Yes, within 5%', 'Roughly, within 20%', "I'd need to check", "I'm not sure where to look", "We don't track this in real-time"],
      },
      {
        id: 'clarity-2',
        question: 'How do you currently track the status of active projects or orders?',
        type: 'text',
        placeholder: 'Describe your tracking method (spreadsheets, software, verbal updates, etc.)...',
        helpText: 'Be honest about how scattered or centralized this is',
      },
      {
        id: 'clarity-3',
        question: "When a customer asks \"where's my order/project?\", how quickly can anyone on your team answer?",
        type: 'scale',
        scaleLabels: { low: "Minutes - it's all visible", high: 'Hours/Days - requires digging' },
      },
      {
        id: 'clarity-4',
        question: 'How do you know if an employee is performing well or struggling?',
        type: 'text',
        placeholder: 'Describe how performance is measured and tracked...',
        helpText: 'Include both metrics and observation methods',
      },
      {
        id: 'clarity-5',
        question: 'Where does your critical business data live? (Select all that apply)',
        type: 'multiselect',
        options: ['Spreadsheets', 'Email threads', 'Paper/physical files', 'CRM system', 'ERP/business software', 'Employee knowledge (not written)', 'Multiple disconnected tools', 'One centralized system'],
      },
      {
        id: 'clarity-6',
        question: 'How often are you surprised by a problem that was visible to others but not escalated?',
        type: 'scale',
        scaleLabels: { low: 'Never - issues surface quickly', high: 'Often - blindsided by problems' },
      },
    ],
  },
  {
    id: 'leverage',
    label: 'Leverage',
    description: 'Output generated per unit of effort, time, or person',
    intro: 'These questions examine how efficiently your business converts inputs (time, people, money) into outputs (revenue, deliverables, growth).',
    questions: [
      {
        id: 'leverage-1',
        question: 'How much revenue does your business generate per employee (including yourself)?',
        type: 'select',
        options: ['Under $50K/employee', '$50K-$100K/employee', '$100K-$200K/employee', '$200K-$500K/employee', 'Over $500K/employee', "I don't know"],
      },
      {
        id: 'leverage-2',
        question: "What percentage of your team's time is spent on repetitive tasks that feel like they should be automated?",
        type: 'scale',
        scaleLabels: { low: '0% - Highly automated', high: '80%+ - Mostly manual work' },
      },
      {
        id: 'leverage-3',
        question: 'Describe the most time-consuming manual process in your business right now.',
        type: 'text',
        placeholder: 'What is it, who does it, how long does it take, how often?',
        helpText: 'This helps us identify high-impact automation opportunities',
      },
      {
        id: 'leverage-4',
        question: 'How much time do you personally spend working IN the business vs ON the business?',
        type: 'select',
        options: ['90%+ in daily operations', '70% operations, 30% strategic', '50/50 split', '30% operations, 70% strategic', 'Mostly strategic work'],
      },
      {
        id: 'leverage-5',
        question: 'If you could 10x one part of your business without adding headcount, what would it be?',
        type: 'text',
        placeholder: "What function or output would have the biggest impact if scaled?",
        helpText: "Think about what's currently limited by human capacity",
      },
      {
        id: 'leverage-6',
        question: 'How much of your revenue comes from recurring/repeat customers vs. new customer acquisition?',
        type: 'scale',
        scaleLabels: { low: 'Mostly new customers', high: 'Mostly recurring revenue' },
      },
    ],
  },
  {
    id: 'friction',
    label: 'Friction',
    description: 'Wasted motion, bottlenecks, and things that slow you down',
    intro: 'These questions identify where work gets stuck, repeated, or wasted in your current operations.',
    questions: [
      {
        id: 'friction-1',
        question: "What's the #1 thing that frustrates you most about your daily operations?",
        type: 'text',
        placeholder: "What keeps coming up that shouldn't be this hard?",
        helpText: 'Be specific - this often reveals the highest-impact fix',
      },
      {
        id: 'friction-2',
        question: 'How often does the same information need to be entered into multiple systems?',
        type: 'scale',
        scaleLabels: { low: 'Never - systems are connected', high: 'Constantly - lots of double entry' },
      },
      {
        id: 'friction-3',
        question: 'How long does it typically take to onboard a new employee to full productivity?',
        type: 'select',
        options: ['Less than 1 week', '1-2 weeks', '1 month', '2-3 months', 'More than 3 months', "We don't have a clear onboarding process"],
      },
      {
        id: 'friction-4',
        question: 'What are the top 3 reasons work gets stuck or delayed in your business?',
        type: 'text',
        placeholder: 'List the most common blockers you encounter...',
        helpText: 'Examples: Waiting for approvals, missing information, unclear ownership',
      },
      {
        id: 'friction-5',
        question: 'How much time per week does your team spend looking for information, files, or answers?',
        type: 'select',
        options: ['Less than 1 hour', '1-3 hours', '3-5 hours', '5-10 hours', 'More than 10 hours', 'I have no idea'],
      },
      {
        id: 'friction-6',
        question: 'How often do mistakes or miscommunications require rework?',
        type: 'scale',
        scaleLabels: { low: 'Rarely - quality is consistent', high: 'Daily - constant fixes needed' },
      },
    ],
  },
  {
    id: 'change-readiness',
    label: 'Change Readiness',
    description: 'Your organization\'s ability to adopt new systems and improve',
    intro: 'These questions assess how prepared your business is to implement changes, adopt new tools, and continuously improve.',
    questions: [
      {
        id: 'change-1',
        question: 'When was the last time you successfully implemented a new system or major process change?',
        type: 'select',
        options: ['Within the last 3 months', '3-6 months ago', '6-12 months ago', '1-2 years ago', 'More than 2 years ago', "We've never successfully implemented a major change"],
      },
      {
        id: 'change-2',
        question: 'What happened with the last tool or system you tried to implement? Why did it succeed or fail?',
        type: 'text',
        placeholder: 'Describe the tool, the outcome, and what you learned...',
        helpText: 'Honest reflection here helps us avoid past mistakes',
      },
      {
        id: 'change-3',
        question: "How would you describe your team's attitude toward new technology and processes?",
        type: 'scale',
        scaleLabels: { low: 'Resistant - prefer familiar ways', high: 'Eager - embrace new approaches' },
      },
      {
        id: 'change-4',
        question: 'Do you have someone internally who can own and champion new system implementations?',
        type: 'select',
        options: ['Yes - dedicated person/role', 'Partially - someone does it part-time', 'It falls on me (the owner)', 'We outsource this entirely', 'No - no clear owner'],
      },
      {
        id: 'change-5',
        question: "What's the biggest barrier to making operational improvements in your business?",
        type: 'text',
        placeholder: 'What stops you from fixing things you know are broken?',
        helpText: 'Common answers: time, budget, expertise, team buy-in, unclear ROI',
      },
      {
        id: 'change-6',
        question: 'If we identified a high-ROI improvement, how quickly could you act on it?',
        type: 'select',
        options: ["Immediately - we're ready", 'Within a month', 'Within a quarter', '6+ months - need to plan/budget', 'Not sure - depends on many factors'],
      },
    ],
  },
  {
    id: 'ai-investment',
    label: 'AI Investment',
    description: 'Your readiness to budget for and measure AI initiatives',
    intro: 'These questions assess how prepared your business is to invest in AI — tracking current spend, allocating budget, and measuring ROI.',
    questions: [
      {
        id: 'ai-invest-1',
        question: 'Do you currently track spending on AI/automation tools separately from other software?',
        type: 'select',
        options: ['Yes, we have detailed tracking', 'Partially - we know roughly what we spend', "No, it's bundled with other software costs", "We don't use any AI/automation tools yet"],
      },
      {
        id: 'ai-invest-2',
        question: "What's your approximate monthly spend on AI-related tools and services (chatbots, automation, analytics, etc.)?",
        type: 'select',
        options: ["$0 - We don't use AI tools yet", 'Under $500/month', '$500-$2,000/month', '$2,000-$10,000/month', 'Over $10,000/month', "I don't know"],
      },
      {
        id: 'ai-invest-3',
        question: 'Do you have a dedicated budget line item or allocation for AI/automation initiatives?',
        type: 'select',
        options: ['Yes, with approved budget for this year', "We're planning to allocate budget next quarter", 'It comes from general IT/operations budget', 'We evaluate AI spending case-by-case', 'No dedicated budget'],
      },
      {
        id: 'ai-invest-4',
        question: 'How do you currently evaluate the return on investment (ROI) for technology purchases?',
        type: 'scale',
        scaleLabels: { low: "Gut feel / we don't track ROI", high: 'Formal ROI analysis with tracked metrics' },
      },
      {
        id: 'ai-invest-5',
        question: 'Have you estimated what it would cost to implement AI solutions in your business?',
        type: 'select',
        options: ['Yes, we have detailed cost projections', 'We have rough estimates', "We've researched but haven't estimated our specific costs", "Not yet - we don't know where to start"],
      },
      {
        id: 'ai-invest-6',
        question: 'What concerns you most about AI implementation costs? What hidden costs worry you?',
        type: 'text',
        placeholder: 'Examples: ongoing subscription fees, training time, integration complexity, maintenance...',
        helpText: 'Be specific about your concerns - this helps us provide targeted guidance',
      },
    ],
  },
];
```

**Step 2: Commit**

```bash
git add lib/assessment-questions.ts
git commit -m "feat: add assessment questions data with 6 dimensions (36 questions)"
```

---

## Phase 2: API Routes

### Task 4: Create checkout API route

**Files:**
- Create: `app/api/checkout/route.ts`

**Step 1: Create Stripe checkout endpoint**

```typescript
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, phone } = await request.json();

    if (!name || !email || !company) {
      return NextResponse.json(
        { error: 'Name, email, and company are required' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Pragma Score Assessment',
              description: '6-dimension operational diagnostic with AI-powered insights',
            },
            unit_amount: 150000, // $1,500.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/assessment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/assessment/start`,
      customer_email: email,
      metadata: {
        name,
        email,
        company,
        phone: phone || '',
      },
    });

    // Create assessment record in Supabase
    const supabase = createServerClient();
    const { error: dbError } = await supabase.from('assessments').insert({
      name,
      email,
      company,
      phone: phone || null,
      status: 'not_started',
      current_step: 0,
      stripe_session_id: session.id,
    });

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue anyway - Stripe session is created
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add app/api/checkout/route.ts
git commit -m "feat: add Stripe checkout API route"
```

---

### Task 5: Create assessments API routes

**Files:**
- Create: `app/api/assessments/[token]/route.ts`

**Step 1: Create assessment CRUD endpoint**

```typescript
// app/api/assessments/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { calculateScores } from '@/lib/scoring';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServerClient();

  const { data: assessment, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', token)
    .single();

  if (error || !assessment) {
    return NextResponse.json(
      { error: 'Assessment not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ assessment });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();
  const supabase = createServerClient();

  const updateData: Record<string, unknown> = {};

  if (body.responses !== undefined) {
    updateData.responses = body.responses;
  }
  if (body.current_step !== undefined) {
    updateData.current_step = body.current_step;
  }
  if (body.status !== undefined) {
    updateData.status = body.status;

    // Calculate scores when submitting
    if (body.status === 'submitted' && body.responses) {
      const scores = calculateScores(body.responses);
      updateData.scores = {
        total: scores.totalScore,
        percentage: scores.percentage,
        band: scores.band,
        bandLabel: scores.bandLabel,
        control: scores.dimensions.find(d => d.dimension === 'control')?.score || 0,
        clarity: scores.dimensions.find(d => d.dimension === 'clarity')?.score || 0,
        leverage: scores.dimensions.find(d => d.dimension === 'leverage')?.score || 0,
        friction: scores.dimensions.find(d => d.dimension === 'friction')?.score || 0,
        changeReadiness: scores.dimensions.find(d => d.dimension === 'change-readiness')?.score || 0,
        aiInvestment: scores.dimensions.find(d => d.dimension === 'ai-investment')?.score || 0,
        dimensions: scores.dimensions,
        topPriorities: scores.topPriorities,
        strengths: scores.strengths,
      };
    }
  }

  const { data: assessment, error } = await supabase
    .from('assessments')
    .update(updateData)
    .eq('id', token)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update assessment' },
      { status: 500 }
    );
  }

  return NextResponse.json({ assessment });
}
```

**Step 2: Commit**

```bash
git add app/api/assessments/[token]/route.ts
git commit -m "feat: add assessment CRUD API with scoring calculation"
```

---

## Phase 3: Landing Page Updates

### Task 6: Update landing page branding to Pragma Score

**Files:**
- Modify: `components/sections/Header.tsx`
- Modify: `components/sections/Footer.tsx`
- Modify: `components/sections/HeroSection.tsx`

**Step 1: Update Header branding**

In `components/sections/Header.tsx`, change:
- Logo alt text to "Pragma Score"
- Add "by Ena Pragma" subtitle
- Update navigation links

**Step 2: Update Footer branding**

In `components/sections/Footer.tsx`, change:
- Product name to "Pragma Score"
- Add "by Ena Pragma" attribution
- Update contact email if needed

**Step 3: Update Hero section**

In `components/sections/HeroSection.tsx`, change:
- Badge: "30-minute diagnostic" (was 25)
- Headline: Reference 6 dimensions
- Stats: "36 questions | 6 dimensions"

**Step 4: Commit**

```bash
git add components/sections/Header.tsx components/sections/Footer.tsx components/sections/HeroSection.tsx
git commit -m "feat: rebrand to Pragma Score with 6 dimensions"
```

---

### Task 7: Update Dimensions section with AI Investment

**Files:**
- Modify: `components/sections/DimensionsSection.tsx`

**Step 1: Add AI Investment dimension card**

Add 6th dimension to the dimensions array with:
- Icon: Calculator or DollarSign
- Title: "AI Investment"
- Description: "Spend awareness, budget allocation, cost forecasting, and ROI tracking for AI initiatives"
- Color: Unique gradient (suggest green-teal for financial theme)

**Step 2: Commit**

```bash
git add components/sections/DimensionsSection.tsx
git commit -m "feat: add AI Investment as 6th dimension"
```

---

### Task 8: Update How It Works and FAQ sections

**Files:**
- Modify: `components/sections/HowItWorksSection.tsx`
- Modify: `components/sections/FAQSection.tsx`

**Step 1: Update How It Works**

Change step 2 description: "Answer 36 questions across 6 operational dimensions"

**Step 2: Update FAQ**

- Update "How long does the assessment take?" to "About 30 minutes. It's 36 questions across 6 dimensions."
- Add new FAQ: "Why does the assessment include AI budgeting questions?"
  - Answer: "Most businesses underestimate AI implementation costs. Our AI Investment dimension helps you understand your current spend, budget readiness, and identifies potential hidden costs before you invest."

**Step 3: Commit**

```bash
git add components/sections/HowItWorksSection.tsx components/sections/FAQSection.tsx
git commit -m "feat: update How It Works and FAQ for 6 dimensions"
```

---

## Phase 4: Assessment Portal

### Task 9: Create assessment start page

**Files:**
- Create: `app/assessment/start/page.tsx`

**Step 1: Create the start page with Stripe checkout**

This page collects name, email, company, phone and initiates Stripe checkout.
Copy structure from ep-jonas-web with Pragma Score branding.

**Step 2: Commit**

```bash
git add app/assessment/start/page.tsx
git commit -m "feat: add assessment start page with Stripe checkout"
```

---

### Task 10: Create assessment portal page

**Files:**
- Create: `app/assessment/portal/page.tsx`

**Step 1: Create the assessment portal**

- Import questions from `lib/assessment-questions.ts`
- 6 sections with progress tracking
- Auto-save responses to Supabase
- Submit redirects to report page

**Step 2: Commit**

```bash
git add app/assessment/portal/page.tsx
git commit -m "feat: add assessment portal with 6-section questionnaire"
```

---

### Task 11: Create assessment success page

**Files:**
- Create: `app/assessment/success/page.tsx`

**Step 1: Create success/redirect page**

After Stripe payment, verify session and redirect to portal with token.

**Step 2: Commit**

```bash
git add app/assessment/success/page.tsx
git commit -m "feat: add assessment success page with payment verification"
```

---

## Phase 5: Report Page

### Task 12: Create report page structure

**Files:**
- Create: `app/assessment/report/page.tsx`

**Step 1: Create basic report page**

- Fetch assessment data by token
- Display overall score with band
- Show 6 dimension breakdown
- Include AI Investment insights section

**Step 2: Commit**

```bash
git add app/assessment/report/page.tsx
git commit -m "feat: add report page with 6-dimension scorecard display"
```

---

### Task 13: Create AI insights API

**Files:**
- Create: `lib/ai-insights.ts`
- Create: `app/api/insights/[token]/route.ts`

**Step 1: Create AI insights generator**

OpenAI prompt that analyzes responses and generates:
- Executive summary
- Per-dimension insights (including AI Investment)
- Recommendations
- Implementation roadmap

**Step 2: Create API route**

Endpoint that generates and caches AI insights.

**Step 3: Commit**

```bash
git add lib/ai-insights.ts app/api/insights/[token]/route.ts
git commit -m "feat: add AI insights generation with OpenAI"
```

---

## Phase 6: Final Integration

### Task 14: Update environment variables

**Files:**
- Modify: `.env.example`

**Step 1: Ensure all required env vars are documented**

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# OpenAI
OPENAI_API_KEY=

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: update environment variables documentation"
```

---

### Task 15: Final build verification

**Step 1: Run build**

```bash
npm run build
```

**Expected:** Build succeeds with no errors

**Step 2: Run dev server and test**

```bash
npm run dev
```

Test:
1. Landing page loads with 6 dimensions
2. Start assessment page loads
3. All routes resolve

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Pragma Score implementation"
```

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| 1 | 1-3 | Core infrastructure (Supabase, scoring, questions) |
| 2 | 4-5 | API routes (checkout, assessments) |
| 3 | 6-8 | Landing page updates (branding, dimensions) |
| 4 | 9-11 | Assessment portal (start, portal, success) |
| 5 | 12-13 | Report page and AI insights |
| 6 | 14-15 | Final integration and verification |

**Total Tasks:** 15
**Estimated Implementation:** Execute with subagent-driven-development for task-by-task review
