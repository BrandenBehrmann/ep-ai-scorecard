// lib/assessment-questions.ts
// Pragma Score Assessment - Complete Business Diagnostic
// December 2025 - Questions designed to collect REAL data for accurate analysis

export type QuestionType = 'scale' | 'text' | 'select' | 'multiselect' | 'number';

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  scaleLabels?: { low: string; high: string };
  placeholder?: string;
  helpText?: string;
  prefix?: string; // For number inputs like "$"
  suffix?: string; // For number inputs like "/year"
}

export interface AssessmentSection {
  id: string;
  label: string;
  description: string;
  intro: string;
  questions: Question[];
}

export const assessmentSections: AssessmentSection[] = [
  // ============================================================================
  // SECTION 0: BUSINESS PROFILE (The Foundation - We need real numbers)
  // ============================================================================
  {
    id: 'profile',
    label: 'Business Profile',
    description: 'The foundation for your personalized analysis',
    intro: 'These questions help us understand your business so we can give you specific, actionable recommendations with real numbers - not generic advice.',
    questions: [
      {
        id: 'profile-1',
        question: 'What is your approximate annual revenue?',
        type: 'select',
        options: [
          'Under $250K',
          '$250K - $500K',
          '$500K - $1M',
          '$1M - $2.5M',
          '$2.5M - $5M',
          '$5M - $10M',
          '$10M - $25M',
          '$25M+',
          'Prefer not to say',
        ],
        helpText: 'This helps us calculate real ROI projections for recommended improvements',
      },
      {
        id: 'profile-2',
        question: 'How many people work in your business (including yourself)?',
        type: 'select',
        options: [
          'Just me (solopreneur)',
          '2-5 people',
          '6-10 people',
          '11-25 people',
          '26-50 people',
          '51-100 people',
          '100+ people',
        ],
        helpText: 'Needed to calculate time savings and efficiency gains',
      },
      {
        id: 'profile-3',
        question: 'What industry best describes your business?',
        type: 'select',
        options: [
          'Professional Services (consulting, legal, accounting)',
          'Agency (marketing, creative, development)',
          'Construction / Trades',
          'Healthcare / Medical',
          'Retail / E-commerce',
          'Manufacturing / Distribution',
          'Real Estate',
          'Technology / SaaS',
          'Hospitality / Food Service',
          'Other',
        ],
      },
      {
        id: 'profile-4',
        question: 'What is your 12-month revenue goal?',
        type: 'text',
        placeholder: 'e.g., "Grow from $1.2M to $2M" or "Maintain current revenue with better margins"',
        helpText: 'Be specific - this helps us align recommendations to your actual goals',
      },
      {
        id: 'profile-5',
        question: 'How many hours per week do YOU personally work?',
        type: 'select',
        options: [
          'Under 30 hours',
          '30-40 hours',
          '40-50 hours',
          '50-60 hours',
          '60-70 hours',
          '70+ hours',
        ],
        helpText: 'Honest answer helps us identify owner burnout risk',
      },
      {
        id: 'profile-6',
        question: 'What would you value your time at per hour (what you should be earning)?',
        type: 'select',
        options: [
          '$50/hour',
          '$75/hour',
          '$100/hour',
          '$150/hour',
          '$200/hour',
          '$250/hour',
          '$300+/hour',
        ],
        helpText: 'This is used to calculate the cost of you doing low-value work',
      },
    ],
  },

  // ============================================================================
  // SECTION 1: SALES & CUSTOMERS (What owners REALLY care about)
  // ============================================================================
  {
    id: 'sales',
    label: 'Sales & Customers',
    description: 'How you acquire and retain revenue',
    intro: 'Revenue is the lifeblood. These questions help us understand how money flows into your business and where the opportunities are.',
    questions: [
      {
        id: 'sales-1',
        question: 'How do most of your new customers find you? (Select top 2)',
        type: 'multiselect',
        options: [
          'Referrals / Word of mouth',
          'Online search (Google, etc.)',
          'Social media',
          'Paid advertising',
          'Networking / Events',
          'Cold outreach (calls, emails)',
          'Partnerships / Affiliates',
          'Inbound content (blog, podcast, video)',
          'Other',
        ],
        helpText: 'Understanding your customer acquisition helps us identify growth levers',
      },
      {
        id: 'sales-2',
        question: 'What is your average deal/sale size?',
        type: 'select',
        options: [
          'Under $500',
          '$500 - $2,000',
          '$2,000 - $5,000',
          '$5,000 - $15,000',
          '$15,000 - $50,000',
          '$50,000 - $100,000',
          '$100,000+',
          'Varies too much to say',
        ],
      },
      {
        id: 'sales-3',
        question: 'Out of 10 qualified leads, how many typically become paying customers?',
        type: 'select',
        options: [
          '1-2 out of 10 (10-20%)',
          '3-4 out of 10 (30-40%)',
          '5-6 out of 10 (50-60%)',
          '7-8 out of 10 (70-80%)',
          '9-10 out of 10 (90%+)',
          "We don't track this",
        ],
        helpText: 'Your close rate reveals sales process efficiency',
      },
      {
        id: 'sales-4',
        question: 'How long does it take from first contact to closed deal?',
        type: 'select',
        options: [
          'Same day',
          '1-7 days',
          '1-4 weeks',
          '1-3 months',
          '3-6 months',
          '6+ months',
          'It varies wildly',
        ],
      },
      {
        id: 'sales-5',
        question: 'What percentage of revenue comes from repeat customers vs. new customers?',
        type: 'select',
        options: [
          '90%+ new customers (transactional)',
          '70% new / 30% repeat',
          '50/50 split',
          '30% new / 70% repeat',
          '90%+ repeat (relationship-based)',
        ],
      },
      {
        id: 'sales-6',
        question: 'What is your biggest constraint on revenue growth right now?',
        type: 'text',
        placeholder: 'Be specific: "Not enough leads", "Can\'t close", "Can\'t deliver more", "Don\'t know"...',
        helpText: 'This is often the most important question in the entire assessment',
      },
    ],
  },

  // ============================================================================
  // SECTION 2: CURRENT TECH STACK (What they already have)
  // ============================================================================
  {
    id: 'tech-stack',
    label: 'Current Tools',
    description: 'What systems and tools you already use',
    intro: 'Understanding your current setup helps us recommend solutions that integrate with what you have - not rip and replace.',
    questions: [
      {
        id: 'tech-1',
        question: 'Which tools do you currently use? (Select all that apply)',
        type: 'multiselect',
        options: [
          'QuickBooks / Xero (accounting)',
          'HubSpot / Salesforce (CRM)',
          'Monday / Asana / ClickUp (project management)',
          'Slack / Teams (communication)',
          'Google Workspace / Microsoft 365',
          'Notion / Confluence (documentation)',
          'Zapier / Make (automation)',
          'ChatGPT / Claude / AI tools',
          'Industry-specific software',
          'Custom-built systems',
          'Mostly spreadsheets',
          'Paper / manual processes',
        ],
      },
      {
        id: 'tech-2',
        question: 'Which of your current tools do you love and want to keep?',
        type: 'text',
        placeholder: 'List the tools that are working well for you...',
        helpText: 'We build around what works - no unnecessary changes',
      },
      {
        id: 'tech-3',
        question: 'Which tools frustrate you or feel like a waste of money?',
        type: 'text',
        placeholder: 'What\'s not working? What do you pay for but barely use?',
      },
      {
        id: 'tech-4',
        question: 'How connected are your systems? Does data flow automatically or require manual transfer?',
        type: 'scale',
        scaleLabels: { low: 'Totally disconnected - lots of copy/paste', high: 'Fully integrated - data flows automatically' },
      },
      {
        id: 'tech-5',
        question: 'What is your approximate monthly spend on software/tools (excluding payroll)?',
        type: 'select',
        options: [
          'Under $100/month',
          '$100-$500/month',
          '$500-$1,000/month',
          '$1,000-$2,500/month',
          '$2,500-$5,000/month',
          '$5,000+/month',
          'No idea',
        ],
      },
    ],
  },

  // ============================================================================
  // SECTION 3: CONTROL (Existing - Person dependency)
  // ============================================================================
  {
    id: 'control',
    label: 'Control',
    description: 'How much depends on specific people (especially you)',
    intro: 'These questions reveal how dependent your business is on specific individuals - the single biggest risk in most small businesses.',
    questions: [
      {
        id: 'control-1',
        question: 'If you took an unplanned 2-week vacation starting tomorrow, what would break?',
        type: 'text',
        placeholder: 'Be specific: sales, customer service, approvals, etc.',
        helpText: 'List everything that would stall or fail',
      },
      {
        id: 'control-2',
        question: 'How much of your core business process is documented?',
        type: 'scale',
        scaleLabels: { low: 'Nothing - it\'s all in people\'s heads', high: 'Fully documented SOPs anyone could follow' },
      },
      {
        id: 'control-3',
        question: 'If your best employee quit tomorrow, how long to recover?',
        type: 'select',
        options: ['Less than 1 week', '1-4 weeks', '1-3 months', '3-6 months', 'More than 6 months', 'We might not recover'],
      },
      {
        id: 'control-4',
        question: 'What percentage of decisions require YOUR approval before moving forward?',
        type: 'scale',
        scaleLabels: { low: '0% - Team is fully empowered', high: '100% - Everything needs my OK' },
      },
      {
        id: 'control-5',
        question: 'Which functions are bottlenecked by a single person (including you)?',
        type: 'text',
        placeholder: 'e.g., "All quotes go through me", "Only Sarah knows the billing system"',
      },
    ],
  },

  // ============================================================================
  // SECTION 4: CLARITY (Existing - Visibility)
  // ============================================================================
  {
    id: 'clarity',
    label: 'Clarity',
    description: 'Visibility into what\'s actually happening',
    intro: 'You can\'t fix what you can\'t see. These questions assess how much visibility you have into your operations.',
    questions: [
      {
        id: 'clarity-1',
        question: 'Right now, without checking anything, do you know your current monthly revenue pace?',
        type: 'select',
        options: ['Yes, within 5%', 'Roughly, within 20%', "I'd need to check", "I'm not sure where to look"],
      },
      {
        id: 'clarity-2',
        question: 'How do you track active projects or orders?',
        type: 'text',
        placeholder: 'Spreadsheet? Software? Verbal updates? Memory?',
      },
      {
        id: 'clarity-3',
        question: 'When a customer asks "where\'s my order?", how quickly can ANYONE answer?',
        type: 'scale',
        scaleLabels: { low: 'Instantly - it\'s all visible', high: 'Hours or days - requires digging' },
      },
      {
        id: 'clarity-4',
        question: 'Where does your critical business information live?',
        type: 'multiselect',
        options: ['Spreadsheets', 'Email threads', 'Paper/physical files', 'CRM/Business software', 'Employee knowledge (not written)', 'Multiple disconnected tools'],
      },
      {
        id: 'clarity-5',
        question: 'How often are you blindsided by problems that others knew about?',
        type: 'scale',
        scaleLabels: { low: 'Never - issues surface quickly', high: 'Often - I\'m always the last to know' },
      },
    ],
  },

  // ============================================================================
  // SECTION 5: LEVERAGE (Existing - Efficiency)
  // ============================================================================
  {
    id: 'leverage',
    label: 'Leverage',
    description: 'Getting more output from the same inputs',
    intro: 'These questions identify where you\'re working harder than you need to - and where automation could multiply your impact.',
    questions: [
      {
        id: 'leverage-1',
        question: 'What percentage of your time is spent on tasks that someone cheaper could do?',
        type: 'scale',
        scaleLabels: { low: '0% - I only do high-value work', high: '80%+ - I\'m doing $20/hr tasks' },
      },
      {
        id: 'leverage-2',
        question: 'Describe the most repetitive, time-consuming process in your business.',
        type: 'text',
        placeholder: 'What is it? Who does it? How many hours per week? How often?',
        helpText: 'This often reveals the highest-ROI automation opportunity',
      },
      {
        id: 'leverage-3',
        question: 'How much of your work is reactive (responding to issues) vs. proactive (building the business)?',
        type: 'scale',
        scaleLabels: { low: '90% proactive - I\'m building', high: '90% reactive - I\'m firefighting' },
      },
      {
        id: 'leverage-4',
        question: 'If you could clone yourself, what would the clone do?',
        type: 'text',
        placeholder: 'What tasks would you immediately hand off?',
        helpText: 'This reveals what\'s trapped in you that shouldn\'t be',
      },
      {
        id: 'leverage-5',
        question: 'What would you do with an extra 10 hours per week?',
        type: 'text',
        placeholder: 'Be honest: grow the business, spend time with family, both?',
        helpText: 'Understanding your "why" helps us prioritize recommendations',
      },
    ],
  },

  // ============================================================================
  // SECTION 6: FRICTION (Existing - Waste)
  // ============================================================================
  {
    id: 'friction',
    label: 'Friction',
    description: 'Where work gets stuck, repeated, or wasted',
    intro: 'Friction is the hidden tax on your business. These questions identify where you\'re losing time and money.',
    questions: [
      {
        id: 'friction-1',
        question: 'What is the #1 thing that frustrates you about your daily operations?',
        type: 'text',
        placeholder: 'What keeps coming up that shouldn\'t be this hard?',
        helpText: 'Be specific - this often points to the biggest fix',
      },
      {
        id: 'friction-2',
        question: 'How often is the same information entered into multiple systems?',
        type: 'scale',
        scaleLabels: { low: 'Never - everything is connected', high: 'Constantly - lots of double entry' },
      },
      {
        id: 'friction-3',
        question: 'How long does it take to onboard a new employee to full productivity?',
        type: 'select',
        options: ['Less than 1 week', '1-2 weeks', '1 month', '2-3 months', 'More than 3 months', 'No clear onboarding process'],
      },
      {
        id: 'friction-4',
        question: 'What are the top 3 reasons work gets stuck or delayed?',
        type: 'text',
        placeholder: 'e.g., "Waiting for approvals", "Missing information", "Unclear who owns it"',
      },
      {
        id: 'friction-5',
        question: 'How many hours per week does your team spend hunting for information?',
        type: 'select',
        options: ['Less than 1 hour', '1-3 hours', '3-5 hours', '5-10 hours', 'More than 10 hours', 'No idea'],
      },
    ],
  },

  // ============================================================================
  // SECTION 7: CHANGE READINESS (Existing - Can they actually implement?)
  // ============================================================================
  {
    id: 'change-readiness',
    label: 'Change Readiness',
    description: 'Your ability to actually implement improvements',
    intro: 'The best plan is useless if you can\'t execute it. These questions assess your capacity for change.',
    questions: [
      {
        id: 'change-1',
        question: 'When was the last time you successfully implemented a new system or major process change?',
        type: 'select',
        options: ['Within 3 months', '3-6 months ago', '6-12 months ago', '1-2 years ago', 'More than 2 years', 'Never successfully'],
      },
      {
        id: 'change-2',
        question: 'What happened with the last tool or system you tried to implement?',
        type: 'text',
        placeholder: 'What was it? Did it succeed or fail? Why?',
        helpText: 'Learning from past attempts helps us avoid the same mistakes',
      },
      {
        id: 'change-3',
        question: 'How does your team respond to new technology and processes?',
        type: 'scale',
        scaleLabels: { low: 'Resistant - "we\'ve always done it this way"', high: 'Excited - eager to try new things' },
      },
      {
        id: 'change-4',
        question: 'Who would own the implementation of new systems? (Be honest)',
        type: 'select',
        options: ['Me (the owner) - it always falls on me', 'A dedicated ops/admin person', 'We\'d need to hire someone', 'We\'d want help implementing', 'No one - that\'s why things don\'t change'],
      },
      {
        id: 'change-5',
        question: 'What\'s the biggest barrier to making improvements in your business?',
        type: 'text',
        placeholder: 'Time? Money? Expertise? Team buy-in? Not knowing where to start?',
      },
      {
        id: 'change-6',
        question: 'If we showed you a clear path to 10 extra hours per week, how fast could you act?',
        type: 'select',
        options: ['Immediately - ready to go', 'Within a month', 'Within a quarter', '6+ months - need to plan/budget', 'Honestly? Probably never'],
      },
    ],
  },

  // ============================================================================
  // SECTION 8: VISION & GOALS (Where do they want to go?)
  // ============================================================================
  {
    id: 'vision',
    label: 'Vision',
    description: 'Where you want to go and what success looks like',
    intro: 'Final questions to understand what you\'re really trying to achieve - so our recommendations align with YOUR definition of success.',
    questions: [
      {
        id: 'vision-1',
        question: 'In 12 months, what would make this assessment worth your time?',
        type: 'text',
        placeholder: 'Be specific: revenue number, hours saved, stress reduced, etc.',
        helpText: 'This becomes the benchmark we measure against',
      },
      {
        id: 'vision-2',
        question: 'What does your ideal week look like as a business owner?',
        type: 'text',
        placeholder: 'How many hours working? What tasks? What freedom?',
      },
      {
        id: 'vision-3',
        question: 'If you could fix ONE thing about your business, what would it be?',
        type: 'text',
        placeholder: 'The thing that, if solved, would change everything...',
        helpText: 'This is often different from the "biggest problem" - it\'s the root cause',
      },
      {
        id: 'vision-4',
        question: 'What have you already tried that didn\'t work?',
        type: 'text',
        placeholder: 'Tools, consultants, approaches that failed...',
        helpText: 'Helps us avoid recommending things you\'ve already rejected',
      },
      {
        id: 'vision-5',
        question: 'How do you prefer to work with outside help?',
        type: 'select',
        options: [
          'Give me a plan, I\'ll implement it myself',
          'Help me implement, then I\'ll maintain it',
          'Do it for me - I don\'t have time',
          'Ongoing partnership - keep improving together',
          'Not sure yet - depends on what you recommend',
        ],
        helpText: 'This helps us tailor our recommendations to your style',
      },
    ],
  },
];

// Helper to get total question count
export function getTotalQuestionCount(): number {
  return assessmentSections.reduce((total, section) => total + section.questions.length, 0);
}

// Helper to get section by ID
export function getSectionById(id: string): AssessmentSection | undefined {
  return assessmentSections.find(section => section.id === id);
}
