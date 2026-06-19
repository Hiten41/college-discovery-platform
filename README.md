# CollegeHub

A college discovery and guidance platform for Indian students — search, compare, and shortlist colleges with the help of an AI counselor and a rank-based predictor.

**Live:** [college-discovery-platform-ten-phi.vercel.app](https://college-discovery-platform-ten-phi.vercel.app/)

---

## What it does

**College Search & Filters**
Search colleges by name and filter by state, fee range, rankings, and entrance exams. Results update fast without page reloads.

**Side-by-Side Comparison**
Pick up to 3 colleges and compare them on fees, NIRF ranking, average package, placement rate, and overall rating.

**Ask Motu — AI Counselor**
A conversational assistant powered by Gemini. Ask it anything college-related — it pulls from structured college data to give grounded answers and handles follow-up questions naturally.

**Rank Predictor**
Enter your entrance exam rank, budget, preferred branch, and college type. Get a categorized list of Dream, Target, and Safe colleges based on your inputs.

**Saved Colleges**
Bookmark colleges and access them from a quick-view dashboard with direct links to official websites.

---

## Tech Stack

| Layer      | Tech                        |
|------------|-----------------------------|
| Frontend   | Next.js, React, TypeScript, Tailwind CSS |
| Backend    | Next.js API Routes          |
| ORM        | Prisma                      |
| Database   | PostgreSQL (Neon)           |
| AI         | Google Gemini API           |
| Deployment | Vercel                      |

---

## Architecture

```
User → Next.js Frontend → API Routes → Prisma ORM → PostgreSQL
```

For AI queries:
```
User → Ask Motu → Gemini API → College Data Layer → Response
```

---

## Running Locally

```bash
git clone https://github.com/Hiten41/college-discovery-platform
cd college-discovery-platform
npm install
```

Set up your `.env`:
```env
DATABASE_URL=your_neon_postgres_url
GEMINI_API_KEY=your_gemini_api_key
```

Push the schema and seed data:
```bash
npx prisma db push
npx prisma db seed
```

Start the dev server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Roadmap

- [ ] Historical placement trends per college
- [ ] Review sentiment analysis
- [ ] OCR-based scorecard upload for rank prediction
- [ ] Counseling round cutoff analytics
- [ ] Alumni Q&A integration

---

## Author

**Hiten Arora** — IIT (ISM) Dhanbad  
[github.com/Hiten41](https://github.com/Hiten41)
