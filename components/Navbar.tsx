"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useSyncExternalStore } from "react"

interface User {
  id: string
  name: string
  email: string
}

const emptyUserSnapshot = "null"

function subscribeToUserStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  return () => window.removeEventListener("storage", onStoreChange)
}

function getStoredUserSnapshot(): string {
  return localStorage.getItem("user") || emptyUserSnapshot
}

function getServerUserSnapshot(): string {
  return emptyUserSnapshot
}

function parseUserSnapshot(snapshot: string): User | null {
  try {
    return JSON.parse(snapshot)
  } catch {
    return null
  }
}

export default function Navbar() {


const userSnapshot = useSyncExternalStore(
  subscribeToUserStorage,
  getStoredUserSnapshot,
  getServerUserSnapshot
)

const user = useMemo(
  () => parseUserSnapshot(userSnapshot),
  [userSnapshot]
)


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

            <Image
              src="/images/logo.png"
              alt="CollegeHub logo"
              width={44}
              height={44}
              priority
              className="relative h-11 w-11 rounded-2xl object-contain"
            />

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
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-bold px-6 py-3 rounded-2xl transition duration-300 shadow-[0_10px_30px_rgba(34,197,94,0.25)]"
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
