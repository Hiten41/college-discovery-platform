"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronRight,
  IndianRupee,
  Loader2,
  MapPin,
  Medal,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { formatRankPredictorFees } from "@/lib/rankPredictor/formatters";
import {
  BRANCHES,
  CATEGORIES,
  EXAMS,
  GENDERS,
  type PredictionTier,
  type RankPredictionResult,
  type RankPredictorInput,
} from "@/lib/rankPredictor/types";

const initialInput: RankPredictorInput = {
  exam: "JEE Main",
  rank: 18000,
  category: "General",
  gender: "Male",
  homeState: "Tamil Nadu",
  preferredBranch: "CSE",
};

const tierMeta = {
  dream: {
    label: "Dream Colleges",
    description: "Ambitious options with lower recommendation-fit scores",
    icon: Sparkles,
    color: "text-violet-300",
    bar: "from-violet-500 to-fuchsia-400",
    border: "border-violet-400/20",
  },
  target: {
    label: "Target Colleges",
    description: "Balanced options in the middle score band",
    icon: Target,
    color: "text-amber-300",
    bar: "from-amber-500 to-orange-400",
    border: "border-amber-400/20",
  },
  safe: {
    label: "Safe Colleges",
    description: "Higher-scoring options based on the V1 heuristic",
    icon: ShieldCheck,
    color: "text-emerald-300",
    bar: "from-emerald-500 to-green-400",
    border: "border-emerald-400/20",
  },
} as const;

