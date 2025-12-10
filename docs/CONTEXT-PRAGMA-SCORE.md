# Pragma Score Implementation Context

**Last Updated:** 2025-12-10
**Branch:** `feature/pragma-score`
**Worktree:** `/Users/brandenbehrmann/Documents/Development/ep-ai-scorecard-1/.worktrees/pragma-score`

---

## Project Overview

Transforming EP AI Scorecard into **Pragma Score** — a standalone 6-dimension assessment tool with AI Investment budgeting analysis.

**Key Differentiator:** Combines operational readiness assessment with AI cost/budget planning (most competitors only measure readiness, not costs).

---

## Current Progress

### Completed Tasks (3/15)

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Supabase client + database types | `620d5f2` |
| 2 | Scoring logic with 6 dimensions | `015bfff` |
| 3 | Assessment questions data (36 questions) | `9187c6f` |

### Remaining Tasks (12/15)

| Task | Description | Status |
|------|-------------|--------|
| 4 | Checkout API route (Stripe) | Pending |
| 5 | Assessments API routes (CRUD) | Pending |
| 6 | Landing page branding update | Pending |
| 7 | Dimensions section (add AI Investment) | Pending |
| 8 | How It Works + FAQ updates | Pending |
| 9 | Assessment start page | Pending |
| 10 | Assessment portal page | Pending |
| 11 | Assessment success page | Pending |
| 12 | Report page structure | Pending |
| 13 | AI insights API | Pending |
| 14 | Environment variables update | Pending |
| 15 | Final build verification | Pending |

---

## Files Created So Far

```
lib/
├── supabase.ts          # Supabase client (browser + server)
├── database.types.ts    # TypeScript types for assessments table
├── scoring.ts           # 6-dimension scoring logic
├── assessment-questions.ts  # 36 questions across 6 sections
└── utils.ts             # (existing) Utility functions

docs/plans/
├── 2025-12-10-pragma-score-design.md         # Design document
└── 2025-12-10-pragma-score-implementation.md # Implementation plan (15 tasks)
```

---

## The 6 Dimensions

1. **Control** — Key-person dependency, documentation, decision bottlenecks
2. **Clarity** — Operational visibility, real-time awareness
3. **Leverage** — Output per effort, automation potential
4. **Friction** — Bottlenecks, errors, waste in processes
5. **Change Readiness** — Capacity to adopt new systems
6. **AI Investment** *(NEW)* — Spend awareness, budget allocation, cost forecasting, ROI tracking

---

## Key Design Decisions

### Branding
- **Name:** Pragma Score (from Greek "πράγμα" = deed/action)
- **Tagline:** "Know your operational truth. Plan your AI future."
- **Parent:** Sub-brand of Ena Pragma ("by Ena Pragma" in footer)

### Pricing
- **One-time:** $1,500
- **Deliverables:** 6-dimension scorecard, AI insights, strategy session, action roadmap

### Scoring
- 36 questions (6 per dimension)
- Mix of scale (1-5), select, multiselect, and text questions
- Text questions for qualitative AI analysis, not scored numerically
- Overall score 0-100 with bands: Critical, At-Risk, Stable, Optimized

---

## How to Resume

1. **Navigate to worktree:**
   ```bash
   cd /Users/brandenbehrmann/Documents/Development/ep-ai-scorecard-1/.worktrees/pragma-score
   ```

2. **Check status:**
   ```bash
   git status
   git log --oneline -5
   ```

3. **Resume implementation:**
   - Read the plan: `docs/plans/2025-12-10-pragma-score-implementation.md`
   - Start at **Task 4: Create checkout API route**
   - Use subagent-driven development for each task

4. **Key files to reference:**
   - Design doc: `docs/plans/2025-12-10-pragma-score-design.md`
   - Implementation plan: `docs/plans/2025-12-10-pragma-score-implementation.md`
   - Original scoring logic (for reference): `/Users/brandenbehrmann/Documents/Development/ep-jonas-web/lib/scoring.ts`

---

## External Dependencies

- **Supabase:** Database for assessments (need to create table)
- **Stripe:** Payment processing ($1,500 checkout)
- **OpenAI:** AI insights generation
- **Vercel:** Deployment target

### Environment Variables Needed
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_BASE_URL=
```

---

## Reference: Original Implementation

The existing assessment system in `ep-jonas-web` has working examples:
- `ep-jonas-web/app/assessment/portal/page.tsx` — Assessment UI
- `ep-jonas-web/app/assessment/report/page.tsx` — Report display
- `ep-jonas-web/lib/ai-insights.ts` — OpenAI integration
- `ep-jonas-web/app/api/` — API routes

---

## Notes

- All code reviews passed for Tasks 1-3
- No blocking issues identified
- Build passes (`npm run build` succeeds)
- Ready to continue with Task 4 (Stripe checkout)
