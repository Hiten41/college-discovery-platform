"use client";

import Link from "next/link";
import { ExternalLink, Eye, MapPin, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface SavedCollege {
  id: string;
  college: {
    id: string;
    name: string;
    image: string | null;
    location: string;
    fees: number | null;
    avgPackage: string | null;
    highestPackage: string | null;
    nirfRank: number | null;
    rating: number | null;
    ownership: string | null;
    examsAccepted: string[];
    website: string | null;
  };
}

function formatFees(fees: number | null) {
  if (fees === null) return "N/A";
  return `Rs. ${fees.toLocaleString("en-IN")}`;
}

function formatValue(value: string | number | null) {
  if (value === null || value === "") return "N/A";
  return value;
}

export default function SavedCollegesPage() {
  const [loading, setLoading] = useState(true);
  const [savedColleges, setSavedColleges] = useState<SavedCollege[]>([]);

  useEffect(() => {
    const fetchSavedColleges = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "null");

      if (!user) {
        window.location.href = "/login";
        return;
      }

      try {
        const res = await fetch(`/api/saved-colleges/${user.id}`);
        const data = await res.json();

        setSavedColleges(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedColleges();
  }, []);

  async function removeSavedCollege(id: string) {
    await fetch(`/api/saved-colleges/${id}`, {
      method: "DELETE",
    });

    setSavedColleges((current) =>
      current.filter((college) => college.id !== id),
    );
  }

  if (loading) {
    return (
      <div className="premium-depth-root min-h-screen flex items-center justify-center text-white text-3xl font-bold">
        Loading Saved Colleges...
      </div>
    );
  }

  return (
    <div className="premium-depth-root min-h-screen text-white px-5 py-8 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="luxe-surface luxe-section mb-10 rounded-[36px] p-7 md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300">
                Saved Dashboard
              </p>

              <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                Saved Colleges
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
                Review your shortlisted colleges with rankings, fees, placements,
                exams, and official website links in one place.
              </p>
            </div>

            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4 shadow-[0_18px_48px_rgba(34,197,94,0.12)]">
              <p className="text-sm font-semibold text-zinc-400">Total Saved</p>
              <p className="text-3xl font-black text-green-300">
                {savedColleges.length}
              </p>
            </div>
          </div>
        </div>

        {savedColleges.length === 0 ? (
          <div className="luxe-surface rounded-[32px] p-10 text-center">
            <h2 className="mb-4 text-3xl font-black">No Saved Colleges</h2>
            <p className="text-gray-400">
              Save colleges from the homepage to see them here.
            </p>
          </div>
        ) : (
          <div className="grid gap-7 lg:grid-cols-2">
            {savedColleges.map((item) => {
              const college = item.college;
              const exams =
                college.examsAccepted.length > 0
                  ? college.examsAccepted.join(", ")
                  : "N/A";

              return (
                <article
                  key={item.id}
                  className="luxe-surface luxe-card overflow-hidden rounded-[32px]"
                >
                  {college.image ? (
                    // Stored college images may come from different external hosts.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={college.image}
                      alt=""
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div className="h-56 w-full bg-gradient-to-br from-green-500/20 via-zinc-900 to-black" />
                  )}

                  <div className="p-6 md:p-7">
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-2xl font-black leading-tight md:text-3xl">
                          {college.name}
                        </h2>

                        <p className="mt-3 flex items-center gap-2 text-zinc-400">
                          <MapPin className="h-4 w-4 text-green-300" />
                          {college.location}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-green-300">
                        <Star className="h-4 w-4 fill-green-300" />
                        <span className="font-black">
                          {formatValue(college.rating)}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Metric label="NIRF rank" value={college.nirfRank ? `#${college.nirfRank}` : "N/A"} />
                      <Metric label="Average package" value={formatValue(college.avgPackage)} />
                      <Metric label="Highest package" value={formatValue(college.highestPackage)} />
                      <Metric label="Fees" value={formatFees(college.fees)} />
                      <Metric label="Ownership" value={formatValue(college.ownership)} />
                      <Metric label="Website" value={college.website ? "Available" : "N/A"} />
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/5 bg-black/20 p-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Exams Accepted
                      </p>
                      <p className="text-sm font-semibold leading-6 text-zinc-200">
                        {exams}
                      </p>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <Link
                        href={`/college/${college.id}`}
                        className="luxe-button inline-flex items-center justify-center gap-2 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm font-black text-green-300 hover:bg-green-500/15"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>

                      <a
                        href={college.website || undefined}
                        target="_blank"
                        rel="noreferrer"
                        aria-disabled={!college.website}
                        className={`luxe-button inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black ${
                          college.website
                            ? "border-green-500/20 bg-green-500/10 text-green-300 hover:bg-green-500/15"
                            : "pointer-events-none border-white/5 bg-white/5 text-zinc-600"
                        }`}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Visit Website
                      </a>

                      <button
                        onClick={() => removeSavedCollege(item.id)}
                        className="luxe-button inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 text-sm font-black text-black shadow-[0_12px_32px_rgba(34,197,94,0.24)] hover:from-green-400 hover:to-emerald-400"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="text-base font-black text-white">{value}</p>
    </div>
  );
}
