"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Phone, PaintBrush, Sparkle, RocketLaunch, Sun, Moon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

const WEB_ICON_MAP: Record<string, Icon> = {
  Phone, PaintBrush, Sparkle, RocketLaunch,
};

function StepIcon({ name, size = 28, className }: { name: string; size?: number; className?: string }) {
  const IconComp = WEB_ICON_MAP[name];
  if (!IconComp) return null;
  return <IconComp size={size} weight="regular" className={className} />;
}

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const t = document.documentElement.getAttribute("data-theme");
    if (t === "light" || t === "dark") setTheme(t);
  }, []);
  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch {}
      return next;
    });
  }, []);
  return { theme, toggle };
}

function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-primary)] transition hover:border-[#b14eb5]/40 hover:text-[#b14eb5] ${className}`}
    >
      {theme === "dark" ? <Sun size={18} weight="regular" /> : <Moon size={18} weight="regular" />}
    </button>
  );
}

/* ─── Scroll reveal (same pattern as main site) ─── */

const revealedIds = new Set<string>();

function useScrollReveal(staggerMs = 100) {
  const ref = useRef<HTMLDivElement>(null);
  const observersRef = useRef<IntersectionObserver[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    observersRef.current.forEach((o) => o.disconnect());
    observersRef.current = [];

    const children = Array.from(el.querySelectorAll("[data-reveal-id]"));

    children.forEach((child) => {
      const id = (child as HTMLElement).dataset.revealId!;
      if (revealedIds.has(id)) {
        child.classList.remove("reveal");
        child.classList.add("visible");
      }
    });

    const unrevealed = children.filter(
      (child) => !revealedIds.has((child as HTMLElement).dataset.revealId!)
    );
    if (!unrevealed.length) return;

    const rows: Element[][] = [];
    let currentRowTop = -1;
    unrevealed.forEach((child) => {
      const top = (child as HTMLElement).offsetTop;
      if (Math.abs(top - currentRowTop) > 10) {
        rows.push([]);
        currentRowTop = top;
      }
      rows[rows.length - 1].push(child);
    });

    rows.forEach((row) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const idx = row.indexOf(entry.target);
              const id = (entry.target as HTMLElement).dataset.revealId!;
              setTimeout(() => {
                entry.target.classList.remove("reveal");
                entry.target.classList.add("visible");
                revealedIds.add(id);
              }, idx * staggerMs);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      row.forEach((card) => observer.observe(card));
      observersRef.current.push(observer);
    });

    return () => {
      observersRef.current.forEach((o) => o.disconnect());
      observersRef.current = [];
    };
  });

  return ref;
}

function useNavScroll() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

function useCountUp(target: number, suffix: string, triggered: boolean) {
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    if (!triggered) return;
    const duration = 3000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(target, Math.round(increment * step));
      setDisplay(current + suffix);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [triggered, target, suffix]);
  return triggered ? display : "0" + suffix;
}

/* ─── Section heading ─── */

function SectionLabel({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-6 sm:mb-8">
      <p className="section-label mb-2 text-xs font-semibold uppercase text-[#b14eb5]">
        {label}
      </p>
      <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
        {title}
      </h2>
    </div>
  );
}

/* ─── Data ─── */

type WebPackage = {
  name: string;
  price: string;
  tagline: string;
  features: string[];
  button: string;
  badge?: string;
  badgeColor?: string;
  borderColor?: string;
  glowColor?: string;
  delivery: string;
};

