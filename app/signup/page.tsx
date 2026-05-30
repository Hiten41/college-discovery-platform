"use client";

import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const res = await fetch(
      "/api/auth/signup",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    );

    const data = await res.json();

    alert(data.message || data.error);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">

      <div className="bg-[#181818] p-8 rounded-3xl w-full max-w-md">

        <h1 className="text-white text-4xl font-black mb-8">
          Sign Up
        </h1>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="w-full mb-4 p-4 rounded-xl bg-[#222] text-white"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full mb-4 p-4 rounded-xl bg-[#222] text-white"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full mb-6 p-4 rounded-xl bg-[#222] text-white"
        />

        <button
          onClick={handleSignup}
          className="w-full bg-green-500 text-black font-black py-4 rounded-xl"
        >
          Create Account
        </button>

      </div>

    </div>
  );
}