# Revenue Friction Diagnostic - Current Progress

**Last Updated:** December 17, 2025
**Status:** Pattern Analysis Implemented, Final Report UI Pending

---

## What Was Built

### Product Pivot (COMPLETE)
Pivoted from "Ena Score" (6-dimension AI assessment with scores) to **Revenue Friction Diagnostic** (forced prioritization identifying THE SINGLE CONSTRAINT).

**Core Principle:** "If the output opens conversation, it failed. If it ends debate, it succeeded."

### Pattern Analysis System (COMPLETE)
Added pre-processing analysis that runs BEFORE AI generation to enable synthesis instead of paraphrase.

**Files Modified:**
- `lib/database.types.ts` - Added `PatternAnalysis` interface
- `lib/scoring.ts` - Added 4 analysis functions + `analyzePatterns()`
- `lib/premium-insights.ts` - New system prompt with analysis toolkit
- `app/api/insights/[token]/route.ts` - Recalculates constraint on regeneration

### Pattern Analysis Detects:

| Analysis Type | Description |
|---------------|-------------|
| **Repeated Entities** | email, phone, spreadsheet, owner, whiteboard, quickbooks, memory, CRM |
| **Contradictions** | Logical conflicts between answers (e.g., "rarely slip" + "nothing enforces") |
| **Quantifiable Data** | Numbers extracted and annualized (e.g., "6-8 hours/week" → "312-416 hours/year") |
| **Second-Order Effects** | What fixing the constraint exposes next |

### Before/After Comparison

**BEFORE (just paraphrasing):**
```
"You identified this as your primary constraint in Section 7."
"This constraint will continue to block revenue conversion."
```

**AFTER (pattern synthesis):**
```
"Follow-up appears as a critical failure point in multiple areas... This is not incidental—it is structural."
"Assuming a conversion rate of 20% and average job value of $1,000, this could mean a potential loss of $62,400 to $104,000 per year."
```

---

## Current Architecture

### Assessment Flow
1. User enters info at `/assessment/start`
2. Answers 23 questions (3 profile + 20 diagnostic) at `/assessment/portal`
3. On submit: `calculateConstraint()` runs with pattern analysis
4. Admin generates diagnostic at `/admin/assessments/[token]`
5. AI uses pattern analysis to synthesize insights
6. Customer views report at `/assessment/report?token=X`

### Key Files

| File | Purpose |
|------|---------|
| `lib/assessment-questions.ts` | 23 questions in 8 sections |
| `lib/scoring.ts` | Constraint detection + pattern analysis |
| `lib/premium-insights.ts` | AI prompt + diagnostic generation |
| `lib/database.types.ts` | TypeScript types including `PatternAnalysis` |
| `app/api/insights/[token]/route.ts` | Diagnostic generation API |

### Database Schema
- `assessments` table with `constraint_result` JSONB column
- `constraint_result` now includes `patternAnalysis` object

---

## What Still Needs Work

### 1. Report Page UI (`app/assessment/report/page.tsx`)
The report page needs to be updated to properly display the new diagnostic format:
- Currently may be showing old v1 layout
- Needs to render the 8 locked sections properly
- Should display pattern analysis insights (entities, contradictions, costs)

### 2. Admin Panel Display
- Pattern analysis should be visible in admin view
- Show detected entities, contradictions, quantified costs

### 3. Testing Edge Cases
- Assessments with no quantifiable numbers
- Assessments with detected contradictions
- Different constraint categories (not just followup_leakage)

---

## Test Assessments Available

### 1. Thompson HVAC Services
- **Token:** `283cec53-9558-447c-8535-7dda2842a32c`
- **Constraint:** Follow-Up Leakage
- **Status:** report_ready

### 2. Precision Plumbing Co (NEW)
- **Token:** `3ad9495e-98cb-481f-8f1f-46350b58d8cc`
- **Constraint:** Follow-Up Leakage
- **Status:** report_ready
- **Pattern Analysis:** 18 owner mentions, 13 phone mentions, 6 spreadsheet mentions
- **Quantified:** 312-416 hours/year wasted, $62,400-$104,000/year potential loss

---

## Environment Setup

### Local Development
```bash
npm run dev
# Server at http://localhost:3000
```

### Admin Access
- URL: `/admin/login`
- Email: `branden@enapragma.co`
- Password: `DElta77!!`

### Key URLs (localhost)
- Start: http://localhost:3000/assessment/start
- Admin: http://localhost:3000/admin/assessments
- Report: http://localhost:3000/assessment/report?token=TOKEN

---

## Technical Details

### Pattern Analysis Functions in `lib/scoring.ts`

```typescript
// Main function
export function analyzePatterns(responses, category): PatternAnalysis

// Sub-functions
extractEntities(responses)      // Finds repeated terms
detectContradictions(responses) // Finds logical conflicts
extractNumbers(responses)       // Finds quantifiable data
inferSecondOrderEffects(category, responses) // Predicts next constraints
```

### AI Prompt Structure

The system prompt now includes 4 analysis tools:
1. **Pattern Amplification** - "X appears in N answers"
2. **Contradiction Exposure** - "You stated A but also B"
3. **Quantification** - "At N hours/week, this is Y hours/year"
4. **Second-Order Effects** - "If X is fixed, Y will surface"

### Output Format (8 Locked Sections)

```typescript
interface RevenueFrictionDiagnostic {
  primaryBottleneck: { constraint, ownerStatement, inPlainTerms }
  whyThisIsPriority: { ruleExplanation, supportingEvidence, notOpinion }
  costOfInaction: { ifIgnored, timeframeWarning, revenueLink }
  whatNotToFixYet: { deprioritizedItem, otherIssues, reasoning }
  goodFixLooksLike: { successState, youWillKnowBecause, notPrescriptive }
  twoPathsForward: { diyPath, epSystemPath }
  doesNotDo: string[]
  finalityStatement: { statement, noUpsell }
}
```

---

## Next Session TODO

1. [ ] Update report page UI to display new diagnostic format
2. [ ] Update admin panel to show pattern analysis details
3. [ ] Test with different constraint categories
4. [ ] Verify production deployment works correctly
5. [ ] Consider adding more contradiction detection pairs
6. [ ] Consider revenue estimation based on industry benchmarks

---

## Git Status

Run `git status` to see uncommitted changes before pushing.