const webPackages: WebPackage[] = [
  {
    name: "Essential",
    price: "$2,500",
    tagline: "Perfect for getting online fast",
    features: [
      "Up to 5 pages",
      "Choose from our templates",
      "2 rounds of revisions",
      "Mobile responsive",
      "Contact form",
      "Basic SEO setup",
    ],
    delivery: "2 weeks",
    button: "Get Started",
  },
  {
    name: "Premium",
    price: "$5,500",
    tagline: "For businesses ready to grow",
    features: [
      "Up to 10 pages",
      "Choose from our templates",
      "3 rounds of revisions",
      "Mobile responsive + animations",
      "Blog / CMS included",
      "E-commerce or booking system",
      "Full SEO setup",
      "1 automation integration",
    ],
    delivery: "3-4 weeks",
    button: "Get Started",
    badge: "Most Popular",
    badgeColor: "#b14eb5",
  },
  {
    name: "Enterprise",
    price: "$12,000+",
    tagline: "Full-stack solution for scaling businesses",
    features: [
      "Unlimited pages",
      "Choose from our templates",
      "5 rounds of revisions",
      "Custom animations",
      "Full SEO + ongoing support",
      "Up to 3 automation integrations",
      "Dedicated project manager",
    ],
    delivery: "6-8 weeks",
    button: "Talk to Us",
  },
  {
    name: "Custom Build",
    price: "From $8,000",
    tagline: "Nothing off the shelf — built entirely around your brand",
    features: [
      "Unlimited pages",
      "Built from scratch — no templates",
      "Unlimited design revisions",
      "Bespoke UI/UX design",
      "Brand identity (optional add-on)",
      "Up to 5 automation integrations",
      "Dedicated project manager",
    ],
    delivery: "8-12 weeks",
    button: "Let's Talk",
    badge: "Bespoke",
    badgeColor: "#FFD700",
    borderColor: "#FFD700",
    glowColor: "rgba(255, 215, 0, 0.3)",
  },
];

type TemplateCategory =
  | "All"
  | "E-commerce"
  | "F&B"
  | "Corporate"
  | "Beauty & Wellness"
  | "Education & Training"
  | "Real Estate"
  | "Professional Services"
  | "Construction & Renovation"
  | "Events"
  | "Non-Profit"
  | "Tech & SaaS"
  | "Hospitality"
  | "Portfolio"
  | "Logistics";

const templateCategories: TemplateCategory[] = [
  "All", "E-commerce", "F&B", "Corporate", "Beauty & Wellness",
  "Education & Training", "Real Estate", "Professional Services",
  "Construction & Renovation", "Events", "Non-Profit", "Tech & SaaS",
  "Hospitality", "Portfolio",
];

type Template = {
  category: TemplateCategory;
  name: string;
  tagline: string;
  status: "live";
  link: string;
  gradient: string;
};

const templates: Template[] = [
  { category: "E-commerce", name: "Lumiere Store", tagline: "Luxury fashion boutique", status: "live", link: "https://bootstrapmade.com/demo/SmartStore/", gradient: "from-rose-500 to-pink-600" },
  { category: "F&B", name: "Ember & Oak", tagline: "Modern restaurant with reservations", status: "live", link: "https://bootstrapmade.com/demo/Flavora/", gradient: "from-orange-500 to-amber-600" },
  { category: "Corporate", name: "Nexus Advisory", tagline: "Business consulting firm", status: "live", link: "https://bootstrapmade.com/demo/Atlas/", gradient: "from-blue-500 to-indigo-600" },
  { category: "Beauty & Wellness", name: "Bloom Studio", tagline: "Spa & wellness centre", status: "live", link: "https://bootstrapmade.com/demo/Sparlex/", gradient: "from-pink-400 to-fuchsia-500" },
  { category: "Education & Training", name: "Elevate Academy", tagline: "Corporate training & courses", status: "live", link: "https://bootstrapmade.com/demo/Learner/", gradient: "from-emerald-500 to-teal-600" },
  { category: "Real Estate", name: "Prestige Properties", tagline: "Premium property agency", status: "live", link: "https://bootstrapmade.com/demo/EstateAgency/", gradient: "from-slate-500 to-gray-600" },
  { category: "Professional Services", name: "ClearCare Clinic", tagline: "Modern medical practice", status: "live", link: "https://bootstrapmade.com/demo/Medicio/", gradient: "from-cyan-500 to-blue-500" },
  { category: "Construction & Renovation", name: "Forma Studio", tagline: "Interior design & renovation", status: "live", link: "https://bootstrapmade.com/demo/Constructify/", gradient: "from-amber-600 to-yellow-700" },
  { category: "Events", name: "Elan Events", tagline: "Luxury event planning", status: "live", link: "https://bootstrapmade.com/demo/TheEvent/", gradient: "bg-[#63077d]" },
  { category: "Non-Profit", name: "Groundwork SG", tagline: "Community & charity", status: "live", link: "https://bootstrapmade.com/demo/Charity/", gradient: "from-green-500 to-emerald-600" },
  { category: "Tech & SaaS", name: "Stackly", tagline: "Software product landing page", status: "live", link: "https://bootstrapmade.com/demo/HeroBiz/", gradient: "bg-[#b14eb5]" },
  { category: "Hospitality", name: "Haven Boutique Hotel", tagline: "Boutique hotel & suites", status: "live", link: "https://bootstrapmade.com/demo/Grandoria/", gradient: "from-amber-400 to-orange-500" },
  { category: "Portfolio", name: "Studio Vance", tagline: "Creative agency portfolio", status: "live", link: "https://bootstrapmade.com/demo/Folio/", gradient: "from-fuchsia-500 to-pink-600" },
  { category: "Logistics", name: "SwiftLink Logistics", tagline: "Freight & logistics company", status: "live", link: "https://bootstrapmade.com/demo/Logis/", gradient: "from-gray-500 to-slate-600" },
];

