# Pragma Score - Design Document

**Date:** 2025-12-10
**Project:** EP AI Scorecard → Pragma Score (standalone website)
**Status:** Design Approved

---

## Executive Summary

Pragma Score is a standalone SaaS diagnostic tool that measures business operational readiness for AI implementation. It extends the existing 5-dimension assessment with a new **6th dimension: AI Investment** — covering spend awareness, budget allocation, and cost forecasting.

**Key Differentiator:** Most AI readiness tools measure *readiness* but not *cost planning*. Pragma Score combines operational health assessment with AI budgeting analysis, giving SMBs actionable financial guidance.

---

## Brand Identity

### Name: **Pragma Score**
- **Etymology:** From Greek "πράγμα" (pragma) = deed, action, thing done
- **Connection:** Directly ties to Ena Pragma ("one thing") brand philosophy
- **Tagline Options:**
  - "Know your operational truth. Plan your AI future."
  - "The 6-dimensional diagnostic for AI-ready operations."
  - "Measure what matters before you automate."

### Visual Identity
- **Parent Brand:** Sub-brand of Ena Pragma (EP attribution in footer)
- **Color Scheme:** Amber/earth tones (matching EP), dark/light mode support
- **Typography:** Modern, clean (inheriting EP's classical-modern fusion)
- **Aesthetic:** Greek philosophy + modern tech (λ, π symbols as decorative elements)

### Domain Options
- pragmascore.com (primary)
- pragmascore.ai (alternative)
- getpragmascore.com (backup)

---

## Product Overview

### Target Market
- Business owners and operators
- Company size: 5-50 employees
- Revenue: $1M-$50M
- Concern: Understanding operational health before AI investments

### Pricing
- **One-time payment:** $1,500
- **Deliverables:**
  1. Personalized scorecard report (6 dimensions, 0-100 score)
  2. AI-generated insights with EP consultant analysis
  3. Priority recommendations ranked by impact
  4. 30-minute complimentary strategy session
  5. Action roadmap (phased implementation plan)

---

## The 6 Dimensions

| # | Dimension | What It Measures | Questions |
|---|-----------|------------------|-----------|
| 1 | **Control** | Key-person dependency, documentation, decision bottlenecks | 6 |
| 2 | **Clarity** | Visibility into operations, real-time awareness | 6 |
| 3 | **Leverage** | Output per effort, automation potential | 6 |
| 4 | **Friction** | Bottlenecks, errors, waste in processes | 6 |
| 5 | **Change Readiness** | Capacity to adopt new systems | 6 |
| 6 | **AI Investment** *(NEW)* | Spend awareness, budget allocation, cost forecasting, ROI tracking | 6 |

**Total Questions:** 36 (was 30, adding 6 for new dimension)
**Estimated Completion Time:** 30 minutes (was 25)

---

## New Dimension: AI Investment

### Purpose
Help businesses understand and plan for AI implementation costs. This addresses a gap in the market where 65% of IT leaders report unexpected AI charges.

### Question Design

#### AI-INVEST-1: Current Spend Tracking
**Question:** "Do you currently track spending on AI/automation tools separately from other software?"
**Type:** Select
**Options & Scores:**
- "Yes, we have detailed tracking" → 5
- "Partially - we know roughly what we spend" → 3
- "No, it's bundled with other software costs" → 2
- "We don't use any AI/automation tools yet" → 1

#### AI-INVEST-2: Current Monthly Spend
**Question:** "What's your approximate monthly spend on AI-related tools and services (chatbots, automation, analytics, etc.)?"
**Type:** Select
**Options & Scores:**
- "$0 - We don't use AI tools yet" → 2 (neutral - awareness matters)
- "Under $500/month" → 3
- "$500-$2,000/month" → 4
- "$2,000-$10,000/month" → 5
- "Over $10,000/month" → 5
- "I don't know" → 1

#### AI-INVEST-3: Budget Allocation
**Question:** "Do you have a dedicated budget line item or allocation for AI/automation initiatives?"
**Type:** Select
**Options & Scores:**
- "Yes, with approved budget for this year" → 5
- "We're planning to allocate budget next quarter" → 4
- "It comes from general IT/operations budget" → 3
- "We evaluate AI spending case-by-case" → 2
- "No dedicated budget" → 1

#### AI-INVEST-4: ROI Measurement
**Question:** "How do you currently evaluate the return on investment (ROI) for technology purchases?"
**Type:** Scale (1-5)
**Scale Labels:**
- Low (1): "Gut feel / we don't track ROI"
- High (5): "Formal ROI analysis with tracked metrics"

#### AI-INVEST-5: Cost Estimation
**Question:** "Have you estimated what it would cost to implement AI solutions in your business?"
**Type:** Select
**Options & Scores:**
- "Yes, we have detailed cost projections" → 5
- "We have rough estimates" → 3
- "We've researched but haven't estimated our specific costs" → 2
- "Not yet - we don't know where to start" → 1

#### AI-INVEST-6: Cost Concerns (Qualitative)
**Question:** "What concerns you most about AI implementation costs? What hidden costs worry you?"
**Type:** Text
**Placeholder:** "Examples: ongoing subscription fees, training time, integration complexity, maintenance..."
**Help Text:** "Be specific about your concerns - this helps us provide targeted guidance"
**Scoring:** Qualitative only — used for AI-generated insights

### Scoring Logic

```typescript
// Add to lib/scoring.ts

const aiInvestScoreMap: Record<string, Record<string, number>> = {
  'ai-invest-1': {
    'Yes, we have detailed tracking': 5,
    'Partially - we know roughly what we spend': 3,
    'No, it\'s bundled with other software costs': 2,
    'We don\'t use any AI/automation tools yet': 1,
  },
  'ai-invest-2': {
    '$0 - We don\'t use AI tools yet': 2,
    'Under $500/month': 3,
    '$500-$2,000/month': 4,
    '$2,000-$10,000/month': 5,
    'Over $10,000/month': 5,
    'I don\'t know': 1,
  },
  'ai-invest-3': {
    'Yes, with approved budget for this year': 5,
    'We\'re planning to allocate budget next quarter': 4,
    'It comes from general IT/operations budget': 3,
    'We evaluate AI spending case-by-case': 2,
    'No dedicated budget': 1,
  },
  'ai-invest-5': {
    'Yes, we have detailed cost projections': 5,
    'We have rough estimates': 3,
    'We\'ve researched but haven\'t estimated our specific costs': 2,
    'Not yet - we don\'t know where to start': 1,
  },
};

// Scale question config
const scaleQuestionConfig = {
  // ... existing config ...
  'ai-invest-4': { invert: false }, // Higher = better (formal ROI process)
};
```

---

## Site Architecture

```
pragmascore.com/
├── / (Landing Page)
│   ├── Hero Section
│   │   └── "Your operational truth score" + 30-min badge
│   ├── Dimensions Section (6 cards)
│   │   └── Highlight AI Investment as differentiator
│   ├── AI Investment Preview Section (NEW)
│   │   └── "The missing piece: Know your AI costs before you invest"
│   ├── How It Works (4 steps)
│   ├── Sample Report Preview
│   ├── Pricing ($1,500 + deliverables)
│   ├── FAQ (expanded with AI budgeting questions)
│   └── Footer ("by Ena Pragma")
│
├── /assessment
│   ├── /start
│   │   └── Email capture + Stripe checkout
│   ├── /portal?token=xxx
│   │   └── 36-question diagnostic (6 sections)
│   └── /complete
│       └── Confirmation + next steps
│
├── /results/[token]
│   ├── Score Overview (0-100 with 6 dimension breakdown)
│   ├── AI Investment Insights (NEW)
│   │   ├── Current spend analysis
│   │   ├── Budget readiness assessment
│   │   ├── Cost projection recommendations
│   │   └── Hidden cost warnings
│   ├── Priority Recommendations
│   ├── Implementation Roadmap
│   └── Book Strategy Call CTA
│
├── /admin (protected)
│   ├── Dashboard
│   ├── Reports Management
│   └── Settings
│
└── /api
    ├── /checkout (Stripe session)
    ├── /webhook (Stripe confirmation)
    ├── /assessments/[token] (CRUD)
    ├── /insights/[token] (OpenAI generation)
    └── /generate-report (PDF generation)
```

---

## Report Enhancements

### New Section: AI Investment Analysis

The report will include a dedicated section for AI Investment insights:

#### 1. Current State Assessment
- **Spend Awareness Score:** Are they tracking AI costs?
- **Current Investment Level:** How much are they already spending?
- **Tracking Maturity:** Detailed vs. bundled vs. none

#### 2. Budget Readiness
- **Allocation Status:** Dedicated budget vs. ad-hoc
- **Approval Process:** How decisions get made
- **Planning Horizon:** Reactive vs. proactive

#### 3. ROI Capability
- **Measurement Maturity:** Gut feel → Formal tracking
- **Success Metrics:** What they track (if anything)
- **Improvement Recommendations:** How to build ROI capability

#### 4. Cost Projections (EP-Added Insights)
Based on company size and current spend:
- **Estimated AI Implementation Costs:** Ranges for their business
- **Hidden Cost Warnings:** Training, integration, maintenance
- **Budget Recommendations:** What to allocate for Year 1

#### 5. AI-Generated Personalized Analysis
Using responses to text questions:
- Specific cost concerns addressed
- Tailored recommendations for their situation
- Risk factors based on their answers

---

## Technical Implementation

### Tech Stack (Inherited from ep-jonas-web)
- **Framework:** Next.js 15 + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + Framer Motion
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **AI:** OpenAI API (GPT-4)
- **Deployment:** Vercel

### Database Schema Updates

```sql
-- Add new dimension to assessments table
ALTER TABLE assessments ADD COLUMN ai_investment_responses JSONB;

-- Or extend existing responses JSONB to include ai-invest-* keys
-- (Recommended: keep existing structure, just add new question IDs)
```

### Scoring System Updates

```typescript
// lib/scoring.ts - Add AI Investment dimension

const dimensionScores: Record<string, { total: number; count: number }> = {
  'control': { total: 0, count: 0 },
  'clarity': { total: 0, count: 0 },
  'leverage': { total: 0, count: 0 },
  'friction': { total: 0, count: 0 },
  'change-readiness': { total: 0, count: 0 },
  'ai-investment': { total: 0, count: 0 }, // NEW
};

const dimensionLabels: Record<string, string> = {
  // ... existing ...
  'ai-investment': 'AI Investment',
};

// Update getDimension function
function getDimension(questionId: string): string {
  // ... existing ...
  if (questionId.startsWith('ai-invest')) return 'ai-investment';
  return 'unknown';
}
```

### AI Prompt Updates

```typescript
// lib/ai-insights.ts - Add AI Investment analysis

const systemPrompt = `
You are analyzing an AI Leverage Scorecard assessment for a business.

The assessment now includes 6 dimensions:
1. Control - Key-person dependency and documentation
2. Clarity - Operational visibility
3. Leverage - Efficiency and automation potential
4. Friction - Bottlenecks and waste
5. Change Readiness - Adoption capability
6. AI Investment - Cost awareness, budget allocation, ROI tracking (NEW)

For the AI Investment dimension, provide:
- Assessment of their current AI spend tracking maturity
- Budget readiness evaluation
- ROI capability analysis
- Specific cost concerns they mentioned and how to address them
- Recommendations for building AI investment capability

Be specific to their responses. Quote their text answers when relevant.
`;
```

---

## Migration Plan

### From ep-jonas-web to Pragma Score

1. **Copy Core Files:**
   - `lib/scoring.ts` → extend with AI Investment
   - `lib/ai-insights.ts` → update prompts
   - `lib/supabase.ts` → configure for new project
   - `app/assessment/*` → portal, report, start pages
   - `app/api/*` → checkout, webhook, assessments, insights

2. **Update Branding:**
   - Replace "AI Leverage Scorecard" → "Pragma Score"
   - Update logos (keep EP attribution)
   - Update colors if needed

3. **Add New Dimension:**
   - Add questions to portal
   - Update scoring logic
   - Update AI prompts
   - Add report section

4. **Update Landing Page:**
   - Change to 6 dimensions
   - Add AI Investment preview section
   - Update FAQ with cost-related questions

---

## Success Metrics

- **Conversion Rate:** Landing page → Purchase (target: 3-5%)
- **Completion Rate:** Started → Submitted (target: 85%+)
- **Strategy Call Booking:** Submitted → Call booked (target: 60%+)
- **Customer Satisfaction:** Post-call survey (target: 4.5+/5)

---

## Timeline Considerations

### Phase 1: Core Migration
- Set up new Vercel project
- Migrate existing assessment functionality
- Update branding to Pragma Score

### Phase 2: New Dimension
- Implement AI Investment questions
- Update scoring logic
- Extend AI insights prompts

### Phase 3: Enhanced Report
- Add AI Investment section to report
- Add cost projection templates
- EP consultant review workflow

### Phase 4: Launch
- Domain setup (pragmascore.com)
- Stripe product configuration
- Production deployment

---

## Open Questions for EP Team

1. **Cost Projection Data:** Do you have benchmark data for AI implementation costs by company size/industry to include in reports?

2. **Consultant Workflow:** How will EP consultants add their targeted insights? Manual edit, admin dashboard, or template system?

3. **Re-assessment Pricing:** What's the discounted rate for 6-month re-assessments?

4. **Domain:** Confirm pragmascore.com availability and preference

---

## Appendix: Research Sources

- [Microsoft AI Readiness Assessment](https://learn.microsoft.com/en-us/assessments/94f1c697-9ba7-4d47-ad83-7c6bd94b1505/)
- [Cisco AI Readiness Assessment](https://www.cisco.com/c/m/en_us/solutions/ai/readiness-index/assessment-tool.html)
- [Saxon.AI Readiness Assessment](https://saxon.ai/ai-readiness-assessment/)
- [Avanade AI Readiness Assessment](https://www.avanade.com/en/services/artificial-intelligence/ai-readiness-hub/ai-readiness-assessment)
- [Zylo 2025 AI Cost Report](https://zylo.com/blog/ai-cost/)
- [BetterCloud SaaS Budgeting](https://www.bettercloud.com/monitor/smart-saas-budgeting-refine-your-spend-strategy/)
- [HubSpot SaaS Landing Pages 2025](https://blog.hubspot.com/marketing/saas-landing-page)
- [Design Studio SaaS Trends 2025](https://www.designstudiouiux.com/blog/top-saas-design-trends/)
