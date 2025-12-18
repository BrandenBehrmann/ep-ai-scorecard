# Revenue Friction Diagnostic - Current Progress

**Last Updated:** December 17, 2025
**Status:** Output Hardening Complete, Report UI Pending

---

## What Was Built

### Product Pivot (COMPLETE)
Pivoted from "Ena Score" (6-dimension AI assessment with scores) to **Revenue Friction Diagnostic** (forced prioritization identifying THE SINGLE CONSTRAINT).

**Core Principle:** "If the output opens conversation, it failed. If it ends debate, it succeeded."

### Output Hardening (COMPLETE - Dec 17)
Implemented 5 MANDATORY SYNTHESIS MECHANISMS that transform AI output from "analysis that informs" to "synthesis that creates inevitability."

**The 5 Mechanisms:**

| # | Mechanism | What It Does | Where Used |
|---|-----------|--------------|------------|
| 1 | **Structural Truth** | ONE sentence describing operating structure making constraint inevitable | Section 1 |
| 2 | **Enforcement Chain** | 3-5 link causal chain → Revenue outcome | Section 2 |
| 3 | **Quantification Ladder** | frequency → volume → time → money | Section 3 |
| 4 | **"This Fix Fails If"** | Why naive fixes collapse | Section 5 |
| 5 | **Binary Success Criteria** | 3 testable yes/no conditions | Section 5 |

**Example Output (Precision Plumbing):**
```
MECHANISM 1: "Revenue conversion depends on owner which has no enforcement mechanism,
             so follow-up leaks by default."

MECHANISM 2: "No automated trigger → Quote sits → Customer quiet → No one notices →
             Revenue leaks through forgotten follow-ups"

MECHANISM 3: "6-8 hours/week → 312-416 hours/year → $15,600-$20,800/year"

MECHANISM 4: "This fix fails if you try adding calendar reminders while owner remains
             the system of record. Reminders require the same overloaded person to
             remember to check them."

MECHANISM 5:
  1. Every quote has an expiration action
  2. Nothing goes quiet for more than 48 hours without a trigger
  3. Closure rate is known and tracked
```

### Pattern Analysis System (COMPLETE)
Pre-processing analysis that runs BEFORE AI generation to enable synthesis instead of paraphrase.

**Files Modified:**
- `lib/database.types.ts` - Added `SynthesisMechanisms` interface
- `lib/scoring.ts` - Added 5 compute functions + constants for chains/criteria/failure modes
- `lib/premium-insights.ts` - Rewrote system prompt with quality gates

---

## Current Architecture

### Assessment Flow
1. User enters info at `/assessment/start`
2. Answers 23 questions (3 profile + 20 diagnostic) at `/assessment/portal`
3. On submit: `calculateConstraint()` runs with pattern analysis + synthesis mechanisms
4. Admin generates diagnostic at `/admin/assessments/[token]`
5. AI uses pre-computed mechanisms to synthesize insights
6. Customer views report at `/assessment/report?token=X`

### Key Files

| File | Purpose |
|------|---------|
| `lib/assessment-questions.ts` | 23 questions in 8 sections |
| `lib/scoring.ts` | Constraint detection + pattern analysis + synthesis mechanisms |
| `lib/premium-insights.ts` | AI prompt + diagnostic generation |
| `lib/database.types.ts` | TypeScript types including `SynthesisMechanisms` |
| `app/api/insights/[token]/route.ts` | Diagnostic generation API |

### Pre-defined Constants in scoring.ts

**ENFORCEMENT_CHAINS:** Causal chains by category
**FAILURE_MODES:** Why naive fixes fail by category
**SUCCESS_CRITERIA:** 3 binary tests by category
**STRUCTURAL_TRUTH_TEMPLATES:** One-sentence templates by category

---

## What Still Needs Work

### 1. Report Page UI (`app/assessment/report/page.tsx`)
The report page needs to be updated to properly display the new diagnostic format:
- Render the 8 locked sections with new mechanism content
- Display enforcement chain visually
- Show binary success criteria as checklist
- Display quantification ladder progression

### 2. Admin Panel Display
- Show synthesis mechanisms in admin view
- Display the 5 mechanisms for debugging/review

### 3. Testing Edge Cases
- Assessments with no quantifiable numbers
- Different constraint categories (not just followup_leakage)
- Validate all category chains/criteria work correctly

---

## Test Assessments Available

### 1. Thompson HVAC Services
- **Token:** `283cec53-9558-447c-8535-7dda2842a32c`
- **Constraint:** Follow-Up Leakage
- **Status:** report_ready

### 2. Precision Plumbing Co
- **Token:** `3ad9495e-98cb-481f-8f1f-46350b58d8cc`
- **Constraint:** Follow-Up Leakage
- **Status:** report_ready (regenerated with new mechanisms)
- **Pattern Analysis:** 18 owner mentions, 13 phone mentions, 6 spreadsheet mentions
- **Quantified:** 312-416 hours/year, $15,600-$20,800/year

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

### SynthesisMechanisms Interface

```typescript
interface SynthesisMechanisms {
  structuralTruth: {
    keyDependency: string;      // e.g., "owner", "email"
    dependencyCount: number;    // How many times it appears
    templateHint: string;       // Pre-generated sentence
  };
  enforcementChain: {
    links: Array<{
      condition: string;
      evidenceQuestionId?: string;
      evidenceText?: string;
    }>;
    finalOutcome: string;
  };
  quantificationLadder: {
    frequency: { value: string; source?: string } | null;
    volume: { value: string; source?: string } | null;
    time: { value: string; source?: string } | null;
    money: { value: string; source?: string } | null;
    summary: string;
  };
  fixFailsIf: {
    naiveApproach: string;
    whyItFails: string;
    sentence: string;
  };
  successCriteria: Array<{
    criterion: string;
    testMethod: string;
  }>;
}
```

### Quality Gates (AI Self-Check)

The system prompt requires AI to verify before output:
- [ ] Exactly 8 sections
- [ ] One constraint only from tradeoff-1
- [ ] tradeoff-2 explicitly stated
- [ ] All 5 mechanisms included
- [ ] Each section has concrete nouns from answers
- [ ] NO banned phrases (might, may, appears, suggests, consider, could)
- [ ] Output reads like inevitability, not analysis

### Banned Phrases
The system prompt explicitly bans: might, may, appears, suggests, consider, could, generally, often, perhaps, seems, "in many businesses", "you might want to", "it appears that", "based on our analysis"

---

## Next Session TODO

1. [ ] Update report page UI to display new diagnostic format
2. [ ] Update admin panel to show synthesis mechanisms
3. [ ] Test with different constraint categories (intake_friction, visibility_gaps, etc.)
4. [ ] Verify production deployment works correctly
5. [ ] Consider adding more contradiction detection pairs

---

## Git Status

Latest commit includes output hardening implementation:
- SynthesisMechanisms interface
- 5 compute functions in scoring.ts
- Updated system prompt with quality gates
- Updated user prompt with mechanism formatting
