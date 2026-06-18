"use client"

import Link from "next/link"
import { useState } from "react"
interface CollegeCardProps {
  id: string
  name: string
  image: string
  location: string
  fees: string
  avgPackage: string
  rating: string
  nirfRank: number
  onCompare: () => void
  isCompared?: boolean
}

function formatFees(fees: string | number) {

  const number =
    typeof fees === "number"
      ? fees
      : parseInt(
          fees.replace(/[^0-9]/g, "")
        )

  if (number >= 100000) {
    return `₹${(number / 100000).toFixed(1)}L`
  }

  if (number >= 1000) {
    return `₹${(number / 1000).toFixed(0)}K`
  }

  return `₹${number}`
}

export default function CollegeCard(props: CollegeCardProps) {
const [saveMessage, setSaveMessage] = useState("")
const saveCollege = async () => {

  const user =
    JSON.parse(
      localStorage.getItem("user") || "null"
    )

  if (!user) {

    window.location.href = "/login"
    return

  }

  const response = await fetch(
    "/api/saved-colleges",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        collegeId: props.id,
      }),
    }
  )

  const data =
    await response.json()

  const button =
    document.getElementById(
      `save-${props.id}`
    )

  if (!button) return

  if (response.ok) {

    button.innerHTML =
      "✓ Saved"

    button.classList.add(
      "text-green-400"
    )

  } else {

    button.innerHTML =
      data.error ||
      "Already Saved"

    button.classList.add(
      "text-yellow-400"
    )

  }

}

  return (

    <div className="group relative bg-gradient-to-br from-[#1a1a1a] via-[#141414] to-[#101010] rounded-[32px] overflow-hidden border border-[#2a2a2a] hover:border-green-500/40 transition duration-500 hover:-translate-y-3 hover:shadow-[0_25px_80px_rgba(0,0,0,0.7)]">

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />

      <div className="relative overflow-hidden">

       <img
  src={props.image}
  alt={props.name}
 
  className="h-64 w-full object-cover transition duration-[1200ms] group-hover:scale-110"
/>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-black/20 to-transparent" />

        <div className="absolute top-5 left-5">

          <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-sm font-bold text-white">

            NIRF #{props.nirfRank}

          </div>

        </div>

        <div className="absolute top-5 right-5">

          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-black px-4 py-2 rounded-full text-sm font-black shadow-lg shadow-green-500/20">

            {props.rating}

          </div>

        </div>

      </div>

      <div className="relative p-8">

        <div className="mb-6">

         <h2 className="text-[1.8rem] font-extrabold tracking-tight text-white mb-2 transition duration-300">
            {props.name}

          </h2>

         <p className="text-zinc-500 text-sm uppercase tracking-wider font-semibold">
            {props.location}
          </p>

        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">

     <div className="bg-[#171717] border border-[#262626] rounded-2xl p-4">

            <p className="text-gray-500 text-sm mb-2">
              Annual Fees
            </p>

        <h3 className="text-green-300 text-xl font-bold tracking-tight">

              {formatFees(props.fees)}

            </h3>

          </div>

         <div className="bg-[#171717] border border-[#262626] rounded-2xl p-4">

            <p className="text-gray-500 text-sm mb-2">
              Avg Package
            </p>

            <h3 className="text-green-400 text-2xl font-black">

              {props.avgPackage}

            </h3>

          </div>

        </div>

       

        <div className="space-y-3">

         <button
  id={`save-${props.id}`}
  onClick={saveCollege}
  className="w-full py-3 rounded-2xl border border-[#2a2a2a] text-white hover:text-green-400 hover:border-green-500/50 transition"
>
  Save College
</button>

          <div className="flex gap-4">

            <Link
              href={`/college/${props.id}`}
              className="flex-1"
            >

              <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-black py-4 rounded-2xl transition duration-300 hover:scale-105 shadow-lg shadow-green-500/20">

                View Details

              </button>

            </Link>

           <button
  onClick={props.onCompare}
  className={`px-6 rounded-2xl font-bold transition duration-300 hover:scale-105 border ${
    props.isCompared
      ? "bg-green-500 text-black border-green-500"
      : "bg-[#232323] hover:bg-[#2d2d2d] border-[#333] text-white"
  }`}
>
  {props.isCompared ? "Added ✓" : "Compare"}
</button>

          </div>

        </div>

      </div>

    </div>

  )
}