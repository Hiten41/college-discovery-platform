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
  examsAccepted: string
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
    <div className="min-h-screen bg-black text-white flex items-center justify-center text-3xl font-bold">
      Loading...
    </div>
  )
}

  if (!college) {

    return (

      <div className="min-h-screen bg-black text-white flex items-center justify-center text-4xl font-bold">

        College Not Found

      </div>

    )

  }

  return (

    <div className="min-h-screen bg-[#0d0d0d] text-white">

      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="relative overflow-hidden rounded-[40px] border border-[#2a2a2a] mb-12">

          <img
            src={college.image}
            alt=""
            className="w-full h-[500px] object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          <div className="absolute bottom-10 left-10">

            <div className="flex items-center gap-4 mb-5">

              <div className="bg-green-500 text-black px-5 py-2 rounded-full font-black">

                {college.rating}

              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-white/10 px-5 py-2 rounded-full font-bold">

                NIRF #{college.nirfRank}

              </div>

            </div>

            <h1 className="text-6xl font-black mb-4 max-w-4xl">

              {college.name}

            </h1>

           <p className="text-2xl text-gray-300 mb-4">

              {college.location}

            </p>
            <div className="flex flex-wrap gap-3 mt-4">

  <span className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-300">
    {college.ownership}
  </span>

  <span className="px-4 py-2 rounded-full bg-[#202020] border border-[#2a2a2a] text-white">
    {college.examsAccepted}
  </span>

  <span className="px-4 py-2 rounded-full bg-[#202020] border border-[#2a2a2a] text-white">
    Est. {college.establishedYear}
  </span>

</div>

     <div className="flex gap-5 flex-wrap">

  <button
    onClick={() =>
      setShowApplyModal(true)
    }
    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-black px-10 py-5 rounded-2xl transition duration-300 hover:scale-105 shadow-[0_10px_40px_rgba(34,197,94,0.3)]"
  >
    Apply Now
  </button>

  <a
    href="/brochure.pdf"
    download
    className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-xl px-10 py-5 rounded-2xl font-bold transition duration-300 inline-flex items-center"
  >
    Download Brochure
  </a>

  <a
    href={college.website || "#"}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-xl px-10 py-5 rounded-2xl font-bold transition duration-300 inline-flex items-center"
  >
    Official Website
  </a>

</div>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">

          <div className="bg-gradient-to-br from-[#1c1c1c] to-[#131313] border border-[#2a2a2a] rounded-[30px] p-8 hover:border-green-500/30 transition duration-300">

            <p className="text-gray-500 mb-3">
              Annual Fees
            </p>

            <h2 className="text-4xl font-black">
              {college.fees}
            </h2>

          </div>

          <div className="bg-gradient-to-br from-[#1c1c1c] to-[#131313] border border-[#2a2a2a] rounded-[30px] p-8 hover:border-green-500/30 transition duration-300">

            <p className="text-gray-500 mb-3">
              Avg Package
            </p>

            <h2 className="text-4xl font-black text-green-400">
              {college.avgPackage}
            </h2>

          </div>

          <div className="bg-gradient-to-br from-[#1c1c1c] to-[#131313] border border-[#2a2a2a] rounded-[30px] p-8 hover:border-green-500/30 transition duration-300">

            <p className="text-gray-500 mb-3">
              Highest Package
            </p>

            <h2 className="text-4xl font-black text-green-400">
             {college.highestPackage || "N/A"}
            </h2>

          </div>

          <div className="bg-gradient-to-br from-[#1c1c1c] to-[#131313] border border-[#2a2a2a] rounded-[30px] p-8 hover:border-green-500/30 transition duration-300">

            <p className="text-gray-500 mb-3">
              Placement Rate
            </p>

            <h2 className="text-4xl font-black text-green-400">
            N/A
            </h2>

          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10">

          <div className="space-y-10">            <div className="bg-gradient-to-br from-[#181818] to-[#121212] border border-[#2a2a2a] rounded-[32px] p-10">

              <h2 className="text-4xl font-black mb-6">

                About College

              </h2>

              <p className="text-gray-400 text-lg leading-relaxed">

              {college.description}

              </p>
              <div className="bg-gradient-to-br from-[#181818] to-[#121212] border border-[#2a2a2a] rounded-[32px] p-10 mt-10">

  <h2 className="text-4xl font-black text-white mb-8">
    College Information
  </h2>

  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

    <div className="bg-[#1b1b1b] border border-[#2a2a2a] rounded-2xl p-6">
      <p className="text-gray-500 mb-2">
        Established
      </p>

      <p className="text-xl font-bold text-white">
        {college.establishedYear || "N/A"}
      </p>
    </div>

    <div className="bg-[#1b1b1b] border border-[#2a2a2a] rounded-2xl p-6">
      <p className="text-gray-500 mb-2">
        Ownership
      </p>

      <p className="text-xl font-bold text-white">
        {college.ownership || "N/A"}
      </p>
    </div>

    <div className="bg-[#1b1b1b] border border-[#2a2a2a] rounded-2xl p-6">
      <p className="text-gray-500 mb-2">
        Accreditation
      </p>

      <p className="text-xl font-bold text-white">
        {college.accreditation || "N/A"}
      </p>
    </div>

    <div className="bg-[#1b1b1b] border border-[#2a2a2a] rounded-2xl p-6">
      <p className="text-gray-500 mb-2">
        Exam Accepted
      </p>

      <p className="text-xl font-bold text-white">
        {college.examsAccepted || "N/A"}
      </p>
    </div>

  </div>

</div>

            </div>

            <div className="bg-gradient-to-br from-[#181818] to-[#121212] border border-[#2a2a2a] rounded-[32px] p-10">

              <h2 className="text-4xl font-black mb-8">

                Top Recruiters

              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

                <div className="bg-[#202020] border border-[#2a2a2a] rounded-2xl p-6 text-center font-bold hover:border-green-500/30 transition duration-300">
                  Google
                </div>

                <div className="bg-[#202020] border border-[#2a2a2a] rounded-2xl p-6 text-center font-bold hover:border-green-500/30 transition duration-300">
                  Microsoft
                </div>

                <div className="bg-[#202020] border border-[#2a2a2a] rounded-2xl p-6 text-center font-bold hover:border-green-500/30 transition duration-300">
                  Amazon
                </div>

                <div className="bg-[#202020] border border-[#2a2a2a] rounded-2xl p-6 text-center font-bold hover:border-green-500/30 transition duration-300">
                  Adobe
                </div>

              </div>

            </div>

            <div className="bg-gradient-to-br from-[#181818] to-[#121212] border border-[#2a2a2a] rounded-[32px] p-10">

              <div className="flex items-center justify-between mb-10">

                <div>

                  <h2 className="text-4xl font-black mb-3">

                    Placement Analytics

                  </h2>

                  <p className="text-gray-500 text-lg">

                    Latest placement performance overview

                  </p>

                </div>

                <div className="bg-green-500/10 border border-green-500/20 px-5 py-3 rounded-2xl text-green-400 font-bold">

                  2025 Report

                </div>

              </div>

              <div className="space-y-8">

                <div>

                  <div className="flex items-center justify-between mb-3">

                    <span className="text-lg font-semibold">
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

                    <span className="text-lg font-semibold">
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

                    <span className="text-lg font-semibold">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">

                <div className="bg-[#202020] border border-[#2a2a2a] rounded-3xl p-6">

                  <p className="text-gray-500 mb-3">
                    Highest International
                  </p>

                  <h3 className="text-3xl font-black text-green-400">
                    {college.highestPackage || "N/A"}
                  </h3>

                </div>

                <div className="bg-[#202020] border border-[#2a2a2a] rounded-3xl p-6">

                  <p className="text-gray-500 mb-3">
                    Highest Domestic
                  </p>

                  <h3 className="text-3xl font-black text-green-400">
                    ₹64L
                  </h3>

                </div>

                <div className="bg-[#202020] border border-[#2a2a2a] rounded-3xl p-6">

                  <p className="text-gray-500 mb-3">
                    Avg CTC
                  </p>

                  <h3 className="text-3xl font-black text-green-400">
                    {college.avgPackage}
                  </h3>

                </div>

              </div>

            </div>            <div className="bg-gradient-to-br from-[#181818] to-[#121212] border border-[#2a2a2a] rounded-[32px] p-10">

              <h2 className="text-4xl font-black mb-8">

                Facilities

              </h2>

              <div className="flex flex-wrap gap-4">

                <div className="px-6 py-4 rounded-2xl bg-[#202020] border border-[#2a2a2a]">
                  Hostel
                </div>

                <div className="px-6 py-4 rounded-2xl bg-[#202020] border border-[#2a2a2a]">
                  Sports Complex
                </div>

                <div className="px-6 py-4 rounded-2xl bg-[#202020] border border-[#2a2a2a]">
                  Central Library
                </div>

                <div className="px-6 py-4 rounded-2xl bg-[#202020] border border-[#2a2a2a]">
                  WiFi Campus
                </div>

                <div className="px-6 py-4 rounded-2xl bg-[#202020] border border-[#2a2a2a]">
                  Labs
                </div>

              </div>

            </div>

            <div className="bg-gradient-to-br from-[#181818] to-[#121212] border border-[#2a2a2a] rounded-[32px] p-10">

              <h2 className="text-4xl font-black mb-8">

                Popular Courses

              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="bg-[#202020] border border-[#2a2a2a] rounded-3xl p-6 hover:border-green-500/30 transition duration-300">

                  <div className="flex items-center justify-between mb-5">

                    <h3 className="text-2xl font-black">
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

                <div className="bg-[#202020] border border-[#2a2a2a] rounded-3xl p-6 hover:border-green-500/30 transition duration-300">

                  <div className="flex items-center justify-between mb-5">

                    <h3 className="text-2xl font-black">
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

            <div className="bg-gradient-to-br from-[#181818] to-[#121212] border border-[#2a2a2a] rounded-[32px] p-10">

              <h2 className="text-4xl font-black mb-8">

                Student Reviews

              </h2>

              <div className="space-y-6">

                <div className="bg-[#202020] border border-[#2a2a2a] rounded-3xl p-6">

                  <div className="flex items-center justify-between mb-4">

                    <h3 className="text-2xl font-black">
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

                <div className="bg-[#202020] border border-[#2a2a2a] rounded-3xl p-6">

                  <div className="flex items-center justify-between mb-4">

                    <h3 className="text-2xl font-black">
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

            </div>            <div className="bg-gradient-to-br from-[#181818] to-[#121212] border border-[#2a2a2a] rounded-[32px] p-10">

              <h2 className="text-4xl font-black mb-8">

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

          <div className="h-fit sticky top-28">

            <div className="bg-gradient-to-br from-[#181818] to-[#121212] border border-[#2a2a2a] rounded-[32px] p-8">

              <h2 className="text-3xl font-black mb-8">

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
  className="w-full mt-10 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-black py-5 rounded-2xl transition duration-300 hover:scale-105"
>
  Apply For Admission
</button>

            </div>

          </div>

        </div>

        <div className="mt-16">

          <div className="flex items-center justify-between mb-8">

            <h2 className="text-4xl font-black">

              Similar Colleges

            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {similarColleges.map((item) => (

                <div
                  key={item.id}
                  className="group bg-gradient-to-br from-[#181818] to-[#121212] border border-[#2a2a2a] rounded-[32px] overflow-hidden hover:border-green-500/30 transition duration-500 hover:-translate-y-2"
                >

                  <img
                    src={item.image}
                    alt=""
                    className="h-56 w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="p-6">

                    <h3 className="text-2xl font-black mb-3">

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

        </div>        <div className="mt-16 bg-gradient-to-br from-[#181818] to-[#121212] border border-[#2a2a2a] rounded-[32px] p-10">

          <h2 className="text-4xl font-black mb-10">

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
        className="w-full flex items-center justify-between p-6 text-left"
      >

        <span className="text-xl font-bold">
          {faq.q}
        </span>

        <span className="text-green-400 text-2xl font-black">
          {openFaq === index ? "−" : "+"}
        </span>

      </button>

      {openFaq === index && (

        <div className="px-6 pb-6">

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

  <div className="fixed bottom-8 right-8 bg-green-500 text-black font-black px-6 py-4 rounded-2xl z-50 shadow-xl">

    ✓ Application Submitted

  </div>

)}
{showApplyModal && (

  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

    <div className="bg-[#181818] border border-[#2a2a2a] rounded-[32px] p-8 w-full max-w-lg">

      <h2 className="text-3xl font-black mb-6">
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

      <div className="flex gap-4">

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