export default function RankPredictorPage() {
  const [form, setForm] = useState<RankPredictorInput>(initialInput);
  const [result, setResult] = useState<RankPredictionResult | null>(null);
  const [activeTier, setActiveTier] = useState<PredictionTier | "all">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleTiers = useMemo(
    () => activeTier === "all" ? (["dream", "target", "safe"] as const) : [activeTier],
    [activeTier],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rank-predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as RankPredictionResult & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Prediction failed.");
      setResult(data);
      setActiveTier("all");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Prediction failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050706] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(34,197,94,0.14),transparent_30%),radial-gradient(circle_at_85%_30%,rgba(16,185,129,0.08),transparent_28%)]" />

      <header className="relative z-10 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3 font-black tracking-tight">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 text-lg text-black shadow-[0_0_28px_rgba(34,197,94,0.3)]">C</span>
            <span className="text-xl">CollegeHub</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to colleges
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-10 pt-14 lg:px-8 lg:pt-20">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-green-300">
            <BrainCircuit className="h-4 w-4" /> Transparent rule-based engine
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Turn your rank into a
            <span className="block bg-gradient-to-r from-green-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">smarter college shortlist.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-400 sm:text-lg">
            Compare your profile with CollegeHub&apos;s stored rankings, fees, placements and ownership data. Every score includes its factors and limitations.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-8 px-5 pb-24 lg:grid-cols-[380px_1fr] lg:px-8">
        <aside>
          <form onSubmit={handleSubmit} className="sticky top-6 rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-400">Your profile</p>
                <h2 className="mt-1 text-2xl font-black">Prediction filters</h2>
              </div>
              <BookOpenCheck className="h-7 w-7 text-green-400" />
            </div>

            <div className="space-y-4">
              <SelectField label="Exam" value={form.exam} options={EXAMS} onChange={(exam) => setForm({ ...form, exam: exam as RankPredictorInput["exam"] })} />
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-zinc-300">Rank</span>
                <input
                  required
                  type="number"
                  min={1}
                  max={10000000}
                  value={form.rank}
                  onChange={(event) => setForm({ ...form, rank: Number(event.target.value) })}
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-white outline-none transition focus:border-green-400/60 focus:ring-4 focus:ring-green-400/10"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Category" value={form.category} options={CATEGORIES} onChange={(category) => setForm({ ...form, category: category as RankPredictorInput["category"] })} />
                <SelectField label="Gender" value={form.gender} options={GENDERS} onChange={(gender) => setForm({ ...form, gender: gender as RankPredictorInput["gender"] })} />
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-zinc-300">Home State</span>
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={form.homeState}
                  onChange={(event) => setForm({ ...form, homeState: event.target.value })}
                  placeholder="e.g. Tamil Nadu"
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-white outline-none transition placeholder:text-zinc-600 focus:border-green-400/60 focus:ring-4 focus:ring-green-400/10"
                />
              </label>
              <SelectField label="Preferred Branch" value={form.preferredBranch} options={BRANCHES} onChange={(preferredBranch) => setForm({ ...form, preferredBranch: preferredBranch as RankPredictorInput["preferredBranch"] })} />
            </div>

            <button disabled={isLoading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-4 font-black text-black shadow-[0_14px_40px_rgba(34,197,94,0.22)] transition hover:from-green-400 hover:to-emerald-400 disabled:cursor-wait disabled:opacity-60">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <BarChart3 className="h-5 w-5" />}
              {isLoading ? "Evaluating colleges" : "Generate predictions"}
            </button>

            <div className="mt-5 rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] p-4 text-xs leading-5 text-amber-100/70">
              <strong className="text-amber-200">V1 notice:</strong> This is not a cutoff predictor. Category, gender, home-state and branch rules remain neutral until verified counselling data is added.
            </div>
          </form>
        </aside>

        <div className="min-w-0">
          {error && <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">{error}</div>}

          {!result && !isLoading && (
            <div className="grid min-h-[540px] place-items-center rounded-[32px] border border-dashed border-white/15 bg-white/[0.025] p-8 text-center">
              <div className="max-w-md">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-green-400/20 bg-green-400/10"><TrendingUp className="h-9 w-9 text-green-400" /></div>
                <h2 className="mt-6 text-3xl font-black">Your shortlist starts here</h2>
                <p className="mt-3 leading-7 text-zinc-500">Complete the filters to evaluate compatible colleges with a fully explainable score.</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-8">
              <div className="rounded-[28px] border border-amber-300/20 bg-gradient-to-br from-amber-400/[0.12] via-white/[0.045] to-white/[0.025] p-5 shadow-2xl shadow-amber-950/10 backdrop-blur">
                <div className="flex gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-amber-300/25 bg-amber-300/10 text-amber-200">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">Important</p>
                    <h2 className="mt-1 text-xl font-black text-white">Rank Predictor V1 is guidance, not a cutoff result.</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-50/70">
                      Rank Predictor V1 uses CollegeHub data and a heuristic recommendation engine. It is not based on official JoSAA, CSAB, or institute cutoffs, so use these recommendations as shortlist guidance rather than admission guarantees.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {(Object.keys(tierMeta) as PredictionTier[]).map((tier) => {
                  const meta = tierMeta[tier];
                  const Icon = meta.icon;
                  return (
                    <button key={tier} onClick={() => setActiveTier(tier)} className={`rounded-3xl border bg-white/[0.045] p-5 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.07] ${meta.border}`}>
                      <div className="flex items-center justify-between"><Icon className={`h-6 w-6 ${meta.color}`} /><span className="text-3xl font-black">{result.groups[tier].length}</span></div>
                      <p className="mt-5 font-bold">{meta.label}</p>
                      <p className="mt-1 text-xs text-zinc-500">View recommendations</p>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-500">Evaluated {result.totalEvaluated} exam-compatible records</p>
                  <h2 className="text-3xl font-black">Your recommendations</h2>
                </div>
                <div className="flex rounded-2xl border border-white/10 bg-black/30 p-1">
                  {(["all", "dream", "target", "safe"] as const).map((tier) => (
                    <button key={tier} onClick={() => setActiveTier(tier)} className={`rounded-xl px-3 py-2 text-xs font-bold capitalize transition ${activeTier === tier ? "bg-green-500 text-black" : "text-zinc-400 hover:text-white"}`}>{tier}</button>
                  ))}
                </div>
              </div>

              {visibleTiers.map((tier) => {
                const meta = tierMeta[tier];
                const Icon = meta.icon;
                return (
                  <section key={tier} className="space-y-4">
                    <div className="flex items-center gap-3"><Icon className={`h-6 w-6 ${meta.color}`} /><div><h3 className="text-xl font-black">{meta.label}</h3><p className="text-sm text-zinc-500">{meta.description}</p></div></div>
                    {result.groups[tier].length === 0 ? (
                      <EmptyTierState tier={tier} />
                    ) : (
                      <div className="grid gap-4 xl:grid-cols-2">
                        {result.groups[tier].map((prediction) => (
                          <article key={prediction.college.name} className={`rounded-[28px] border bg-gradient-to-b from-white/[0.065] to-white/[0.025] p-5 ${meta.border}`}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.07]"><Building2 className="h-5 w-5 text-green-300" /></span><div><h4 className="font-black leading-5">{prediction.college.name}</h4><p className="mt-1 flex items-center gap-1 text-xs text-zinc-500"><MapPin className="h-3 w-3" />{prediction.college.location}</p></div></div>
                              <div className="text-right">
                                <span className={`text-2xl font-black ${meta.color}`}>{prediction.confidenceScore}%</span>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Match</p>
                              </div>
                            </div>
                            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full bg-gradient-to-r ${meta.bar}`} style={{ width: `${prediction.confidenceScore}%` }} /></div>
                            <p className="mt-2 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{matchLabel(prediction.confidenceScore)}</p>
                            <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                              <NirfMetric value={prediction.college.nirfRank} />
                              <Metric icon={TrendingUp} label="Avg package" value={prediction.college.avgPackage ?? "N/A"} />
                              <Metric icon={BarChart3} label="Highest" value={prediction.college.highestPackage ?? "N/A"} />
                              <Metric icon={IndianRupee} label="Stored fee" value={formatRankPredictorFees(prediction.college.fees)} />
                            </div>
                            <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
                              {recommendationHighlights(prediction).map((reason) => <p key={reason} className="flex gap-2 text-xs leading-5 text-zinc-400"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" />{reason}</p>)}
                              <details className="group rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                                <summary className="cursor-pointer list-none text-xs font-bold text-zinc-300 transition hover:text-white">
                                  How this recommendation was generated
                                </summary>
                                <div className="mt-3 space-y-2 text-xs leading-5 text-zinc-500">
                                  <p>{prediction.confidenceScore}% match is used for this tier. College quality is used only to order colleges inside the tier.</p>
                                  {prediction.factors.map((factor) => (
                                    <p key={factor.key}>{factor.label}: {factor.score}/{factor.maximum}</p>
                                  ))}
                                </div>
                              </details>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}

              <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6">
                <div className="flex items-center gap-3"><BrainCircuit className="h-6 w-6 text-green-400" /><h3 className="text-lg font-black">How to read this result</h3></div>
                <p className="mt-4 text-sm leading-6 text-zinc-400">{result.disclaimer}</p>
                <div className="mt-4 space-y-2">{result.limitations.map((limitation) => <p key={limitation} className="flex gap-2 text-sm text-zinc-500"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />{limitation}</p>)}</div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function matchLabel(score: number) {
  if (score >= 75) return "High recommendation match";
  if (score >= 35) return "Moderate recommendation match";
  return "Aspirational recommendation match";
}

function recommendationHighlights(prediction: RankPredictionResult["groups"][PredictionTier][number]) {
  const highlights = [`${prediction.confidenceScore}% match for your current rank profile`];

  if (prediction.college.avgPackage) highlights.push(`Stored average package: ${prediction.college.avgPackage}`);
  if (prediction.college.fees !== null) highlights.push(`Stored fee: ${formatRankPredictorFees(prediction.college.fees)}`);
  if (prediction.college.nirfRank !== null) highlights.push(`NIRF #${prediction.college.nirfRank} in CollegeHub data`);

  return highlights.slice(0, 4);
}

function EmptyTierState({ tier }: { tier: PredictionTier }) {
  const meta = tierMeta[tier];
  const Icon = meta.icon;
  const title = tier === "dream"
    ? "No Dream Colleges Yet"
    : tier === "target"
      ? "No Target Colleges Yet"
      : "No Safe Colleges Yet";

  return (
    <div className={`rounded-3xl border bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-8 ${meta.border}`}>
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-white/10 bg-white/[0.06]">
          <Icon className={`h-8 w-8 ${meta.color}`} />
        </div>
        <h4 className="mt-5 text-2xl font-black text-white">{title}</h4>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Try adjusting your rank, exploring another exam, or reviewing the other recommendation tiers.
        </p>
        <div className="mt-5 grid gap-2 text-left text-sm text-zinc-400 sm:grid-cols-3">
          {["Adjust your rank", "Explore another exam", "Review other tiers"].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
              {item}
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs leading-5 text-zinc-600">
          As CollegeHub grows, more recommendations will become available.
        </p>
      </div>
    </div>
  );
}

function NirfMetric({ value }: { value: number | null }) {
  return (
    <div className="rounded-2xl bg-black/25 p-3">
      <p className="flex items-center gap-1.5 text-zinc-500"><Medal className="h-3.5 w-3.5" />Ranking</p>
      <p className="mt-1 inline-flex max-w-full items-center rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-xs font-black text-amber-100" title={value === null ? "NIRF not available" : `NIRF #${value}`}>
        <Medal className="mr-1.5 h-3.5 w-3.5 text-amber-200" />
        {value === null ? "NIRF N/A" : `NIRF #${value}`}
      </p>
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-zinc-300">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0d100e] px-4 py-3.5 text-white outline-none transition focus:border-green-400/60 focus:ring-4 focus:ring-green-400/10">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof Medal; label: string; value: string }) {
  return <div className="rounded-2xl bg-black/25 p-3"><p className="flex items-center gap-1.5 text-zinc-500"><Icon className="h-3.5 w-3.5" />{label}</p><p className="mt-1 truncate font-bold text-zinc-200" title={value}>{value}</p></div>;
}
