"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Star } from "lucide-react";
import { normalizeStoredCompareColleges } from "@/lib/compareStorage";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
interface College {
  id: string
  name: string
  image: string
  location: string
  fees: number
  avgPackage: string
  rating: number
  nirfRank: number
   ownership: string | null
  examsAccepted: string[]
  highestPackage: string | null
}
export default function ComparePage() {
const [colleges] = useState<College[]>(() => {

  if (typeof window === "undefined") {
    return [];
  }

  return normalizeStoredCompareColleges(
    JSON.parse(
      localStorage.getItem("compareColleges") || "[]"
    )
  );

});
const [isDockOpen, setIsDockOpen] = useState(false);

 

  const getBestRank = () => {
    return [...colleges].sort(
      (a, b) => a.nirfRank - b.nirfRank
    )[0];
  };

  const getBestPackage = () => {
    return [...colleges].sort(
      (a, b) =>
        parseFloat(
          String(b.avgPackage).replace(/[^0-9.]/g, "")
        ) -
        parseFloat(
          String(a.avgPackage).replace(/[^0-9.]/g, "")
        )
    )[0];
  };

  const getLowestFees = () => {
    return [...colleges].sort(
      (a, b) => a.fees - b.fees
    )[0];
  };

  if (colleges.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
        <div className="text-center">

          <h1 className="text-5xl font-black text-white mb-4">
            No Colleges Selected
          </h1>

          <p className="text-zinc-500">
            Add colleges to compare first.
          </p>

        </div>
      </div>
    );
  }

  return (
  <div className="premium-depth-root min-h-screen relative overflow-x-hidden pb-36">
<div className="absolute inset-0">

  <div
    className="absolute inset-0"
    style={{
      background:
        "radial-gradient(circle at top left, rgba(37,99,235,0.25), transparent 35%)",
    }}
  />

  <div
    className="absolute inset-0"
    style={{
      background:
        "radial-gradient(circle at bottom right, rgba(29,78,216,0.20), transparent 40%)",
    }}
  />

<div
  className="absolute inset-0"
  style={{
    background:
      "linear-gradient(135deg, transparent 0%, rgba(2,6,23,0.4) 100%)",
  }}
/>
<div
  className="absolute inset-0 opacity-[0.03]"
  style={{
    backgroundImage:
      "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
    backgroundSize: "80px 80px",
  }}
/>
</div>
     <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">

      <div className="relative h-[360px] md:h-[420px] rounded-[28px] md:rounded-[40px] overflow-hidden mb-10 md:mb-14">

  <img
    src="/images/hacker.jpg"
    alt="Comparison Dashboard"
    className="absolute inset-0 w-full h-full object-cover"
  />

<div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />

  <div className="relative z-10 h-full flex flex-col justify-center px-5 sm:px-8 md:px-12">

    <p className="text-violet-400 font-bold text-xs sm:text-sm md:text-lg uppercase tracking-[0.18em] md:tracking-[0.3em] mb-4">
      Comparison Dashboard
    </p>

<h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-green-300 bg-clip-text text-transparent mb-6">
      Detailed Comparison
    </h1>

    <p className="text-zinc-300 text-base sm:text-lg md:text-2xl max-w-3xl leading-relaxed">
      Compare rankings, placements, fees and admissions side-by-side with advanced analytics.
    </p>

  </div>

</div>
        <div className="luxe-surface luxe-section mb-8 rounded-3xl p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-300">
                Selected for comparison
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">
                {colleges.length} colleges ready
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsDockOpen(true)}
              className="luxe-button inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-100 hover:border-emerald-200/50 hover:bg-emerald-400/15"
            >
              View selected dock
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {colleges.map((college) => (
              <span
                key={college.id}
                className="shrink-0 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold text-zinc-200"
              >
                {college.name}
              </span>
            ))}
          </div>
        </div>

        <div className="hidden">

          {colleges.map((college) => (

            <div
              key={college.id}
              className="bg-[#111111] border border-[#222222] rounded-3xl overflow-hidden"
            >

              <img
                src={college.image}
                alt={college.name}
                className="h-52 w-full object-cover"
              />

              <div className="p-5">

                <h3 className="text-xl font-bold text-white mb-2">
                  {college.name}
                </h3>

                <p className="text-zinc-500 text-sm mb-5">
                  {college.location}
                </p>

                <div className="space-y-3">

                  <div className="flex justify-between">
                    <span className="text-zinc-500">
                      Rank
                    </span>

                    <span className="text-green-400 font-semibold">
                      #{college.nirfRank}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">
                      Package
                    </span>

                    <span className="text-violet-400 font-semibold">
                      {college.avgPackage}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">
                      Fees
                    </span>

                    <span className="text-orange-400 font-semibold">
                      ₹{college.fees?.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">
                      Rating
                    </span>

                    <span className="text-emerald-400 font-semibold">
                      {college.rating}
                    </span>
                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>
                <div className="grid md:grid-cols-3 gap-6 mb-12">

          <div className="luxe-surface rounded-3xl p-4 md:p-6 overflow-x-auto">

            <p className="text-zinc-500 mb-3">
              Best Rank
            </p>

            <h3 className="text-2xl font-black text-green-400">
              {getBestRank()?.name}
            </h3>

          </div>

          <div className="luxe-surface rounded-3xl p-4 md:p-6 overflow-x-auto">

            <p className="text-zinc-500 mb-3">
              Best Package
            </p>

            <h3 className="text-2xl font-black text-violet-400">
              {getBestPackage()?.name}
            </h3>

          </div>

          <div className="luxe-surface rounded-3xl p-6">

            <p className="text-zinc-500 mb-3">
              Lowest Fees
            </p>

            <h3 className="text-2xl font-black text-orange-400">
              {getLowestFees()?.name}
            </h3>

          </div>

        </div>

        <div className="mb-8">

          <h2 className="text-3xl font-black text-white mb-2">
            Detailed Breakdown
          </h2>

          <p className="text-zinc-500">
            Compare every important metric side-by-side
          </p>

        </div>

        <div className="md:hidden mb-10">
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
              Swipe sideways
            </p>
            <p className="text-xs font-semibold text-zinc-500">
              {colleges.length} colleges
            </p>
          </div>
          <div className="compare-dock-scroll flex max-w-full snap-x gap-4 overflow-x-auto pb-3">
            {colleges.map((college) => (
              <article
                key={college.id}
                className="luxe-surface luxe-card w-[82vw] max-w-[330px] shrink-0 snap-start rounded-[28px] p-4"
              >
                <img
                  src={college.image}
                  alt={college.name}
                  className="h-36 w-full rounded-2xl object-cover"
                />
                <h3 className="mt-4 text-xl font-black leading-6 text-white">
                  {college.name}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-zinc-500">
                  <MapPin className="h-3.5 w-3.5 text-emerald-300" />
                  {college.location}
                </p>
                <div className="mt-5 space-y-3">
                  <MobileMetric label="Fees" value={`Rs. ${college.fees?.toLocaleString("en-IN")}`} tone="text-orange-300" />
                  <MobileMetric label="Avg Package" value={college.avgPackage} tone="text-violet-300" />
                  <MobileMetric label="NIRF Rank" value={`#${college.nirfRank}`} tone="text-green-300" />
                  <MobileMetric label="Ownership" value={college.ownership || "-"} tone="text-white" />
                  <MobileMetric label="Exam" value={college.examsAccepted.length > 0 ? college.examsAccepted.join(", ") : "-"} tone="text-white" />
                  <MobileMetric label="Highest" value={college.highestPackage || "-"} tone="text-cyan-300" />
                  <MobileMetric label="Rating" value={String(college.rating)} tone="text-emerald-300" />
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="luxe-surface hidden overflow-x-auto rounded-3xl md:block">

    <table className="w-full min-w-[760px] text-left text-sm md:text-xl">

            <thead>

              <tr className="bg-[#171717]">

                <th className="p-6 text-white">
                  Attribute
                </th>

                {colleges.map((college) => (

                  <th
                    key={college.id}
                    className="p-6 text-white"
                  >
                    {college.name}
                  </th>

                ))}

              </tr>

            </thead>

            <tbody>

              <tr className="border-t border-[#222222]">

                <td className="p-6 text-zinc-400">
                  Location
                </td>

                {colleges.map((college) => (

                  <td
                    key={college.id}
                    className="p-6 text-white"
                  >
                    {college.location}
                  </td>

                ))}

              </tr>

              <tr className="border-t border-[#222222]">

                <td className="p-6 text-zinc-400">
                  Fees
                </td>

                {colleges.map((college) => (

                  <td
                    key={college.id}
                    className="p-6 text-orange-400 font-bold"
                  >
                    ₹{college.fees?.toLocaleString()}
                  </td>

                ))}

              </tr>

              <tr className="border-t border-[#222222]">

                <td className="p-6 text-zinc-400">
                  Avg Package
                </td>

                {colleges.map((college) => (

                  <td
                    key={college.id}
                    className="p-6 text-violet-400 font-bold"
                  >
                    {college.avgPackage}
                  </td>

                ))}

              </tr>

              <tr className="border-t border-[#222222]">

                <td className="p-6 text-zinc-400">
                  NIRF Rank
                </td>

                {colleges.map((college) => (

                  <td
                    key={college.id}
                    className="p-6 text-green-400 font-bold"
                  >
                    #{college.nirfRank}
                  </td>

                ))}

              </tr>

              <tr className="border-t border-[#222222]">

                <td className="p-6 text-zinc-400">
                  Ownership
                </td>

                {colleges.map((college) => (

                  <td
                    key={college.id}
                    className="p-6 text-white"
                  >
                    {college.ownership || "-"}
                  </td>

                ))}

              </tr>
                            <tr className="border-t border-[#222222]">

                <td className="p-6 text-zinc-400">
                  Exam Accepted
                </td>

                {colleges.map((college) => (

                  <td
                    key={college.id}
                    className="p-6 text-white"
                  >
                    {college.examsAccepted.length > 0 ? college.examsAccepted.join(", ") : "-"}
                  </td>

                ))}

              </tr>

              <tr className="border-t border-[#222222]">

                <td className="p-6 text-zinc-400">
                  Highest Package
                </td>

                {colleges.map((college) => (

                  <td
                    key={college.id}
                    className="p-6 text-cyan-400 font-bold"
                  >
                    {college.highestPackage || "-"}
                  </td>

                ))}

              </tr>

              <tr className="border-t border-[#222222]">

                <td className="p-6 text-zinc-400">
                  Rating
                </td>

                {colleges.map((college) => (

                  <td
                    key={college.id}
                    className="p-6 text-emerald-400 font-bold"
                  >
                    {college.rating}
                  </td>

                ))}

              </tr>

            </tbody>

          </table>

        </div>

        <div className="mt-14 mb-8">

          <h2 className="text-3xl font-black text-white mb-2">
            Analytics
          </h2>

          <p className="text-zinc-500">
            Compare placement outcomes and fee structure
          </p>

        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          <div className="luxe-surface rounded-3xl p-6">

            <h3 className="text-xl font-bold text-white mb-6">
              Average Package Comparison
            </h3>

            <div className="h-[320px] min-w-[340px] sm:min-w-[420px]">

            <ResponsiveContainer width="100%" height={300}>

                <BarChart
                  data={colleges.map((college) => ({
                    name: college.name,
                    value: parseFloat(
                      String(college.avgPackage).replace(
                        /[^0-9.]/g,
                        ""
                      )
                    ),
                  }))}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#262626"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#888"
                  />

                  <YAxis
                    stroke="#888"
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill="#8b5cf6"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

          <div className="luxe-surface rounded-3xl p-4 md:p-6 overflow-x-auto">

            <h3 className="text-xl font-bold text-white mb-6">
              Annual Fees Comparison
            </h3>

            <div className="h-[320px] min-w-[340px] sm:min-w-[420px]">

            <ResponsiveContainer width="100%" height={300}>

                <BarChart
                  data={colleges.map((college) => ({
                    name: college.name,
                    value: college.fees,
                  }))}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#262626"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#888"
                  />

                  <YAxis
                    stroke="#888"
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill="#f97316"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-white/10 bg-[#080b12]/92 shadow-[0_-24px_90px_rgba(0,0,0,0.68),0_0_55px_rgba(37,99,235,0.18)] backdrop-blur-2xl">
          <button
            type="button"
            onClick={() => setIsDockOpen((value) => !value)}
            className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
            aria-expanded={isDockOpen}
          >
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-300">
                Compare dock
              </p>
              <div className="mt-1 flex min-w-0 items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-2xl bg-emerald-400/10 text-sm font-black text-emerald-200">
                  {colleges.length}
                </span>
                <p className="truncate text-sm font-bold text-white sm:text-base">
                  {colleges.map((college) => college.name).join(" vs ")}
                </p>
              </div>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-zinc-200">
              {isDockOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </span>
          </button>

          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${
              isDockOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="compare-dock-scroll flex max-h-[52vh] gap-3 overflow-x-auto overflow-y-hidden border-t border-white/10 px-4 pb-4 pt-1 sm:px-5">
                {colleges.map((college) => (
                  <article
                    key={college.id}
                    className="luxe-card w-[280px] shrink-0 rounded-3xl border border-white/10 bg-white/[0.055] p-3 shadow-[0_16px_45px_rgba(0,0,0,0.34)]"
                  >
                    <div className="flex gap-3">
                      <img
                        src={college.image}
                        alt={college.name}
                        className="h-20 w-24 shrink-0 rounded-2xl object-cover"
                      />
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-sm font-black leading-5 text-white">
                          {college.name}
                        </h3>
                        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-zinc-400">
                          <MapPin className="h-3 w-3 text-emerald-300" />
                          {college.location}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-zinc-400">
                          <Star className="h-3 w-3 text-yellow-300" />
                          {college.rating}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-2xl bg-black/25 px-2 py-2">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">Rank</p>
                        <p className="mt-1 text-xs font-black text-green-300">#{college.nirfRank}</p>
                      </div>
                      <div className="rounded-2xl bg-black/25 px-2 py-2">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">Package</p>
                        <p className="mt-1 truncate text-xs font-black text-violet-300">{college.avgPackage}</p>
                      </div>
                      <div className="rounded-2xl bg-black/25 px-2 py-2">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">Fees</p>
                        <p className="mt-1 text-xs font-black text-orange-300">
                          Rs. {college.fees?.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm font-semibold text-zinc-500">{label}</span>
      <span className={`max-w-[58%] text-right text-sm font-black ${tone}`}>
        {value}
      </span>
    </div>
  );
}
