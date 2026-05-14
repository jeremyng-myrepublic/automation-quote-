export type SolutionTier = "Template" | "Configured" | "Bespoke";

export type Solution = {
  id: string;
  category: string;
  icon: string; // Phosphor icon name
  name: string;
  description: string;
  /** One-line plain-language hook shown on the grid card. */
  hook: string;
  tier: SolutionTier;
  /**
   * Indicative "from" price in SGD. Required for Template & Configured.
   * Bespoke solutions are quoted after Discovery and have no priceFrom.
   */
  priceFrom?: number;
  whatYouNeed?: string;
  goodFitIf?: string;
  example?: string;
  whatsIncluded?: string;
  videoUrl?: string;
};

export const categories = [
  "Start Here",
  "AI Agents",
  "Email Automation",
  "Integrations & Data",
  "Workflow Automation",
  "Notifications & Comms",
  "Reporting & Analytics",
] as const;

export type Category = (typeof categories)[number];

export const solutions: Solution[] = [
  // Start Here
  {
    id: "discovery-1",
    category: "Start Here",
    icon: "Compass",
    name: "Discovery & Solution Design",
    description:
      "A structured assessment phase before any build begins. We surface and prioritise your pain points, review your systems and data, and produce a solution design plus a fixed-price build quote. Fully creditable against the build that follows.",
    hook: "Begin with a paid discovery — fully creditable against your build.",
    tier: "Template",
    priceFrom: 3000,
  },

  // AI Agents
  {
    id: "ai-1",
    category: "AI Agents",
    icon: "Robot",
    name: "AI Customer Support Assistant",
    description:
      "Answer customer questions instantly, day or night — so your team isn't stuck replying to the same questions over and over. It handles the routine stuff and passes only the tricky cases to a human.",
    hook: "Answer customer questions instantly, day or night.",
    tier: "Configured",
    priceFrom: 15000,
    whatYouNeed: "A list of your common questions and answers (or existing FAQ docs), and the channels you want it on — website, WhatsApp, etc.",
    goodFitIf: "You're handling a high volume of repetitive customer enquiries and your team is spending real time on the same questions.",
    example: "A customer messages at 11pm asking about your opening hours and returns policy — it answers both instantly, and no one on your team touched it.",
  },
  {
    id: "ai-3",
    category: "AI Agents",
    icon: "MagnifyingGlass",
    name: "Lead Scoring Assistant",
    description:
      "Know which new enquiries are actually worth chasing — automatically. Your sales team spends time on the leads most likely to buy, instead of guessing or chasing dead ends.",
    hook: "Know which new enquiries are actually worth chasing.",
    tier: "Configured",
    priceFrom: 12000,
    whatYouNeed: "Access to where your leads come in (your CRM or forms), and a rough idea of what a 'good lead' looks like for you.",
    goodFitIf: "You get more enquiries than your sales team can chase properly, and you want them focused on the ones likely to convert.",
    example: "Twenty enquiries come in overnight — by morning they're ranked, so your team calls the five most promising first instead of working top to bottom.",
  },
  {
    id: "ai-4",
    category: "AI Agents",
    icon: "ChatCircle",
    name: "Meeting Booking Assistant",
    description:
      "Let people book time with you without the endless back-and-forth emails. It checks your calendar, handles time zones, and sends the reminders — you just show up.",
    hook: "Let people book time with you — no back-and-forth emails.",
    tier: "Template",
    priceFrom: 6000,
    whatYouNeed: "A connected calendar (Google or Outlook) and your availability preferences.",
    goodFitIf: "You or your team spend time emailing back and forth just to find a meeting slot.",
    example: "A prospect wants to meet — they pick a slot that works, it lands in your calendar, and the reminder goes out, all without an email thread.",
    whatsIncluded: "A booking page tied to your calendar, time-zone handling, automated confirmation and reminder emails, and a buffer/availability ruleset.",
  },
  {
    id: "ai-5",
    category: "AI Agents",
    icon: "Brain",
    name: "Internal Answers Assistant",
    description:
      "Your staff get instant answers to 'how do I…' questions, pulled straight from your own company documents — so they stop interrupting each other to ask.",
    hook: "Your staff get instant answers from your own documents.",
    tier: "Configured",
    priceFrom: 9000,
    whatYouNeed: "Access to the internal documents your team refers to — handbooks, process docs, policies.",
    goodFitIf: "Your team loses time asking each other 'how do I…' questions, or the same questions reach you repeatedly.",
    example: "A new staff member asks how to submit an expense claim — they get the answer straight from your own handbook, in seconds.",
  },
  {
    id: "ai-7",
    category: "AI Agents",
    icon: "Globe",
    name: "Brand Mention Tracker",
    description:
      "Know whenever someone mentions your business online — good or bad — and get a suggested reply ready to go, so nothing slips past you.",
    hook: "Know whenever someone mentions your business online.",
    tier: "Configured",
    priceFrom: 8000,
    whatYouNeed: "The social platforms and search terms you want watched (your business name, products, key people).",
    goodFitIf: "You want to catch what's being said about your business online without manually checking platforms all day.",
    example: "Someone posts a complaint about your service — you're alerted within minutes, with a suggested reply ready, instead of finding it days later.",
  },
  {
    id: "ai-8",
    category: "AI Agents",
    icon: "PencilSimpleLine",
    name: "Marketing Content Drafter",
    description:
      "Get first drafts of blog posts, social captions, and marketing copy in your brand's voice — turning a blank page into something to edit, in minutes instead of hours.",
    hook: "First drafts of your marketing copy in minutes, not hours.",
    tier: "Template",
    priceFrom: 7000,
    whatYouNeed: "Examples of your existing content and a short brief on your brand voice.",
    goodFitIf: "You publish content regularly and the blank-page stage is what slows you down.",
    example: "You need a blog post on a new service — you give a one-line brief and get a full first draft in your voice, ready to edit.",
    whatsIncluded: "A brand-voice setup from your examples, draft generation for your chosen content types (blog, social, email), and an editable-template structure.",
  },

  // Email Automation
  {
    id: "email-1",
    category: "Email Automation",
    icon: "Envelope",
    name: "Welcome Email Series",
    description:
      "New sign-ups automatically get a warm series of welcome emails — introducing your business and guiding them to act — without you sending a single one by hand.",
    hook: "New sign-ups get a warm welcome series — automatically.",
    tier: "Template",
    priceFrom: 3500,
    whatYouNeed: "Access to your email platform and a sense of what you want new sign-ups to know first.",
    goodFitIf: "You get regular new sign-ups and want them to feel looked after from day one — without manual sending.",
    example: "Someone signs up on Monday — over the next week they get a warm, paced introduction to your business, all automatic.",
    whatsIncluded: "A multi-email welcome sequence, sign-up trigger setup, personalised fields, and basic open/click tracking.",
  },
  {
    id: "email-2",
    category: "Email Automation",
    icon: "ArrowsClockwise",
    name: "Win-Back Emails",
    description:
      "Automatically reach out to customers who've gone quiet, with a timely nudge or offer that brings them back — instead of letting them drift away for good.",
    hook: "Bring quiet customers back before they drift away.",
    tier: "Template",
    priceFrom: 4000,
    whatYouNeed: "Access to your email platform and your customer list with last-activity dates.",
    goodFitIf: "You have customers who've gone quiet and you're currently doing nothing to bring them back.",
    example: "A customer hasn't ordered in three months — they automatically get a 'we miss you' email with a small offer, and some come back.",
    whatsIncluded: "A win-back email sequence, inactivity triggers, offer/incentive setup, and response tracking.",
  },
  {
    id: "email-3",
    category: "Email Automation",
    icon: "Mailbox",
    name: "Automated Account Emails",
    description:
      "Every order confirmation, receipt, and password reset sends itself, instantly and reliably — the essential emails customers expect, handled automatically.",
    hook: "Order confirmations and receipts that send themselves.",
    tier: "Configured",
    priceFrom: 6000,
    whatYouNeed: "Access to your system that creates orders/accounts, and your email platform.",
    goodFitIf: "You run transactions online and customers expect instant, reliable confirmations and receipts.",
    example: "A customer places an order — the confirmation and receipt arrive immediately, every time, with no manual step.",
  },
  {
    id: "email-4",
    category: "Email Automation",
    icon: "Target",
    name: "Lead Follow-Up Series",
    description:
      "Stay in front of potential customers with a steady series of helpful emails — so leads don't go cold while they're making up their minds.",
    hook: "Stay in front of leads so they don't go cold.",
    tier: "Template",
    priceFrom: 4000,
    whatYouNeed: "Access to your email platform and the content you'd want to share with a prospect over time.",
    goodFitIf: "Leads often go cold because follow-up is manual and inconsistent.",
    example: "A prospect downloads your guide but isn't ready to buy — a helpful email series keeps you in mind until they are.",
    whatsIncluded: "A multi-touch nurture sequence, entry triggers, stage-appropriate content slots, and engagement tracking.",
  },
  {
    id: "email-5",
    category: "Email Automation",
    icon: "ChartBar",
    name: "Newsletter Automation",
    description:
      "Send a polished newsletter on a regular schedule without the manual work of pulling it together each time — formatted, tested, and sent automatically.",
    hook: "A polished newsletter, sent on schedule, with no manual work.",
    tier: "Template",
    priceFrom: 3500,
    whatYouNeed: "Access to your email platform and your sources of content for the newsletter.",
    goodFitIf: "You send (or want to send) a regular newsletter but the manual assembly is the bottleneck.",
    example: "Your monthly newsletter pulls together, formats, and sends itself on the 1st — you just approve it.",
    whatsIncluded: "A newsletter template, a content-curation/assembly setup, scheduled sending, and built-in A/B subject testing.",
  },
  {
    id: "email-6",
    category: "Email Automation",
    icon: "ShoppingBag",
    name: "Abandoned Cart Reminders",
    description:
      "When a shopper leaves items in their cart without buying, they automatically get a reminder — often with a small nudge — recovering sales you'd otherwise lose.",
    hook: "Recover sales when shoppers leave items behind.",
    tier: "Configured",
    priceFrom: 4000,
    whatYouNeed: "An online store, and access to it plus your email platform.",
    goodFitIf: "You sell online and a meaningful number of shoppers add to cart but don't check out.",
    example: "A shopper leaves two items in their cart — an hour later they get a friendly reminder, and a chunk of those come back to buy.",
  },
  {
    id: "email-7",
    category: "Email Automation",
    icon: "Gift",
    name: "Birthday & Renewal Emails",
    description:
      "Birthdays, anniversaries, and renewal reminders go out automatically — the personal touches that keep customers feeling looked after, without anyone remembering to send them.",
    hook: "Birthday and renewal emails that send themselves.",
    tier: "Template",
    priceFrom: 3000,
    whatYouNeed: "Customer data that includes the relevant dates (birthdays, sign-up/renewal dates), and your email platform.",
    goodFitIf: "You want the personal touches that build loyalty, but no one has time to track and send them.",
    example: "A customer's renewal is two weeks away — they get a friendly reminder with their options, automatically.",
    whatsIncluded: "Date-triggered email setup for birthdays/anniversaries/renewals, personalised content fields, and offer slots.",
  },
  {
    id: "email-8",
    category: "Email Automation",
    icon: "Star",
    name: "Review Request Emails",
    description:
      "After a purchase or a support chat, customers automatically get asked for a review or quick feedback — building your reputation without you chasing anyone.",
    hook: "Build your reputation without chasing anyone for reviews.",
    tier: "Template",
    priceFrom: 3500,
    whatYouNeed: "Access to your email platform and a way to know when a purchase or interaction has finished.",
    goodFitIf: "You want more reviews and feedback but asking manually is inconsistent or forgotten.",
    example: "Three days after a purchase, the customer gets a short, friendly request for a review — building your reputation on autopilot.",
    whatsIncluded: "A post-purchase/post-interaction email trigger, a review-request template, and feedback capture.",
  },

  // Integrations & Data
  {
    id: "crm-1",
    category: "Integrations & Data",
    icon: "Folders",
    name: "Keep Your Tools In Sync",
    description:
      "Stop copying information between your CRM and your other tools. When something updates in one place, it updates everywhere — no double entry, no mismatched records.",
    hook: "Stop copying information between your tools.",
    tier: "Configured",
    priceFrom: 8000,
    whatYouNeed: "Access to your CRM and the other tools you want kept in sync, plus which fields matter.",
    goodFitIf: "Your team copies the same information between systems, or works from records that don't match.",
    example: "A contact updates their phone number in one tool — it updates everywhere, so no one's calling the old number.",
  },
  {
    id: "crm-2",
    category: "Integrations & Data",
    icon: "Broom",
    name: "Auto-Fill Contact Details",
    description:
      "Your contact records fill themselves in — company size, industry, role — so your team has the full picture without manually researching every lead.",
    hook: "Your contact records fill themselves in.",
    tier: "Configured",
    priceFrom: 6000,
    whatYouNeed: "Access to your CRM and a data-enrichment source (we'll advise on options).",
    goodFitIf: "Your team manually researches leads, or your records are thin and inconsistent.",
    example: "A new lead comes in with just a name and email — their company, size, and industry fill in automatically.",
  },
  {
    id: "crm-3",
    category: "Integrations & Data",
    icon: "LinkSimple",
    name: "Connect Leads to Companies",
    description:
      "When a new lead comes in from a company you already deal with, it's automatically linked to that company — so your team sees the full relationship, not scattered contacts.",
    hook: "See the full relationship, not scattered contacts.",
    tier: "Configured",
    priceFrom: 5000,
    whatYouNeed: "Access to your CRM with your existing accounts and incoming leads.",
    goodFitIf: "You deal with companies that have multiple contacts, and leads come in disconnected from the accounts they belong to.",
    example: "A new enquiry arrives from someone at a company you already work with — it's instantly linked, so your team sees the whole picture.",
  },
  {
    id: "crm-4",
    category: "Integrations & Data",
    icon: "Tray",
    name: "Web Form to CRM",
    description:
      "Every enquiry from your website lands straight in your CRM, tidy and assigned to the right person — no copy-pasting, no leads lost in an inbox.",
    hook: "Website enquiries land straight in your CRM, tidy.",
    tier: "Template",
    priceFrom: 4000,
    whatYouNeed: "Your website forms and access to your CRM.",
    goodFitIf: "Website enquiries currently arrive by email or get manually copied into your CRM.",
    example: "Someone fills in your contact form — it appears in your CRM straight away, assigned to the right salesperson.",
    whatsIncluded: "Form-to-CRM connection, field mapping, duplicate checking, and owner-assignment rules.",
  },
  {
    id: "crm-5",
    category: "Integrations & Data",
    icon: "Tag",
    name: "Auto-Organise Your Contacts",
    description:
      "Your contacts sort themselves into the right groups automatically — by what they've bought or how they behave — so your outreach always hits the right people.",
    hook: "Your contacts sort themselves into the right groups.",
    tier: "Configured",
    priceFrom: 5000,
    whatYouNeed: "Access to your CRM and the grouping rules that matter to you.",
    goodFitIf: "Your contact list is one big undifferentiated pile and your outreach isn't targeted.",
    example: "A customer makes their third purchase — they're automatically moved into your 'loyal customers' group for tailored offers.",
  },
  {
    id: "crm-6",
    category: "Integrations & Data",
    icon: "ArrowsClockwise",
    name: "Clean Up Duplicate Records",
    description:
      "Finds and merges duplicate contacts and companies in your CRM automatically — so you're not emailing the same person twice or working from messy data.",
    hook: "No more duplicate contacts or messy data.",
    tier: "Configured",
    priceFrom: 5000,
    whatYouNeed: "Access to your CRM.",
    goodFitIf: "Your CRM has built up duplicate or messy records over time.",
    example: "The same customer exists three times under slightly different details — they're found and merged into one clean record.",
  },
  {
    id: "crm-7",
    category: "Integrations & Data",
    icon: "ChartBar",
    name: "Auto-Update Your Sales Pipeline",
    description:
      "Your sales pipeline updates itself as things actually happen — when a meeting's booked or a reply comes in — so it always reflects reality without manual upkeep.",
    hook: "Your sales pipeline updates itself as things happen.",
    tier: "Configured",
    priceFrom: 6000,
    whatYouNeed: "Access to your CRM and a clear definition of what moves a deal between stages.",
    goodFitIf: "Your sales pipeline is often out of date because updating it is manual.",
    example: "A prospect replies to confirm a meeting — the deal automatically moves to the next stage, no one had to remember.",
  },

  // Workflow Automation
  {
    id: "wf-1",
    category: "Workflow Automation",
    icon: "Gear",
    name: "Automated Approvals",
    description:
      "Requests that need sign-off — purchases, leave, content — route to the right people automatically, with reminders if someone's slow. No more chasing approvals over email.",
    hook: "No more chasing sign-offs over email.",
    tier: "Configured",
    priceFrom: 8000,
    whatYouNeed: "The approval steps you use and who signs off on what.",
    goodFitIf: "Approvals — purchases, leave, content — get stuck or lost in email threads.",
    example: "A purchase request goes in — it routes to the right manager, and if they don't respond in two days, it nudges them.",
  },
  {
    id: "wf-3",
    category: "Workflow Automation",
    icon: "Shuffle",
    name: "Smart Task Assignment",
    description:
      "Incoming work is automatically assigned to the right team member — based on who's free and who's best suited — so nothing piles up on one person or gets dropped.",
    hook: "Incoming work goes to the right person, automatically.",
    tier: "Configured",
    priceFrom: 6000,
    whatYouNeed: "Where tasks come in, and the rules for who should get what.",
    goodFitIf: "Incoming work piles up on whoever notices it, or gets dropped between people.",
    example: "A support task comes in needing a specialist — it's assigned to the right available person automatically, not left in a shared inbox.",
  },
  {
    id: "wf-5",
    category: "Workflow Automation",
    icon: "CalendarBlank",
    name: "Recurring Task Reminders",
    description:
      "The tasks that happen every week or month create and assign themselves on schedule, with reminders — so routine work never gets forgotten.",
    hook: "Routine work that never gets forgotten.",
    tier: "Template",
    priceFrom: 3500,
    whatYouNeed: "A list of your recurring tasks and who owns them.",
    goodFitIf: "Routine weekly or monthly tasks sometimes get forgotten.",
    example: "The monthly compliance check creates itself on the 1st, assigned with a reminder — so it never slips.",
    whatsIncluded: "Recurring task setup on your schedules, owner assignment, automatic reminders, and completion tracking.",
  },
  {
    id: "wf-6",
    category: "Workflow Automation",
    icon: "FileText",
    name: "Automated Contract Drafting",
    description:
      "Contracts draft themselves from your templates with the client's details filled in, go out for e-signature, and file themselves once signed — a job of minutes, not hours.",
    hook: "Contracts drafted, signed, and filed in minutes.",
    tier: "Configured",
    priceFrom: 7000,
    whatYouNeed: "Your contract templates and access to where the client details live (your CRM).",
    goodFitIf: "Drafting contracts is a repetitive manual job that slows down closing.",
    example: "A deal is ready to close — the contract drafts itself with the client's details, goes out for signature, and files itself once signed.",
  },
  {
    id: "wf-8",
    category: "Workflow Automation",
    icon: "Buildings",
    name: "Automated Project Setup",
    description:
      "When a new project starts, everything it needs — folders, boards, channels, the right people notified — gets set up automatically, so the team can start work straight away.",
    hook: "New projects set themselves up so the team starts straight away.",
    tier: "Configured",
    priceFrom: 5000,
    whatYouNeed: "Your standard project setup steps and the tools involved (folders, boards, channels).",
    goodFitIf: "Starting a new project means manually setting up the same things every time.",
    example: "A new client project kicks off — its folder, board, channel, and team notifications are all created in one go.",
  },

  // Notifications & Comms
  {
    id: "notif-1",
    category: "Notifications & Comms",
    icon: "Bell",
    name: "Instant Alerts, Anywhere",
    description:
      "Get notified the moment something important happens — by text, email, or Slack, whichever you check — so you're never the last to know.",
    hook: "Never be the last to know something important.",
    tier: "Template",
    priceFrom: 4500,
    whatYouNeed: "The events you want to be alerted on, and your preferred channels (text, email, Slack).",
    goodFitIf: "Important things happen and you find out too late because no one's watching.",
    example: "A big order comes in — you get a text within seconds, wherever you are.",
    whatsIncluded: "Alert setup for your chosen events, multi-channel delivery (SMS/email/Slack), and threshold/schedule triggers.",
  },
  {
    id: "notif-2",
    category: "Notifications & Comms",
    icon: "DeviceMobile",
    name: "Text Message Campaigns",
    description:
      "Reach customers where they actually look — their text messages — with campaigns that handle sign-ups, delivery, and replies automatically.",
    hook: "Reach customers where they actually look — their texts.",
    tier: "Configured",
    priceFrom: 6000,
    whatYouNeed: "An SMS provider (we'll advise) and your customer contact list with consent.",
    goodFitIf: "You want to reach customers somewhere they actually look, and email open rates aren't cutting it.",
    example: "You run a one-day promotion — a text goes out to opted-in customers, with replies handled automatically.",
  },
  {
    id: "notif-3",
    category: "Notifications & Comms",
    icon: "Briefcase",
    name: "Slack Assistant",
    description:
      "Bring your important updates and tools straight into Slack — your team gets what they need where they already work, instead of switching between apps all day.",
    hook: "Your updates and tools, right inside Slack.",
    tier: "Configured",
    priceFrom: 6000,
    whatYouNeed: "A Slack workspace and access to the tools/data you want surfaced in it.",
    goodFitIf: "Your team lives in Slack but has to leave it to check other systems.",
    example: "A new lead comes in — it's posted straight into your sales Slack channel, so the team sees it without opening the CRM.",
  },
  {
    id: "notif-4",
    category: "Notifications & Comms",
    icon: "Megaphone",
    name: "Issue Escalation Alerts",
    description:
      "If a problem isn't dealt with in time, it automatically gets escalated up the chain — so important issues never quietly slip through the cracks.",
    hook: "Important issues never quietly slip through the cracks.",
    tier: "Configured",
    priceFrom: 5000,
    whatYouNeed: "Your escalation chain — who handles what, and the time limits that matter.",
    goodFitIf: "Problems sometimes sit unresolved because there's no system pushing them up the chain.",
    example: "A support issue isn't picked up within an hour — it automatically escalates to the team lead, so it doesn't get forgotten.",
  },
  {
    id: "notif-5",
    category: "Notifications & Comms",
    icon: "GlobeHemisphereWest",
    name: "Connect Your Apps",
    description:
      "When one of your tools does something, the right people and systems automatically hear about it — a reliable bridge between the apps you already use.",
    hook: "A reliable bridge between the apps you already use.",
    tier: "Template",
    priceFrom: 3500,
    whatYouNeed: "The apps you want connected and what event in one should trigger something in another.",
    goodFitIf: "You use several tools that don't talk to each other, so things fall through the gaps.",
    example: "Your booking tool gets a new booking — your ops team and your calendar both hear about it automatically.",
    whatsIncluded: "Connection setup between your chosen apps, event triggers, formatted notifications, and routing to the right teams/channels.",
  },
  {
    id: "notif-6",
    category: "Notifications & Comms",
    icon: "PaperPlaneTilt",
    name: "Keep Customers Updated",
    description:
      "Customers automatically hear about their order status, service issues, or account changes — before they have to ask — building trust and cutting 'where's my order?' enquiries.",
    hook: "Customers hear about their order before they have to ask.",
    tier: "Configured",
    priceFrom: 5000,
    whatYouNeed: "Access to the systems holding the status info (orders, accounts) and your customers' contact details.",
    goodFitIf: "Customers contact you asking 'where's my order?' or 'what's happening with my account?'",
    example: "An order ships — the customer automatically gets a notification, so they never have to ask.",
  },
  {
    id: "notif-7",
    category: "Notifications & Comms",
    icon: "Handshake",
    name: "Microsoft Teams Assistant",
    description:
      "Bring your updates, approvals, and task assignments straight into Microsoft Teams — your team works from one place instead of jumping between systems.",
    hook: "Your updates and approvals, right inside Teams.",
    tier: "Configured",
    priceFrom: 6000,
    whatYouNeed: "A Microsoft Teams setup and access to the tools/data you want surfaced in it.",
    goodFitIf: "Your team works in Teams but switches between systems to get updates and approvals.",
    example: "An approval request appears directly in the right Teams channel — handled there, without opening another tool.",
  },

  // Reporting & Analytics
  {
    id: "report-2",
    category: "Reporting & Analytics",
    icon: "Calculator",
    name: "Automated Reports",
    description:
      "The reports you build by hand every week or month build themselves — pulled together from your data and delivered to your inbox on schedule.",
    hook: "The reports you build by hand — built for you, on schedule.",
    tier: "Configured",
    priceFrom: 6000,
    whatYouNeed: "Access to the data sources the report draws from, and a sample of the report you build today.",
    goodFitIf: "You or your team manually build the same reports every week or month.",
    example: "Your weekly sales report builds itself every Monday morning and lands in your inbox as a PDF — no one assembled it.",
  },
  {
    id: "report-3",
    category: "Reporting & Analytics",
    icon: "TrendDown",
    name: "Early Warning Alerts",
    description:
      "Keep an eye on your key numbers automatically — and get an alert the moment something looks off — so you catch problems early instead of finding out too late.",
    hook: "Catch problems early, instead of finding out too late.",
    tier: "Configured",
    priceFrom: 7000,
    whatYouNeed: "Access to the metrics you want watched, and a sense of what 'normal' looks like for each.",
    goodFitIf: "By the time you notice a problem in your numbers, it's already cost you.",
    example: "Your daily refund rate doubles unexpectedly — you get an alert that morning, not at month-end.",
  },
  {
    id: "report-6",
    category: "Reporting & Analytics",
    icon: "Clock",
    name: "Team Time Reports",
    description:
      "See clearly where your team's time actually goes — by project and client — pulled together automatically, so you can spot what's profitable and what's not.",
    hook: "See clearly where your team's time actually goes.",
    tier: "Configured",
    priceFrom: 5000,
    whatYouNeed: "Access to wherever your team logs time, and how you want it grouped (project, client, team).",
    goodFitIf: "You don't have a clear picture of where your team's time actually goes.",
    example: "At month-end you see exactly how many hours went to each client — and spot the one quietly eating your margin.",
  },
];

export const BUNDLE_DISCOUNT = 0.1;
export const BUNDLE_THRESHOLD = 3;
