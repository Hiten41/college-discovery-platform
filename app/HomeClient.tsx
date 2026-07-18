"use client"
import { motion } from "framer-motion"
import type { KeyboardEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../components/Navbar"
import CollegeCard from "../components/CollegeCard"
import { normalizeStoredCompareColleges } from "@/lib/compareStorage"
type College = {
  id: string

  name: string
  location: string
  state: string | null

 fees: number
avgPackage: string
nirfRank: number
rating: number
 
highestPackage?: string | null
  image: string

  ownership: string | null

  examsAccepted: string[]

  description: string | null

  website: string | null

  establishedYear: number | null

  accreditation: string | null
}

type HomeClientProps = {
  initialColleges: College[]
}

export default function HomeClient({ initialColleges }: HomeClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  
 const heroSlides = [
  {
    title: "Everything You Need To Choose A College",
    subtitle: "Compare, evaluate and discover colleges with confidence.",
  },
  {
    title: "Compare India's Top Colleges",
    subtitle: "Rankings, placements and fees in one place.",
  },
  {
    title: "Find Better Placements & Packages",
    subtitle: "Analyze placement trends and salary outcomes.",
  },
  {
    title: "Make Data-Driven Career Decisions",
    subtitle: "Choose colleges using real metrics and insights.",
  },
]

const [displayText, setDisplayText] = useState("")
const [textIndex, setTextIndex] = useState(0)
  const router = useRouter()
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [colleges, setColleges] = useState<College[]>(initialColleges)
  const [loading, setLoading] = useState(false)
const [aiQuery, setAiQuery] = useState("")
 
  const [selectedState, setSelectedState] = useState("")
const [selectedOwnership, setSelectedOwnership] = useState("")
const [selectedExam, setSelectedExam] = useState("")
const [maxRank, setMaxRank] = useState(200)
  const [activeTab, setActiveTab] = useState("Popular")
  const [maxFees, setMaxFees] = useState(2500000)
  

  const [compareColleges, setCompareColleges] = useState<College[]>([])
useEffect(() => {
  const loadCompareColleges = () => {
    const stored = normalizeStoredCompareColleges(
      JSON.parse(
        localStorage.getItem("compareColleges") || "[]"
      )
    );

    setCompareColleges(stored as College[]);
  };

  loadCompareColleges();

  window.addEventListener("pageshow", loadCompareColleges);

  return () => {
    window.removeEventListener("pageshow", loadCompareColleges);
  };
}, []);
  const didSkipInitialFetchRef = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])
  useEffect(() => {
    const hasInitial = Array.isArray(initialColleges) && initialColleges.length > 0
    const noFilters =
  !debouncedSearch.trim() &&
  !selectedState.trim() &&
  !selectedOwnership.trim() &&
  !selectedExam.trim()

    if (!didSkipInitialFetchRef.current && hasInitial && noFilters) {
      didSkipInitialFetchRef.current = true
      return
    }

    didSkipInitialFetchRef.current = true

    const fetchColleges = async () => {
      setLoading(true)

      try {
        const params = new URLSearchParams()

        if (debouncedSearch.trim()) {
          params.set("search", debouncedSearch)
        }

      if (selectedState.trim()) {
  params.set("state", selectedState)
}

if (selectedOwnership.trim()) {
  params.set("ownership", selectedOwnership)
}

if (selectedExam.trim()) {
  params.set("exam", selectedExam)
}

params.set("maxFees", String(maxFees))

params.set("maxRank", String(maxRank))

        const queryString = params.toString()

        const url = queryString ? `/api/colleges?${queryString}` : "/api/colleges"

        const response = await fetch(url)

if (!response.ok) {
  throw new Error("Failed to fetch colleges")
}

const data = await response.json()

if (Array.isArray(data)) {
  setColleges(data)
}
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchColleges()
 }, [
  debouncedSearch,
  selectedState,
  selectedOwnership,
  selectedExam,
  maxFees,
  maxRank,
  initialColleges,
])
const handleAiSearch = async () => {
  if (!aiQuery.trim()) return;

  try {
    setLoading(true);

    const response = await fetch("/api/ai-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: aiQuery,
      }),
    });

    const data = await response.json();

    console.log("AI RESPONSE:", data);

    if (!data.response) {
      alert("No response returned from AI");
      return;
    }

   const cleanedResponse = data.response
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

const filters = JSON.parse(cleanedResponse);

    if (filters.state) {
      setSelectedState(filters.state);
    }

    if (filters.ownership) {
      setSelectedOwnership(filters.ownership);
    }

    if (filters.exam) {
      setSelectedExam(filters.exam);
    }

    if (filters.maxFees) {
      setMaxFees(filters.maxFees);
    }
  } catch (error) {
    console.error("AI SEARCH ERROR:", error);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  const currentText = heroSlides[textIndex].title

  let index = 0
  let deleting = false

  const interval = setInterval(() => {
    if (!deleting) {
      setDisplayText(currentText.slice(0, index + 1))

      index++

      if (index > currentText.length) {
        deleting = true
      }
    } else {
      setDisplayText(currentText.slice(0, index - 1))

      index-=2

      if (index <= 0) {
        clearInterval(interval)

        setTextIndex((prev) =>
          prev === heroSlides.length - 1 ? 0 : prev + 1
        )
      }
    }
  }, deleting ? 35 : 115)

  return () => clearInterval(interval)
}, [textIndex])

  function handleCompare(college: College) {
    const alreadyAdded = compareColleges.find((item) => item.id === college.id)
    if (alreadyAdded) return

    if (compareColleges.length >= 3) return

   const updated = [
  ...compareColleges,
  college,
]

setCompareColleges(updated)

localStorage.setItem(
  "compareColleges",
  JSON.stringify(normalizeStoredCompareColleges(updated))
)
  }

  function removeCollege(id: string) {
    setCompareColleges(compareColleges.filter((college) => college.id !== id))
  }

  function extractFees(fees: string | number) {
    if (typeof fees === "number") {
      return fees
    }

    return parseInt(fees.replace(/[^0-9]/g, ""))
  }

  function getHighestPackage() {
    if (compareColleges.length === 0) return 0

    return Math.max(
      ...compareColleges.map((college) =>
        parseFloat(college.avgPackage.replace(/[^0-9.]/g, ""))
      )
    )
  }

  

  function resetFilters() {
    setSearchTerm("")

setSelectedState("")

setSelectedOwnership("")

setSelectedExam("")

setMaxFees(2500000)

setMaxRank(200)



    if (Array.isArray(initialColleges) && initialColleges.length > 0) {
      setColleges(initialColleges)
      setLoading(false)
    }
  }

  function scrollToCollegeResults() {
    document
      .getElementById("colleges")
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return

    event.preventDefault()
    setDebouncedSearch(searchTerm)
    requestAnimationFrame(scrollToCollegeResults)
  }

  function handleExploreColleges() {
    setDebouncedSearch(searchTerm)
    scrollToCollegeResults()
  }

  const filteredColleges = Array.isArray(colleges)
    ? colleges.filter((college) => {
        const matchesSearch = true
        const matchesLocation = true

        const feesValue = extractFees(college.fees)

        const matchesFees =
          (Number.isFinite(feesValue) ? feesValue : Number.POSITIVE_INFINITY) <=
          maxFees

        

        return matchesSearch && matchesLocation && matchesFees
      })
    : []

  if (activeTab === "Highest") {
    filteredColleges.sort(
      (a, b) =>
        parseFloat(b.avgPackage.replace(/[^0-9.]/g, "")) -
        parseFloat(a.avgPackage.replace(/[^0-9.]/g, ""))
    )
  }

  if (activeTab === "Ranked") {
    filteredColleges.sort((a, b) => a.nirfRank - b.nirfRank)
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#030409]"
      style={{
        backgroundColor: "#030409",
        backgroundImage:
          "radial-gradient(circle at 16% 8%, rgba(37, 99, 235, 0.11), transparent 34%), radial-gradient(circle at 84% 18%, rgba(124, 58, 237, 0.15), transparent 30%), radial-gradient(circle at 22% 68%, rgba(236, 72, 153, 0.075), transparent 34%), radial-gradient(circle at 78% 92%, rgba(37, 99, 235, 0.08), transparent 40%), linear-gradient(180deg, #030409 0%, #050615 45%, #030409 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 14% 12%, rgba(37, 99, 235, 0.12), transparent 30%), radial-gradient(circle at 86% 22%, rgba(124, 58, 237, 0.17), transparent 30%), radial-gradient(circle at 18% 76%, rgba(236, 72, 153, 0.07), transparent 28%), radial-gradient(circle at 82% 86%, rgba(37, 99, 235, 0.08), transparent 34%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-40 -top-40 z-0 h-[520px] w-[520px] rounded-full bg-blue-600/10 blur-[160px] md:h-[760px] md:w-[760px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -right-40 top-24 z-0 h-[500px] w-[500px] rounded-full bg-violet-600/18 blur-[160px] md:h-[720px] md:w-[720px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-44 left-1/4 z-0 h-[520px] w-[520px] rounded-full bg-pink-500/8 blur-[170px] md:h-[760px] md:w-[760px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.38) 0 0.65px, transparent 1px), radial-gradient(circle, rgba(167,139,250,0.28) 0 0.55px, transparent 1px), radial-gradient(circle, rgba(147,197,253,0.24) 0 0.55px, transparent 1px)",
          backgroundSize: "150px 150px, 230px 230px, 310px 310px",
          backgroundPosition: "18px 34px, 92px 118px, 170px 56px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,4,9,0.12) 0%, rgba(3,4,9,0.34) 100%), radial-gradient(ellipse at center, transparent 0%, rgba(3,4,9,0.42) 78%)",
        }}
      />
      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <motion.section
  initial={{ opacity: 0, y: 28, scale: 0.985 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
  className="premium-hero-shell relative overflow-hidden rounded-[28px] md:rounded-[40px] border border-[#1f1f1f] bg-gradient-to-br from-[#07120c]/95 via-[#08090f]/95 to-[#040507]/95 p-6 sm:p-8 md:p-16 mb-10 md:mb-14"
>
 <div className="premium-aurora" />
 <div className="premium-particles" />
 <div className="absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full bg-green-500/18 blur-[140px]" />
 <div className="absolute bottom-0 left-0 h-[280px] w-[280px] rounded-full bg-blue-600/10 blur-[120px]" />
  <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">

    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >

      <div className="inline-flex items-center px-5 py-2 rounded-full border border-green-500/20 bg-green-500/10 text-green-300 font-semibold mb-8 shadow-[0_0_40px_rgba(34,197,94,0.12)] backdrop-blur-xl">
        College Discovery Platform
      </div>

   <h1 className="
text-4xl
sm:text-5xl
md:text-7xl
font-black
leading-tight
bg-gradient-to-r
from-white
via-cyan-200
to-blue-500
bg-clip-text
text-transparent
min-h-[132px]
sm:min-h-[150px]
md:min-h-[180px]
">
  {displayText}
</h1>

    <p className="text-zinc-200 text-base sm:text-xl md:text-2xl mb-8 max-w-2xl leading-relaxed">
  {heroSlides[textIndex].subtitle}
</p>



<input
  type="text"
  placeholder="Search colleges..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  onKeyDown={handleSearchKeyDown}
  className="luxe-input w-full bg-black/40 border border-white/10 text-white px-5 sm:px-6 py-4 sm:py-5 rounded-2xl mb-6 backdrop-blur-xl outline-none transition focus:border-green-400/50"
/>

      <div className="flex flex-wrap gap-4">

        <button
          onClick={handleExploreColleges}
          className="luxe-button w-full sm:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-black shadow-[0_18px_55px_rgba(34,197,94,0.24)]"
        >
          Explore Colleges
        </button>

        <button
          onClick={() =>
            document
              .getElementById("compare")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="luxe-button w-full sm:w-auto px-6 py-4 rounded-2xl border border-white/10 bg-white/[0.035] text-white font-bold hover:border-green-500/40 backdrop-blur-xl"
        >
          Compare Colleges
        </button>

      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-xl">
        {[
          ["150+", "Institutions"],
          ["AI", "Guidance"],
          ["3-way", "Compare"],
        ].map(([value, label], index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 + index * 0.08, duration: 0.5 }}
            className="premium-panel rounded-2xl px-4 py-3"
          >
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
          </motion.div>
        ))}
      </div>

    </motion.div>

   <div className="hidden lg:block">

  <motion.div
    initial={{ opacity: 0, rotateY: -8, y: 24 }}
    animate={{ opacity: 1, rotateY: 0, y: 0 }}
    transition={{ delay: 0.22, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    className="premium-panel relative overflow-hidden rounded-[36px] p-8"
  >

    <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-500" />

    <div className="flex items-center justify-between mb-8">

      <div>

        <p className="text-green-300 text-sm font-semibold tracking-wide mb-2">
          TOP RANKED COLLEGES
        </p>

        <h3 className="text-3xl font-extrabold tracking-tight text-white">
        India&#39;s Best Institutions
        </h3>

      </div>

      <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm font-semibold">
        NIRF
      </div>

    </div>

    <div className="space-y-4">

      <div className="flex items-center justify-between border-b border-white/5 pb-4">

        <div>
          <p className="text-white font-semibold">
            IIT Madras
          </p>
          <p className="text-zinc-500 text-sm">
            Chennai
          </p>
        </div>

        <span className="text-green-300 font-bold">
          #1
        </span>

      </div>

      <div className="flex items-center justify-between border-b border-white/5 pb-4">

        <div>
          <p className="text-white font-semibold">
            IIT Delhi
          </p>
          <p className="text-zinc-500 text-sm">
            Delhi
          </p>
        </div>

        <span className="text-green-300 font-bold">
          #2
        </span>

      </div>

      <div className="flex items-center justify-between border-b border-white/5 pb-4">

        <div>
          <p className="text-white font-semibold">
            IIT Bombay
          </p>
          <p className="text-zinc-500 text-sm">
            Mumbai
          </p>
        </div>

        <span className="text-green-300 font-bold">
          #3
        </span>

      </div>

      <div className="flex items-center justify-between">

        <div>
          <p className="text-white font-semibold">
            IIT Kanpur
          </p>
          <p className="text-zinc-500 text-sm">
            Uttar Pradesh
          </p>
        </div>

        <span className="text-green-300 font-bold">
          #4
        </span>

      </div>

    </div>

  </motion.div>

</div>

  </div>
</motion.section>
<div className="mb-16">

 
  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

<div className="premium-panel group relative overflow-hidden rounded-[28px] p-6 md:p-8 transition-all duration-500 hover:-translate-y-2 hover:border-green-500/40 hover:shadow-[0_20px_80px_rgba(34,197,94,0.18)]">

  <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-500" />

  <div className="flex items-start justify-between mb-8">

    <div>

      <h3 className="text-2xl md:text-[2rem] font-extrabold tracking-[-0.03em] text-white mb-4">
        College Comparison
      </h3>

      <p className="text-zinc-300 text-[16px] font-medium leading-7 max-w-[90%]">
        Compare placements, fees, rankings and ratings side by side before making a decision.
      </p>

    </div>

    <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm font-semibold tracking-wide">
      Compare
    </div>

  </div>

  <div className="border-t border-white/5 pt-5 flex items-center justify-between">

    <span className="
text-zinc-300
text-xl
leading-relaxed
max-w-2xl
">
      Up to 3 colleges
    </span>

  </div>

</div>

  <div className="premium-panel group relative overflow-hidden rounded-[28px] p-6 md:p-8 transition-all duration-500 hover:-translate-y-2 hover:border-green-500/40 hover:shadow-[0_20px_80px_rgba(34,197,94,0.18)]">

  <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-500" />

  <div className="flex items-start justify-between mb-8">

    <div>

      <h3 className="text-2xl md:text-[2rem] font-extrabold tracking-[-0.03em] text-white mb-4">
        Placement Insights
      </h3>

      <p className="text-zinc-300 text-[16px] font-medium leading-7 max-w-[90%]">
        Explore average packages, placement performance and career outcomes.
      </p>

    </div>

    <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm font-semibold tracking-wide">
      Insights
    </div>

  </div>

  <div className="border-t border-white/5 pt-5 flex items-center justify-between">

    <span className="text-zinc-400 text-sm font-medium">
      Placement Data
    </span>

  </div>

</div>

  <div className="premium-panel group relative overflow-hidden rounded-[28px] p-6 md:p-8 transition-all duration-500 hover:-translate-y-2 hover:border-green-500/40 hover:shadow-[0_20px_80px_rgba(34,197,94,0.18)]">

  <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-500" />

  <div className="flex items-start justify-between mb-8">

    <div>

      <h3 className="text-2xl md:text-[2rem] font-extrabold tracking-[-0.03em] text-white mb-4">
        NIRF Rankings
      </h3>

      <p className="text-zinc-300 text-[16px] font-medium leading-7 max-w-[90%]">
        Discover institutions using verified national ranking information.
      </p>

    </div>

    <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm font-semibold tracking-wide">
      Rankings
    </div>

  </div>

  <div className="border-t border-white/5 pt-5 flex items-center justify-between">

    <span className="text-zinc-400 text-sm font-medium">
      Official Data
    </span>

  </div>

</div>

    <div className="premium-panel group relative overflow-hidden rounded-[28px] p-6 md:p-8 transition-all duration-500 hover:-translate-y-2 hover:border-green-500/40 hover:shadow-[0_20px_80px_rgba(34,197,94,0.18)]">

  <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-500" />

  <div className="flex items-start justify-between mb-8">

    <div>

      <h3 className="text-2xl md:text-[2rem] font-extrabold tracking-[-0.03em] text-white mb-4">
        Smart Discovery
      </h3>

      <p className="text-zinc-300 text-[16px] font-medium leading-7 max-w-[90%]">
        Search, filter and discover colleges faster with intelligent tools.
      </p>

    </div>

    <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm font-semibold tracking-wide">
      Search
    </div>

  </div>

  <div className="border-t border-white/5 pt-5 flex items-center justify-between">

    <span className="text-zinc-400 text-sm font-medium">
      Fast Results
    </span>

  </div>

</div>

  </div>

</div>
<div id="compare">
  {compareColleges.length > 0 && (
    <div className="premium-panel mb-16 relative overflow-hidden rounded-[28px] md:rounded-[36px] p-5 md:p-8">

      <div className="flex items-center justify-between mb-10">

        <div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3">
            Compare Colleges
          </h2>

          <p className="text-gray-500 text-base md:text-lg">
            Side-by-side analysis of selected colleges
          </p>
        </div>

        <div className="flex items-center gap-4">
<div className="flex items-center gap-4">

  <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-5 py-3 rounded-2xl font-bold">
    {compareColleges.length} Selected
  </div>

  <button
    onClick={() => {
      localStorage.setItem(
        "compareColleges",
        JSON.stringify(normalizeStoredCompareColleges(compareColleges))
      )

     router.push("/compare")
    }}
    className="luxe-button px-5 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-black"
  >
    View Detailed Comparison
  </button>

</div>

 

</div>

      </div>

      <div className="flex max-w-full snap-x gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:pb-0 lg:grid-cols-3">

        {compareColleges.map((college) => (

          <div
            key={college.id}
            className="luxe-surface luxe-card w-[82vw] max-w-[340px] shrink-0 snap-start overflow-hidden rounded-[32px] md:w-auto md:max-w-none"
          >

            <img
              src={college.image}
              alt=""
              className="h-52 w-full object-cover"
            />

            <div className="p-6">

              <h3 className="text-2xl font-black text-white mb-4">
                {college.name}
              </h3>

              <div className="space-y-4 mb-6">

                <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
                  <span className="text-gray-500">Location</span>
                  <span className="text-white font-bold">
                    {college.location}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
                  <span className="text-gray-500">Avg Package</span>
                  <span
                    className={`font-bold ${
                      parseFloat(
                        college.avgPackage.replace(/[^0-9.]/g, "")
                      ) === getHighestPackage()
                        ? "text-green-400"
                        : "text-white"
                    }`}
                  >
                    {college.avgPackage}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
                  <span className="text-gray-500">NIRF Rank</span>
                  <span className="text-white font-bold">
                    #{college.nirfRank}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
                  <span className="text-gray-500">Fees</span>
                  <span className="text-white font-bold">
                    ₹{college.fees.toLocaleString()}
                  </span>
                </div>
<div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
  <span className="text-gray-500">
    Ownership
  </span>

  <span className="text-white font-bold">
    {college.ownership}
  </span>
</div>
<div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
  <span className="text-gray-500">
    Exam
  </span>

  <span className="text-white font-bold">
    {college.examsAccepted.length > 0 ? college.examsAccepted.join(", ") : "N/A"}
  </span>
</div>
<div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
  <span className="text-gray-500">
    Highest Package
  </span>

  <span className="text-green-400 font-bold">
    {college.highestPackage || "-"}
  </span>
</div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Rating</span>
                  <span className="text-green-400 font-bold">
                    {college.rating}
                  </span>
                </div>

              </div>

       <div className="flex justify-center mt-4">
  <button
    onClick={() => removeCollege(college.id)}
    className="
px-6 py-3
rounded-xl
bg-gradient-to-r
from-green-500
to-emerald-600
hover:from-green-400
hover:to-emerald-500
text-black
font-semibold
text-base
transition-all
duration-300
shadow-lg
shadow-green-900/40
hover:scale-105
"
  >
    Remove
  </button>
</div>

            </div>

          </div>

        ))}

      </div>

    </div>
  )}
</div>
        {/* CARDS */}

        <div id="colleges" className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 scroll-mt-28">
          <div className="h-fit lg:sticky lg:top-28">
          <div className="premium-panel relative overflow-hidden rounded-[28px] md:rounded-[32px] p-6 md:p-8">
            <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-500" />
              <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-[2rem] font-extrabold tracking-tight text-white">
  Discover
</h2>

                <button
                  onClick={resetFilters}
                  className="luxe-button px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 font-semibold hover:bg-green-500/15"
                >
                  Reset
                </button>
              </div>

             <div className="space-y-8">

  {/* STATE */}

  <div>
    <p className="text-zinc-300 mb-4 text-sm uppercase tracking-wider font-semibold">
      State
    </p>

    <select
      value={selectedState}
      onChange={(e) => setSelectedState(e.target.value)}
      className="luxe-input w-full bg-black/35 border border-white/10 text-white px-5 py-4 rounded-2xl outline-none focus:border-green-500"
    >
      <option value="">All States</option>

      <option value="Delhi">Delhi</option>
      <option value="Tamil Nadu">Tamil Nadu</option>
      <option value="Maharashtra">Maharashtra</option>
      <option value="Karnataka">Karnataka</option>
      <option value="Telangana">Telangana</option>
      <option value="Rajasthan">Rajasthan</option>
      <option value="Punjab">Punjab</option>
      <option value="Uttar Pradesh">Uttar Pradesh</option>
      <option value="West Bengal">West Bengal</option>
    </select>
  </div>

  {/* OWNERSHIP */}

  <div>
    <p className="text-zinc-300 mb-4 text-sm uppercase tracking-wider font-semibold">
      Ownership
    </p>

    <select
      value={selectedOwnership}
      onChange={(e) => setSelectedOwnership(e.target.value)}
      className="luxe-input w-full bg-black/35 border border-white/10 text-white px-5 py-4 rounded-2xl outline-none focus:border-green-500"
    >
      <option value="">All Types</option>

      <option value="Government">Government</option>
      <option value="Private">Private</option>
    </select>
  </div>

  {/* EXAM */}

  <div>
    <p className="text-zinc-300 mb-4 text-sm uppercase tracking-wider font-semibold">
      Exam Accepted
    </p>

    <select
      value={selectedExam}
      onChange={(e) => setSelectedExam(e.target.value)}
      className="luxe-input w-full bg-black/35 border border-white/10 text-white px-5 py-4 rounded-2xl outline-none focus:border-green-500"
    >
      <option value="">All Exams</option>

      <option value="JEE Advanced">JEE Advanced</option>
      <option value="JEE Main">JEE Main</option>
      <option value="BITSAT">BITSAT</option>
      <option value="VITEEE">VITEEE</option>
      <option value="MET">MET</option>
    </select>
  </div>

  {/* MAX FEES */}

  <div>
    <div className="flex items-center justify-between mb-4">
      <p className="text-zinc-300 font-semibold">
        Max Fees
      </p>

      <p className="text-green-400 font-bold">
        ₹{(maxFees / 100000).toFixed(1)}L
      </p>
    </div>

    <input
      type="range"
      min="50000"
      max="600000"
      step="25000"
      value={maxFees}
      onChange={(e) =>
        setMaxFees(Number(e.target.value))
      }
      className="w-full accent-green-500"
    />
  </div>

  {/* NIRF RANK */}

  <div>
    <div className="flex items-center justify-between mb-4">
      <p className="text-zinc-300 font-semibold">
        Max NIRF Rank
      </p>

      <p className="text-green-400 font-bold">
        {maxRank}
      </p>
    </div>

    <input
      type="range"
      min="1"
      max="200"
      step="1"
      value={maxRank}
      onChange={(e) =>
        setMaxRank(Number(e.target.value))
      }
      className="w-full accent-green-500"
    />
  </div>

</div>
            </div>
          </div>

          <div className="relative min-w-0 max-w-full overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-12 bg-gradient-to-r from-[#030409] via-[#030409]/75 to-transparent md:block" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-12 bg-gradient-to-l from-[#030409] via-[#030409]/75 to-transparent md:block" />

            <div
              className="college-card-scroll flex w-full max-w-full snap-x gap-6 overflow-x-auto pb-4 md:gap-8 xl:gap-10"
              onWheel={(event) => {
                if (!event.shiftKey) return
                event.currentTarget.scrollLeft += event.deltaY
              }}
            >
              {filteredColleges.map((college) => (
                <div
                  key={college.id}
                  className="w-[min(82vw,360px)] shrink-0 snap-start md:w-[340px] xl:w-[360px]"
                >
                  <CollegeCard
                    id={college.id}
                    name={college.name}
                    image={college.image}
                    location={college.location}
                    fees={String(college.fees)}
                    avgPackage={college.avgPackage}
                    rating={String(college.rating)}
                    nirfRank={college.nirfRank}
                    isCompared={
  compareColleges.some(
    (item) => item.id === college.id
  )
}
                    onCompare={() => handleCompare(college)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
