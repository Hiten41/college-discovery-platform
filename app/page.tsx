import HomeClient from "./HomeClient"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

export const revalidate = 300

const getInitialColleges = unstable_cache(
  async () => {
    return prisma.college.findMany({
      select: {
  id: true,

  name: true,
  location: true,
  state: true,

  fees: true,

  avgPackage: true,
  highestPackage: true,

  nirfRank: true,
  rating: true,

  ownership: true,

  accreditation: true,

  examsAccepted: true,

  website: true,

  description: true,

  establishedYear: true,

  image: true,
},
    })
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

  nirfRank: college.nirfRank ?? 999,
  rating: college.rating ?? 0,
}))

return <HomeClient initialColleges={safeColleges} />
}