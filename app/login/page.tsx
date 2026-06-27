"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    try {

      setLoading(true);

      const res = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      router.push("/");
      router.refresh();

    } catch (error) {

      console.error(error);
      alert("Login failed");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="premium-depth-root relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-green-500/20 blur-[110px]" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="luxe-surface luxe-section relative w-full max-w-md overflow-hidden rounded-[32px] p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500 via-emerald-300 to-green-500" />

        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-emerald-300/20 bg-black/30 shadow-[0_0_35px_rgba(34,197,94,0.28)]">
            <Image src="/images/logo.png" alt="CollegeHub logo" width={40} height={40} className="h-10 w-10 rounded-xl object-contain" priority />
          </div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-green-300">
            Welcome back
          </p>
          <h1 className="text-4xl font-black text-white">
            Login to CollegeHub
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            Continue discovering, saving, and comparing colleges.
          </p>
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="luxe-input mb-4 w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-green-400/50 focus:bg-green-500/5"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="luxe-input mb-6 w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-green-400/50 focus:bg-green-500/5"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="luxe-button w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 py-4 font-black text-black shadow-[0_18px_45px_rgba(34,197,94,0.28)] hover:from-green-400 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Logging In..." : "Login"}
        </button>

        <p className="mt-6 text-center text-sm text-zinc-400">
          New to CollegeHub?{" "}
          <Link href="/signup" className="font-bold text-green-300 transition hover:text-green-200">
            Create an account
          </Link>
        </p>

      </div>

    </div>

  );
}
