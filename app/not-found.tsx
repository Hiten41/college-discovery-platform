import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center text-white">

      <h1 className="text-8xl font-black mb-6">
        404
      </h1>

      <p className="text-gray-400 text-xl mb-8">
        Page not found
      </p>

      <Link
        href="/"
        className="px-8 py-4 rounded-2xl bg-green-500 text-black font-black"
      >
        Back Home
      </Link>

    </div>
  )
}