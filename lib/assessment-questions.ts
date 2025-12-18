// lib/assessment-questions.ts
// Revenue Friction Diagnostic - Question Set
// December 2025 - v2 pivot: Observable reality questions only
//
// RULES:
// - No "how mature"
// - No scales or ratings
// - No "how do you feel"
// - Only observable reality
// - Bad answers must still produce signal

export type QuestionType = 'text' | 'select';

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  helpText?: string;
}

export interface AssessmentSection {
  id: string;
  label: string;
  description: string;
  intro: string;
  questions: Question[];
  isHidden?: boolean; // Profile section is hidden from diagnostic narrative
}

export const assessmentSections: AssessmentSection[] = [
  // ============================================================================
  // SECTION 0: PROFILE (Hidden - Internal use only)
  // These fields are NOT scored, NOT shown in output
  // Used only for internal qualification and CRM segmentation
  // ============================================================================
  {
    id: 'profile',
    label: 'Quick Context',
    description: 'A few details to personalize your diagnostic',
    intro: 'These help us understand your business context. They will not appear in your diagnostic results.',
    isHidden: true,
    questions: [
      {
        id: 'profile-1',
        question: 'How many people work in your business (including yourself)?',
        type: 'select',
        options: [
          '1-5 people',
          '6-15 people',
          '16-30 people',
          '31-50 people',
          '50+ people',
        ],
      },
      {
        id: 'profile-2',
        question: 'What industry or type of work does your business do?',
        type: 'text',
        placeholder: 'e.g., HVAC services, marketing agency, manufacturing',
      },
      {
        id: 'profile-3',
        question: 'What is your role?',
        type: 'select',
        options: [
          'Owner',
          'Operator / General Manager',
          'Other',
        ],
      },
    ],
  },

  // ============================================================================
  // SECTION 1: INTAKE REALITY
  // How work enters the business
  // ============================================================================
  {
    id: 'intake',
    label: 'Intake Reality',
    description: 'How work enters your business',
    intro: 'These questions explore how new work, leads, and requests flow into your business. Be specific about what actually happens, not what should happen.',
    questions: [
      {
        id: 'intake-1',
        question: 'List every way new work enters your business today.',
        type: 'text',
        placeholder: 'e.g., phone calls, emails, website forms, referrals, walk-ins, text messages...',
        helpText: 'Include all channels, even informal ones like personal texts to the owner.',
      },
      {
        id: 'intake-2',
        question: 'How many people touch new work before it is considered "in progress"?',
        type: 'text',
        placeholder: 'e.g., "Usually 2-3 people: whoever answers, then me, then the scheduler"',
        helpText: 'Count everyone who handles, reviews, or approves before work officially starts.',
      },
      {
        id: 'intake-3',
        question: 'What happens when new work arrives after hours or when the owner is unavailable?',
        type: 'text',
        placeholder: 'e.g., "It waits in my inbox until I check it" or "We have an answering service but they just take messages"',
      },
      {
        id: 'intake-4',
        question: 'Where does new work sit if no one acts on it immediately?',
        type: 'text',
        placeholder: 'e.g., "In email", "On a sticky note", "In a shared spreadsheet", "Voicemail"',
        helpText: 'Where do things pile up or get forgotten?',
      },
    ],
  },

  // ============================================================================
  // SECTION 2: OWNERSHIP AND HANDOFFS
  // How work gets assigned and moves between people
  // ============================================================================
  {
    id: 'ownership',
    label: 'Ownership & Handoffs',
    description: 'How work gets assigned and moves',
    intro: 'These questions explore how work is assigned to people and what happens when it moves between team members.',
    questions: [
      {
        id: 'ownership-1',
        question: 'How is ownership explicitly assigned when work moves between people?',
        type: 'text',
        placeholder: 'e.g., "I verbally tell them", "We update a shared board", "It\'s usually assumed based on job role"',
        helpText: 'How does someone officially become responsible for a piece of work?',
      },
      {
        id: 'ownership-2',
        question: 'How often does work stall because ownership was assumed, not assigned?',
        type: 'text',
        placeholder: 'e.g., "Weekly - things fall through the cracks", "Rarely, we\'re pretty clear", "Constantly, it\'s a major issue"',
      },
      {
        id: 'ownership-3',
        question: 'How does someone know work is blocked vs just delayed?',
        type: 'text',
        placeholder: 'e.g., "They ask me", "There\'s no way to tell", "We have status fields in our system"',
        helpText: 'What\'s the difference between something waiting and something stuck?',
      },
    ],
  },

  // ============================================================================
  // SECTION 3: FOLLOW-UP AND REVENUE LEAKAGE
  // What happens when things need to be chased
  // ============================================================================
  {
    id: 'followup',
    label: 'Follow-Up & Leakage',
    description: 'Where revenue falls through cracks',
    intro: 'These questions explore what happens when work requires follow-up and how things slip through the cracks.',
    questions: [
      {
        id: 'followup-1',
        question: 'Which steps in your business require follow-up to generate revenue or complete work?',
        type: 'text',
        placeholder: 'e.g., "Sending quotes, collecting payment, scheduling the next appointment, getting customer approval"',
        helpText: 'List the steps where someone has to remember to circle back.',
      },
      {
        id: 'followup-2',
        question: 'What enforces follow-up if someone forgets?',
        type: 'text',
        placeholder: 'e.g., "Nothing - we rely on memory", "I check in weekly", "We have automated reminders"',
        helpText: 'What system or person catches things before they slip?',
      },
      {
        id: 'followup-3',
        question: 'How often do deals or tasks go quiet without resolution?',
        type: 'text',
        placeholder: 'e.g., "Multiple times a week", "Occasionally", "Rarely - we track everything"',
        helpText: 'Things that just... disappear without being closed out.',
      },
    ],
  },

  // ============================================================================
  // SECTION 4: VISIBILITY
  // Can you see what's happening without asking
  // ============================================================================
  {
    id: 'visibility',
    label: 'Visibility',
    description: 'What you can see without asking',
    intro: 'These questions explore your ability to understand what\'s happening in your business without interrupting people.',
    questions: [
      {
        id: 'visibility-1',
        question: 'Can you see what is currently stuck without asking someone?',
        type: 'text',
        placeholder: 'e.g., "No, I have to ask around", "Sort of - I can check our project board", "Yes, our system shows me"',
      },
      {
        id: 'visibility-2',
        question: 'What do you interrupt people most often to get updates on?',
        type: 'text',
        placeholder: 'e.g., "Job status", "Whether a quote was sent", "If a customer paid", "Where a project stands"',
        helpText: 'What questions do you find yourself asking repeatedly?',
      },
      {
        id: 'visibility-3',
        question: 'How many tools do you check to understand what is happening?',
        type: 'text',
        placeholder: 'e.g., "Email, our CRM, the shared spreadsheet, and usually texts" or "Just one main system"',
        helpText: 'Count all the places information lives.',
      },
    ],
  },

  // ============================================================================
  // SECTION 5: MANUAL WORK AND DEPENDENCY
  // Key person risk and repetitive data movement
  // ============================================================================
  {
    id: 'manual',
    label: 'Manual Work & Dependency',
    description: 'Key person risk and data re-entry',
    intro: 'These questions explore where your business depends on specific people and where information gets moved manually.',
    questions: [
      {
        id: 'manual-1',
        question: 'Which tasks exist mainly to move information between people or systems?',
        type: 'text',
        placeholder: 'e.g., "Copying job details from email to our scheduling software", "Re-typing customer info from the phone into our CRM"',
        helpText: 'Work that\'s just about transferring data, not creating value.',
      },
      {
        id: 'manual-2',
        question: 'How many hours per week are spent re-entering or reconciling data?',
        type: 'text',
        placeholder: 'e.g., "Probably 5-10 hours across the team", "I don\'t know but it feels like a lot", "Very little"',
      },
      {
        id: 'manual-3',
        question: 'What breaks first if one key person is unavailable for two weeks?',
        type: 'text',
        placeholder: 'e.g., "Scheduling falls apart", "No one can answer customer questions", "Invoicing stops", "Everything keeps running"',
        helpText: 'What depends on one person knowing how to do it?',
      },
    ],
  },

  // ============================================================================
  // SECTION 6: DECISION FRICTION
  // Where people pause or repeat decisions
  // ============================================================================
  {
    id: 'decision',
    label: 'Decision Friction',
    description: 'Where decisions slow things down',
    intro: 'These questions explore where decisions create friction or get repeated unnecessarily.',
    questions: [
      {
        id: 'decision-1',
        question: 'Where do people pause because they are unsure of the next step?',
        type: 'text',
        placeholder: 'e.g., "When a customer asks for something unusual", "When a job goes over budget", "When there\'s a complaint"',
        helpText: 'Moments where work stops because someone doesn\'t know what to do.',
      },
      {
        id: 'decision-2',
        question: 'Which decisions are repeated that follow the same rules every time?',
        type: 'text',
        placeholder: 'e.g., "Pricing standard jobs", "Scheduling priority", "Approving small purchases under $X"',
        helpText: 'Decisions that have predictable answers but still require human involvement.',
      },
    ],
  },

  // ============================================================================
  // SECTION 7: FORCED TRADEOFFS (DETERMINANT)
  // This section DETERMINES the primary constraint
  // The answer to tradeoff-1 IS the primary constraint - no AI override
  // ============================================================================
  {
    id: 'tradeoffs',
    label: 'Forced Tradeoffs',
    description: 'The one thing to fix',
    intro: 'This is the most important section. Your answers here determine your diagnostic result. Be honest about what matters most.',
    questions: [
      {
        id: 'tradeoff-1',
        question: 'If you fixed only one issue in the next 30 days, which would most immediately reduce daily friction or lost revenue?',
        type: 'text',
        placeholder: 'Be specific. e.g., "Leads sitting in email without follow-up", "Not knowing where jobs stand without asking", "Everything depending on me"',
        helpText: 'This is your PRIMARY focus. Everything else becomes secondary.',
      },
      {
        id: 'tradeoff-2',
        question: 'Which issue would you intentionally ignore for six months if the above were fixed?',
        type: 'text',
        placeholder: 'e.g., "The messy filing system", "Our outdated website", "Training documentation"',
        helpText: 'This proves you\'re willing to deprioritize. It\'s okay to let things wait.',
      },
    ],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get total question count (excluding hidden profile section)
 */
export function getTotalQuestionCount(): number {
  return assessmentSections
    .filter(section => !section.isHidden)
    .reduce((count, section) => count + section.questions.length, 0);
}

/**
 * Get all question count (including profile)
 */
export function getAllQuestionCount(): number {
  return assessmentSections.reduce((count, section) => count + section.questions.length, 0);
}

/**
 * Get section by ID
 */
export function getSectionById(id: string): AssessmentSection | undefined {
  return assessmentSections.find(section => section.id === id);
}

/**
 * Get question by ID
 */
export function getQuestionById(id: string): Question | undefined {
  for (const section of assessmentSections) {
    const question = section.questions.find(q => q.id === id);
    if (question) return question;
  }
  return undefined;
}

/**
 * Get visible sections (non-hidden)
 */
export function getVisibleSections(): AssessmentSection[] {
  return assessmentSections.filter(section => !section.isHidden);
}

/**
 * Get diagnostic sections only (excludes profile)
 */
export function getDiagnosticSections(): AssessmentSection[] {
  return assessmentSections.filter(section => section.id !== 'profile');
}

/**
 * Check if a section is the determinant section (tradeoffs)
 */
export function isDeterminantSection(sectionId: string): boolean {
  return sectionId === 'tradeoffs';
}

/**
 * Get the determinant questions (tradeoff-1 and tradeoff-2)
 */
export function getDeterminantQuestions(): { primary: Question; deprioritized: Question } | undefined {
  const tradeoffSection = getSectionById('tradeoffs');
  if (!tradeoffSection) return undefined;

  const primary = tradeoffSection.questions.find(q => q.id === 'tradeoff-1');
  const deprioritized = tradeoffSection.questions.find(q => q.id === 'tradeoff-2');

  if (!primary || !deprioritized) return undefined;

  return { primary, deprioritized };
}

// Question labels for referencing in insights
export const QUESTION_LABELS: Record<string, string> = {
  // Profile (hidden)
  'profile-1': 'Company Size',
  'profile-2': 'Industry',
  'profile-3': 'Role',
  // Intake
  'intake-1': 'Work Entry Channels',
  'intake-2': 'Handoffs Before Start',
  'intake-3': 'After-Hours Handling',
  'intake-4': 'Where Work Piles Up',
  // Ownership
  'ownership-1': 'Ownership Assignment',
  'ownership-2': 'Assumed Ownership Issues',
  'ownership-3': 'Blocked vs Delayed',
  // Follow-up
  'followup-1': 'Steps Requiring Follow-Up',
  'followup-2': 'Follow-Up Enforcement',
  'followup-3': 'Things Going Quiet',
  // Visibility
  'visibility-1': 'Stuck Work Visibility',
  'visibility-2': 'Interrupt Triggers',
  'visibility-3': 'Tools Checked',
  // Manual
  'manual-1': 'Data Movement Tasks',
  'manual-2': 'Re-Entry Hours',
  'manual-3': 'Key Person Dependency',
  // Decision
  'decision-1': 'Decision Pause Points',
  'decision-2': 'Repeated Decisions',
  // Tradeoffs (DETERMINANT)
  'tradeoff-1': 'PRIMARY CONSTRAINT (Owner-Defined)',
  'tradeoff-2': 'Intentionally Deprioritized',
};
