"use client"
import { useEffect } from "react"
import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import Navbar from "@/components/Navbar"

interface College {
  id: string
  name: string
  image: string
  location: string
  fees: string
  avgPackage: string
  rating: string
  nirfRank: number
  ownership: string
  examsAccepted: string[]
  establishedYear: number
    website: string
  highestPackage: string
  description: string
  accreditation: string
}
export default function CollegeDetails() {

  const params = useParams()
  const id = params.id as string

  const [openFaq, setOpenFaq] =
    useState<number | null>(null)
    const [showApplyModal, setShowApplyModal] =
  useState(false)

const [studentName, setStudentName] =
  useState("")

const [studentEmail, setStudentEmail] =
  useState("")

  const [college, setCollege] =
  useState<College | null>(null)

const [similarColleges, setSimilarColleges] =
  useState<College[]>([])
const [loading, setLoading] = useState(true)
const [applicationSubmitted,
  setApplicationSubmitted] =
  useState(false)

useEffect(() => {
  const fetchCollege = async () => {
    try {
      const res = await fetch("/api/colleges")
      const data = await res.json()

  const foundCollege = data.find(
  (item: College) => item.id === id
)

if (!foundCollege) {
  setCollege(null)
  setLoading(false)
  return
}

setCollege(foundCollege)

setSimilarColleges(
  data
    .filter(
      (item: College) =>
        item.id !== foundCollege.id
    )
    .slice(0, 3)
)
      setLoading(false)

    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  if (id) {
    fetchCollege()
  }

}, [id])

// ADD THIS WHOLE BLOCK HERE

useEffect(() => {

  if (applicationSubmitted) {

    const timer =
      setTimeout(() => {

        setApplicationSubmitted(false)

      }, 3000)

    return () =>
      clearTimeout(timer)

  }

}, [applicationSubmitted])

if (loading) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-center text-xl font-bold text-white md:text-3xl">
      Loading...
    </div>
  )
}

  if (!college) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-black px-4 text-center text-2xl font-bold text-white md:text-4xl">

        College Not Found

      </div>

    )

  }

  return (

    <div className="premium-detail-page premium-depth-root min-h-screen text-white">

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 md:py-10">

        <div className="luxe-surface luxe-section relative mb-10 overflow-hidden rounded-[28px] md:mb-12 md:rounded-[40px]">

          <img
            src={college.image}
            alt=""
            className="h-[360px] w-full object-cover sm:h-[420px] md:h-[500px]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          <div className="absolute inset-x-5 bottom-5 sm:inset-x-8 md:bottom-10 md:left-10 md:right-auto">

            <div className="mb-4 flex flex-wrap items-center gap-3 md:mb-5 md:gap-4">

              <div className="rounded-full bg-green-500 px-4 py-2 text-sm font-black text-black md:px-5 md:text-base">

                {college.rating}

              </div>

              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-xl md:px-5 md:text-base">

                NIRF #{college.nirfRank}

              </div>

            </div>

            <h1 className="mb-3 max-w-4xl text-3xl font-black leading-tight sm:text-4xl md:mb-4 md:text-6xl">

              {college.name}

            </h1>

           <p className="mb-4 text-lg text-gray-300 md:text-2xl">

              {college.location}

            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm md:text-base">

  <span className="rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-green-300">
    {college.ownership}
  </span>

  <span className="rounded-full border border-[#2a2a2a] bg-[#202020] px-4 py-2 text-white">
    {college.examsAccepted.length > 0 ? college.examsAccepted.join(", ") : "N/A"}
  </span>

  <span className="rounded-full border border-[#2a2a2a] bg-[#202020] px-4 py-2 text-white">
    Est. {college.establishedYear}
  </span>

</div>

     <div className="mt-5 flex flex-wrap gap-3 md:gap-5">

  <button
    onClick={() =>
      setShowApplyModal(true)
    }
    className="luxe-button w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-3 font-black text-black shadow-[0_10px_40px_rgba(34,197,94,0.3)] hover:from-green-400 hover:to-emerald-400 sm:w-auto md:px-10 md:py-5"
  >
    Apply Now
  </button>

  <a
    href="/brochure.pdf"
    download
    className="luxe-button inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold backdrop-blur-xl hover:bg-white/20 sm:w-auto md:px-10 md:py-5"
  >
    Download Brochure
  </a>

  <a
    href={college.website || "#"}
    target="_blank"
    rel="noopener noreferrer"
    className="luxe-button inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold backdrop-blur-xl hover:bg-white/20 sm:w-auto md:px-10 md:py-5"
  >
    Official Website
  </a>

</div>

          </div>

        </div>

        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mb-16 md:grid-cols-4 md:gap-6">

          <div className="rounded-[24px] border border-[#2a2a2a] bg-gradient-to-br from-[#1c1c1c] to-[#131313] p-5 transition duration-300 hover:border-green-500/30 md:rounded-[30px] md:p-8">

            <p className="text-gray-500 mb-3">
              Annual Fees
            </p>

            <h2 className="text-2xl font-black md:text-4xl">
              {college.fees}
            </h2>

          </div>

          <div className="rounded-[24px] border border-[#2a2a2a] bg-gradient-to-br from-[#1c1c1c] to-[#131313] p-5 transition duration-300 hover:border-green-500/30 md:rounded-[30px] md:p-8">

            <p className="text-gray-500 mb-3">
              Avg Package
            </p>

            <h2 className="text-2xl font-black text-green-400 md:text-4xl">
              {college.avgPackage}
            </h2>

          </div>

          <div className="rounded-[24px] border border-[#2a2a2a] bg-gradient-to-br from-[#1c1c1c] to-[#131313] p-5 transition duration-300 hover:border-green-500/30 md:rounded-[30px] md:p-8">

            <p className="text-gray-500 mb-3">
              Highest Package
            </p>

            <h2 className="text-2xl font-black text-green-400 md:text-4xl">
             {college.highestPackage || "N/A"}
            </h2>

          </div>

          <div className="rounded-[24px] border border-[#2a2a2a] bg-gradient-to-br from-[#1c1c1c] to-[#131313] p-5 transition duration-300 hover:border-green-500/30 md:rounded-[30px] md:p-8">

            <p className="text-gray-500 mb-3">
              Placement Rate
            </p>

            <h2 className="text-2xl font-black text-green-400 md:text-4xl">
            N/A
            </h2>

          </div>

        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_350px] lg:gap-10">

          <div className="space-y-8 md:space-y-10">            <div className="rounded-[28px] border border-[#2a2a2a] bg-gradient-to-br from-[#181818] to-[#121212] p-6 md:rounded-[32px] md:p-10">

              <h2 className="mb-5 text-2xl font-black md:mb-6 md:text-4xl">

                About College

              </h2>

              <p className="text-base leading-relaxed text-gray-400 md:text-lg">

              {college.description}

              </p>
              <div className="mt-8 rounded-[26px] border border-[#2a2a2a] bg-gradient-to-br from-[#181818] to-[#121212] p-5 md:mt-10 md:rounded-[32px] md:p-10">

  <h2 className="mb-6 text-2xl font-black text-white md:mb-8 md:text-4xl">
    College Information
  </h2>

  <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">

    <div className="rounded-2xl border border-[#2a2a2a] bg-[#1b1b1b] p-5 md:p-6">
      <p className="text-gray-500 mb-2">
        Established
      </p>

      <p className="text-lg font-bold text-white md:text-xl">
        {college.establishedYear || "N/A"}
      </p>
    </div>

    <div className="rounded-2xl border border-[#2a2a2a] bg-[#1b1b1b] p-5 md:p-6">
      <p className="text-gray-500 mb-2">
        Ownership
      </p>

      <p className="text-lg font-bold text-white md:text-xl">
        {college.ownership || "N/A"}
      </p>
    </div>

    <div className="rounded-2xl border border-[#2a2a2a] bg-[#1b1b1b] p-5 md:p-6">
      <p className="text-gray-500 mb-2">
        Accreditation
      </p>

      <p className="text-lg font-bold text-white md:text-xl">
        {college.accreditation || "N/A"}
      </p>
    </div>

    <div className="rounded-2xl border border-[#2a2a2a] bg-[#1b1b1b] p-5 md:p-6">
      <p className="text-gray-500 mb-2">
        Exam Accepted
      </p>

      <p className="text-lg font-bold text-white md:text-xl">
        {college.examsAccepted.length > 0 ? college.examsAccepted.join(", ") : "N/A"}
      </p>
    </div>

  </div>

