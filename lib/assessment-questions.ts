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