const comparisonFeatures = [
  { feature: "Number of pages", essential: "Up to 5", premium: "Up to 10", enterprise: "Unlimited", custom: "Unlimited" },
  { feature: "Template or custom", essential: "Template", premium: "Template", enterprise: "Template", custom: "From scratch" },
  { feature: "Design revisions", essential: "2 rounds", premium: "3 rounds", enterprise: "5 rounds", custom: "Unlimited" },
  { feature: "Mobile responsive", essential: true, premium: true, enterprise: true, custom: true },
  { feature: "Contact form", essential: true, premium: true, enterprise: true, custom: true },
  { feature: "Blog / CMS", essential: false, premium: true, enterprise: true, custom: true },
  { feature: "E-commerce / booking", essential: false, premium: true, enterprise: true, custom: true },
  { feature: "Custom animations", essential: false, premium: true, enterprise: true, custom: true },
  { feature: "SEO setup", essential: "Basic", premium: "Full", enterprise: "Full + ongoing", custom: "Full + ongoing" },
  { feature: "Automation integration", essential: false, premium: "1 included", enterprise: "Up to 3", custom: "Up to 5" },
  { feature: "Brand identity", essential: false, premium: false, enterprise: false, custom: "Add-on" },
  { feature: "Dedicated project manager", essential: false, premium: false, enterprise: true, custom: true },
  { feature: "Delivery time", essential: "2 weeks", premium: "3-4 weeks", enterprise: "6-8 weeks", custom: "8-12 weeks" },
];

const howItWorksSteps = [
  { num: "01", title: "Discovery Call", icon: "Phone", desc: "We learn about your business, goals, and preferences.", badge: "Day 1" },
  { num: "02", title: "Design & Feedback", icon: "PaintBrush", desc: "We build your site and refine it based on your feedback.", badge: "Day 2-7" },
  { num: "03", title: "Final Revisions", icon: "Sparkle", desc: "We make final tweaks until you're 100% happy.", badge: "Day 8-12" },
  { num: "04", title: "Launch", icon: "RocketLaunch", desc: "We go live and hand over full ownership to you.", badge: "Day 14+" },
];

