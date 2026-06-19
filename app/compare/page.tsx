"use client";

import { useState } from "react";
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
  <div className="min-h-screen bg-[#080808] relative overflow-hidden">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">

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

          <div className="bg-[#111111] border border-[#222222] rounded-3xl p-4 md:p-6 overflow-x-auto">

            <p className="text-zinc-500 mb-3">
              Best Rank
            </p>

            <h3 className="text-2xl font-black text-green-400">
              {getBestRank()?.name}
            </h3>

          </div>

          <div className="bg-[#111111] border border-[#222222] rounded-3xl p-6">

            <p className="text-zinc-500 mb-3">
              Best Package
            </p>

            <h3 className="text-2xl font-black text-violet-400">
              {getBestPackage()?.name}
            </h3>

          </div>

          <div className="bg-[#111111] border border-[#222222] rounded-3xl p-6">

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

        <div className="overflow-x-auto rounded-3xl border border-[#222222] bg-[#111111]">

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

          <div className="bg-[#111111] border border-[#222222] rounded-3xl p-6">

            <h3 className="text-xl font-bold text-white mb-6">
              Average Package Comparison
            </h3>

            <div className="h-[320px] min-w-[420px]">

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

          <div className="bg-[#111111] border border-[#222222] rounded-3xl p-4 md:p-6 overflow-x-auto">

            <h3 className="text-xl font-bold text-white mb-6">
              Annual Fees Comparison
            </h3>

            <div className="h-[320px] min-w-[420px]">

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
    </div>
  );
}
