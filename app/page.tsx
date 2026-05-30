"use client"

import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import CollegeCard from "../components/CollegeCard"


export default function Home() {
 const [searchTerm, setSearchTerm] = useState("")
 const [debouncedSearch,
  setDebouncedSearch] =
  useState("")
const [colleges, setColleges] = useState<any[]>([])
const [loading, setLoading] = useState(true)
const [selectedLocation, setSelectedLocation] =
  useState("")

const [activeTab, setActiveTab] =
  useState("Popular")

const [maxFees, setMaxFees] =
  useState(2500000)

const [selectedTypes, setSelectedTypes] =
  useState<string[]>([])

const [compareColleges, setCompareColleges] =
  useState<typeof colleges>([])
useEffect(() => {

  const timer =
    setTimeout(() => {

      setDebouncedSearch(
        searchTerm
      )

    }, 500)

  return () =>
    clearTimeout(timer)

}, [searchTerm])
useEffect(() => {
  const fetchColleges = async () => {
    try {
     const response = await fetch(
  `/api/colleges?search=${debouncedSearch}&location=${selectedLocation}`
)

      const data = await response.json()

      setColleges(data)

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  fetchColleges()
}, [searchTerm, selectedLocation])
 


 function handleCompare(college: typeof colleges[0]) {

  const alreadyAdded =
    compareColleges.find(
      item => item.id === college.id
    )

  if (alreadyAdded) return

  if (compareColleges.length >= 3) return

  setCompareColleges([
    ...compareColleges,
    college
  ])

}
function removeCollege(id: string) {

  setCompareColleges(
    compareColleges.filter(
      college => college.id !== id
    )
  )

}
function extractFees(fees: string | number) {

  if (typeof fees === "number") {
    return fees
  }

  return parseInt(
    fees.replace(/[^0-9]/g, "")
  )

}

function getHighestPackage() {

  if (compareColleges.length === 0)
    return 0

  return Math.max(
    ...compareColleges.map(
      college =>
        parseFloat(
          college.avgPackage.replace(
            /[^0-9.]/g,
            ""
          )
        )
    )
  )

}

function handleTypeChange(type: string) {

  if (selectedTypes.includes(type)) {

    setSelectedTypes(
      selectedTypes.filter(
        item => item !== type
      )
    )

  } else {

    setSelectedTypes([
      ...selectedTypes,
      type
    ])

  }

}

function resetFilters() {

  setSearchTerm("")
  setSelectedLocation("")
  setActiveTab("Popular")
  setMaxFees(2500000)
  setSelectedTypes([])

}
let filteredColleges = Array.isArray(colleges)
  ? colleges.filter(college => {

      const matchesSearch = true
      const matchesLocation = true

      const matchesFees =
        extractFees(college.fees) <= maxFees

      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.some(type =>
          college.name
            .toLowerCase()
            .includes(type.toLowerCase())
        )

      return (
        matchesSearch &&
        matchesLocation &&
        matchesFees &&
        matchesType
      )

    })
  : []

if (activeTab === "Highest") {

  filteredColleges.sort(
    (a, b) =>
      parseFloat(
        b.avgPackage.replace(
          /[^0-9.]/g,
          ""
        )
      ) -
      parseFloat(
        a.avgPackage.replace(
          /[^0-9.]/g,
          ""
        )
      )
  )

}

if (activeTab === "Ranked") {

  filteredColleges.sort(
    (a, b) =>
      a.nirfRank - b.nirfRank
  )

}

  return (
    <div className="min-h-screen bg-[#0d0d0d]">

      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* HERO */}

        <div className="relative overflow-hidden rounded-[40px] border border-[#2a2a2a] bg-gradient-to-br from-[#151515] via-[#101010] to-black p-10 md:p-16 mb-14">

          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 blur-[120px] rounded-full" />

          <div className="relative z-10">

            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 font-semibold mb-8">

              India's Leading College Discovery Platform

            </div>

            <h1 className="text-6xl md:text-7xl font-black text-white leading-tight mb-6">

              Discover Your
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                {" "}Dream College
              </span>

            </h1>

            <p className="text-gray-400 text-xl mb-10">

              Compare top colleges, placements, rankings and campus life.

            </p>

            <input
              type="text"
              placeholder="Search colleges..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-full bg-[#1b1b1b] border border-[#2a2a2a] text-white px-6 py-5 rounded-2xl"
            />

          </div>

        </div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">

  <div className="relative overflow-hidden bg-gradient-to-br from-[#1c1c1c] to-[#131313] border border-[#2a2a2a] rounded-[30px] p-8 hover:border-green-500/30 transition duration-500">

    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full" />

    <div className="relative z-10">

      <p className="text-gray-500 mb-3 text-lg">
        Colleges
      </p>

      <h2 className="text-5xl font-black text-white mb-2">
        250+
      </h2>

      <p className="text-green-400 font-semibold">
        Across India
      </p>

    </div>

  </div>

  <div className="relative overflow-hidden bg-gradient-to-br from-[#1c1c1c] to-[#131313] border border-[#2a2a2a] rounded-[30px] p-8 hover:border-green-500/30 transition duration-500">

    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

    <div className="relative z-10">

      <p className="text-gray-500 mb-3 text-lg">
        Students
      </p>

      <h2 className="text-5xl font-black text-white mb-2">
        1M+
      </h2>

      <p className="text-green-400 font-semibold">
        Active Users
      </p>

    </div>

  </div>

  <div className="relative overflow-hidden bg-gradient-to-br from-[#1c1c1c] to-[#131313] border border-[#2a2a2a] rounded-[30px] p-8 hover:border-green-500/30 transition duration-500">

    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full" />

    <div className="relative z-10">

      <p className="text-gray-500 mb-3 text-lg">
        Highest Package
      </p>

      <h2 className="text-5xl font-black text-white mb-2">
        ₹1.2Cr
      </h2>

      <p className="text-green-400 font-semibold">
        Top Placement
      </p>

    </div>

  </div>

  <div className="relative overflow-hidden bg-gradient-to-br from-[#1c1c1c] to-[#131313] border border-[#2a2a2a] rounded-[30px] p-8 hover:border-green-500/30 transition duration-500">

    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

    <div className="relative z-10">

      <p className="text-gray-500 mb-3 text-lg">
        Reviews
      </p>

      <h2 className="text-5xl font-black text-white mb-2">
        50K+
      </h2>

      <p className="text-green-400 font-semibold">
        Verified Ratings
      </p>

    </div>

  </div>

</div>

<div className="mb-16">

  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-[32px] p-8">

    <h2 className="text-3xl font-black text-white mb-3">
      Trusted By Students Across India
    </h2>

    <p className="text-gray-400 text-lg">
      Compare placements, fees, rankings, reviews and campus life from top institutions.
    </p>

  </div>

</div>

{compareColleges.length > 0 && (

  <div className="mb-16 relative overflow-hidden rounded-[36px] border border-[#2a2a2a] bg-gradient-to-br from-[#171717] via-[#121212] to-black p-8">

    <div className="flex items-center justify-between mb-10">

      <div>

        <h2 className="text-5xl font-black text-white mb-3">

          Compare Colleges

        </h2>

        <p className="text-gray-500 text-lg">

          Side-by-side analysis of selected colleges

        </p>

      </div>

      <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-5 py-3 rounded-2xl font-bold">

        {compareColleges.length} Selected

      </div>

    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

      {compareColleges.map((college) => (

        <div
          key={college.id}
          className="bg-[#1b1b1b] border border-[#2a2a2a] rounded-[32px] overflow-hidden"
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

    <span className="text-gray-500">
      Location
    </span>

    <span className="text-white font-bold">
      {college.location}
    </span>

  </div>

  <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">

    <span className="text-gray-500">
      Avg Package
    </span>

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

    <span className="text-gray-500">
      NIRF Rank
    </span>

    <span className="text-white font-bold">
      #{college.nirfRank}
    </span>

  </div>

  <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">

    <span className="text-gray-500">
      Fees
    </span>

    <span className="text-white font-bold">
      {college.fees}
    </span>

  </div>

  <div className="flex items-center justify-between">

    <span className="text-gray-500">
      Rating
    </span>

    <span className="text-green-400 font-bold">
      {college.rating}
    </span>

  </div>

</div>

            <button
              onClick={() =>
                removeCollege(college.id)
              }
              className="w-full py-3 rounded-2xl bg-red-500 text-white font-bold"
            >

              Remove

            </button>

          </div>

        </div>

      ))}

    </div>

  </div>

)}
<div className="flex items-center justify-between mb-10">

  <div>

    <h2 className="text-4xl font-black text-white mb-2">
      Explore Colleges
    </h2>

    <p className="text-gray-500 text-lg">
      Showing top institutions across India
    </p>

  </div>

  <div className="hidden md:flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-2">

    <button
      className={`px-5 py-3 rounded-xl font-bold transition duration-300 ${
        activeTab === "Popular"
          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-black"
          : "text-gray-400 hover:text-white"
      }`}
      onClick={() =>
        setActiveTab("Popular")
      }
    >
      Popular
    </button>

    <button
      className={`px-5 py-3 rounded-xl font-bold transition duration-300 ${
        activeTab === "Highest"
          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-black"
          : "text-gray-400 hover:text-white"
      }`}
      onClick={() =>
        setActiveTab("Highest")
      }
    >
      Highest Packages
    </button>

    <button
      className={`px-5 py-3 rounded-xl font-bold transition duration-300 ${
        activeTab === "Ranked"
          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-black"
          : "text-gray-400 hover:text-white"
      }`}
      onClick={() =>
        setActiveTab("Ranked")
      }
    >
      Top Ranked
    </button>

  </div>

</div>
        {/* CARDS */}

       <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10">

  <div className="h-fit sticky top-28">

    <div className="bg-gradient-to-br from-[#181818] to-[#121212] border border-[#2a2a2a] rounded-[32px] p-8">

      <div className="flex items-center justify-between mb-8">

        <h2 className="text-3xl font-black text-white">
          Filters
        </h2>

        <button
          onClick={resetFilters}
          className="text-green-400 font-bold hover:text-green-300 transition"
        >
          Reset
        </button>

      </div>

      <div className="space-y-8">

        <div>

          <p className="text-gray-400 mb-4 font-semibold">
            Location
          </p>

          <select
            value={selectedLocation}
            onChange={(e) =>
              setSelectedLocation(
                e.target.value
              )
            }
            className="w-full bg-[#202020] border border-[#2a2a2a] text-white px-5 py-4 rounded-2xl outline-none focus:border-green-500"
          >

            <option value="">
              All Locations
            </option>

            <option value="Delhi">
              Delhi
            </option>

            <option value="Mumbai">
              Mumbai
            </option>

            <option value="Chennai">
              Chennai
            </option>

            <option value="Kanpur">
              Kanpur
            </option>

            <option value="Tamil Nadu">
              Tamil Nadu
            </option>

          </select>

        </div>

        <div>

          <p className="text-gray-400 mb-4 font-semibold">
            College Type
          </p>

          <div className="space-y-4">

            <label className="flex items-center gap-3 text-gray-300">

              <input
                type="checkbox"
                checked={selectedTypes.includes("iit")}
                onChange={() =>
                  handleTypeChange("iit")
                }
                className="accent-green-500"
              />

              IIT

            </label>

            <label className="flex items-center gap-3 text-gray-300">

              <input
                type="checkbox"
                checked={selectedTypes.includes("nit")}
                onChange={() =>
                  handleTypeChange("nit")
                }
                className="accent-green-500"
              />

              NIT

            </label>

            <label className="flex items-center gap-3 text-gray-300">

              <input
                type="checkbox"
                checked={selectedTypes.includes("vit")}
                onChange={() =>
                  handleTypeChange("vit")
                }
                className="accent-green-500"
              />

              VIT

            </label>

          </div>

        </div>

        <div>

          <div className="flex items-center justify-between mb-4">

            <p className="text-gray-400 font-semibold">
              Max Fees
            </p>

            <p className="text-green-400 font-bold">
              ₹{(maxFees / 100000).toFixed(1)}L
            </p>

          </div>

          <input
            type="range"
            min="50000"
            max="500000"
            step="50000"
            value={maxFees}
            onChange={(e) =>
              setMaxFees(
                Number(e.target.value)
              )
            }
            className="w-full accent-green-500"
          />

        </div>

      </div>

    </div>

  </div>

  <div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">

      {filteredColleges.map((college) => (

        <CollegeCard
          key={college.id}
          {...college}
          onCompare={() =>
            handleCompare(college)
          }
        />

      ))}

    </div>

  </div>

</div>

      </div>

    </div>
  )
}