const faqs = [
  {
    q: "Do I own the website after it's built?",
    a: "Yes — 100%. You own all the code, content, and the domain. We hand everything over on launch day.",
  },
  {
    q: "Can I update the website myself after launch?",
    a: "Yes. We build on platforms that are easy to manage. We also provide a handover session so you know how to make basic updates.",
  },
  {
    q: "What if I want changes after the site is launched?",
    a: "Minor changes are covered during the revision rounds. For ongoing changes after launch, we offer support packages starting from $200/month.",
  },
  {
    q: "Do you provide hosting?",
    a: "We recommend and set up hosting for you (typically Vercel or similar). Hosting costs are separate and usually $0-$20/month depending on your needs.",
  },
  {
    q: "How do I get started?",
    a: "Click \"Get Started\" on any package above, or contact us directly. We'll schedule a discovery call within 24 hours.",
  },
  {
    q: "Can I combine web design with automation services?",
    a: "Absolutely — in fact we recommend it. Our Premium and Enterprise packages include automation integrations, or you can add them from our automation portal.",
  },
];

/* ─── Stats Bar ─── */

function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stat1 = useCountUp(14, "+", triggered);
  const stat2 = useCountUp(2, "", triggered);
  const stat3 = useCountUp(100, "%", triggered);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 -mt-8 relative z-10">
      <div
        ref={ref}
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8"
        style={{ boxShadow: "0 0 40px rgba(177,78,181,0.08)" }}
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: stat1, label: "Industries served" },
            { value: triggered ? stat2 + " Weeks" : "0 Weeks", label: "Fastest delivery" },
            { value: stat3, label: "Mobile responsive" },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-2xl font-bold text-[#b14eb5] sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)] sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works (grid zigzag, same as main site) ─── */

function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const ContentBlock = ({ step, delay }: { step: typeof howItWorksSteps[number]; delay: string }) => (
    <div
      className={`timeline-content text-center ${triggered ? "shown" : ""}`}
      style={{ transitionDelay: delay }}
    >
      <div style={{ marginBottom: "8px" }}><StepIcon name={step.icon} size={28} className="text-[#b14eb5] mx-auto" /></div>
      <h3 className="font-heading font-bold text-[var(--text-primary)]" style={{ fontSize: "16px", marginBottom: "4px" }}>{step.title}</h3>
      <p className="leading-relaxed text-[var(--text-secondary)]" style={{ fontSize: "14px", marginBottom: "8px" }}>{step.desc}</p>
      <span className="inline-block rounded-full bg-[#b14eb5]/10 border border-[#b14eb5]/20 px-3 py-0.5 text-xs font-medium text-[#b14eb5]">
        {step.badge}
      </span>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16" ref={sectionRef}>
      <SectionLabel label="Process" title="From Brief to Launch" />

      {/* Desktop: 3-row grid */}
      <div className="hidden md:block mt-12">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr",
            gridTemplateRows: "220px 80px 220px",
            alignItems: "stretch",
          }}
        >
          {/* Row 1: top content */}
          {howItWorksSteps.map((step, i) => {
            const isAbove = i % 2 === 0;
            const delay = `${0.8 + i * 0.2}s`;
            return (
              <div
                key={`top-${i}`}
                style={{
                  gridColumn: i * 2 + 1,
                  gridRow: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: "0 8px 16px 8px",
                }}
              >
                {isAbove && <ContentBlock step={step} delay={delay} />}
              </div>
            );
          })}

          {/* Row 1: arrow spacers */}
          {[1, 2, 3].map((i) => (
            <div key={`arrow-top-${i}`} style={{ gridColumn: i * 2, gridRow: 1 }} />
          ))}

          {/* Row 2: nodes + line */}
          {howItWorksSteps.map((step, i) => {
            const nodeDelay = `${0.4 + i * 0.2}s`;
            return (
              <div
                key={`node-${i}`}
                style={{
                  gridColumn: i * 2 + 1,
                  gridRow: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <div
                  className={`timeline-node z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#63077d] to-[#b14eb5] text-sm font-bold text-white ${triggered ? "popped" : ""}`}
                  style={{ animationDelay: triggered ? nodeDelay : undefined }}
                >
                  {step.num}
                </div>
              </div>
            );
          })}

          {/* Row 2: arrows between nodes */}
          {[1, 2, 3].map((i) => (
            <div
              key={`arrow-${i}`}
              style={{
                gridColumn: i * 2,
                gridRow: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: "100%", height: "2px", background: "linear-gradient(90deg, #63077d, #b14eb5)", position: "relative" }}>
                <div style={{ position: "absolute", right: "-4px", top: "-4px", width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: "8px solid #b14eb5" }} />
              </div>
            </div>
          ))}

          {/* Row 3: bottom content */}
          {howItWorksSteps.map((step, i) => {
            const isBelow = i % 2 !== 0;
            const delay = `${0.8 + i * 0.2}s`;
            return (
              <div
                key={`bottom-${i}`}
                style={{
                  gridColumn: i * 2 + 1,
                  gridRow: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  padding: "16px 8px 0 8px",
                }}
              >
                {isBelow && <ContentBlock step={step} delay={delay} />}
              </div>
            );
          })}

          {/* Row 3: arrow spacers */}
          {[1, 2, 3].map((i) => (
            <div key={`arrow-bot-${i}`} style={{ gridColumn: i * 2, gridRow: 3 }} />
          ))}
        </div>
      </div>

      {/* Mobile: vertical timeline */}
      <div className="md:hidden mt-8">
        {howItWorksSteps.map((step, i) => {
          const isLast = i === howItWorksSteps.length - 1;
          const nodeDelay = `${0.2 + i * 0.2}s`;
          const contentDelay = `${0.4 + i * 0.2}s`;
          return (
            <div key={step.num} style={{ display: "flex", gap: "16px", marginBottom: isLast ? 0 : "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  className={`timeline-node z-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#63077d] to-[#b14eb5] text-xs font-bold text-white ${triggered ? "popped" : ""}`}
                  style={{ width: "44px", height: "44px", flexShrink: 0, animationDelay: triggered ? nodeDelay : undefined }}
                >
                  {step.num}
                </div>
                {!isLast && (
                  <div style={{ width: "2px", flexGrow: 1, marginTop: "8px", background: "linear-gradient(180deg, #63077d, #b14eb5)" }} />
                )}
              </div>
              <div
                className={`timeline-content ${triggered ? "shown" : ""}`}
                style={{ transitionDelay: contentDelay, paddingBottom: isLast ? 0 : "8px" }}
              >
                <div style={{ marginBottom: "4px" }}><StepIcon name={step.icon} size={24} className="text-[#b14eb5]" /></div>
                <h3 className="font-heading text-sm font-bold text-[var(--text-primary)] mb-1">{step.title}</h3>
                <p className="text-xs leading-relaxed text-[var(--text-secondary)] mb-2">{step.desc}</p>
                <span className="inline-block rounded-full bg-[#b14eb5]/10 border border-[#b14eb5]/20 px-3 py-0.5 text-xs font-medium text-[#b14eb5]">
                  {step.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Main page ─── */

export default function WebServices() {
  const [mobileNav, setMobileNav] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<TemplateCategory>("All");

  const navScrolled = useNavScroll();
  const packagesRef = useScrollReveal();
  const galleryRef = useScrollReveal();
  const compareRef = useScrollReveal();
  const faqRef = useScrollReveal(80);
  const footerRef = useScrollReveal();

  const filteredTemplates =
    activeTemplate === "All"
      ? templates
      : templates.filter((t) => t.category === activeTemplate);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* ── Floating navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-30 px-4 pt-4 sm:px-6">
        <div className={`nav-glass mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/[0.06] bg-[var(--bg-primary)]/60 px-5 py-3 ${navScrolled ? "scrolled" : ""}`}>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/myrepublic-logo.png"
              alt="MyRepublic"
              width={1080}
              height={361}
              priority
              className="h-7 w-auto sm:h-8"
            />
            <span className="font-heading text-lg font-bold text-[#b14eb5] tracking-tight">Business</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-6 md:flex">
            {[
              { label: "Packages", href: "#packages" },
              { label: "Templates", href: "#gallery" },
              { label: "Compare", href: "#compare" },
              { label: "FAQ", href: "#faq" },
              { label: "Automation", href: "/" },
            ].map((link) =>
              link.href === "/" ? (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-[var(--text-primary)] transition hover:text-[#b14eb5] hover:underline hover:underline-offset-4"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-[var(--text-primary)] transition hover:text-[#b14eb5] hover:underline hover:underline-offset-4"
                >
                  {link.label}
                </a>
              )
            )}
            <ThemeToggle />
            <a
              href="#packages"
              className="nav-btn-glow rounded-lg bg-gradient-to-r from-[#63077d] to-[#b14eb5] px-5 py-2 text-sm font-semibold text-white transition"
            >
              View Packages
            </a>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <a
              href="#packages"
              className="nav-btn-glow rounded-lg bg-gradient-to-r from-[#63077d] to-[#b14eb5] px-4 py-2 text-sm font-semibold text-white transition"
            >
              Packages
            </a>
            <button
              onClick={() => setMobileNav(!mobileNav)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-primary)] transition hover:border-[#b14eb5]/40 hover:text-[var(--text-primary)]"
              aria-label="Toggle menu"
            >
              {mobileNav ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileNav && (
          <div className="mt-2 mx-auto max-w-7xl rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/95 backdrop-blur-lg p-4 md:hidden">
            {[
              { label: "Packages", href: "#packages" },
              { label: "Templates", href: "#gallery" },
              { label: "Compare", href: "#compare" },
              { label: "FAQ", href: "#faq" },
              { label: "Automation", href: "/" },
            ].map((link) =>
              link.href === "/" ? (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileNav(false)}
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--border-subtle)]/30 hover:text-[#b14eb5]"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileNav(false)}
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--border-subtle)]/30 hover:text-[#b14eb5]"
                >
                  {link.label}
                </a>
              )
            )}
          </div>
        )}
      </nav>

      {/* ── 1. Hero ── */}
      <section className="hero-mesh relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pb-28 sm:pt-40">
        <span className="hero-blob-3" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="section-label mb-3 text-xs font-semibold uppercase text-[#b14eb5]">
            Web Design
          </p>
          <h1 className="animate-hero font-heading text-3xl font-extrabold leading-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
            Beautiful Websites
            <br />
            That Convert
          </h1>
          <div className="animate-hero-delay mx-auto mt-4 w-48 sm:w-64">
            <div className="glow-line" />
          </div>
          <p className="animate-hero-delay-2 mx-auto mt-6 max-w-xl text-base text-[var(--text-muted)] sm:text-lg">
            Template-based or fully custom — we build professional websites for Singapore businesses, fast.
          </p>
          <div className="animate-hero-delay-2 mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#gallery"
              className="rounded-lg border border-[#b14eb5]/30 bg-[#b14eb5]/10 px-6 py-3 text-sm font-semibold text-[#b14eb5] transition hover:bg-[#b14eb5]/20"
            >
              Browse Templates
            </a>
            <a
              href="#packages"
              className="nav-btn-glow rounded-lg bg-gradient-to-r from-[#63077d] to-[#b14eb5] px-6 py-3 text-sm font-semibold text-white transition"
            >
              View Packages
            </a>
          </div>
        </div>
      </section>

      {/* ── 2. Stats Bar ── */}
      <StatsBar />

      {/* ── 3. Packages ── */}
      <section id="packages" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20" ref={packagesRef}>
        <SectionLabel label="Pricing" title="Choose Your Package" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {webPackages.map((pkg) => (
            <div
              key={pkg.name}
              data-reveal-id={`web-pkg-${pkg.name}`}
              className={`${revealedIds.has(`web-pkg-${pkg.name}`) ? "visible" : "reveal"} relative rounded-2xl border bg-[var(--bg-card)] p-6 transition hover:-translate-y-1`}
              style={{
                borderColor: pkg.borderColor || "var(--border-subtle)",
                boxShadow: pkg.glowColor ? `0 0 25px ${pkg.glowColor}` : undefined,
              }}
              onMouseEnter={(e) => {
                if (pkg.glowColor) {
                  e.currentTarget.style.boxShadow = `0 0 40px ${pkg.glowColor}, 0 0 80px ${pkg.glowColor}`;
                } else {
                  e.currentTarget.style.boxShadow = "0 0 25px rgba(177,78,181,0.35), 0 0 50px rgba(177,78,181,0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (pkg.glowColor) {
                  e.currentTarget.style.boxShadow = `0 0 25px ${pkg.glowColor}`;
                } else {
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {pkg.badge && (
                <span
                  className="absolute -top-3 right-4 rounded-full px-3 py-1 text-xs font-bold text-[var(--text-primary)]"
                  style={{ backgroundColor: pkg.badgeColor }}
                >
                  {pkg.badge}
                </span>
              )}
              <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">{pkg.name}</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{pkg.tagline}</p>
              <p className="mt-4 text-3xl font-bold text-[var(--text-primary)]">{pkg.price}</p>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">Delivery: {pkg.delivery}</p>

              <ul className="mt-5 space-y-2.5">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="text-[#b14eb5]">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className="mt-6 w-full rounded-lg py-2.5 text-sm font-semibold text-[var(--text-primary)] transition"
                style={{
                  background: pkg.borderColor
                    ? `linear-gradient(135deg, ${pkg.borderColor}, #b8860b)`
                    : "linear-gradient(135deg, #63077d, #b14eb5)",
                }}
              >
                {pkg.button}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Feature Comparison Table ── */}
      <section id="compare" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 -mt-8">
        <SectionLabel label="Compare" title="What's Included" />
        <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)]" ref={compareRef}>
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
                <th className="px-4 py-4 text-left font-semibold text-[var(--text-muted)]">Feature</th>
                <th className="px-4 py-4 text-center font-semibold text-[var(--text-primary)]">Essential</th>
                <th className="px-4 py-4 text-center font-semibold text-[var(--text-primary)]" style={{ backgroundColor: "rgba(177,78,181,0.06)" }}>Premium</th>
                <th className="px-4 py-4 text-center font-semibold text-[var(--text-primary)]">Enterprise</th>
                <th className="px-4 py-4 text-center font-semibold text-[var(--text-primary)]" style={{ borderLeft: "2px solid #FFD700" }}>Custom Build</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((row, i) => (
                <tr
                  key={row.feature}
                  data-reveal-id={`compare-${i}`}
                  className={`${revealedIds.has(`compare-${i}`) ? "visible" : "reveal"} border-b border-[var(--border-subtle)]/50 ${i % 2 === 0 ? "bg-[var(--bg-primary)]" : "bg-[var(--bg-card)]/50"}`}
                >
                  <td className="px-4 py-3 font-medium text-[var(--text-secondary)]">{row.feature}</td>
                  {(["essential", "premium", "enterprise", "custom"] as const).map((key) => {
                    const val = row[key];
                    const isPremium = key === "premium";
                    const isCustom = key === "custom";
                    return (
                      <td
                        key={key}
                        className="px-4 py-3 text-center"
                        style={{
                          backgroundColor: isPremium ? "rgba(177,78,181,0.06)" : undefined,
                          borderLeft: isCustom ? "2px solid rgba(255,215,0,0.2)" : undefined,
                        }}
                      >
                        {typeof val === "boolean" ? (
                          val ? (
                            <span className="text-[#10b981]">&#10003;</span>
                          ) : (
                            <span className="text-[var(--text-tertiary)]">&#10007;</span>
                          )
                        ) : (
                          <span className="text-[var(--text-secondary)]">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 5. Template Gallery ── */}
      <section id="gallery" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <SectionLabel label="Templates" title="Choose Your Starting Point" />
        <p className="mb-8 text-sm text-[var(--text-muted)] -mt-4">Click any template to view a live demo site</p>

        {/* Filter pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          {templateCategories.map((cat) => {
            const isActive = activeTemplate === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveTemplate(cat)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                  isActive
                    ? "pill-active text-white shadow-lg shadow-[#b14eb5]/10"
                    : "pill-inactive border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[#b14eb5]/40 hover:text-[var(--text-secondary)]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Template grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" ref={galleryRef}>
          {filteredTemplates.map((t) => (
            <div
              key={t.name}
              data-reveal-id={`tpl-${t.name}`}
              className={`${revealedIds.has(`tpl-${t.name}`) ? "visible" : "reveal"} group relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] transition hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(177,78,181,0.2)]`}
            >
              {/* Gradient thumbnail */}
              <div className={`relative h-48 bg-gradient-to-br ${t.gradient}`}>
                <span className="absolute top-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-[var(--text-primary)] backdrop-blur-sm">
                  {t.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-heading text-base font-bold text-[var(--text-primary)]">{t.name}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{t.tagline}</p>
                <a
                  href={t.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#b14eb5] transition hover:text-[#c878f0]"
                >
                  View Live Demo <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs italic text-[var(--text-tertiary)]">
          * Demo sites shown are template previews. Your final website will be customised with your brand, content, and colours.
        </p>
      </section>

      {/* ── 5. How It Works ── */}
      <HowItWorks />

      {/* ── 7. Cross-sell Block ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div
          className="rounded-2xl border border-[#b14eb5]/20 bg-[var(--bg-card)] p-8 sm:p-10"
          style={{ borderLeft: "4px solid #b14eb5" }}
        >
          <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
            Want Automation Built Into Your Site?
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            Combine your website with AI agents, automated emails, CRM, and more. Our Premium and Enterprise packages include automation integrations — or add them separately.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#63077d] to-[#b14eb5] px-6 py-3 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-[#b14eb5]/20"
          >
            Explore Automation Solutions <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>

      {/* ── 8. FAQ ── */}
      <section id="faq" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <SectionLabel label="FAQ" title="Frequently Asked Questions" />
        <div className="mx-auto max-w-3xl divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]" ref={faqRef}>
          {faqs.map((faq, i) => (
            <button
              key={i}
              data-reveal-id={`web-faq-${i}`}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className={`${revealedIds.has(`web-faq-${i}`) ? "visible" : "reveal"} w-full text-left px-5 py-4 sm:px-6 sm:py-5 transition`}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">{faq.q}</h3>
                <span className="shrink-0 text-lg text-[#b14eb5]">
                  {openFaq === i ? "\u2212" : "+"}
                </span>
              </div>
              {openFaq === i && (
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{faq.a}</p>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── 9. CTA Section ── */}
      <section className="relative overflow-hidden border-t border-[var(--border-subtle)]/30">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-card)] to-[var(--bg-primary)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] sm:text-4xl">
            Ready to Build Your Website?
          </h2>
          <p className="mt-4 text-base text-[var(--text-muted)] sm:text-lg">
            Let&apos;s create something your customers will remember.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#packages"
              className="rounded-lg border border-[#b14eb5]/30 bg-[#b14eb5]/10 px-6 py-3 text-sm font-semibold text-[#b14eb5] transition hover:bg-[#b14eb5]/20"
            >
              View Packages
            </a>
            <a
              href="#faq"
              className="nav-btn-glow rounded-lg bg-gradient-to-r from-[#63077d] to-[#b14eb5] px-6 py-3 text-sm font-semibold text-white transition"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border-subtle)]/30 bg-[var(--bg-primary)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left" ref={footerRef}>
          <div data-reveal-id="web-footer-brand" className={revealedIds.has("web-footer-brand") ? "visible" : "reveal"}>
            <Link href="/" className="flex items-center gap-2 justify-center sm:justify-start">
              <Image
                src="/myrepublic-logo.png"
                alt="MyRepublic"
                width={1080}
                height={361}
                className="h-7 w-auto sm:h-8"
              />
              <span className="font-heading text-lg font-bold text-[#b14eb5] tracking-tight">Business</span>
            </Link>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Professional websites for Singapore businesses.</p>
          </div>
          <div data-reveal-id="web-footer-copy" className={revealedIds.has("web-footer-copy") ? "visible" : "reveal"}>
            <p className="text-sm text-[var(--text-muted)]">
              &copy; {new Date().getFullYear()} MyRepublic Business. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
