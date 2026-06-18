"use client"

import Link from "next/link"
import { useState } from "react"

export default function Navbar() {


 interface User {
  id: string
  name: string
  email: string
}

const [user] = useState<User | null>(() => {

  if (typeof window === "undefined") {
    return null
  }

  return JSON.parse(
    localStorage.getItem("user") || "null"
  )

})

  const handleLogout = () => {

    localStorage.removeItem("user")

    window.location.reload()

  }

  return (

    <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-black/50 border-b border-white/5">

      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

        <Link
          href="/"
          className="flex items-center gap-4"
        >

          <div className="relative">

            <div className="absolute inset-0 bg-green-500 blur-xl opacity-40 rounded-2xl" />

            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-black text-xl font-black">
              C
            </div>

          </div>

          <div>

            <h1 className="text-white text-2xl font-black tracking-tight">
              CollegeHub
            </h1>

            <p className="text-gray-500 text-sm">
              Discover • Compare • Explore
            </p>

          </div>

        </Link>

        <div className="hidden lg:flex items-center gap-8">

          <Link
            href="/"
            className="text-gray-400 hover:text-white transition duration-300 font-medium"
          >
            Home
          </Link>

        <button
  onClick={() =>
    document
      .getElementById("colleges")
      ?.scrollIntoView({ behavior: "smooth" })
  }
  className="text-gray-400 hover:text-white transition duration-300 font-medium"
>
  Top Colleges
</button>

<button
  onClick={() =>
    document
      .getElementById("compare")
      ?.scrollIntoView({ behavior: "smooth" })
  }
  className="text-gray-400 hover:text-white transition duration-300 font-medium"
>
  Compare
</button>

<Link
  href="/rank-predictor"
  className="text-gray-400 hover:text-white transition duration-300 font-medium"
>
  Rank Predictor
</Link>

          <Link
            href="/saved-colleges"
            className="text-gray-400 hover:text-white transition duration-300 font-medium"
          >
            Saved Colleges
          </Link>

          

        </div>

        <div className="flex items-center gap-4">

          {user ? (

            <>
              <span className="hidden md:block text-white font-semibold">
                Hi, {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-400 text-white font-bold px-6 py-3 rounded-2xl transition duration-300"
              >
                Logout
              </button>
            </>

          ) : (

            <>
              <Link
                href="/login"
                className="hidden md:block text-gray-300 hover:text-white transition duration-300 font-medium"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-black px-7 py-3 rounded-2xl transition duration-300 hover:scale-105 shadow-[0_10px_40px_rgba(34,197,94,0.35)]"
              >
                Get Started
              </Link>
            </>

          )}

        </div>

      </div>

    </nav>

  )
}
