Restaurant Table Management System (Next.js)

Setup
- Requirements: Node 20+, npm
- Install deps: `npm i`
- DB: Prisma + SQLite (local file)
- Migrate: `npx prisma migrate dev`
- Seed sample tables: `npm run prisma:seed`
- Dev: `npm run dev`

App Structure
- Floor: `/` — visual grid with tables (click to seat walk-in / end seating)
- Reservations: `/reservations` — create, confirm, cancel, and seat reservations
- Analytics: `/analytics` — daily covers, peak hour, average dining time
- Realtime: server-sent events at `/api/events` broadcast updates

Tech
- Next.js App Router, Tailwind, Prisma (SQLite)
- API routes: `/api/tables`, `/api/reservations`, `/api/seating`, `/api/analytics`
- Models: Table, Reservation, SeatingSession

Product Brief (1 page)
- Target user persona: floor manager / host(ess) at small to mid-size restaurants
- Key problem solved: quick overview of table status, fast walk-in seating, and reservation handling in one place
- Success metrics: time-to-seat, reduced double-booking, table turn time, covers per service

Development Process (1 page)
- AI usage: scaffolding Next.js + Tailwind, Prisma schema design, API routes, and basic UI wiring
- Biggest help: schema iteration and API boilerplate, lint fixes, and wiring SSE across pages
- Time saved: ~2–3 hours vs fully manual implementation

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
