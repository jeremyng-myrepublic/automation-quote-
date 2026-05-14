"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Robot, ClipboardText, MagnifyingGlass, ChatCircle, Brain, ShoppingCart,
  Globe, PencilSimpleLine, Envelope, ArrowsClockwise, Mailbox, Target,
  ChartBar, ShoppingBag, Gift, Star, Folders, Broom, LinkSimple, Tray,
  Tag, Lock, Gear, NotePencil, Shuffle, Package, CalendarBlank, FileText,
  Wrench, Buildings, Bell, DeviceMobile, Briefcase, Megaphone,
  GlobeHemisphereWest, PaperPlaneTilt, Handshake, Broadcast, TrendUp,
  Calculator, TrendDown, Flask, CurrencyDollar, Clock, MapTrifold,
  Phone, GraduationCap, Lifebuoy, RocketLaunch, Compass, X, Check, XCircle, CheckCircle,
  Sun, Moon, CaretRight, CaretDown, Plus,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

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

const ICON_MAP: Record<string, Icon> = {
  Robot, ClipboardText, MagnifyingGlass, ChatCircle, Brain, ShoppingCart,
  Globe, PencilSimpleLine, Envelope, ArrowsClockwise, Mailbox, Target,
  ChartBar, ShoppingBag, Gift, Star, Folders, Broom, LinkSimple, Tray,
  Tag, Lock, Gear, NotePencil, Shuffle, Package, CalendarBlank, FileText,
  Wrench, Buildings, Bell, DeviceMobile, Briefcase, Megaphone,
  GlobeHemisphereWest, PaperPlaneTilt, Handshake, Broadcast, TrendUp,
  Calculator, TrendDown, Flask, CurrencyDollar, Clock, MapTrifold,
  Phone, GraduationCap, Lifebuoy, RocketLaunch, Compass,
};

function SolutionIcon({ name, size = 28, className }: { name: string; size?: number; className?: string }) {
  const IconComp = ICON_MAP[name];
  if (!IconComp) return null;
  return <IconComp size={size} weight="regular" className={className} />;
}
import {
  solutions,
  categories,
  BUNDLE_DISCOUNT,
  BUNDLE_THRESHOLD,
  type Solution,
  type Category,
  type SolutionTier,
} from "../data/solutions";

/** Sum priceFrom across solutions; undefined (Bespoke) contributes 0. */
function solutionsSubtotal(sols: Solution[]) {
  return sols.reduce((sum, s) => sum + (s.priceFrom ?? 0), 0);
}

/** Solutions with at least one Bespoke item can't be totalled cleanly. */
function hasBespoke(sols: Solution[]) {
  return sols.some((s) => s.tier === "Bespoke");
}

/** Format an indicative SGD amount like "SGD 12,500". */
function formatSGD(amount: number) {
  return `SGD ${amount.toLocaleString()}`;
}

/** Tier badge classnames — uses existing palette, no new colours. */
function tierBadgeClass(tier: SolutionTier) {
  switch (tier) {
    case "Template":
      return "border border-[#b14eb5]/30 bg-[#b14eb5]/10 text-[#b14eb5]";
    case "Configured":
      return "border border-transparent bg-[#63077d] text-white";
    case "Bespoke":
      return "border border-[#63077d]/50 bg-transparent text-[#63077d]";
  }
}

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
    name: "Pilot",
    tagline: "Prove one solution against one clearly-defined pain point. The lowest-risk way to start.",
    solutionIds: ["discovery-1", "email-1", "crm-4", "notif-5"],
    gradient: "from-sky-500 to-blue-600",
    iconBg: "bg-sky-500/10 text-sky-400",
    glowClass: "pkg-glow-blue",
  },
  {
    name: "Programme",
    tagline: "Solve a cluster of related pain points across a department, coordinated end to end.",
    solutionIds: ["discovery-1", "ai-4", "email-4", "email-7", "crm-5", "wf-5", "report-6"],
    gradient: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-500/10 text-violet-400",
    glowClass: "pkg-glow-purple",
  },
  {
    name: "Partnership",
    tagline: "Ongoing, multi-department AI capability with a standing delivery relationship.",
    solutionIds: [
      "discovery-1",
      "ai-1", "ai-5", "email-3", "crm-1", "wf-1",
    ],
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-500/10 text-amber-400",
    glowClass: "pkg-glow-orange",
  },
];

function getPackagePrice(pkg: Package) {
  const sols = solutions.filter((s) => pkg.solutionIds.includes(s.id));
  const subtotal = solutionsSubtotal(sols);
  const hasDiscount = sols.length >= BUNDLE_THRESHOLD;
  return {
    solutions: sols,
    total: hasDiscount ? Math.round(subtotal * (1 - BUNDLE_DISCOUNT)) : subtotal,
  };
}