</div>

            </div>

            <div className="rounded-[28px] border border-[#2a2a2a] bg-gradient-to-br from-[#181818] to-[#121212] p-6 md:rounded-[32px] md:p-10">

              <h2 className="mb-6 text-2xl font-black md:mb-8 md:text-4xl">

                Top Recruiters

              </h2>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">

                <div className="rounded-2xl border border-[#2a2a2a] bg-[#202020] p-4 text-center font-bold transition duration-300 hover:border-green-500/30 md:p-6">
                  Google
                </div>

                <div className="rounded-2xl border border-[#2a2a2a] bg-[#202020] p-4 text-center font-bold transition duration-300 hover:border-green-500/30 md:p-6">
                  Microsoft
                </div>

                <div className="rounded-2xl border border-[#2a2a2a] bg-[#202020] p-4 text-center font-bold transition duration-300 hover:border-green-500/30 md:p-6">
                  Amazon
                </div>

                <div className="rounded-2xl border border-[#2a2a2a] bg-[#202020] p-4 text-center font-bold transition duration-300 hover:border-green-500/30 md:p-6">
                  Adobe
                </div>

              </div>

            </div>

            <div className="rounded-[28px] border border-[#2a2a2a] bg-gradient-to-br from-[#181818] to-[#121212] p-6 md:rounded-[32px] md:p-10">

              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mb-10">

                <div>

                  <h2 className="mb-3 text-2xl font-black md:text-4xl">

                    Placement Analytics

                  </h2>

                  <p className="text-base text-gray-500 md:text-lg">

                    Latest placement performance overview

                  </p>

                </div>

                <div className="w-fit rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-2 font-bold text-green-400 md:px-5 md:py-3">

                  2025 Report

                </div>

              </div>

              <div className="space-y-7 md:space-y-8">

                <div>

                  <div className="flex items-center justify-between mb-3">

                    <span className="text-base font-semibold md:text-lg">
                      Placement Rate
                    </span>

                    <span className="text-green-400 font-black">
                     N/A
                    </span>

                  </div>

                  <div className="w-full h-4 rounded-full bg-[#232323] overflow-hidden">

                    <div className="h-full w-[92%] bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />

                  </div>

                </div>

                <div>

                  <div className="flex items-center justify-between mb-3">

                    <span className="text-base font-semibold md:text-lg">
                      Internship Offers
                    </span>

                    <span className="text-green-400 font-black">
                      85%
                    </span>

                  </div>

                  <div className="w-full h-4 rounded-full bg-[#232323] overflow-hidden">

                    <div className="h-full w-[85%] bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />

                  </div>

                </div>

                <div>

                  <div className="flex items-center justify-between mb-3">

                    <span className="text-base font-semibold md:text-lg">
                      Dream Offers
                    </span>

                    <span className="text-green-400 font-black">
                      78%
                    </span>

                  </div>

                  <div className="w-full h-4 rounded-full bg-[#232323] overflow-hidden">

                    <div className="h-full w-[78%] bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />

                  </div>

                </div>

              </div>

              <div className="mt-10 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-3 md:gap-6">

                <div className="rounded-3xl border border-[#2a2a2a] bg-[#202020] p-5 md:p-6">

                  <p className="text-gray-500 mb-3">
                    Highest International
                  </p>

                  <h3 className="text-2xl font-black text-green-400 md:text-3xl">
                    {college.highestPackage || "N/A"}
                  </h3>

                </div>

                <div className="rounded-3xl border border-[#2a2a2a] bg-[#202020] p-5 md:p-6">

                  <p className="text-gray-500 mb-3">
                    Highest Domestic
                  </p>

                  <h3 className="text-2xl font-black text-green-400 md:text-3xl">
                    Rs.64L
                  </h3>

                </div>

                <div className="rounded-3xl border border-[#2a2a2a] bg-[#202020] p-5 md:p-6">

                  <p className="text-gray-500 mb-3">
                    Avg CTC
                  </p>

                  <h3 className="text-2xl font-black text-green-400 md:text-3xl">
                    {college.avgPackage}
                  </h3>

                </div>

              </div>

            </div>            <div className="rounded-[28px] border border-[#2a2a2a] bg-gradient-to-br from-[#181818] to-[#121212] p-6 md:rounded-[32px] md:p-10">

              <h2 className="mb-6 text-2xl font-black md:mb-8 md:text-4xl">

                Facilities

              </h2>

              <div className="flex flex-wrap gap-4">

                <div className="rounded-2xl border border-[#2a2a2a] bg-[#202020] px-4 py-3 text-sm md:px-6 md:py-4 md:text-base">
                  Hostel
                </div>

                <div className="rounded-2xl border border-[#2a2a2a] bg-[#202020] px-4 py-3 text-sm md:px-6 md:py-4 md:text-base">
                  Sports Complex
                </div>

                <div className="rounded-2xl border border-[#2a2a2a] bg-[#202020] px-4 py-3 text-sm md:px-6 md:py-4 md:text-base">
                  Central Library
                </div>

                <div className="rounded-2xl border border-[#2a2a2a] bg-[#202020] px-4 py-3 text-sm md:px-6 md:py-4 md:text-base">
                  WiFi Campus
                </div>

                <div className="rounded-2xl border border-[#2a2a2a] bg-[#202020] px-4 py-3 text-sm md:px-6 md:py-4 md:text-base">
                  Labs
                </div>

              </div>

            </div>

            <div className="rounded-[28px] border border-[#2a2a2a] bg-gradient-to-br from-[#181818] to-[#121212] p-6 md:rounded-[32px] md:p-10">

              <h2 className="mb-6 text-2xl font-black md:mb-8 md:text-4xl">

                Popular Courses

              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="rounded-3xl border border-[#2a2a2a] bg-[#202020] p-5 transition duration-300 hover:border-green-500/30 md:p-6">

                  <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                    <h3 className="text-xl font-black md:text-2xl">
                      B.Tech CSE
                    </h3>

                    <span className="text-green-400 font-bold">
                      4 Years
                    </span>

                  </div>

                  <p className="text-gray-400 mb-6 leading-relaxed">

                    Industry-focused curriculum with AI, Web Development, System Design and Placement Preparation.

                  </p>

                  <div className="flex items-center justify-between">

                    <span className="text-gray-500">
                      Seats
                    </span>

                    <span className="font-bold">
                      240
                    </span>

                  </div>

                </div>

                <div className="rounded-3xl border border-[#2a2a2a] bg-[#202020] p-5 transition duration-300 hover:border-green-500/30 md:p-6">

                  <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                    <h3 className="text-xl font-black md:text-2xl">
                      MBA
                    </h3>

                    <span className="text-green-400 font-bold">
                      2 Years
                    </span>

                  </div>

                  <p className="text-gray-400 mb-6 leading-relaxed">

                    Premium management program focused on analytics, consulting and leadership.

                  </p>

                  <div className="flex items-center justify-between">

                    <span className="text-gray-500">
                      Seats
                    </span>

                    <span className="font-bold">
                      120
                    </span>

                  </div>

                </div>

              </div>

            </div>

            <div className="rounded-[28px] border border-[#2a2a2a] bg-gradient-to-br from-[#181818] to-[#121212] p-6 md:rounded-[32px] md:p-10">

              <h2 className="mb-6 text-2xl font-black md:mb-8 md:text-4xl">

                Student Reviews

              </h2>

              <div className="space-y-6">

                <div className="rounded-3xl border border-[#2a2a2a] bg-[#202020] p-5 md:p-6">

                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                    <h3 className="text-xl font-black md:text-2xl">
                      Aarav Sharma
                    </h3>

                    <span className="text-green-400 font-bold">
                      4.8/5
                    </span>

                  </div>

                  <p className="text-gray-400 leading-relaxed">

                    Amazing campus life and placements. Coding culture is extremely strong and seniors are very supportive.

                  </p>

                </div>

                <div className="rounded-3xl border border-[#2a2a2a] bg-[#202020] p-5 md:p-6">

                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                    <h3 className="text-xl font-black md:text-2xl">
                      Priya Verma
                    </h3>

                    <span className="text-green-400 font-bold">
                      4.6/5
                    </span>

                  </div>

                  <p className="text-gray-400 leading-relaxed">

                    Infrastructure, professors and opportunities are excellent. Internship support is also really good.

                  </p>

                </div>

              </div>

            </div>            <div className="rounded-[28px] border border-[#2a2a2a] bg-gradient-to-br from-[#181818] to-[#121212] p-6 md:rounded-[32px] md:p-10">

              <h2 className="mb-6 text-2xl font-black md:mb-8 md:text-4xl">

                Campus Gallery

              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                <img
                  src={college.image}
                  alt=""
                  className="rounded-3xl h-60 w-full object-cover hover:scale-105 transition duration-500"
                />

                <img
                  src={college.image}
                  alt=""
                  className="rounded-3xl h-60 w-full object-cover hover:scale-105 transition duration-500"
                />

                <img
                  src={college.image}
                  alt=""
                  className="rounded-3xl h-60 w-full object-cover hover:scale-105 transition duration-500"
                />

              </div>

            </div>

          </div>

          <div className="h-fit lg:sticky lg:top-28">

            <div className="rounded-[28px] border border-[#2a2a2a] bg-gradient-to-br from-[#181818] to-[#121212] p-6 md:rounded-[32px] md:p-8">

              <h2 className="mb-6 text-2xl font-black md:mb-8 md:text-3xl">

                Quick Highlights

              </h2>

              <div className="space-y-6">

                <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">

                  <span className="text-gray-500">
                    Established
                  </span>

                  <span className="font-bold">
                    1951
                  </span>

                </div>

                <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">

                  <span className="text-gray-500">
                    Ownership
                  </span>

                  <span className="font-bold">
                    Government
                  </span>

                </div>

                <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">

                  <span className="text-gray-500">
                    Total Students
                  </span>

                  <span className="font-bold">
                    12,000+
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-gray-500">
                    Campus Size
                  </span>

                  <span className="font-bold">
                    500 Acres
                  </span>

                </div>

              </div>

            <button
  onClick={() =>
    setShowApplyModal(true)
  }
  className="mt-8 w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 py-4 font-black text-black transition duration-300 hover:scale-105 hover:from-green-400 hover:to-emerald-400 md:mt-10 md:py-5"
