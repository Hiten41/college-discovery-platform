"use client"
import Navbar from "@/components/Navbar"


import { useEffect, useState } from "react"
import Link from "next/link"

interface SavedCollege {
  id: string
  name: string
  image: string
  location: string
  fees: string
  avgPackage: string
  rating: string
  nirfRank: number
}

export default function Wishlist() {

  const [savedColleges, setSavedColleges] = useState<SavedCollege[]>([])

  const removeCollege = (id: string) => {

    const updatedColleges =
      savedColleges.filter(
        college => college.id !== id
      )

    localStorage.setItem(
      "savedColleges",
      JSON.stringify(updatedColleges)
    )

    setSavedColleges(updatedColleges)

  }

  useEffect(() => {

    const colleges =
      JSON.parse(
        localStorage.getItem("savedColleges") || "[]"
      )

    setSavedColleges(colleges)

  }, [])

  return (

<div className="min-h-screen bg-[#0d0d0d] text-white">

  <Navbar />

  <div className="max-w-6xl mx-auto px-6 py-10">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-black mb-3">

          My Wishlist

        </h1>

        <p className="text-gray-400 mb-10">

          Colleges you've saved for later comparison and exploration.

        </p>

        {savedColleges.length === 0 ? (

          <div className="bg-[#181818] border border-[#2a2a2a] rounded-[32px] p-16 text-center">

            <h2 className="text-3xl font-black mb-4">

              No Colleges Saved Yet

            </h2>

            <p className="text-gray-400 mb-8">

              Start exploring colleges and save your favorites here.

            </p>

            <Link href="/">

              <button className="px-8 py-4 rounded-2xl bg-green-500 hover:bg-green-400 text-black font-black transition duration-300">

                Explore Colleges

              </button>

            </Link>

          </div>

        ) : (

          <div className="space-y-6">

            {savedColleges.map((college) => (

              <div
                key={college.id}
                className="bg-gradient-to-br from-[#181818] to-[#121212] border border-[#2a2a2a] rounded-[32px] overflow-hidden hover:border-green-500/30 transition duration-300"
              >

                <div className="flex flex-col md:flex-row">

                  <img
                    src={college.image}
                    alt={college.name}
                    className="w-full md:w-72 h-56 md:h-auto object-cover"
                  />

                  <div className="flex-1 p-6 flex flex-col justify-between">

                    <div>

                      <h2 className="text-2xl font-black mb-2">

                        {college.name}

                      </h2>

                      <p className="text-gray-400 mb-4">

                        {college.location}

                      </p>

                      <div className="flex flex-wrap gap-3">

                        <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold">

                          {college.avgPackage}

                        </div>

                        <div className="px-4 py-2 rounded-full bg-[#232323] border border-[#333] text-gray-300 text-sm font-bold">

                          NIRF #{college.nirfRank}

                        </div>

                        <div className="px-4 py-2 rounded-full bg-[#232323] border border-[#333] text-gray-300 text-sm font-bold">

                          {college.fees}

                        </div>

                      </div>

                    </div>

                    <div className="flex gap-4 mt-6 flex-wrap">

                      <Link
                        href={`/college/${college.id}`}
                      >

                        <button className="px-6 py-3 rounded-2xl bg-green-500 hover:bg-green-400 text-black font-black transition duration-300 hover:scale-105">

                          View Details

                        </button>

                      </Link>

                      <button
                        onClick={() => removeCollege(college.id)}
                        className="px-6 py-3 rounded-2xl bg-red-500 hover:bg-red-400 text-white font-black transition duration-300 hover:scale-105"
                      >

                        Remove

                      </button>

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

            </div>

      </div>

    </div>

  )

}