/* ─── Engagement Tier Journey ──────────────────────────────────────────
   Three connected stages: Pilot → Programme → Partnership.
   Connecting line draws once on scroll-into-view. Stages settle in
   sequence with a gentle fade + small upward ease. Lists collapsed by
   default; expand/collapse uses grid-template-rows for smooth height.
   Respects prefers-reduced-motion (see globals.css .tier-* rules).
─────────────────────────────────────────────────────────────────────── */
function TierJourney({
  selectedIds,
  setSelectedIds,
}: {
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggleExpand = useCallback((name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  return (
    <div ref={sectionRef} className="tier-journey relative pt-2">
      {/* Horizontal connecting line (desktop) — drawn once L→R */}
      <div aria-hidden className={`tier-track hidden md:block ${inView ? "tier-track-drawn" : ""}`} />

      <div className="relative grid gap-8 md:grid-cols-3 md:gap-6">
        {packages.map((pkg, idx) => {
          const { solutions: pkgSolutions, total: pkgTotal } = getPackagePrice(pkg);
          const isActive = pkg.solutionIds.every((id) => selectedIds.has(id));
          const isExpanded = expanded.has(pkg.name);
          const isLast = idx === packages.length - 1;
          return (
            <div
              key={pkg.name}
              className={`tier-stage relative ${inView ? "tier-stage-in" : ""}`}
              style={{ ["--tier-delay" as string]: `${0.15 + idx * 0.18}s` } as React.CSSProperties}
            >
              <div
                className={`tier-card relative flex h-full flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-7 ${isActive ? "tier-card-active" : ""}`}
              >
                {/* header row: stage label + (optional) "most start here" tag */}
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Stage {idx + 1} — {pkg.name}
                  </p>
                  {idx === 0 && (
                    <span className="rounded-full bg-[#b14eb5]/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#b14eb5] whitespace-nowrap">
                      Most start here
                    </span>
                  )}
                </div>

                {/* tier name */}
                <h3 className="mt-3 font-heading text-2xl font-bold text-[var(--text-primary)]">
                  {pkg.name}
                </h3>

                {/* one-line purpose */}
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {pkg.tagline}
                </p>

                {/* quiet price detail */}
                <p className="mt-5 text-xs text-[var(--text-muted)]">
                  From <span className="font-semibold text-[var(--text-secondary)]">{formatSGD(pkgTotal)}</span>
                  <span className="mx-1.5 text-[var(--text-tertiary)]">·</span>
                  Indicative
                </p>

                {/* flex spacer keeps actions/list at the bottom */}
                <div className="flex-1" />

                {/* select action */}
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
                  className={`tier-btn mt-6 w-full rounded-lg py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "border border-[var(--border-subtle)] bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      : "bg-gradient-to-r from-[#63077d] to-[#b14eb5] text-white"
                  }`}
                >
                  {isActive ? "Remove Tier" : "Select Tier"}
                </button>

                {/* collapsible solution list */}
                <button
                  onClick={() => toggleExpand(pkg.name)}
                  aria-expanded={isExpanded}
                  className="mt-3 flex w-full items-center justify-between px-1 py-1.5 text-xs text-[var(--text-muted)] transition hover:text-[var(--text-secondary)]"
                >
                  <span>Includes {pkgSolutions.length} solutions</span>
                  <CaretDown
                    size={14}
                    weight="regular"
                    className={`tier-chev transition-transform duration-300 ease-out ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                <div className={`tier-list-grid ${isExpanded ? "tier-list-grid-open" : ""}`}>
                  <div className="tier-list-inner">
                    <ul className="mt-2 space-y-1.5">
                      {pkgSolutions.map((s) => (
                        <li key={s.id} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                          <SolutionIcon name={s.icon} size={14} className="text-[#b14eb5] shrink-0" />
                          <span>{s.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* forward cue between stages (desktop) */}
              {!isLast && (
                <div aria-hidden className="tier-cue tier-cue-h hidden md:flex">
                  <CaretRight size={16} weight="bold" />
                </div>
              )}
              {/* forward cue (mobile) */}
              {!isLast && (
                <div aria-hidden className="tier-cue tier-cue-v flex md:hidden">
                  <CaretDown size={16} weight="bold" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
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

function useScrollReveal(staggerMs = 100) {
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
      <p className="section-label mb-2 text-xs font-semibold uppercase text-[#b14eb5]">
        {label}
      </p>
      <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
        {title}
      </h2>
    </div>
  );
}

/* ─── Quote modal (dark) ─── */

/* ─── Solution detail popup ──────────────────────────────────────────
   Opened when a grid card is clicked. Renders the full description,
   plus optional sections (video, what you'll need, good fit if,
   what's included, for example). Add to Quote / Added button calls
   the same toggle the card uses — no forked logic.
─────────────────────────────────────────────────────────────────── */

/** Convert common video URLs (YouTube, Vimeo) to embed-friendly URLs.
 *  Returns null if we don't recognise the format. */
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.startsWith("/embed/")) return url;
    }
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
    if (host === "player.vimeo.com") return url;
    return null;
  } catch {
    return null;
  }
}

function DetailSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {heading}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
        {children}
      </p>
    </div>
  );
}

function SolutionDetailModal({
  solution,
  isSelected,
  onToggle,
  onClose,
}: {
  solution: Solution;
  isSelected: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const embedUrl = solution.videoUrl ? toEmbedUrl(solution.videoUrl) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="solution-detail-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="solution-detail-modal flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl"
      >
        {/* Header — stays put */}
        <div className="flex shrink-0 items-start justify-between gap-4 px-6 pt-6 sm:px-7 sm:pt-7">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center gap-3">
              <SolutionIcon name={solution.icon} size={28} className="text-[#b14eb5]" />
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tierBadgeClass(solution.tier)}`}>
                {solution.tier}
              </span>
            </div>
            <h2 id="solution-detail-title" className="font-heading text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
              {solution.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2 pt-4 sm:px-7">
          {embedUrl && (
            <div className="mb-5 aspect-video w-full overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-black">
              <iframe
                src={embedUrl}
                title={`${solution.name} — video`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}

          <p className="text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            {solution.description}
          </p>

          {solution.whatYouNeed && (
            <DetailSection heading="What you'll need">{solution.whatYouNeed}</DetailSection>
          )}
          {solution.goodFitIf && (
            <DetailSection heading="Good fit if…">{solution.goodFitIf}</DetailSection>
          )}
          {solution.whatsIncluded && (
            <DetailSection heading="What's included">{solution.whatsIncluded}</DetailSection>
          )}
          {solution.example && (
            <DetailSection heading="For example">{solution.example}</DetailSection>
          )}
        </div>

        {/* Footer — sticky to the bottom of the modal */}
        <div className="flex shrink-0 flex-col gap-3 border-t border-[var(--border-subtle)]/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">From</p>
            <p className="font-heading text-lg font-bold text-[var(--text-primary)] sm:text-xl">
              {solution.priceFrom !== undefined ? formatSGD(solution.priceFrom) : "Quote on Discovery"}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={isSelected}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
              isSelected
                ? "border border-[var(--border-subtle)] bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                : "bg-gradient-to-r from-[#63077d] to-[#b14eb5] text-white hover:shadow-lg hover:shadow-[#b14eb5]/20"
            }`}
          >
            {isSelected ? (
              <>
                <Check size={14} weight="bold" />
                <span>Added — Remove</span>
              </>
            ) : (
              <>
                <Plus size={14} weight="bold" />
                <span>Add to Quote</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuoteModal({
  selected,
  total,
  discounted,
  subtotal,
  onClose,
  onSuccess,
}: {
  selected: Solution[];
  total: number;
  discounted: boolean;
  subtotal: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [safView, setSafView] = useState<{ pdfBase64: string; email: string } | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const nameVal = formData.get("name") as string;
    const companyVal = formData.get("company") as string;
    const emailVal = formData.get("email") as string;
    const phoneVal = (formData.get("phone") as string) || "";
    const designationVal = formData.get("designation") as string;
    const uenVal = formData.get("uen") as string;
    const addressVal = formData.get("address") as string;
    const postalCodeVal = formData.get("postalCode") as string;
    const contractLengthVal = formData.get("contractLength") as string;

    const quotePayload = {
      name: nameVal,
      company: companyVal,
      email: emailVal,
      phone: phoneVal || undefined,
      referral_source: formData.get("referral_source") as string,
      notes: (formData.get("notes") as string) || undefined,
      selected_solutions: selected.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        tier: s.tier,
        priceFrom: s.priceFrom ?? 0,
      })),
      total_price: total,
    };

    try {
      // Step 1: Submit quote
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quotePayload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      // Step 2: Generate SAF
      setLoadingMsg("Generating your Service Application Form...");
      const safPayload = {
        name: nameVal,
        company: companyVal,
        email: emailVal,
        phone: phoneVal,
        designation: designationVal,
        uen: uenVal,
        address: addressVal,
        postalCode: postalCodeVal,
        contractLength: contractLengthVal,
        selectedSolutions: selected.map((s) => ({
          name: s.name,
          tier: s.tier,
          priceFrom: s.priceFrom ?? 0,
        })),
        subtotal: subtotal,
        discountAmount: discounted ? Math.round(subtotal * BUNDLE_DISCOUNT) : 0,
        finalPrice: total,
      };

      const safRes = await fetch("/api/generate-saf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safPayload),
      });

      if (!safRes.ok) {
        const safData = await safRes.json();
        throw new Error(safData.error || "Failed to generate SAF");
      }

      const safData = await safRes.json();
      setSafView({ pdfBase64: safData.pdfBase64, email: emailVal });
      setLoadingMsg("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quote");
      setLoadingMsg("");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDownload() {
    if (!safView) return;
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${safView.pdfBase64}`;
    link.download = "MyRepublic-Business-SAF.pdf";
    link.click();
  }

  const inputCls =
    "w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-2.5 text-[var(--text-primary)] placeholder-gray-500 outline-none transition focus:border-[#b14eb5] focus:ring-2 focus:ring-[#b14eb5]/20";

  // ── SAF Ready View ──
  if (safView) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-2xl sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] sm:text-2xl flex items-center gap-2">
                Your SAF is Ready
                <span className="text-emerald-400">&#10003;</span>
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                A copy has been sent to <span className="text-[#b14eb5]">{safView.email}</span>. Review below and download to sign.
              </p>
            </div>
            <button onClick={() => { setSafView(null); onSuccess(); }} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] shrink-0 ml-4">
              <X size={22} />
            </button>
          </div>

          <div className="mb-6 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <iframe
              src={`data:application/pdf;base64,${safView.pdfBase64}`}
              width="100%"
              height="600"
              style={{ border: "none", background: "#fff" }}
              title="Service Application Form Preview"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 rounded-lg bg-gradient-to-r from-[#63077d] to-[#b14eb5] py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-[#b14eb5]/20"
            >
              Download PDF
            </button>
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_NOTIFY_EMAIL || "hello@jemaisolutions.com"}?subject=SAF Change Request&body=Hi, I would like to request changes to my SAF.`}
              className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] py-3 font-semibold text-[var(--text-muted)] text-center transition hover:border-[#b14eb5]/40 hover:text-[var(--text-primary)]"
            >
              Request Changes
            </a>
            <button
              onClick={() => { setSafView(null); onSuccess(); }}
              className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] py-3 font-semibold text-[var(--text-muted)] transition hover:border-[#b14eb5]/40 hover:text-[var(--text-primary)]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
            Request a Quote
          </h2>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
            <X size={22} />
          </button>
        </div>

        <div className="mb-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4">
          <p className="mb-1 text-sm font-medium text-[var(--text-muted)]">
            {selected.length} solution{selected.length !== 1 && "s"} selected
          </p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            From {formatSGD(total)}
            {discounted && (
              <span className="ml-2 text-sm font-medium text-emerald-400">
                (10% bundle discount applied)
              </span>
            )}
          </p>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">Indicative — final scope confirmed in Discovery.</p>
        </div>

        {loadingMsg && (
          <div className="mb-4 rounded-lg border border-[#b14eb5]/30 bg-[#b14eb5]/10 p-4 text-center">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#b14eb5] border-t-transparent mr-2 align-middle" />
            <span className="text-sm text-[#b14eb5]">{loadingMsg}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Full Name *</label>
            <input required name="name" type="text" className={inputCls} placeholder="Jeremy Ng" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Company *</label>
            <input required name="company" type="text" className={inputCls} placeholder="Acme Corp" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Email *</label>
            <input required name="email" type="email" className={inputCls} placeholder="john@acme.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Phone *</label>
            <input required name="phone" type="tel" className={inputCls} placeholder="+65 9123 4567" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Designation / Job Title *</label>
            <input required name="designation" type="text" className={inputCls} placeholder="Managing Director" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">UEN (Unique Entity Number) *</label>
            <input required name="uen" type="text" className={inputCls} placeholder="201912345A" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Registered Address *</label>
            <input required name="address" type="text" className={inputCls} placeholder="123 Business Park Drive #01-01" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Postal Code *</label>
            <input required name="postalCode" type="text" className={inputCls} placeholder="123456" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">Contract Length *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="contractLength" value="24" required className="accent-[#b14eb5]" defaultChecked />
                <span className="text-sm text-[var(--text-primary)]">24 Months</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="contractLength" value="36" className="accent-[#b14eb5]" />
                <span className="text-sm text-[var(--text-primary)]">36 Months</span>
              </label>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">How did you hear about us? *</label>
            <select required name="referral_source" defaultValue="" className={inputCls}>
              <option value="" disabled>Select an option</option>
              {referralOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Notes</label>
            <textarea name="notes" rows={3} className={`${inputCls} resize-none`} placeholder="Any specific requirements or questions..." />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-gradient-to-r from-[#63077d] to-[#b14eb5] py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-[#b14eb5]/20 disabled:opacity-60"
          >
            {submitting ? (loadingMsg || "Submitting...") : "Submit Quote & Generate SAF"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Mobile drawer (dark) ─── */

function MobileDrawer({
  selected,
  subtotal,
  total,
  discounted,
  onToggle,
  onRequestQuote,
  onClose,
}: {
  selected: Solution[];
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
      <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xl slide-in-from-bottom">
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-600" />
        </div>

        <div className="flex items-center justify-between px-5 pb-3 pt-1">
          <h2 className="font-heading text-lg font-bold text-[var(--text-primary)]">Your Selection</h2>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto border-t border-[var(--border-subtle)]/50 px-5 py-4">
          <div className="space-y-3">
            {selected.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <SolutionIcon name={s.icon} size={18} className="text-[#b14eb5] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{s.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      <span className={`mr-1 inline-flex rounded px-1.5 py-px text-[10px] font-medium uppercase tracking-wider ${tierBadgeClass(s.tier)}`}>{s.tier}</span>
                      From {formatSGD(s.priceFrom ?? 0)}
                    </p>
                  </div>
                </div>
                <button onClick={() => onToggle(s.id)} className="shrink-0 text-[var(--text-tertiary)] hover:text-red-400">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--border-subtle)]/50 px-5 pb-6 pt-4">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Indicative totals</p>
          {discounted && (
            <>
              <div className="mb-1 flex justify-between text-sm text-[var(--text-tertiary)] line-through">
                <span>Subtotal</span>
                <span>{formatSGD(subtotal)}</span>
              </div>
              <div className="mb-1 flex justify-between text-sm font-medium text-emerald-400">
                <span>Bundle discount (10%)</span>
                <span>-{formatSGD(subtotal - total)}</span>
              </div>
            </>
          )}
          <div className="mt-2 flex justify-between text-lg font-bold text-[var(--text-primary)]">
            <span>From</span>
            <span>{formatSGD(total)}</span>
          </div>
          <button
            onClick={() => { onClose(); onRequestQuote(); }}
            className="mt-4 w-full rounded-lg bg-gradient-to-r from-[#63077d] to-[#b14eb5] py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-[#b14eb5]/20"
          >
            Request Quote
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Pain Points & Solution ─── */

const painPoints = [
  "Manually replying to customer enquiries",
  "Leads lost due to missed follow-ups",
  "Hours wasted on data entry",
  "No real-time pipeline visibility",
  "Slow, manual staff onboarding",
  "Chasing invoices and payments by hand",
];

const solutionPoints = [
  "AI handles 80% of queries, 24/7",
  "Instant automated lead follow-ups",
  "Zero manual data entry",
  "Live KPI dashboard, always updated",
  "Staff onboarded automatically from day one",
  "Invoices sent and chased automatically",
];

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

function PainPointsSection() {
  const columnsRef = useScrollReveal();
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsTriggered, setStatsTriggered] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stat1 = useCountUp(10, "+", statsTriggered);
  const stat2 = useCountUp(3, "x", statsTriggered);
  const stat3 = useCountUp(70, "%", statsTriggered);
  const stat4 = useCountUp(80, "%", statsTriggered);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
      <SectionLabel label="Sound Familiar?" title="Still Doing This Manually?" />

      <div className="grid gap-6 md:grid-cols-2" ref={columnsRef}>
        {/* Left: Pain points */}
        <div
          data-reveal-id="pain-col"
          className={`${revealedIds.has("pain-col") ? "visible" : "reveal"} rounded-xl`}
          style={{ backgroundColor: "var(--bg-card)", border: "2px solid var(--border-subtle)", borderLeft: "4px solid #ef4444", padding: "40px", minHeight: "420px" }}
        >
          <h3 className="font-heading font-bold mb-6 text-[var(--text-primary)]" style={{ fontSize: "22px" }}>
            Without Automation
          </h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {painPoints.map((point, i) => (
              <li key={i} className="flex items-center gap-3 leading-relaxed text-[var(--text-secondary)]" style={{ fontSize: "18px" }}>
                <XCircle size={24} weight="fill" className="shrink-0" style={{ color: "#ef4444" }} />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Solutions */}
        <div
          data-reveal-id="solution-col"
          className={`${revealedIds.has("solution-col") ? "visible" : "reveal"} rounded-xl`}
          style={{ backgroundColor: "var(--bg-card)", border: "2px solid var(--border-subtle)", borderLeft: "4px solid #10b981", padding: "40px", minHeight: "420px" }}
        >
          <h3 className="font-heading font-bold mb-6 text-[var(--text-primary)]" style={{ fontSize: "22px" }}>
            With MyRepublic Business
          </h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {solutionPoints.map((point, i) => (
              <li key={i} className="flex items-center gap-3 leading-relaxed text-[var(--text-secondary)]" style={{ fontSize: "18px" }}>
                <CheckCircle size={24} weight="fill" className="shrink-0" style={{ color: "#10b981" }} />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stat bar */}
      <div
        ref={statsRef}
        className="mt-8 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[var(--border-subtle)]">
          {[
            { value: stat1, label: "Hours saved per week" },
            { value: stat2, label: "Faster lead response" },
            { value: stat3, label: "Lead-to-conversion increase" },
            { value: stat4, label: "Repetitive tasks eliminated" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center py-6 sm:py-8">
              <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">{stat.value}</span>
              <span className="mt-1 text-xs sm:text-sm text-[var(--text-muted)]">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works timeline ─── */

const howItWorksSteps = [
  { num: "01", title: "Select & Quote", icon: "ShoppingCart", desc: "Browse solutions, build your stack, and submit a quote. No commitment needed.", badge: "Day 1" },
  { num: "02", title: "Discovery & Design", icon: "Compass", desc: "A paid discovery phase: we confirm scope, review your systems, and produce a solution design with a fixed-price quote. Creditable against your build.", badge: "Week 1" },
  { num: "03", title: "We Build", icon: "Gear", desc: "Our team builds your automation with progress updates throughout.", badge: "Week 1–3" },
  { num: "04", title: "Handover & Training", icon: "GraduationCap", desc: "We deliver, train your team live, and hand over full documentation.", badge: "Week 3" },
];

/* ─── Problem-led entry (Layer 2 of Solutions section) ─── */
type BusinessProblem = {
  id: string;
  label: string;
  solutionIds: string[];
};

const BUSINESS_PROBLEMS: BusinessProblem[] = [
  {
    id: "queries",
    label: "We're drowning in customer queries",
    solutionIds: ["ai-1", "ai-5", "ai-4", "notif-6"],
  },
  {
    id: "leads",
    label: "Leads go cold before we follow up",
    solutionIds: ["ai-3", "email-1", "email-2", "email-4", "crm-3", "crm-4"],
  },
  {
    id: "manual-data",
    label: "Too much manual data entry",
    solutionIds: ["crm-1", "crm-2", "crm-4", "crm-5", "crm-6", "wf-6"],
  },
  {
    id: "pipeline-visibility",
    label: "I can't see what's happening in our pipeline",
    solutionIds: ["crm-7", "ai-3", "report-2", "report-3", "notif-4"],
  },
  {
    id: "repetitive-tasks",
    label: "Repetitive tasks eating the team's time",
    solutionIds: ["wf-1", "wf-3", "wf-5", "wf-6", "wf-8", "ai-8", "email-7"],
  },
  {
    id: "slow-reporting",
    label: "Slow, manual reporting",
    solutionIds: ["report-2", "report-3", "report-6", "ai-8"],
  },
];

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

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16" ref={sectionRef}>
      <SectionLabel label="Process" title="From Quote to Go-Live in 4 Steps" />

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-4">
        {howItWorksSteps.map((step, i) => {
          const isLast = i === howItWorksSteps.length - 1;
          return (
            <div
              key={step.num}
              className={`step-card relative ${triggered ? "step-card-in" : ""}`}
              style={{ ["--step-delay" as string]: `${0.15 + i * 0.12}s` } as React.CSSProperties}
            >
              <div className="step-card-inner flex h-full flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-7">
                {/* step number */}
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Step {step.num}
                </p>

                {/* icon */}
                <div className="mt-3">
                  <SolutionIcon name={step.icon} size={32} className="text-[#b14eb5]" />
                </div>

                {/* title */}
                <h3 className="mt-3 font-heading text-lg font-bold text-[var(--text-primary)]">
                  {step.title}
                </h3>

                {/* description */}
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {step.desc}
                </p>

                <div className="flex-1" />

                {/* timeline badge */}
                <span className="mt-5 inline-flex w-fit rounded-full border border-[#b14eb5]/20 bg-[#b14eb5]/10 px-3 py-0.5 text-xs font-medium text-[#b14eb5]">
                  {step.badge}
                </span>
              </div>

              {/* forward cue between cards (desktop) */}
              {!isLast && (
                <div aria-hidden className="step-cue step-cue-h hidden md:flex">
                  <CaretRight size={14} weight="bold" />
                </div>
              )}
              {/* forward cue (mobile) */}
              {!isLast && (
                <div aria-hidden className="step-cue step-cue-v flex md:hidden">
                  <CaretDown size={14} weight="bold" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Testimonial carousel ─── */

const testimonials = [
  { quote: "Jeremy and the team built us an automated lead follow-up system in under a week. We went from missing leads to closing 30% more deals.", name: "Marcus Tan", title: "Director, Pinnacle Advisory Group" },
  { quote: "The AI customer support agent handles 80% of our inbound queries automatically. Our team finally has time to focus on real work.", name: "Sarah Lim", title: "Operations Manager, BrightSpace Interior Design" },
  { quote: "We were skeptical about automation but the onboarding was smooth and the results were immediate. Highly recommend.", name: "David Ng", title: "Founder, SwiftFreight Logistics" },
  { quote: "Our invoice processing used to take half a day. Now it's fully automated and done in minutes. The ROI was immediate.", name: "Priya Mehta", title: "CFO, Horizon Trading Pte Ltd" },
  { quote: "The CRM they built for us is exactly what we needed — simple, fast, and our whole sales team actually uses it.", name: "Jason Wong", title: "Sales Director, Apex Property Group" },
  { quote: "We now have an AI agent answering customer WhatsApp messages 24/7. Response times went from hours to seconds.", name: "Michelle Ong", title: "Head of Operations, FreshBox Delivery" },
  { quote: "They automated our entire onboarding process. New clients go from sign-up to fully set up without any manual work from our team.", name: "Raymond Koh", title: "CEO, Velocity Consulting" },
  { quote: "The email nurture sequence they built converts at 3x our old manual process. We didn't expect results this fast.", name: "Cheryl Tan", title: "Marketing Manager, GreenLeaf Wellness" },
  { quote: "Our operations team used to spend 2 hours daily on data entry. That's completely gone now. Best investment we made this year.", name: "Bernard Lim", title: "COO, PrimePack Industries" },
  { quote: "The AI knowledge base agent answers staff HR questions instantly. Our HR team went from firefighting to actual strategic work.", name: "Angela Yeo", title: "HR Director, Nexus Capital Group" },
  { quote: "We had zero technical knowledge going in. The team made everything simple and trained our staff thoroughly. Couldn't ask for more.", name: "Tommy Goh", title: "Owner, Tommy's Kitchen Group" },
  { quote: "The automated reporting dashboard saves our management team 3 hours every Monday morning. Data is just there when we need it.", name: "Stephanie Chan", title: "Business Analyst, BlueStar Logistics" },
  { quote: "The WhatsApp appointment reminder system reduced our no-show rate by 40%. Simple idea, massive impact on revenue.", name: "Dr. Kevin Loh", title: "Clinic Director, Loh Medical Centre" },
  { quote: "We were losing deals because follow-ups fell through the cracks. The automated pipeline fixed that completely within the first week.", name: "Darren Chia", title: "Business Development Manager, Titan Solutions" },
  { quote: "The social media automation alone saved us 10 hours a week. Our content is consistent now and engagement has never been better.", name: "Felicia Ng", title: "Brand Manager, Lumière Aesthetics" },
];

function TestimonialCarousel() {
  const doubled = [...testimonials, ...testimonials];
  const trackRef = useRef<HTMLDivElement>(null);
  const headingRef = useScrollReveal();

  const pause = () => {
    if (trackRef.current) trackRef.current.style.animationPlayState = "paused";
  };
  const resume = () => {
    if (trackRef.current) trackRef.current.style.animationPlayState = "running";
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div ref={headingRef}>
        <div data-reveal-id="testimonial-heading" className={revealedIds.has("testimonial-heading") ? "visible" : "reveal"}>
          <SectionLabel label="Testimonials" title="What Our Clients Say" />
        </div>
      </div>
      <div
        onMouseEnter={pause}
        onMouseLeave={resume}
        style={{
          overflow: "hidden",
          width: "100%",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div
          ref={trackRef}
          id="marquee-track"
          style={{
            display: "flex",
            flexWrap: "nowrap",
            width: "max-content",
            animation: "marquee 120s linear infinite",
            willChange: "transform",
          }}
        >
          {doubled.map((t, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: "360px",
                marginRight: "24px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: "12px",
                  backgroundColor: "var(--bg-card)",
                  border: "2px solid var(--border-subtle)",
                  borderLeft: "4px solid #b14eb5",
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ marginBottom: "12px", color: "#fbbf24", fontSize: "14px", letterSpacing: "0.05em" }}>★★★★★</div>
                <p style={{ marginBottom: "16px", flex: 1, fontSize: "14px", fontStyle: "italic", lineHeight: 1.7, color: "var(--text-primary)" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>{t.name}</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{t.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Main page ─── */

export default function Home() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [problemFilter, setProblemFilter] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [supportModal, setSupportModal] = useState<number | null>(null);
  const [detailSolutionId, setDetailSolutionId] = useState<string | null>(null);

  /* Discovery is its own block above the grid — exclude from the browse list. */
  const discoverySolution = solutions.find((s) => s.id === "discovery-1");
  const browsableSolutions = solutions.filter((s) => s.id !== "discovery-1");

  /* Problem filter (if active) takes priority over category. */
  const activeProblem = problemFilter
    ? BUSINESS_PROBLEMS.find((p) => p.id === problemFilter) ?? null
    : null;

  const filtered = activeProblem
    ? browsableSolutions.filter((s) => activeProblem.solutionIds.includes(s.id))
    : activeCategory === "All"
      ? browsableSolutions
      : browsableSolutions.filter((s) => s.category === activeCategory);

  const onCategorySelect = useCallback((cat: Category | "All") => {
    setActiveCategory(cat);
    setProblemFilter(null);
  }, []);

  const onProblemSelect = useCallback((id: string) => {
    setProblemFilter((cur) => (cur === id ? null : id));
    setActiveCategory("All");
    requestAnimationFrame(() => {
      document.getElementById("solutions-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const selected = solutions.filter((s) => selectedIds.has(s.id));
  const subtotal = solutionsSubtotal(selected);
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
  const supportRef = useScrollReveal();
  const solutionsRef = useScrollReveal();
  const faqRef = useScrollReveal(80);
  const footerRef = useScrollReveal();
  const navScrolled = useNavScroll();
  const pricePop = usePricePop(total);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* ── Floating navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-30 px-4 pt-4 sm:px-6">
        <div className={`nav-glass mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/[0.06] bg-[var(--bg-primary)]/60 px-5 py-3 ${navScrolled ? "scrolled" : ""}`}>
          <span className="flex items-center gap-2">
            <Image
              src="/myrepublic-logo.png"
              alt="MyRepublic"
              width={1080}
              height={361}
              priority
              className="h-7 w-auto sm:h-8"
            />
            <span className="font-heading text-lg font-bold text-[#b14eb5] tracking-tight">Business</span>
          </span>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-6 md:flex">
            {[
              { label: "Tiers", href: "#packages" },
              { label: "Support", href: "#support" },
              { label: "Solutions", href: "#solutions" },
              { label: "FAQ", href: "#faq" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[var(--text-primary)] transition hover:text-[#b14eb5] hover:underline hover:underline-offset-4"
              >
                {link.label}
              </a>
            ))}
            {/* Web Services link hidden for now
            <a
              href="/web-services"
              className="text-sm font-medium text-[var(--text-primary)] transition hover:text-[#b14eb5] hover:underline hover:underline-offset-4"
            >
              Web Services
            </a>
            */}
            <ThemeToggle />
            <a
              href="#solutions"
              className="nav-btn-glow rounded-lg bg-gradient-to-r from-[#63077d] to-[#b14eb5] px-5 py-2 text-sm font-semibold text-white transition"
            >
              Get Started
            </a>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <a
              href="#solutions"
              className="nav-btn-glow rounded-lg bg-gradient-to-r from-[#63077d] to-[#b14eb5] px-4 py-2 text-sm font-semibold text-white transition"
            >
              Get Started
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
              { label: "Tiers", href: "#packages" },
              { label: "Support", href: "#support" },
              { label: "Solutions", href: "#solutions" },
              { label: "FAQ", href: "#faq" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileNav(false)}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--border-subtle)]/30 hover:text-[#b14eb5]"
              >
                {link.label}
              </a>
            ))}
            {/* Web Services link hidden for now
            <a
              href="/web-services"
              onClick={() => setMobileNav(false)}
              className="block rounded-lg px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--border-subtle)]/30 hover:text-[#b14eb5]"
            >
              Web Services
            </a>
            */}
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="hero-mesh relative overflow-hidden px-4 pb-16 pt-32 sm:px-6 sm:pb-20 sm:pt-40">
        <span className="hero-blob-3" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="animate-hero font-heading text-3xl font-extrabold leading-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
            Build Your Custom
            <br />
            Automation Stack
          </h1>
          <div className="animate-hero-delay mx-auto mt-4 w-48 sm:w-64">
            <div className="glow-line" />
          </div>
          <p className="animate-hero-delay-2 mx-auto mt-6 max-w-xl text-base text-[var(--text-muted)] sm:text-lg">
            Transparent pricing. Expert delivery. Select what you need.
          </p>
          <div className="animate-hero-delay-2 mt-8 flex justify-center">
            <div className="bundle-callout group relative flex items-center gap-4 rounded-2xl border border-[#b14eb5]/30 bg-gradient-to-r from-[#b14eb5]/[0.06] via-[#b14eb5]/[0.12] to-[#b14eb5]/[0.06] px-5 py-3.5 backdrop-blur-sm sm:gap-5 sm:px-7 sm:py-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#63077d] to-[#b14eb5] text-white shadow-lg shadow-[#b14eb5]/30 sm:h-14 sm:w-14">
                <Tag size={22} weight="fill" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-2xl font-extrabold text-[#b14eb5] sm:text-3xl">10% OFF</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] sm:text-sm">Bundle</span>
                </div>
                <span className="text-xs text-[var(--text-secondary)] sm:text-sm">Auto-applied when you select 3+ solutions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pain Points ── */}
      <PainPointsSection />

      {/* ── How It Works ── */}
      <HowItWorks />

      {/* ── Engagement Tiers — connected journey ── */}
      <section id="packages" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16" ref={packagesRef}>
        <SectionLabel label="Engagement Tiers" title="Choose Your Tier" />
        <TierJourney selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
      </section>

      {/* ── Support & Training ── */}
      {(() => {
        const supportCards = [
          {
            icon: "GraduationCap",
            title: "End-User & Admin Training",
            description:
              "Formal training programs for both new users and advanced admins. Includes different learning formats to help your team stay current and keep getting value from your systems over time.",
            price: "From $1,500",
            items: [
              "Half-day or full-day training sessions (on-site or remote)",
              "Separate tracks for end users and system administrators",
              "Hands-on walkthroughs of your specific automation setup",
              "Training materials and recorded session provided",
              "Follow-up Q&A session included",
            ],
            bestFor: "Teams of 5–50 people going live on a new system",
            timeline: "Typically scheduled within 1 week of project completion",
          },
          {
            icon: "Lifebuoy",
            title: "Ongoing Customer Support",
            description:
              "Continued support after go-live through flexible Success Plans. Choose from tiered packages that include expertise, guidance, and education — higher tiers include a dedicated Technical Account Manager.",
            price: "From $800/month",
            items: [
              "Dedicated support via WhatsApp or email (response within 4 hours)",
              "Monthly system health check and optimisation review",
              "Bug fixes and minor adjustments included",
              "Access to our knowledge base and video library",
              "Higher tiers include a named Technical Account Manager",
            ],
            planOptions: "Basic ($800/month), Standard ($1,500/month), Premium ($2,500/month)",
            commitment: "3 months",
          },
          {
            icon: "RocketLaunch",
            title: "Post-Deployment Adoption Help",
            description:
              "Hands-on adoption support beyond technical cutover — improving adoption, refining workflows, adding scope, and stabilising processes after your team starts using the system.",
            price: "From $2,000",
            items: [
              "4-week hands-on adoption programme after go-live",
              "Weekly check-in calls with your team",
              "Usage analytics review to identify adoption gaps",
              "Process refinement based on real-world usage feedback",
              "Additional staff training if needed",
              "Scope expansion support (adding new automations to existing setup)",
            ],
            bestFor: "Companies who want to maximise ROI after launch",
            timeline: "Starts 1–2 weeks after project go-live",
          },
        ];
        const activeCard = supportModal !== null ? supportCards[supportModal] : null;

        return (
          <>
            <section id="support" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
              <SectionLabel label="Support" title="We're With You After Launch" />
              <div className="grid gap-5 md:grid-cols-3" ref={supportRef}>
                {supportCards.map((card, i) => (
                  <div
                    key={card.title}
                    data-reveal-id={`support-${i}`}
                    className={`${revealedIds.has(`support-${i}`) ? "visible" : "reveal"} card-idle group flex flex-col rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 sm:p-6`}
                  >
                    <div className="mb-3"><SolutionIcon name={card.icon} size={32} className="text-[#b14eb5]" /></div>
                    <h3 className="font-heading mb-2 text-base font-semibold text-[var(--text-primary)]">
                      {card.title}
                    </h3>
                    <p className="mb-5 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {card.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="price-glow text-sm font-bold">{card.price}</span>
                      <button
                        onClick={() => setSupportModal(i)}
                        className="rounded-lg border border-[#b14eb5]/30 px-4 py-2 text-sm font-semibold text-[#b14eb5] transition hover:bg-[#b14eb5]/10 hover:border-[#b14eb5]/60 hover:shadow-[0_0_12px_rgba(177,78,181,0.25)]"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Support detail modal */}
            {activeCard && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", animation: "fade-in 0.2s ease-out" }}
                onClick={() => setSupportModal(null)}
              >
                <style>{`@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
                <div
                  className="relative w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-2xl sm:p-8"
                  style={{ animation: "fade-in 0.2s ease-out" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSupportModal(null)}
                    className="absolute right-4 top-4 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition"
                  >
                    <X size={22} />
                  </button>

                  <div className="mb-4"><SolutionIcon name={activeCard.icon} size={40} className="text-[#b14eb5]" /></div>
                  <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] sm:text-2xl mb-1">
                    {activeCard.title}
                  </h2>
                  <p className="text-lg font-bold text-[#b14eb5] mb-6">{activeCard.price}</p>

                  <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">What&apos;s Included</h3>
                  <ul className="mb-6 space-y-2">
                    {activeCard.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <Check size={14} weight="bold" className="mt-0.5 text-[#b14eb5] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4">
                    {"bestFor" in activeCard && (
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Best for</span>
                        <p className="text-sm text-[var(--text-secondary)]">{activeCard.bestFor}</p>
                      </div>
                    )}
                    {"planOptions" in activeCard && (
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Plan options</span>
                        <p className="text-sm text-[var(--text-secondary)]">{activeCard.planOptions}</p>
                      </div>
                    )}
                    {"commitment" in activeCard && (
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Minimum commitment</span>
                        <p className="text-sm text-[var(--text-secondary)]">{activeCard.commitment}</p>
                      </div>
                    )}
                    {"timeline" in activeCard && (
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Timeline</span>
                        <p className="text-sm text-[var(--text-secondary)]">{activeCard.timeline}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* ── Testimonials ── (hidden for now) */}
      {/* <TestimonialCarousel /> */}

      {/* ── Solutions ── */}
      <section id="solutions" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex gap-6">
          {/* Left */}
          <div className="min-w-0 flex-1">
            <SectionLabel label="Solutions" title="Choose Your Stack" />

            {/* ─── LAYER 1 — Discovery hero (front door) ─── */}
            {discoverySolution && (() => {
              const isDiscoverySelected = selectedIds.has(discoverySolution.id);
              return (
                <div className="discovery-hero mb-10 rounded-2xl border-2 border-[#63077d]/45 bg-[var(--bg-card)] p-5 sm:p-7">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-7">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#63077d] text-white sm:h-16 sm:w-16">
                      <SolutionIcon name={discoverySolution.icon} size={30} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b14eb5]">
                        Not sure where to start? Begin here
                      </p>
                      <h3 className="mt-2 font-heading text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                        {discoverySolution.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
                        {discoverySolution.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-row items-center justify-between gap-4 md:flex-col md:items-end md:justify-center md:text-right">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">From</p>
                        <p className="font-heading text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                          {formatSGD(discoverySolution.priceFrom ?? 0)}
                        </p>
                      </div>
                      <button
                        onClick={() => toggle(discoverySolution.id)}
                        className={`whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                          isDiscoverySelected
                            ? "border border-[var(--border-subtle)] bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            : "bg-[#63077d] text-white hover:bg-[#4d0561]"
                        }`}
                      >
                        {isDiscoverySelected ? "Remove" : "Add to Quote"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ─── LAYER 2 — Problem-led entry ─── */}
            <div className="mb-12">
              <h3 className="font-heading text-base font-bold text-[var(--text-primary)] sm:text-lg">
                What&rsquo;s slowing your business down?
              </h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Tap whatever sounds familiar — we&rsquo;ll narrow the list below to fit.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {BUSINESS_PROBLEMS.map((p) => {
                  const isActive = problemFilter === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onProblemSelect(p.id)}
                      aria-pressed={isActive}
                      className={`problem-card rounded-xl border p-4 text-left text-sm transition ${
                        isActive
                          ? "border-[#b14eb5] bg-[var(--bg-card-active)] text-[var(--text-primary)]"
                          : "border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)]"
                      }`}
                    >
                      <span className="block font-medium leading-snug">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── LAYER 3 — Browse fallback (heading, explainer, pills, grid) ─── */}
            <div id="solutions-grid" className="scroll-mt-24">
              <h3 className="font-heading text-base font-bold text-[var(--text-primary)] sm:text-lg">
                Or browse all solutions
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
                <span className="font-semibold text-[var(--text-secondary)]">Template</span> — fixed scope, fixed price.{" "}
                <span className="font-semibold text-[var(--text-secondary)]">Configured</span> — tailored to your setup; the &lsquo;from&rsquo; price is confirmed at Discovery.
              </p>

              {activeProblem && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#b14eb5]/40 bg-[#b14eb5]/10 px-4 py-2.5">
                  <span className="text-sm text-[var(--text-secondary)]">
                    Showing solutions for: <strong className="text-[var(--text-primary)]">{activeProblem.label}</strong>
                  </span>
                  <button
                    onClick={() => setProblemFilter(null)}
                    className="text-xs font-semibold uppercase tracking-wider text-[#b14eb5] transition hover:text-[#c878f0]"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Category filter pills (Start Here excluded — Discovery is its own block above) */}
              <style>{`
                @media (max-width: 767px) {
                  .cat-pills { display: grid !important; grid-template-columns: 1fr 1fr; gap: 8px; }
                  .cat-pills > button { padding: 12px 16px !important; border: 1px solid #63077d !important; width: 100%; }
                  .cat-pill-inactive { background: #1e293b !important; color: #ffffff !important; }
                }
              `}</style>
              <div className="cat-pills mt-5 mb-8 flex flex-wrap gap-2">
                {(["All", ...categories.filter((c) => c !== "Start Here")] as const).map((cat) => {
                  const isActive = activeCategory === cat && !activeProblem;
                  return (
                    <button
                      key={cat}
                      onClick={() => onCategorySelect(cat as Category | "All")}
                      className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "pill-active text-white shadow-lg shadow-[#b14eb5]/10"
                          : `cat-pill-inactive pill-inactive border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[#b14eb5]/40 hover:text-[var(--text-secondary)]`
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Solution cards grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" ref={solutionsRef}>
              {filtered.map((s) => {
                const isSelected = selectedIds.has(s.id);
                return (
                  <div
                    key={s.id}
                    data-reveal-id={s.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setDetailSolutionId(s.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setDetailSolutionId(s.id);
                      }
                    }}
                    aria-label={`View details for ${s.name}`}
                    className={`${revealedIds.has(s.id) ? "visible" : "reveal"} group relative cursor-pointer rounded-xl border-2 p-5 text-left sm:p-6 min-h-[180px] flex flex-col ${
                      isSelected
                        ? "card-active border-[#b14eb5] bg-[var(--bg-card-active)]"
                        : "card-idle border-[var(--border-subtle)] bg-[var(--bg-card)]"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <SolutionIcon name={s.icon} size={32} className="text-[#b14eb5]" />
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tierBadgeClass(s.tier)}`}>
                        {s.tier}
                      </span>
                    </div>
                    <h3 className="font-heading mb-1.5 text-sm font-semibold text-[var(--text-primary)] sm:text-base">
                      {s.name}
                    </h3>
                    <p className="mb-4 flex-1 text-xs leading-snug text-[var(--text-secondary)] sm:text-sm">
                      {s.hook}
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-[var(--text-muted)]">
                        From <span className="price-glow font-bold text-[var(--text-primary)]">
                          {s.priceFrom !== undefined ? formatSGD(s.priceFrom) : "Quote on Discovery"}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggle(s.id); }}
                        aria-pressed={isSelected}
                        aria-label={isSelected ? `Remove ${s.name} from quote` : `Add ${s.name} to quote`}
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                          isSelected
                            ? "bg-[#63077d] text-white hover:bg-[#4d0561]"
                            : "border border-[#b14eb5]/40 text-[#b14eb5] hover:border-[#b14eb5] hover:bg-[#b14eb5]/10"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check size={12} weight="bold" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus size={12} weight="bold" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {selected.length > 0 && <div className="h-20 lg:hidden" />}
          </div>

          {/* ── Cart sidebar (desktop) ── */}
          <div className="hidden w-80 shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
              {quoteSubmitted ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                    <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="font-heading mb-2 text-xl font-bold text-[var(--text-primary)]">
                    Quote Requested!
                  </h2>
                  <p className="mb-6 text-sm text-[var(--text-muted)]">
                    We&apos;ll be in touch within 24 hours with your custom proposal.
                  </p>
                  <button
                    onClick={() => { setQuoteSubmitted(false); setSelectedIds(new Set()); }}
                    className="rounded-lg border border-[var(--border-subtle)] px-6 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-[#b14eb5]/40 hover:text-[var(--text-primary)]"
                  >
                    Start New Quote
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-heading mb-4 text-lg font-bold text-[var(--text-primary)]">
                    Your Selection
                  </h2>

                  {selected.length === 0 ? (
                    <div className="py-10 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-subtle)]">
                        <svg className="h-5 w-5 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">
                        Click on solutions to add them to your quote.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                        {selected.map((s) => (
                          <div key={s.id} className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <SolutionIcon name={s.icon} size={18} className="text-[#b14eb5] shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-[var(--text-primary)]">{s.name}</p>
                                <p className="text-xs text-[var(--text-muted)]">
                                  <span className={`mr-1.5 inline-flex rounded px-1.5 py-px text-[10px] font-medium uppercase tracking-wider ${tierBadgeClass(s.tier)}`}>{s.tier}</span>
                                  From {formatSGD(s.priceFrom ?? 0)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggle(s.id)}
                              className="shrink-0 text-[var(--text-tertiary)] hover:text-red-400"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-[var(--border-subtle)]/50 pt-4">
                        <p className="mb-2 text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Indicative totals</p>
                        {discounted && (
                          <>
                            <div className="mb-1 flex justify-between text-sm text-[var(--text-tertiary)] line-through">
                              <span>Subtotal</span>
                              <span>{formatSGD(subtotal)}</span>
                            </div>
                            <div className="mb-1 flex justify-between text-sm font-medium text-emerald-400">
                              <span>Bundle discount (10%)</span>
                              <span>-{formatSGD(subtotal - total)}</span>
                            </div>
                          </>
                        )}
                        <div className="mt-2 flex justify-between text-lg font-bold text-[var(--text-primary)]">
                          <span>From</span>
                          <span className={`inline-block ${pricePop ? "price-pop total-glow" : ""}`}>
                            {formatSGD(total)}
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

      {/* ── FAQ ── */}
      <section id="faq" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <SectionLabel label="FAQ" title="Frequently Asked Questions" />
        <div className="mx-auto max-w-3xl divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]" ref={faqRef}>
          {[
            {
              q: "How long does it take to build my automation?",
              a: "Depends on complexity. A simple email automation takes 2–3 days. A full CRM or AI agent typically takes 1–2 weeks. You'll get a clear timeline before we start.",
            },
            {
              q: "Do you work with small businesses?",
              a: "Yes, most of our clients are Singapore SMEs. Our solutions are built to be practical and affordable, not over-engineered.",
            },
            {
              q: "What tools and platforms do you use?",
              a: "We build on modern, well-supported technology — not proprietary black boxes. Claude (Anthropic) for intelligent agents, n8n for workflow orchestration, and established platforms for messaging, data, and integrations. We choose the right tool for your specific needs, so solutions stay maintainable and you're never locked to one vendor.",
            },
            {
              q: "What happens after the build is done?",
              a: "We hand over everything with full documentation and training. You can also opt into one of our ongoing support plans.",
            },
            {
              q: "Do I need technical knowledge to use what you build?",
              a: "No. We build for non-technical users. If you can use WhatsApp, you can use what we build.",
            },
            {
              q: "How do I get started?",
              a: "Select your solutions above and click Request Quote. We'll respond within 24 hours to schedule a scoping call.",
            },
          ].map((faq, i) => (
            <button
              key={i}
              data-reveal-id={`faq-${i}`}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className={`${revealedIds.has(`faq-${i}`) ? "visible" : "reveal"} w-full text-left px-5 py-4 sm:px-6 sm:py-5 transition`}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">{faq.q}</h3>
                <span className="shrink-0 text-lg text-[#b14eb5]">
                  {openFaq === i ? "−" : "+"}
                </span>
              </div>
              {openFaq === i && (
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{faq.a}</p>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border-subtle)]/30 bg-[var(--bg-primary)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left" ref={footerRef}>
          <div data-reveal-id="footer-brand" className={revealedIds.has("footer-brand") ? "visible" : "reveal"}>
            <span className="flex items-center gap-2 justify-center sm:justify-start">
              <Image
                src="/myrepublic-logo.png"
                alt="MyRepublic"
                width={1080}
                height={361}
                className="h-7 w-auto sm:h-8"
              />
              <span className="font-heading text-lg font-bold text-[#b14eb5] tracking-tight">Business</span>
            </span>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Automation solutions, delivered by experts.</p>
          </div>
          <div data-reveal-id="footer-copy" className={revealedIds.has("footer-copy") ? "visible" : "reveal"}>
            <p className="text-sm text-[var(--text-muted)]">
              &copy; {new Date().getFullYear()} MyRepublic Business. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ── Mobile fixed bottom bar ── */}
      {selected.length > 0 && !quoteSubmitted && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/95 p-4 backdrop-blur-lg lg:hidden">
          <div className="mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-muted)]">
                {selected.length} solution{selected.length !== 1 && "s"} selected
              </p>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                From {formatSGD(total)}
                {discounted && (
                  <span className="ml-1 text-xs font-medium text-emerald-400">-10%</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowDrawer(true)}
              className="rounded-lg bg-gradient-to-r from-[#63077d] to-[#b14eb5] px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-[#b14eb5]/20"
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
          total={total}
          discounted={discounted}
          subtotal={subtotal}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); setQuoteSubmitted(true); }}
        />
      )}

      {/* ── Solution detail popup ── */}
      {detailSolutionId && (() => {
        const sol = solutions.find((s) => s.id === detailSolutionId);
        if (!sol) return null;
        return (
          <SolutionDetailModal
            solution={sol}
            isSelected={selectedIds.has(sol.id)}
            onToggle={() => { toggle(sol.id); setDetailSolutionId(null); }}
            onClose={() => setDetailSolutionId(null)}
          />
        );
      })()}
    </div>
  );
}