>
  Apply For Admission
</button>

            </div>

          </div>

        </div>

        <div className="mt-12 md:mt-16">

          <div className="mb-6 flex items-center justify-between md:mb-8">

            <h2 className="text-2xl font-black md:text-4xl">

              Similar Colleges

            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {similarColleges.map((item) => (

                <div
                  key={item.id}
                  className="group overflow-hidden rounded-[28px] border border-[#2a2a2a] bg-gradient-to-br from-[#181818] to-[#121212] transition duration-500 hover:-translate-y-2 hover:border-green-500/30 md:rounded-[32px]"
                >

                  <img
                    src={item.image}
                    alt=""
                    className="h-56 w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="p-6">

                    <h3 className="mb-3 text-xl font-black md:text-2xl">

                      {item.name}

                    </h3>

                    <p className="text-gray-400 mb-5">

                      {item.location}

                    </p>

                    <div className="flex items-center justify-between mb-6">

                      <span className="text-green-400 font-bold">

                        {item.avgPackage}

                      </span>

                      <span className="text-white font-bold">

                        #{item.nirfRank}

                      </span>

                    </div>

                    <Link
                      href={`/college/${item.id}`}
                      className="block w-full text-center py-4 rounded-2xl bg-green-500 hover:bg-green-400 text-black font-black transition duration-300"
                    >

                      View College

                    </Link>

                  </div>

                </div>

              ))}

          </div>

        </div>        <div className="mt-12 rounded-[28px] border border-[#2a2a2a] bg-gradient-to-br from-[#181818] to-[#121212] p-6 md:mt-16 md:rounded-[32px] md:p-10">

          <h2 className="mb-6 text-2xl font-black md:mb-10 md:text-4xl">

            Frequently Asked Questions

          </h2>

         <div className="space-y-5">

  {[
    {
      q: "What is the admission process?",
      a: "Admissions are based on entrance exam scores, counselling and eligibility criteria."
    },
    {
      q: "What is the average placement package?",
      a: "Average package varies by branch and placement season."
    },
    {
      q: "Are hostel facilities available?",
      a: "Yes, hostel accommodation is available with dining and internet facilities."
    },
    {
      q: "Which companies visit for placements?",
      a: "Recruiters include Google, Microsoft, Amazon, Adobe and many top companies."
    }
  ].map((faq, index) => (

    <div
      key={index}
      className="bg-[#202020] border border-[#2a2a2a] rounded-3xl overflow-hidden"
    >

      <button
        onClick={() =>
          setOpenFaq(
            openFaq === index
              ? null
              : index
          )
        }
        className="flex w-full items-center justify-between gap-4 p-5 text-left md:p-6"
      >

        <span className="text-base font-bold md:text-xl">
          {faq.q}
        </span>

        <span className="text-green-400 text-2xl font-black">
          {openFaq === index ? "-" : "+"}
        </span>

      </button>

      {openFaq === index && (

        <div className="px-5 pb-5 md:px-6 md:pb-6">

          <p className="text-gray-400 leading-relaxed">
            {faq.a}
          </p>

        </div>

      )}

    </div>

  ))}

