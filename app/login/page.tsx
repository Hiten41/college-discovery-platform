"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

    <div className="min-h-screen bg-black flex items-center justify-center">

      <div className="bg-[#181818] p-8 rounded-3xl w-full max-w-md">

        <h1 className="text-white text-4xl font-black mb-8">
          Login
        </h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full mb-4 p-4 rounded-xl bg-[#222] text-white"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full mb-6 p-4 rounded-xl bg-[#222] text-white"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-green-500 text-black font-black py-4 rounded-xl disabled:opacity-50"
        >
          {loading ? "Logging In..." : "Login"}
        </button>

      </div>

    </div>

  );
}