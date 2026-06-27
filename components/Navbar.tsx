"use client"

import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useMemo, useState, useSyncExternalStore } from "react"

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const userSnapshot = useSyncExternalStore(
    subscribeToUserStorage,
    getStoredUserSnapshot,
    getServerUserSnapshot
  )

  const user = useMemo(
    () => parseUserSnapshot(userSnapshot),
    [userSnapshot]
  )

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 18)

    updateScrollState()
    window.addEventListener("scroll", updateScrollState, { passive: true })

    return () => window.removeEventListener("scroll", updateScrollState)
  }, [])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const handleLogout = () => {
    localStorage.removeItem("user")
    window.location.reload()
  }

  const handleCompareNavigation = () => {
    closeMobileMenu()

    const compareSection = document.getElementById("compare")

    if (compareSection) {
      compareSection.scrollIntoView({ behavior: "smooth" })
      return
    }

    window.location.href = "/#compare"
  }

  return (
    <motion.nav
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-3 z-50 mx-3 rounded-[28px] border backdrop-blur-2xl transition-all duration-500 ${
        isScrolled
          ? "border-white/10 bg-black/62 shadow-[0_18px_70px_rgba(0,0,0,0.42)]"
          : "border-white/5 bg-black/38 shadow-[0_10px_45px_rgba(0,0,0,0.24)]"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 lg:py-4 flex items-center justify-between">
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex min-w-0 items-center gap-3 sm:gap-4"
        >
          <div className="relative shrink-0">
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

          <div className="min-w-0">
            <h1 className="text-white text-xl sm:text-2xl font-black tracking-tight">
              CollegeHub
            </h1>

            <p className="hidden min-[360px]:block text-gray-500 text-xs sm:text-sm">
              Discover - Compare - Explore
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
            onClick={handleCompareNavigation}
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

        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden md:block text-white font-semibold">
                Hi, {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="luxe-button bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-bold px-6 py-3 rounded-2xl shadow-[0_10px_30px_rgba(34,197,94,0.25)]"
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
                className="luxe-button relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-black px-7 py-3 rounded-2xl shadow-[0_10px_40px_rgba(34,197,94,0.35)]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="luxe-button grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white hover:border-green-400/40 hover:bg-green-500/10 lg:hidden"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={`grid overflow-hidden border-t border-white/5 bg-[#080808]/95 transition-all duration-300 ease-out lg:hidden ${
          isMobileMenuOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto w-full max-w-7xl px-4 pb-5 pt-3">
          <div className="space-y-2">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="block rounded-2xl px-4 py-3 text-base font-bold text-gray-200 transition hover:bg-white/[0.04] hover:text-white"
            >
              Home
            </Link>

            <button
              type="button"
              onClick={handleCompareNavigation}
              className="block w-full rounded-2xl px-4 py-3 text-left text-base font-bold text-gray-200 transition hover:bg-white/[0.04] hover:text-white"
            >
              Compare
            </button>

            <Link
              href="/rank-predictor"
              onClick={closeMobileMenu}
              className="block rounded-2xl px-4 py-3 text-base font-bold text-gray-200 transition hover:bg-white/[0.04] hover:text-white"
            >
              Rank Predictor
            </Link>

            <Link
              href="/saved-colleges"
              onClick={closeMobileMenu}
              className="block rounded-2xl px-4 py-3 text-base font-bold text-gray-200 transition hover:bg-white/[0.04] hover:text-white"
            >
              Saved Colleges
            </Link>
          </div>

          <div className="mt-4 border-t border-white/10 pt-4">
            {user ? (
              <div className="space-y-3">
                <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white">
                  Hi, {user.name}
                </p>

                <button
                  onClick={handleLogout}
                  className="luxe-button w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-3.5 text-center font-black text-black hover:from-green-400 hover:to-emerald-400"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="rounded-2xl border border-white/10 px-5 py-3.5 text-center font-bold text-gray-200 transition hover:border-green-400/40 hover:text-white"
                >
                  Login
                </Link>

                <Link
                  href="/signup"
                  onClick={closeMobileMenu}
                  className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-3.5 text-center font-black text-black transition hover:from-green-400 hover:to-emerald-400"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
