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
  subtotal,
  onClose,
  onSuccess,
}: {
  selected: Solution[];
  totalMandays: number;
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
        mandays: s.mandays,
        price: s.mandays * MANDAY_RATE,
      })),
      total_days: totalDays,
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
          mandays: s.mandays,
          price: s.mandays * MANDAY_RATE,
        })),
        totalDays: totalDays,
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
    link.download = "Jem-AI-Solutions-SAF.pdf";
    link.click();
  }

  const inputCls =
    "w-full rounded-lg border border-[#1e3a5f] bg-[#0a0f1e] px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20";

  // ── SAF Ready View ──
  if (safView) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#1e3a5f] bg-[#111827] p-6 shadow-2xl sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
                Your SAF is Ready
                <span className="text-emerald-400">&#10003;</span>
              </h2>
              <p className="text-sm text-[#94a3b8] mt-1">
                A copy has been sent to <span className="text-[#0ea5e9]">{safView.email}</span>. Review below and download to sign.
              </p>
            </div>
            <button onClick={() => { setSafView(null); onSuccess(); }} className="text-2xl text-gray-500 hover:text-gray-300 shrink-0 ml-4">
              ✕
            </button>
          </div>

          <div className="mb-6 rounded-lg border border-[#1e3a5f] overflow-hidden">
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
              className="flex-1 rounded-lg bg-gradient-to-r from-[#185FA5] to-[#0ea5e9] py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-[#0ea5e9]/20"
            >
              Download PDF
            </button>
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_NOTIFY_EMAIL || "hello@jemaisolutions.com"}?subject=SAF Change Request&body=Hi, I would like to request changes to my SAF.`}
              className="flex-1 rounded-lg border border-[#1e3a5f] bg-[#0a0f1e] py-3 font-semibold text-[#94a3b8] text-center transition hover:border-[#0ea5e9]/40 hover:text-white"
            >
              Request Changes
            </a>
            <button
              onClick={() => { setSafView(null); onSuccess(); }}
              className="flex-1 rounded-lg border border-[#1e3a5f] bg-[#0a0f1e] py-3 font-semibold text-[#94a3b8] transition hover:border-[#0ea5e9]/40 hover:text-white"
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
          <p className="mb-1 text-sm font-medium text-[#94a3b8]">
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

        {loadingMsg && (
          <div className="mb-4 rounded-lg border border-[#0ea5e9]/30 bg-[#0ea5e9]/10 p-4 text-center">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#0ea5e9] border-t-transparent mr-2 align-middle" />
            <span className="text-sm text-[#0ea5e9]">{loadingMsg}</span>
          </div>
        )}

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
            <label className="mb-1 block text-sm font-medium text-gray-300">Phone *</label>
            <input required name="phone" type="tel" className={inputCls} placeholder="+65 9123 4567" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Designation / Job Title *</label>
            <input required name="designation" type="text" className={inputCls} placeholder="Managing Director" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">UEN (Unique Entity Number) *</label>
            <input required name="uen" type="text" className={inputCls} placeholder="201912345A" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Registered Address *</label>
            <input required name="address" type="text" className={inputCls} placeholder="123 Business Park Drive #01-01" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Postal Code *</label>
            <input required name="postalCode" type="text" className={inputCls} placeholder="123456" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Contract Length *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="contractLength" value="24" required className="accent-[#0ea5e9]" defaultChecked />
                <span className="text-sm text-[#e2e8f0]">24 Months</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="contractLength" value="36" className="accent-[#0ea5e9]" />
                <span className="text-sm text-[#e2e8f0]">36 Months</span>
              </label>
            </div>
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
                    <p className="text-sm font-medium text-[#e2e8f0]">{s.name}</p>
                    <p className="text-xs text-[#94a3b8]">
                      {s.mandays} mandays &middot; ${(s.mandays * MANDAY_RATE).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button onClick={() => onToggle(s.id)} className="shrink-0 text-sm text-[#64748b] hover:text-red-400">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#1e3a5f]/50 px-5 pb-6 pt-4">
          <div className="mb-1 flex justify-between text-sm text-[#94a3b8]">
            <span>Total mandays</span>
            <span>{totalMandays}</span>
          </div>
          {discounted && (
            <>
              <div className="mb-1 flex justify-between text-sm text-[#64748b] line-through">
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
          style={{ backgroundColor: "#111827", border: "2px solid #1e3a5f", borderLeft: "4px solid #ef4444", padding: "40px", minHeight: "420px" }}
        >
          <h3 className="font-heading font-bold mb-6" style={{ color: "#f87171", fontSize: "22px" }}>
            Without Automation
          </h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {painPoints.map((point, i) => (
              <li key={i} className="flex items-center gap-3 leading-relaxed text-[#cbd5e1]" style={{ fontSize: "18px" }}>
                <span className="shrink-0" style={{ color: "#ef4444", fontSize: "24px", lineHeight: 1 }}>❌</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Solutions */}
        <div
          data-reveal-id="solution-col"
          className={`${revealedIds.has("solution-col") ? "visible" : "reveal"} rounded-xl`}
          style={{ backgroundColor: "#111827", border: "2px solid #1e3a5f", borderLeft: "4px solid #10b981", padding: "40px", minHeight: "420px" }}
        >
          <h3 className="font-heading font-bold mb-6" style={{ color: "#34d399", fontSize: "22px" }}>
            With Jem AI Solutions
          </h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {solutionPoints.map((point, i) => (
              <li key={i} className="flex items-center gap-3 leading-relaxed text-[#cbd5e1]" style={{ fontSize: "18px" }}>
                <span className="shrink-0" style={{ color: "#10b981", fontSize: "24px", lineHeight: 1 }}>✅</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stat bar */}
      <div
        ref={statsRef}
        className="mt-8 rounded-xl border border-[#1e3a5f] bg-[#111827]"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#1e3a5f]">
          {[
            { value: stat1, label: "Hours saved per week" },
            { value: stat2, label: "Faster lead response" },
            { value: stat3, label: "Lead-to-conversion increase" },
            { value: stat4, label: "Repetitive tasks eliminated" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center py-6 sm:py-8">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">{stat.value}</span>
              <span className="mt-1 text-xs sm:text-sm text-[#94a3b8]">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works timeline ─── */

const howItWorksSteps = [
  { num: "01", title: "Select & Quote", icon: "🛒", desc: "You browse solutions, build your stack, and submit a quote. No commitment needed.", badge: "Day 1" },
  { num: "02", title: "Scoping Call", icon: "📞", desc: "We schedule a 45-min call to confirm requirements, timeline, and project scope.", badge: "Day 2–3" },
  { num: "03", title: "We Build", icon: "⚙️", desc: "Our team builds your automation with progress updates throughout.", badge: "Day 4–14" },
  { num: "04", title: "Handover & Training", icon: "🎓", desc: "We deliver, train your team live, and hand over full documentation.", badge: "Day 15" },
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

  const ConnectorArrow = () => (
    <svg viewBox="0 0 40 24" fill="none" style={{ width: "40px", height: "24px" }}>
      <path
        d="M0 12 C10 12, 14 4, 20 4 S30 12, 40 12"
        stroke="url(#arrow-grad)"
        strokeWidth="2"
        fill="none"
      />
      <polygon points="36,8 40,12 36,16" fill="#0ea5e9" />
      <defs>
        <linearGradient id="arrow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#185FA5" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
    </svg>
  );

  const ContentBlock = ({ step, delay }: { step: typeof howItWorksSteps[number]; delay: string }) => (
    <div
      className={`timeline-content text-center ${triggered ? "shown" : ""}`}
      style={{ transitionDelay: delay }}
    >
      <div style={{ fontSize: "28px", marginBottom: "8px" }}>{step.icon}</div>
      <h3 className="font-heading font-bold text-white" style={{ fontSize: "16px", marginBottom: "4px" }}>{step.title}</h3>
      <p className="leading-relaxed text-[#cbd5e1]" style={{ fontSize: "14px", marginBottom: "8px" }}>{step.desc}</p>
      <span className="inline-block rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 px-3 py-0.5 text-xs font-medium text-[#0ea5e9]">
        {step.badge}
      </span>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16" ref={sectionRef}>
      <SectionLabel label="Process" title="From Quote to Go-Live in 4 Steps" />

      {/* ── Desktop: 3-row grid with zigzag content ── */}
      <div className="hidden md:block mt-12">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr",
            gridTemplateRows: "220px 80px 220px",
            alignItems: "stretch",
          }}
        >
          {/* ── Row 1: top content ── */}
          {howItWorksSteps.map((step, i) => {
            const isAbove = i % 2 === 0;
            const contentDelay = `${0.8 + i * 0.2}s`;
            return (
              <div
                key={`top-${step.num}`}
                style={{
                  gridColumn: i * 2 + 1,
                  gridRow: 1,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: "12px",
                }}
              >
                {isAbove ? <ContentBlock step={step} delay={contentDelay} /> : null}
              </div>
            );
          })}

          {/* ── Row 2: nodes + connecting line ── */}
          {/* Horizontal line behind nodes */}
          <div
            style={{
              gridColumn: "1 / -1",
              gridRow: 2,
              display: "flex",
              alignItems: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "12.5%",
                right: "12.5%",
                height: "2px",
                background: "linear-gradient(90deg, #185FA5, #0ea5e9)",
                boxShadow: "0 0 8px rgba(14,165,233,0.4)",
                opacity: triggered ? 1 : 0,
                transition: "opacity 0.8s ease-out 0.3s",
              }}
            />
          </div>

          {/* Nodes on row 2 */}
          {howItWorksSteps.map((step, i) => {
            const nodeDelay = `${0.4 + i * 0.2}s`;
            return (
              <div
                key={`node-${step.num}`}
                style={{
                  gridColumn: i * 2 + 1,
                  gridRow: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}
              >
                <div
                  className={`timeline-node flex items-center justify-center rounded-full bg-gradient-to-br from-[#185FA5] to-[#0ea5e9] text-sm font-bold text-white ${triggered ? "popped" : ""}`}
                  style={{
                    width: "48px",
                    height: "48px",
                    animationDelay: triggered ? nodeDelay : undefined,
                  }}
                >
                  {step.num}
                </div>
              </div>
            );
          })}

          {/* Connector arrows between nodes on row 2 */}
          {[0, 1, 2].map((i) => (
            <div
              key={`arrow-${i}`}
              style={{
                gridColumn: i * 2 + 2,
                gridRow: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: triggered ? 1 : 0,
                transition: `opacity 0.4s ease-out ${0.6 + i * 0.2}s`,
              }}
            >
              <ConnectorArrow />
            </div>
          ))}

          {/* ── Row 3: bottom content ── */}
          {howItWorksSteps.map((step, i) => {
            const isBelow = i % 2 === 1;
            const contentDelay = `${0.8 + i * 0.2}s`;
            return (
              <div
                key={`bottom-${step.num}`}
                style={{
                  gridColumn: i * 2 + 1,
                  gridRow: 3,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  paddingTop: "12px",
                }}
              >
                {isBelow ? <ContentBlock step={step} delay={contentDelay} /> : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mobile: vertical steps ── */}
      <div className="flex md:hidden mt-10 flex-col" style={{ gap: "24px" }}>
        {howItWorksSteps.map((step, i) => {
          const nodeDelay = `${0.2 + i * 0.2}s`;
          const contentDelay = `${0.4 + i * 0.2}s`;
          const isLast = i === howItWorksSteps.length - 1;
          return (
            <div key={step.num} className="relative" style={{ display: "flex", gap: "16px" }}>
              {/* Left: node + connecting line */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div
                  className={`timeline-node flex items-center justify-center rounded-full bg-gradient-to-br from-[#185FA5] to-[#0ea5e9] text-sm font-bold text-white ${triggered ? "popped" : ""}`}
                  style={{ width: "44px", height: "44px", animationDelay: triggered ? nodeDelay : undefined }}
                >
                  {step.num}
                </div>
                {!isLast && (
                  <div
                    style={{
                      flex: 1,
                      width: "2px",
                      marginTop: "4px",
                      background: "linear-gradient(180deg, #185FA5, #0ea5e9)",
                      boxShadow: "0 0 6px rgba(14,165,233,0.3)",
                      opacity: triggered ? 1 : 0,
                      transition: `opacity 0.6s ease-out ${0.4 + i * 0.2}s`,
                    }}
                  />
                )}
              </div>
              {/* Right: content */}
              <div
                className={`timeline-content ${triggered ? "shown" : ""}`}
                style={{ transitionDelay: contentDelay, paddingTop: "2px", minHeight: "44px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "22px" }}>{step.icon}</span>
                  <h3 className="font-heading font-bold text-white" style={{ fontSize: "15px" }}>{step.title}</h3>
                </div>
                <p className="leading-relaxed text-[#cbd5e1]" style={{ fontSize: "13px", marginBottom: "6px" }}>{step.desc}</p>
                <span className="inline-block rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 px-3 py-0.5 text-xs font-medium text-[#0ea5e9]">
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
                  backgroundColor: "#111827",
                  border: "2px solid #1e3a5f",
                  borderLeft: "4px solid #0ea5e9",
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ marginBottom: "12px", color: "#fbbf24", fontSize: "14px", letterSpacing: "0.05em" }}>★★★★★</div>
                <p style={{ marginBottom: "16px", flex: 1, fontSize: "14px", fontStyle: "italic", lineHeight: 1.7, color: "#e2e8f0" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>{t.name}</p>
                <p style={{ fontSize: "12px", color: "#94a3b8" }}>{t.title}</p>
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
  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [supportModal, setSupportModal] = useState<number | null>(null);

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
  const supportRef = useScrollReveal();
  const solutionsRef = useScrollReveal();
  const faqRef = useScrollReveal(80);
  const footerRef = useScrollReveal();
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

          {/* Desktop nav links */}
          <div className="hidden items-center gap-6 md:flex">
            {[
              { label: "Packages", href: "#packages" },
              { label: "Support", href: "#support" },
              { label: "Solutions", href: "#solutions" },
              { label: "FAQ", href: "#faq" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#e2e8f0] transition hover:text-[#0ea5e9] hover:underline hover:underline-offset-4"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/web-services"
              className="text-sm font-medium text-[#e2e8f0] transition hover:text-[#0ea5e9] hover:underline hover:underline-offset-4"
            >
              Web Services
            </a>
            <a
              href="#solutions"
              className="nav-btn-glow rounded-lg bg-gradient-to-r from-[#185FA5] to-[#0ea5e9] px-5 py-2 text-sm font-semibold text-white transition"
            >
              Get Started
            </a>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <a
              href="#solutions"
              className="nav-btn-glow rounded-lg bg-gradient-to-r from-[#185FA5] to-[#0ea5e9] px-4 py-2 text-sm font-semibold text-white transition"
            >
              Get Started
            </a>
            <button
              onClick={() => setMobileNav(!mobileNav)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1e3a5f] text-[#e2e8f0] transition hover:border-[#0ea5e9]/40 hover:text-white"
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
          <div className="mt-2 mx-auto max-w-7xl rounded-xl border border-[#1e3a5f] bg-[#111827]/95 backdrop-blur-lg p-4 md:hidden">
            {[
              { label: "Packages", href: "#packages" },
              { label: "Support", href: "#support" },
              { label: "Solutions", href: "#solutions" },
              { label: "FAQ", href: "#faq" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileNav(false)}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-[#e2e8f0] transition hover:bg-[#1e3a5f]/30 hover:text-[#0ea5e9]"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/web-services"
              onClick={() => setMobileNav(false)}
              className="block rounded-lg px-4 py-3 text-sm font-medium text-[#e2e8f0] transition hover:bg-[#1e3a5f]/30 hover:text-[#0ea5e9]"
            >
              Web Services
            </a>
          </div>
        )}
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
          <p className="animate-hero-delay-2 mx-auto mt-6 max-w-xl text-base text-[#94a3b8] sm:text-lg">
            Transparent pricing. Expert delivery. Select what you need.
          </p>
          <div className="animate-hero-delay-2 badge-glow mt-4 inline-flex items-center gap-2 rounded-full border border-[#0ea5e9]/20 bg-[#0ea5e9]/5 px-4 py-2 text-xs font-medium text-[#0ea5e9] sm:text-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0ea5e9] animate-pulse" />
            Select 3+ solutions for a 10% bundle discount
          </div>
        </div>
      </section>

      {/* ── Pain Points ── */}
      <PainPointsSection />

      {/* ── How It Works ── */}
      <HowItWorks />

      {/* ── Packages ── */}
      <section id="packages" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16" ref={packagesRef}>
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
                      <li key={s.id} className="flex items-center gap-2 text-xs text-[#94a3b8] sm:text-sm">
                        <span className="text-sm sm:text-base">{s.icon}</span>
                        <span className="text-[#cbd5e1]">{s.name}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mb-4 flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white sm:text-2xl">
                      ${pkgTotal.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#94a3b8]">{mandays} mandays</span>
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
      {(() => {
        const supportCards = [
          {
            icon: "🎓",
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
            icon: "🛟",
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
            icon: "🚀",
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
                    className={`${revealedIds.has(`support-${i}`) ? "visible" : "reveal"} card-idle group flex flex-col rounded-xl border-2 border-[#1e3a5f] bg-[#111827] p-5 sm:p-6`}
                  >
                    <div className="mb-3 text-3xl">{card.icon}</div>
                    <h3 className="font-heading mb-2 text-base font-semibold text-white">
                      {card.title}
                    </h3>
                    <p className="mb-5 flex-1 text-sm leading-relaxed text-[#cbd5e1]">
                      {card.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="price-glow text-sm font-bold">{card.price}</span>
                      <button
                        onClick={() => setSupportModal(i)}
                        className="rounded-lg border border-[#0ea5e9]/30 px-4 py-2 text-sm font-semibold text-[#0ea5e9] transition hover:bg-[#0ea5e9]/10 hover:border-[#0ea5e9]/60 hover:shadow-[0_0_12px_rgba(14,165,233,0.25)]"
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
                  className="relative w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[#1e3a5f] bg-[#111827] p-6 shadow-2xl sm:p-8"
                  style={{ animation: "fade-in 0.2s ease-out" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSupportModal(null)}
                    className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-300 transition"
                  >
                    ✕
                  </button>

                  <div className="text-4xl mb-4">{activeCard.icon}</div>
                  <h2 className="font-heading text-xl font-bold text-white sm:text-2xl mb-1">
                    {activeCard.title}
                  </h2>
                  <p className="text-lg font-bold text-[#0ea5e9] mb-6">{activeCard.price}</p>

                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">What&apos;s Included</h3>
                  <ul className="mb-6 space-y-2">
                    {activeCard.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-[#cbd5e1]">
                        <span className="mt-0.5 text-[#0ea5e9]">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3 rounded-lg border border-[#1e3a5f] bg-[#0a0f1e] p-4">
                    {"bestFor" in activeCard && (
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Best for</span>
                        <p className="text-sm text-[#cbd5e1]">{activeCard.bestFor}</p>
                      </div>
                    )}
                    {"planOptions" in activeCard && (
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Plan options</span>
                        <p className="text-sm text-[#cbd5e1]">{activeCard.planOptions}</p>
                      </div>
                    )}
                    {"commitment" in activeCard && (
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Minimum commitment</span>
                        <p className="text-sm text-[#cbd5e1]">{activeCard.commitment}</p>
                      </div>
                    )}
                    {"timeline" in activeCard && (
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Timeline</span>
                        <p className="text-sm text-[#cbd5e1]">{activeCard.timeline}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* ── Testimonials ── */}
      <TestimonialCarousel />

      {/* ── Solutions ── */}
      <section id="solutions" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex gap-6">
          {/* Left */}
          <div className="min-w-0 flex-1">
            <SectionLabel label="Solutions" title="Choose Your Stack" />

            {/* Category filter pills */}
            <style>{`
              @media (max-width: 767px) {
                .cat-pills { display: grid !important; grid-template-columns: 1fr 1fr; gap: 8px; }
                .cat-pills > button { padding: 12px 16px !important; border: 1px solid #185FA5 !important; width: 100%; }
                .cat-pill-inactive { background: #1e293b !important; color: #ffffff !important; }
              }
            `}</style>
            <div className="cat-pills mb-8 flex flex-wrap gap-2">
              {(["All", ...categories] as const).map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat as Category | "All")}
                    className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "pill-active text-white shadow-lg shadow-[#0ea5e9]/10"
                        : `cat-pill-inactive pill-inactive border border-[#1e3a5f] text-[#94a3b8] hover:border-[#0ea5e9]/40 hover:text-gray-200`
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
                    <p className="mb-4 flex-1 text-xs leading-relaxed text-[#cbd5e1] sm:text-sm">
                      {s.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#94a3b8]">
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
                  <p className="mb-6 text-sm text-[#94a3b8]">
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
                      <p className="text-sm text-[#94a3b8]">
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
                                <p className="text-sm font-medium text-[#e2e8f0]">{s.name}</p>
                                <p className="text-xs text-[#94a3b8]">{s.mandays} mandays</p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggle(s.id)}
                              className="shrink-0 text-sm text-[#64748b] hover:text-red-400"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-[#1e3a5f]/50 pt-4">
                        <div className="mb-1 flex justify-between text-sm text-[#94a3b8]">
                          <span>Total mandays</span>
                          <span>{totalMandays}</span>
                        </div>
                        {discounted && (
                          <>
                            <div className="mb-1 flex justify-between text-sm text-[#64748b] line-through">
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

      {/* ── FAQ ── */}
      <section id="faq" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <SectionLabel label="FAQ" title="Frequently Asked Questions" />
        <div className="mx-auto max-w-3xl divide-y divide-[#1e3a5f] rounded-xl border border-[#1e3a5f] bg-[#111827]" ref={faqRef}>
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
              a: "We use the best AI and automation technology available today — including Claude AI for intelligent agents, and purpose-built platforms for workflows, CRMs, and integrations. We choose the right tool for your specific business needs and budget.",
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
                <h3 className="text-sm font-semibold text-white sm:text-base">{faq.q}</h3>
                <span className="shrink-0 text-lg text-[#0ea5e9]">
                  {openFaq === i ? "−" : "+"}
                </span>
              </div>
              {openFaq === i && (
                <p className="mt-3 text-sm leading-relaxed text-[#cbd5e1]">{faq.a}</p>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1e3a5f]/30 bg-[#0a0f1e]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left" ref={footerRef}>
          <div data-reveal-id="footer-brand" className={revealedIds.has("footer-brand") ? "visible" : "reveal"}>
            <span className="font-heading text-lg font-bold text-white tracking-tight">
              Jem <span className="text-[#0ea5e9]">AI Solutions</span>
            </span>
            <p className="mt-1 text-sm text-[#94a3b8]">Automation solutions, delivered by experts.</p>
          </div>
          <div data-reveal-id="footer-copy" className={revealedIds.has("footer-copy") ? "visible" : "reveal"}>
            <p className="text-sm text-[#94a3b8]">
              &copy; {new Date().getFullYear()} Jem AI Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ── Mobile fixed bottom bar ── */}
      {selected.length > 0 && !quoteSubmitted && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#1e3a5f] bg-[#111827]/95 p-4 backdrop-blur-lg lg:hidden">
          <div className="mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-[#94a3b8]">
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
          subtotal={subtotal}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); setQuoteSubmitted(true); }}
        />
      )}
    </div>
  );
}
