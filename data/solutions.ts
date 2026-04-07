export type Solution = {
  id: string;
  category: string;
  icon: string; // Phosphor icon name
  name: string;
  description: string;
  mandays: number;
};

export const categories = [
  "AI Agents",
  "Email Automation",
  "CRM & Data",
  "Workflow Automation",
  "Notifications & Comms",
  "Reporting & Analytics",
] as const;

export type Category = (typeof categories)[number];

export const solutions: Solution[] = [
  // AI Agents
  {
    id: "ai-1",
    category: "AI Agents",
    icon: "Robot",
    name: "Customer Support Agent",
    description:
      "AI-powered chatbot that handles FAQs, ticket routing, and first-level support across web and messaging channels.",
    mandays: 8,
  },
  {
    id: "ai-2",
    category: "AI Agents",
    icon: "ClipboardText",
    name: "Document Processing Agent",
    description:
      "Extracts, classifies, and routes data from invoices, contracts, and forms using intelligent OCR and NLP.",
    mandays: 10,
  },
  {
    id: "ai-3",
    category: "AI Agents",
    icon: "MagnifyingGlass",
    name: "Lead Qualification Agent",
    description:
      "Scores and qualifies inbound leads based on firmographic data, engagement history, and custom criteria.",
    mandays: 6,
  },
  {
    id: "ai-4",
    category: "AI Agents",
    icon: "ChatCircle",
    name: "Meeting Scheduler Agent",
    description:
      "Handles calendar coordination, timezone management, and follow-ups for scheduling meetings autonomously.",
    mandays: 5,
  },
  {
    id: "ai-5",
    category: "AI Agents",
    icon: "Brain",
    name: "Knowledge Base Agent",
    description:
      "Searches internal documents and wikis to answer employee questions with cited, accurate responses.",
    mandays: 7,
  },
  {
    id: "ai-6",
    category: "AI Agents",
    icon: "ShoppingCart",
    name: "Product Recommendation Agent",
    description:
      "Suggests relevant products or services to customers based on browsing behavior, purchase history, and preferences.",
    mandays: 7,
  },
  {
    id: "ai-7",
    category: "AI Agents",
    icon: "Globe",
    name: "Social Media Monitor Agent",
    description:
      "Tracks brand mentions, sentiment, and trending topics across social platforms with automated response drafts.",
    mandays: 6,
  },
  {
    id: "ai-8",
    category: "AI Agents",
    icon: "PencilSimpleLine",
    name: "Content Generation Agent",
    description:
      "Drafts blog posts, social captions, and marketing copy from briefs using brand voice guidelines and templates.",
    mandays: 8,
  },
  // Email Automation
  {
    id: "email-1",
    category: "Email Automation",
    icon: "Envelope",
    name: "Welcome Drip Sequence",
    description:
      "Automated onboarding email series triggered by sign-up, with personalized content and engagement tracking.",
    mandays: 3,
  },
  {
    id: "email-2",
    category: "Email Automation",
    icon: "ArrowsClockwise",
    name: "Re-engagement Campaign",
    description:
      "Win-back email flows targeting inactive users with dynamic offers and behavioral triggers.",
    mandays: 4,
  },
  {
    id: "email-3",
    category: "Email Automation",
    icon: "Mailbox",
    name: "Transactional Email System",
    description:
      "Reliable delivery of order confirmations, receipts, password resets, and account notifications.",
    mandays: 5,
  },
  {
    id: "email-4",
    category: "Email Automation",
    icon: "Target",
    name: "Lead Nurture Sequence",
    description:
      "Multi-touch email workflows that guide prospects through the funnel with relevant content at each stage.",
    mandays: 4,
  },
  {
    id: "email-5",
    category: "Email Automation",
    icon: "ChartBar",
    name: "Newsletter Automation",
    description:
      "Automated curation, formatting, and distribution of recurring newsletters with A/B testing built in.",
    mandays: 3,
  },
  {
    id: "email-6",
    category: "Email Automation",
    icon: "ShoppingBag",
    name: "Abandoned Cart Recovery",
    description:
      "Triggered email sequence that reminds shoppers of items left in their cart with urgency and incentive messaging.",
    mandays: 3,
  },
  {
    id: "email-7",
    category: "Email Automation",
    icon: "Gift",
    name: "Lifecycle Milestone Emails",
    description:
      "Automated birthday, anniversary, and renewal reminder emails with personalized offers and dynamic content.",
    mandays: 2,
  },
  {
    id: "email-8",
    category: "Email Automation",
    icon: "Star",
    name: "Review & Feedback Requests",
    description:
      "Post-purchase or post-interaction emails that solicit reviews, NPS scores, and customer feedback automatically.",
    mandays: 3,
  },
  // CRM & Data
  {
    id: "crm-1",
    category: "CRM & Data",
    icon: "Folders",
    name: "CRM Data Sync",
    description:
      "Bi-directional sync between your CRM and external tools, keeping contacts, deals, and activities in sync.",
    mandays: 6,
  },
  {
    id: "crm-2",
    category: "CRM & Data",
    icon: "Broom",
    name: "Data Enrichment Pipeline",
    description:
      "Automatically enriches contact and company records with third-party data sources like Clearbit or Apollo.",
    mandays: 5,
  },
  {
    id: "crm-3",
    category: "CRM & Data",
    icon: "LinkSimple",
    name: "Lead-to-Account Matching",
    description:
      "Maps incoming leads to existing accounts using fuzzy matching on domain, name, and firmographic data.",
    mandays: 4,
  },
  {
    id: "crm-4",
    category: "CRM & Data",
    icon: "Tray",
    name: "Form-to-CRM Pipeline",
    description:
      "Routes web form submissions into your CRM with deduplication, field mapping, and owner assignment.",
    mandays: 3,
  },
  {
    id: "crm-5",
    category: "CRM & Data",
    icon: "Tag",
    name: "Auto-Tagging & Segmentation",
    description:
      "Applies tags and segments to contacts based on behavior, purchase history, and demographic rules.",
    mandays: 4,
  },
  {
    id: "crm-6",
    category: "CRM & Data",
    icon: "ArrowsClockwise",
    name: "Duplicate Detection & Merge",
    description:
      "Identifies and merges duplicate contacts, companies, and deals in your CRM using configurable matching rules.",
    mandays: 4,
  },
  {
    id: "crm-7",
    category: "CRM & Data",
    icon: "ChartBar",
    name: "Deal Stage Automation",
    description:
      "Automatically advances deals through pipeline stages based on activity milestones, email replies, and meeting outcomes.",
    mandays: 5,
  },
  {
    id: "crm-8",
    category: "CRM & Data",
    icon: "Lock",
    name: "Data Privacy & Consent Manager",
    description:
      "Tracks consent preferences, handles GDPR/CCPA data requests, and enforces retention policies across your CRM.",
    mandays: 6,
  },
  // Workflow Automation
  {
    id: "wf-1",
    category: "Workflow Automation",
    icon: "Gear",
    name: "Approval Workflow Engine",
    description:
      "Multi-step approval chains for purchase orders, time-off requests, or content publishing with escalation rules.",
    mandays: 7,
  },
  {
    id: "wf-2",
    category: "Workflow Automation",
    icon: "NotePencil",
    name: "Employee Onboarding Flow",
    description:
      "Orchestrates IT provisioning, document signing, training assignments, and team introductions for new hires.",
    mandays: 6,
  },
  {
    id: "wf-3",
    category: "Workflow Automation",
    icon: "Shuffle",
    name: "Task Router",
    description:
      "Intelligent distribution of incoming tasks to team members based on skills, capacity, and priority rules.",
    mandays: 5,
  },
  {
    id: "wf-4",
    category: "Workflow Automation",
    icon: "Package",
    name: "Order Fulfillment Pipeline",
    description:
      "End-to-end automation from order capture to shipping label generation, inventory updates, and tracking.",
    mandays: 8,
  },
  {
    id: "wf-5",
    category: "Workflow Automation",
    icon: "CalendarBlank",
    name: "Recurring Task Scheduler",
    description:
      "Creates and assigns recurring tasks on custom schedules with automatic reminders and completion tracking.",
    mandays: 3,
  },
  {
    id: "wf-6",
    category: "Workflow Automation",
    icon: "FileText",
    name: "Contract Generation Pipeline",
    description:
      "Generates contracts from templates with merged CRM data, routes for e-signature, and files executed copies.",
    mandays: 6,
  },
  {
    id: "wf-7",
    category: "Workflow Automation",
    icon: "Wrench",
    name: "IT Service Request Flow",
    description:
      "Automates IT ticket intake, categorization, SLA assignment, and routing to the correct support tier.",
    mandays: 5,
  },
  {
    id: "wf-8",
    category: "Workflow Automation",
    icon: "Buildings",
    name: "Project Kickoff Automator",
    description:
      "Spins up project channels, boards, document folders, and stakeholder notifications when a new project is created.",
    mandays: 4,
  },
  // Notifications & Comms
  {
    id: "notif-1",
    category: "Notifications & Comms",
    icon: "Bell",
    name: "Multi-Channel Alerting",
    description:
      "Sends alerts via Slack, SMS, email, and push based on system events, thresholds, or schedule triggers.",
    mandays: 4,
  },
  {
    id: "notif-2",
    category: "Notifications & Comms",
    icon: "DeviceMobile",
    name: "SMS Campaign Manager",
    description:
      "Automated SMS outreach with opt-in management, delivery tracking, and response handling.",
    mandays: 5,
  },
  {
    id: "notif-3",
    category: "Notifications & Comms",
    icon: "Briefcase",
    name: "Slack Bot Integration",
    description:
      "Custom Slack bot that posts updates, handles commands, and bridges data between Slack and business tools.",
    mandays: 5,
  },
  {
    id: "notif-4",
    category: "Notifications & Comms",
    icon: "Megaphone",
    name: "Escalation Notifier",
    description:
      "Tiered notification system that escalates unresolved issues through defined chains with SLA tracking.",
    mandays: 4,
  },
  {
    id: "notif-5",
    category: "Notifications & Comms",
    icon: "GlobeHemisphereWest",
    name: "Webhook Relay Hub",
    description:
      "Receives webhooks from external services and fans out formatted notifications to the right teams and channels.",
    mandays: 3,
  },
  {
    id: "notif-6",
    category: "Notifications & Comms",
    icon: "PaperPlaneTilt",
    name: "Customer Status Notifier",
    description:
      "Sends proactive updates to customers about order status, outages, or account changes via their preferred channel.",
    mandays: 4,
  },
  {
    id: "notif-7",
    category: "Notifications & Comms",
    icon: "Handshake",
    name: "Teams Integration Bot",
    description:
      "Microsoft Teams bot that surfaces CRM updates, approval requests, and task assignments directly in team channels.",
    mandays: 5,
  },
  {
    id: "notif-8",
    category: "Notifications & Comms",
    icon: "Broadcast",
    name: "Incident Broadcast System",
    description:
      "Detects system incidents and broadcasts status updates to internal teams and external status pages simultaneously.",
    mandays: 6,
  },
  // Reporting & Analytics
  {
    id: "report-1",
    category: "Reporting & Analytics",
    icon: "TrendUp",
    name: "Executive Dashboard",
    description:
      "Real-time KPI dashboard pulling data from multiple sources into a single unified view for leadership.",
    mandays: 8,
  },
  {
    id: "report-2",
    category: "Reporting & Analytics",
    icon: "Calculator",
    name: "Automated Report Generator",
    description:
      "Scheduled reports compiled from databases, APIs, and spreadsheets, delivered as PDF or spreadsheet.",
    mandays: 5,
  },
  {
    id: "report-3",
    category: "Reporting & Analytics",
    icon: "TrendDown",
    name: "Anomaly Detection Alerts",
    description:
      "Monitors key metrics and triggers alerts when values deviate beyond configured thresholds or trends.",
    mandays: 6,
  },
  {
    id: "report-4",
    category: "Reporting & Analytics",
    icon: "Flask",
    name: "Pipeline Analytics",
    description:
      "Tracks conversion rates, stage velocity, and deal health across your sales pipeline with visual breakdowns.",
    mandays: 7,
  },
  {
    id: "report-5",
    category: "Reporting & Analytics",
    icon: "CurrencyDollar",
    name: "Revenue Attribution Model",
    description:
      "Multi-touch attribution tracking that maps marketing spend to closed revenue across all channels.",
    mandays: 9,
  },
  {
    id: "report-6",
    category: "Reporting & Analytics",
    icon: "Clock",
    name: "Time & Utilization Tracker",
    description:
      "Aggregates time-tracking data across tools to produce utilization reports by team, project, and client.",
    mandays: 4,
  },
  {
    id: "report-7",
    category: "Reporting & Analytics",
    icon: "ClipboardText",
    name: "Customer Health Scorecard",
    description:
      "Calculates and visualizes customer health scores from usage, support tickets, NPS, and renewal data.",
    mandays: 6,
  },
  {
    id: "report-8",
    category: "Reporting & Analytics",
    icon: "MapTrifold",
    name: "Cohort & Retention Analysis",
    description:
      "Groups users by signup date or behavior and tracks retention, churn, and LTV trends over time with visual charts.",
    mandays: 7,
  },
];

export const MANDAY_RATE = 1000;
export const BUNDLE_DISCOUNT = 0.1;
export const BUNDLE_THRESHOLD = 3;