</div>

        </div>

      </div>
      {applicationSubmitted && (

  <div className="fixed inset-x-4 bottom-4 z-50 rounded-2xl bg-green-500 px-5 py-4 text-center font-black text-black shadow-xl md:inset-x-auto md:bottom-8 md:right-8 md:px-6">

    Application Submitted

  </div>

)}
{showApplyModal && (

  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-[#2a2a2a] bg-[#181818] p-6 md:rounded-[32px] md:p-8">

      <h2 className="mb-6 text-2xl font-black md:text-3xl">
        Apply To {college.name}
      </h2>

      <input
        type="text"
        placeholder="Full Name"
        value={studentName}
        onChange={(e) =>
          setStudentName(e.target.value)
        }
        className="w-full mb-4 bg-[#232323] p-4 rounded-2xl"
      />

      <input
        type="email"
        placeholder="Email"
        value={studentEmail}
        onChange={(e) =>
          setStudentEmail(e.target.value)
        }
        className="w-full mb-6 bg-[#232323] p-4 rounded-2xl"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">

        <button
          onClick={() => {
            setShowApplyModal(false)
            setStudentName("")
            setStudentEmail("")
          }}
          className="flex-1 bg-[#232323] py-4 rounded-2xl font-bold"
        >
          Cancel
        </button>

      <button
  onClick={() => {

    setApplicationSubmitted(true)

    setShowApplyModal(false)

    setStudentName("")

    setStudentEmail("")

  }}
  className="flex-1 bg-green-500 text-black font-black py-4 rounded-2xl"
>
  Submit
</button>

      </div>

    </div>

  </div>

)}
    </div>

  )

}
