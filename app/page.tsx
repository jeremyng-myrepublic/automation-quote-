"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  solutions,
  categories,
  MANDAY_RATE,
  BUNDLE_DISCOUNT,
  BUNDLE_THRESHOLD,
  type Solution,
  type Category,
} from "../data/solutions";

/* ─── Data ─── */

type Package = {
  name: string;
  tagline: string;
  solutionIds: string[];
  gradient: string;
  iconBg: string;
  glowClass: string;
};

const packages: Package[] = [
  {
    name: "Starter Pack",
    tagline: "Essential automations for small businesses getting started",
    solutionIds: ["email-1", "crm-4", "notif-5"],
    gradient: "from-sky-500 to-blue-600",
    iconBg: "bg-sky-500/10 text-sky-400",
    glowClass: "pkg-glow-blue",
  },
  {
    name: "Growth Pack",
    tagline: "Scale your operations with smart workflows and insights",
    solutionIds: ["ai-4", "email-4", "email-7", "crm-5", "wf-5", "report-6"],
    gradient: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-500/10 text-violet-400",
    glowClass: "pkg-glow-purple",
  },
  {
    name: "Enterprise Pack",
    tagline: "Full-stack automation suite for large organisations",
    solutionIds: [
      "ai-1", "ai-5", "email-3", "crm-1", "crm-8",
      "wf-1", "wf-2", "notif-8", "report-1", "report-4",
    ],
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-500/10 text-amber-400",
    glowClass: "pkg-glow-orange",
  },
];

function getPackagePrice(pkg: Package) {
  const sols = solutions.filter((s) => pkg.solutionIds.includes(s.id));
  const mandays = sols.reduce((sum, s) => sum + s.mandays, 0);
  const subtotal = mandays * MANDAY_RATE;
  const hasDiscount = sols.length >= BUNDLE_THRESHOLD;
  return {
    solutions: sols,
    mandays,
    total: hasDiscount ? Math.round(subtotal * (1 - BUNDLE_DISCOUNT)) : subtotal,
  };
}

const referralOptions = [
  "Google Search",
  "Social Media",
  "Referral / Word of Mouth",
  "LinkedIn",
  "Blog / Article",
  "Conference / Event",
  "Other",
];

/* ─── Scroll reveal hook (per-card, 100ms stagger per row) ─── */
/* Tracks which card IDs have already been revealed so re-renders don't re-hide them */

const revealedIds = new Set<string>();

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const observersRef = useRef<IntersectionObserver[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Clean up previous observers
    observersRef.current.forEach((o) => o.disconnect());
    observersRef.current = [];

    const children = Array.from(el.querySelectorAll("[data-reveal-id]"));

    // Mark already-revealed cards as visible immediately
    children.forEach((child) => {
      const id = (child as HTMLElement).dataset.revealId!;
      if (revealedIds.has(id)) {
        child.classList.remove("reveal");
        child.classList.add("visible");
      }
    });

    // Find cards that still need revealing
    const unrevealed = children.filter(
      (child) => !revealedIds.has((child as HTMLElement).dataset.revealId!)
    );
    if (!unrevealed.length) return;

    // Group into rows by offsetTop
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
              }, idx * 100);
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

/* ─── Navbar scroll detection ─── */

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

/* ─── Price pop on change ─── */

function usePricePop(value: number) {
  const [pop, setPop] = useState(false);
  const prevRef = useRef(value);
  useEffect(() => {
    if (prevRef.current !== value && value > 0) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 300);
      prevRef.current = value;
      return () => clearTimeout(t);
    }
    prevRef.current = value;
  }, [value]);
  return pop;
}

/* ─── Section heading ─── */

function SectionLabel({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-6 sm:mb-8">
      <p className="section-label mb-2 text-xs font-semibold uppercase text-[#0ea5e9]">
        {label}
      </p>
      <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
        {title}
      </h2>
    </div>
  );
}

/* ─── Quote modal (dark) ─── */

