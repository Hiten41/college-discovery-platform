export interface College {
  id: string
  name: string
  location: string
  rating: string
  fees: string
  avgPackage: string
  nirfRank: number
  students: string
  image: string
}

const colleges: College[] = [
  {
    id: "iit-delhi",
    name: "IIT Delhi",
    location: "New Delhi",
    rating: "4.8",
    fees: "₹2,50,000/year",
    avgPackage: "₹21 LPA",
    nirfRank: 2,
    students: "12,000+",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: "nit-trichy",
    name: "NIT Trichy",
    location: "Tamil Nadu",
    rating: "4.7",
    fees: "₹1,80,000/year",
    avgPackage: "₹15 LPA",
    nirfRank: 9,
    students: "10,000+",
    image:
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: "bits-pilani",
    name: "BITS Pilani",
    location: "Rajasthan",
    rating: "4.6",
    fees: "₹4,50,000/year",
    avgPackage: "₹18 LPA",
    nirfRank: 20,
    students: "15,000+",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: "iit-bombay",
    name: "IIT Bombay",
    location: "Mumbai",
    rating: "4.9",
    fees: "₹2,30,000/year",
    avgPackage: "₹23 LPA",
    nirfRank: 3,
    students: "13,000+",
    image:
      "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: "iit-madras",
    name: "IIT Madras",
    location: "Chennai",
    rating: "4.8",
    fees: "₹2,20,000/year",
    avgPackage: "₹22 LPA",
    nirfRank: 1,
    students: "11,000+",
    image:
      "https://images.unsplash.com/photo-1564981797816-1043664bf78d?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: "iit-kanpur",
    name: "IIT Kanpur",
    location: "Kanpur",
    rating: "4.7",
    fees: "₹2,10,000/year",
    avgPackage: "₹19 LPA",
    nirfRank: 5,
    students: "9,000+",
    image:
      "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: "iit-kharagpur",
    name: "IIT Kharagpur",
    location: "West Bengal",
    rating: "4.7",
    fees: "₹2,15,000/year",
    avgPackage: "₹18 LPA",
    nirfRank: 6,
    students: "14,000+",
    image:
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: "vit-vellore",
    name: "VIT Vellore",
    location: "Tamil Nadu",
    rating: "4.5",
    fees: "₹1,95,000/year",
    avgPackage: "₹9 LPA",
    nirfRank: 11,
    students: "20,000+",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop",
  },
]

export default colleges