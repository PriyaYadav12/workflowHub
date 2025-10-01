"use client";

import { useMemo, useState } from "react";

export type Category = "campaign" | "script" | "captions" | "presentation" | "other";

export type StrategyFormValues = {
  clientName: string;
  category: Category;
  audience: string;
  brandPersonality: string;
  otherInfo: string;
  deliverables: string;
  objectives: string[]; // awareness | engagement | conversion
  internalNotes: string;
};

export type StrategyFormProps = {
  initial?: Partial<StrategyFormValues>;
  onSubmit: (values: StrategyFormValues) => Promise<void> | void;
  submitting?: boolean;
  webhookConfigured?: boolean;
};

export default function StrategyForm({ initial, onSubmit, submitting, webhookConfigured }: StrategyFormProps) {
  const [values, setValues] = useState<StrategyFormValues>({
    clientName: initial?.clientName || "",
    category: initial?.category || "campaign",
    audience: initial?.audience || "",
    brandPersonality: initial?.brandPersonality || "",
    otherInfo: initial?.otherInfo || "",
    deliverables: initial?.deliverables || "",
    objectives: initial?.objectives || [],
    internalNotes: initial?.internalNotes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const personalityOptions = useMemo(
    () => [
      { key: "Professional", emoji: "🏢", sub: "Corporate and authoritative" },
      { key: "Friendly & Approachable", emoji: "🤝", sub: "Warm and personable" },
      { key: "Premium & Luxury", emoji: "💎", sub: "Sophisticated and exclusive" },
      { key: "Modern & Tech-forward", emoji: "🚀", sub: "Innovative and cutting-edge" },
      { key: "Classic & Traditional", emoji: "🏛️", sub: "Timeless and established" },
      { key: "Bold & Edgy", emoji: "⚡", sub: "Daring and unconventional" },
    ],
    []
  );

  const objectiveOptions = ["Awareness", "Engagement", "Conversion","Idea Generation","Visual Direction"] as const;

  const toggleObjective = (key: string) => {
    setValues((prev) => ({
      ...prev,
      objectives: prev.objectives.includes(key)
        ? prev.objectives.filter((k) => k !== key)
        : [...prev.objectives, key],
    }));
  };

  const validate = (v: StrategyFormValues) => {
    const e: Record<string, string> = {};
    if (!v.clientName.trim()) e.clientName = "Client name is required";
    if (!v.category) e.category = "Category is required";
    if (!v.deliverables.trim()) e.deliverables = "Deliverables are required";
    return e;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eMap = validate(values);
    setErrors(eMap);
    if (Object.keys(eMap).length > 0) return;
    await onSubmit(values);
  }


  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-white/90">Brand Information</h2>
      <p className="mt-1 text-sm text-white/60">Fill the brief. The right panel shows a preview/result.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Client Name */}
        <div>
          <label className="block text-sm font-medium text-white/80">Brand Name <span className="text-rose-300">*</span></label>
          <div className={`mt-2 rounded-xl border px-3 py-2 focus-within:ring-2 ${errors.clientName ? "border-rose-400/50 ring-rose-400/30 bg-rose-500/5" : "border-white/15 ring-white/20 bg-white/5"}`}>
            <input
              value={values.clientName}
              onChange={(e) => setValues((p) => ({ ...p, clientName: e.target.value }))}
              placeholder="Enter brand name"
              className="w-full bg-transparent outline-none text-sm placeholder-white/40"
            />
          </div>
          {errors.clientName ? <p className="mt-1 text-xs text-rose-300">{errors.clientName}</p> : null}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-white/80">What strategy are you looking for? <span className="text-rose-300">*</span></label>
          <div className={`mt-2 rounded-xl border px-3 py-2 ${errors.category ? "border-rose-400/50 bg-rose-500/5" : "border-white/15 bg-white/5"}`}>
            <select
              value={values.category}
              onChange={(e) =>
                setValues((p) => ({
                  ...p,
                  category: e.target.value as Category,
                }))
              }
              className="w-full bg-transparent outline-none text-sm placeholder-white/40"
            >
              <option value="campaign">Campaign</option>
              <option value="script">Script</option>
              <option value="captions">Captions</option>
              <option value="presentation">Presentation</option>
              <option value="other">Other</option>
            </select>
          </div>
          {errors.category ? <p className="mt-1 text-xs text-rose-300">{errors.category}</p> : null}
        </div>

        {/* Audience */}
        <div>
          <label className="block text-sm font-medium text-white/80">Who are your target Audience?</label>
          <div className="mt-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 focus-within:ring-2 ring-white/20">
            <textarea
              value={values.audience}
              onChange={(e) => setValues((p) => ({ ...p, audience: e.target.value }))}
              placeholder="Who are we targeting? Demographics, interests, regions..."
              rows={3}
              className="w-full bg-transparent outline-none text-sm placeholder-white/40 resize-y"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80">Any other information about client?</label>
          <div className="mt-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 focus-within:ring-2 ring-white/20">
            <textarea
              value={values.otherInfo}
              onChange={(e) => setValues((p) => ({ ...p, otherInfo: e.target.value }))}
              placeholder="Enter any other information about client like: Website, Social Media Handles, etc."
              rows={3}
              className="w-full bg-transparent outline-none text-sm placeholder-white/40 resize-y"
            />
          </div>
        </div>
        {/* Brand Personality */}
        <div>
          <div className="text-sm font-medium text-white/80">What is your Brand Personality?</div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {personalityOptions.map((opt) => {
              const active = values.brandPersonality === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setValues((p) => ({ ...p, brandPersonality: opt.key }))}
                  className={`text-left rounded-2xl border px-4 py-3 transition-colors ${
                    active ? "border-indigo-400/40 bg-indigo-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2 text-white/90">
                    <span className="text-lg">{opt.emoji}</span>
                    <span className="font-medium">{opt.key}</span>
                  </div>
                  <div className="mt-1 text-xs text-white/60">{opt.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Deliverables */}
        <div>
          <label className="block text-sm font-medium text-white/80">What are expected deliverables? <span className="text-rose-300">*</span></label>
          <div className={`mt-2 rounded-xl border px-3 py-2 focus-within:ring-2 ${errors.deliverables ? "border-rose-400/50 ring-rose-400/30 bg-rose-500/5" : "border-white/15 ring-white/20 bg-white/5"}`}>
            <textarea
              value={values.deliverables}
              onChange={(e) => setValues((p) => ({ ...p, deliverables: e.target.value }))}
              placeholder="List items: e.g., 5 IG posts, 2 Reels, presentation deck, ad scripts..."
              rows={3}
              className="w-full bg-transparent outline-none text-sm placeholder-white/40 resize-y"
            />
          </div>
          {errors.deliverables ? <p className="mt-1 text-xs text-rose-300">{errors.deliverables}</p> : null}
        </div>

        {/* Objectives */}
        <div>
          <div className="text-sm font-medium text-white/80">What are Brand Objectives?</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {objectiveOptions.map((key) => {
              const checked = values.objectives.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleObjective(key)}
                  className={`px-3 py-2 rounded-xl text-sm border transition-colors ${
                    checked ? "border-emerald-400/40 bg-emerald-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        </div>

        {/* Internal Notes */}
        <div>
          <label className="block text-sm font-medium text-white/80">Any Internal Notes (by PM/CTL)</label>
          <div className="mt-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 focus-within:ring-2 ring-white/20">
            <textarea
              value={values.internalNotes}
              onChange={(e) => setValues((p) => ({ ...p, internalNotes: e.target.value }))}
              placeholder="Guidelines, constraints, timelines, references, do/don'ts..."
              rows={4}
              className="w-full bg-transparent outline-none text-sm placeholder-white/40 resize-y"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="text-xs text-white/60">
            {webhookConfigured ? (
              <span className="bg-emerald-400/10 border border-emerald-300/20 text-emerald-200/90 px-2 py-1 rounded-lg">Webhook set</span>
            ) : (
              <span className="bg-white/5 border border-white/10 text-white/70 px-2 py-1 rounded-lg">No webhook configured</span>
            )}
          </div>
          <button
            type="submit"
            className="px-4 h-10 rounded-xl border border-indigo-400/30 bg-indigo-500/40 text-white text-sm hover:bg-indigo-500/50 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Generate Strategy"}
          </button>
        </div>
      </form>
    </section>
  );
}