function QuoteModal({
  selected,
  totalMandays: totalDays,
  total,
  discounted,
  onClose,
  onSuccess,
}: {
  selected: Solution[];
  totalMandays: number;
  total: number;
  discounted: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name") as string,
      company: formData.get("company") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || undefined,
      referral_source: formData.get("referral_source") as string,
      notes: (formData.get("notes") as string) || undefined,
      selected_solutions: selected.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        mandays: s.mandays,
        price: s.mandays * MANDAY_RATE,
      })),
      total_days: totalDays,
      total_price: total,
    };

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quote");
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-[#1e3a5f] bg-[#0a0f1e] px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#1e3a5f] bg-[#111827] p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
            Request a Quote
          </h2>
          <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-300">
            ✕
          </button>
        </div>

        <div className="mb-6 rounded-lg border border-[#1e3a5f] bg-[#0a0f1e] p-4">
          <p className="mb-1 text-sm font-medium text-gray-400">
            {selected.length} solution{selected.length !== 1 && "s"} selected
          </p>
          <p className="text-2xl font-bold text-white">
            ${total.toLocaleString()}
            {discounted && (
              <span className="ml-2 text-sm font-medium text-emerald-400">
                (10% bundle discount applied)
              </span>
            )}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Full Name *</label>
            <input required name="name" type="text" className={inputCls} placeholder="John Doe" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Company *</label>
            <input required name="company" type="text" className={inputCls} placeholder="Acme Corp" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Email *</label>
            <input required name="email" type="email" className={inputCls} placeholder="john@acme.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Phone</label>
            <input name="phone" type="tel" className={inputCls} placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">How did you hear about us? *</label>
            <select required name="referral_source" defaultValue="" className={inputCls}>
              <option value="" disabled>Select an option</option>
              {referralOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Notes</label>
            <textarea name="notes" rows={3} className={`${inputCls} resize-none`} placeholder="Any specific requirements or questions..." />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-gradient-to-r from-[#185FA5] to-[#0ea5e9] py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-[#0ea5e9]/20 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Quote Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Mobile drawer (dark) ─── */

function MobileDrawer({
  selected,
  totalMandays,
  subtotal,
  total,
  discounted,
  onToggle,
  onRequestQuote,
  onClose,
}: {
  selected: Solution[];
  totalMandays: number;
  subtotal: number;
  total: number;
  discounted: boolean;
  onToggle: (id: string) => void;
  onRequestQuote: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-[#1e3a5f] bg-[#111827] shadow-xl slide-in-from-bottom">
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-600" />
        </div>

        <div className="flex items-center justify-between px-5 pb-3 pt-1">
          <h2 className="font-heading text-lg font-bold text-white">Your Selection</h2>
          <button onClick={onClose} className="text-xl text-gray-500 hover:text-gray-300">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto border-t border-[#1e3a5f]/50 px-5 py-4">
          <div className="space-y-3">
            {selected.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span className="text-lg">{s.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{s.name}</p>
                    <p className="text-xs text-gray-500">
                      {s.mandays} mandays &middot; ${(s.mandays * MANDAY_RATE).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button onClick={() => onToggle(s.id)} className="shrink-0 text-sm text-gray-600 hover:text-red-400">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#1e3a5f]/50 px-5 pb-6 pt-4">
          <div className="mb-1 flex justify-between text-sm text-gray-400">
            <span>Total mandays</span>
            <span>{totalMandays}</span>
          </div>
          {discounted && (
            <>
              <div className="mb-1 flex justify-between text-sm text-gray-500 line-through">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="mb-1 flex justify-between text-sm font-medium text-emerald-400">
                <span>Bundle discount (10%)</span>
                <span>-${(subtotal - total).toLocaleString()}</span>
              </div>
            </>
          )}
          <div className="mt-2 flex justify-between text-lg font-bold text-white">
            <span>Total</span>
            <span>${total.toLocaleString()}</span>
          </div>
          <button
            onClick={() => { onClose(); onRequestQuote(); }}
            className="mt-4 w-full rounded-lg bg-gradient-to-r from-[#185FA5] to-[#0ea5e9] py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-[#0ea5e9]/20"
          >
            Request Quote
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─── */

export default function Home() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  const filtered =
    activeCategory === "All"
      ? solutions
      : solutions.filter((s) => s.category === activeCategory);

  const selected = solutions.filter((s) => selectedIds.has(s.id));
  const totalMandays = selected.reduce((sum, s) => sum + s.mandays, 0);
  const subtotal = totalMandays * MANDAY_RATE;
  const discounted = selected.length >= BUNDLE_THRESHOLD;
  const total = discounted
    ? Math.round(subtotal * (1 - BUNDLE_DISCOUNT))
    : subtotal;

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const packagesRef = useScrollReveal();
  const solutionsRef = useScrollReveal();
  const navScrolled = useNavScroll();
  const pricePop = usePricePop(total);

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* ── Floating navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-30 px-4 pt-4 sm:px-6">
        <div className={`nav-glass mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0a0f1e]/60 px-5 py-3 ${navScrolled ? "scrolled" : ""}`}>
          <span className="font-heading text-lg font-bold text-white tracking-tight">
            Jem <span className="text-[#0ea5e9]">AI Solutions</span>
          </span>
          <a
            href="#solutions"
            className="nav-btn-glow rounded-lg bg-gradient-to-r from-[#185FA5] to-[#0ea5e9] px-5 py-2 text-sm font-semibold text-white transition"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-mesh relative overflow-hidden px-4 pb-16 pt-32 sm:px-6 sm:pb-20 sm:pt-40">
        <span className="hero-blob-3" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="animate-hero font-heading text-3xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            Build Your Custom
            <br />
            Automation Stack
          </h1>
          <div className="animate-hero-delay mx-auto mt-4 w-48 sm:w-64">
            <div className="glow-line" />
          </div>
          <p className="animate-hero-delay-2 mx-auto mt-6 max-w-xl text-base text-gray-400 sm:text-lg">
            Transparent pricing. Expert delivery. Select what you need.
          </p>
          <div className="animate-hero-delay-2 badge-glow mt-4 inline-flex items-center gap-2 rounded-full border border-[#0ea5e9]/20 bg-[#0ea5e9]/5 px-4 py-2 text-xs font-medium text-[#0ea5e9] sm:text-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0ea5e9] animate-pulse" />
            Select 3+ solutions for a 10% bundle discount
          </div>
        </div>
      </section>

      {/* ── Packages ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16" ref={packagesRef}>
        <SectionLabel label="Packages" title="Start with a Bundle" />
        <div className="grid gap-5 md:grid-cols-3">
          {packages.map((pkg) => {
            const { solutions: pkgSolutions, mandays, total: pkgTotal } = getPackagePrice(pkg);
            const isActive = pkg.solutionIds.every((id) => selectedIds.has(id));
            return (
              <div
                key={pkg.name}
                data-reveal-id={`pkg-${pkg.name}`}
                className={`${revealedIds.has(`pkg-${pkg.name}`) ? "visible" : "reveal"} pkg-border overflow-hidden ${pkg.glowClass} ${isActive ? "pkg-active" : ""}`}
              >
                <div className={`pkg-header-shimmer bg-gradient-to-r ${pkg.gradient} px-5 py-3`}>
                  <h3 className="font-heading text-sm font-bold text-white sm:text-base">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-white/70">{pkg.tagline}</p>
                </div>
                <div className="p-5">
                  <ul className="mb-4 space-y-1.5">
                    {pkgSolutions.map((s) => (
                      <li key={s.id} className="flex items-center gap-2 text-xs text-gray-400 sm:text-sm">
                        <span className="text-sm sm:text-base">{s.icon}</span>
                        <span className="text-gray-300">{s.name}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mb-4 flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white sm:text-2xl">
                      ${pkgTotal.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">{mandays} mandays</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        if (isActive) {
                          pkg.solutionIds.forEach((id) => next.delete(id));
                        } else {
                          pkg.solutionIds.forEach((id) => next.add(id));
                        }
                        return next;
                      });
                    }}
                    className={`pkg-btn-glow w-full rounded-lg py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? "border border-[#1e3a5f] bg-transparent text-gray-400 hover:text-white"
                        : "bg-gradient-to-r from-[#185FA5] to-[#0ea5e9] text-white"
                    }`}
                  >
                    {isActive ? "Remove Package" : "Select Package"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Support & Training ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <SectionLabel label="Support" title="We're With You After Launch" />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: "🎓",
              title: "End-User & Admin Training",
              description:
                "Formal training programs for both new users and advanced admins. Includes different learning formats to help your team stay current and keep getting value from your systems over time.",
              price: "From $1,500",
            },
            {
              icon: "🛟",
              title: "Ongoing Customer Support",
              description:
                "Continued support after go-live through flexible Success Plans. Choose from tiered packages that include expertise, guidance, and education — higher tiers include a dedicated Technical Account Manager.",
              price: "From $800/month",
            },
            {
              icon: "🚀",
              title: "Post-Deployment Adoption Help",
              description:
                "Hands-on adoption support beyond technical cutover — improving adoption, refining workflows, adding scope, and stabilising processes after your team starts using the system.",
              price: "From $2,000",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="card-idle group flex flex-col rounded-xl border-2 border-[#1e3a5f] bg-[#111827] p-5 sm:p-6"
            >
              <div className="mb-3 text-3xl">{card.icon}</div>
              <h3 className="font-heading mb-2 text-base font-semibold text-white">
                {card.title}
              </h3>
              <p className="mb-5 flex-1 text-sm leading-relaxed text-gray-500">
                {card.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="price-glow text-sm font-bold">{card.price}</span>
                <button
                  onClick={() => setShowModal(true)}
                  className="rounded-lg border border-[#0ea5e9]/30 px-4 py-2 text-sm font-semibold text-[#0ea5e9] transition hover:bg-[#0ea5e9]/10 hover:border-[#0ea5e9]/60 hover:shadow-[0_0_12px_rgba(14,165,233,0.25)]"
                >
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Solutions ── */}
      <section id="solutions" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex gap-6">
          {/* Left */}
          <div className="min-w-0 flex-1">
            <SectionLabel label="Solutions" title="Choose Your Stack" />

            {/* Category filter pills */}
            <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:-mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
              {(["All", ...categories] as const).map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat as Category | "All")}
                    className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "pill-active text-white shadow-lg shadow-[#0ea5e9]/10"
                        : "pill-inactive border border-[#1e3a5f] text-gray-400 hover:border-[#0ea5e9]/40 hover:text-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Solution cards grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" ref={solutionsRef}>
              {filtered.map((s) => {
                const isSelected = selectedIds.has(s.id);
                return (
                  <button
                    key={s.id}
                    data-reveal-id={s.id}
                    onClick={() => toggle(s.id)}
                    className={`${revealedIds.has(s.id) ? "visible" : "reveal"} group relative rounded-xl border-2 p-5 text-left sm:p-6 min-h-[180px] sm:min-h-[200px] flex flex-col ${
                      isSelected
                        ? "card-active border-[#0ea5e9] bg-[#1a2744]"
                        : "card-idle border-[#1e3a5f] bg-[#111827]"
                    }`}
                  >
                    {isSelected && (
                      <div className="check-pop absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-[#185FA5] to-[#0ea5e9] text-xs font-bold text-white shadow-lg shadow-[#0ea5e9]/30">
                        ✓
                      </div>
                    )}
                    <div className="mb-3 text-2xl sm:text-3xl">{s.icon}</div>
                    <h3 className="font-heading mb-1.5 text-sm font-semibold text-white sm:text-base">
                      {s.name}
                    </h3>
                    <p className="mb-4 flex-1 text-xs leading-relaxed text-gray-500 sm:text-sm">
                      {s.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">
                        {s.mandays} mandays
                      </span>
                      <span className="price-glow text-sm font-bold sm:text-base">
                        ${(s.mandays * MANDAY_RATE).toLocaleString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {selected.length > 0 && <div className="h-20 lg:hidden" />}
          </div>

          {/* ── Cart sidebar (desktop) ── */}
          <div className="hidden w-80 shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border border-[#1e3a5f] bg-[#111827] p-6">
              {quoteSubmitted ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                    <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="font-heading mb-2 text-xl font-bold text-white">
                    Quote Requested!
                  </h2>
                  <p className="mb-6 text-sm text-gray-400">
                    We&apos;ll be in touch within 24 hours with your custom proposal.
                  </p>
                  <button
                    onClick={() => { setQuoteSubmitted(false); setSelectedIds(new Set()); }}
                    className="rounded-lg border border-[#1e3a5f] px-6 py-2.5 text-sm font-semibold text-gray-300 transition hover:border-[#0ea5e9]/40 hover:text-white"
                  >
                    Start New Quote
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-heading mb-4 text-lg font-bold text-white">
                    Your Selection
                  </h2>

                  {selected.length === 0 ? (
                    <div className="py-10 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#1e3a5f]">
                        <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">
                        Click on solutions to add them to your quote.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                        {selected.map((s) => (
                          <div key={s.id} className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <span className="text-lg">{s.icon}</span>
                              <div>
                                <p className="text-sm font-medium text-white">{s.name}</p>
                                <p className="text-xs text-gray-500">{s.mandays} mandays</p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggle(s.id)}
                              className="shrink-0 text-sm text-gray-600 hover:text-red-400"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-[#1e3a5f]/50 pt-4">
                        <div className="mb-1 flex justify-between text-sm text-gray-500">
                          <span>Total mandays</span>
                          <span>{totalMandays}</span>
                        </div>
                        {discounted && (
                          <>
                            <div className="mb-1 flex justify-between text-sm text-gray-600 line-through">
                              <span>Subtotal</span>
                              <span>${subtotal.toLocaleString()}</span>
                            </div>
                            <div className="mb-1 flex justify-between text-sm font-medium text-emerald-400">
                              <span>Bundle discount (10%)</span>
                              <span>-${(subtotal - total).toLocaleString()}</span>
                            </div>
                          </>
                        )}
                        <div className="mt-2 flex justify-between text-lg font-bold text-white">
                          <span>Total</span>
                          <span className={`inline-block ${pricePop ? "price-pop total-glow" : ""}`}>
                            ${total.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowModal(true)}
                        className="btn-cta mt-5 w-full rounded-lg py-3 font-semibold text-white transition"
                      >
                        Request Quote
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1e3a5f]/30 bg-[#0a0f1e]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <span className="font-heading text-lg font-bold text-white tracking-tight">
              Jem <span className="text-[#0ea5e9]">AI Solutions</span>
            </span>
            <p className="mt-1 text-sm text-gray-500">Automation solutions, delivered by experts.</p>
          </div>
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Jem AI Solutions. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ── Mobile fixed bottom bar ── */}
      {selected.length > 0 && !quoteSubmitted && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#1e3a5f] bg-[#111827]/95 p-4 backdrop-blur-lg lg:hidden">
          <div className="mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">
                {selected.length} solution{selected.length !== 1 && "s"} selected
              </p>
              <p className="text-lg font-bold text-white">
                ${total.toLocaleString()}
                {discounted && (
                  <span className="ml-1 text-xs font-medium text-emerald-400">-10%</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowDrawer(true)}
              className="rounded-lg bg-gradient-to-r from-[#185FA5] to-[#0ea5e9] px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-[#0ea5e9]/20"
            >
              View Quote
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile drawer ── */}
      {showDrawer && (
        <MobileDrawer
          selected={selected}
          totalMandays={totalMandays}
          subtotal={subtotal}
          total={total}
          discounted={discounted}
          onToggle={toggle}
          onRequestQuote={() => setShowModal(true)}
          onClose={() => setShowDrawer(false)}
        />
      )}

      {/* ── Quote modal ── */}
      {showModal && (
        <QuoteModal
          selected={selected}
          totalMandays={totalMandays}
          total={total}
          discounted={discounted}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); setQuoteSubmitted(true); }}
        />
      )}
    </div>
  );
}
