import HomeClient from "./HomeClient"
import { getCollegeCards } from "@/lib/collegeSource"
import { unstable_cache } from "next/cache"

export const revalidate = 300

const getInitialColleges = unstable_cache(
  async () => {
    return getCollegeCards()
  },
  ["colleges:initial"],
  { revalidate }
)

export default async function Page() {
 const colleges = await getInitialColleges()

const safeColleges = colleges.map((college) => ({
  ...college,

  fees: college.fees ?? 0,
  avgPackage: college.avgPackage ?? "N/A",
  image: college.image ?? "/images/hacker.jpg",
  description: college.description ?? "",

  nirfRank: college.nirfRank ?? 999,
  rating: college.rating ?? 0,
}))

return <HomeClient initialColleges={safeColleges} />
}
