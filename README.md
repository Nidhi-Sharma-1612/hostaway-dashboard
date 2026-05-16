# Hostaway Dashboard

A responsive property management dashboard built with Next.js, connecting to the [Hostaway API](https://api.hostaway.com/documentation) to manage listings, reservations, and calendar availability in real time.

## Features

- **Dashboard** — Live stats: total properties, confirmed reservations, arriving today, guests in-house
- **Listings** — Browse all properties with images, location, bedrooms, capacity, and pricing
- **Reservations** — View, create, edit, and delete reservations with status tracking
- **Calendar** — Monthly availability view per property; click to block or unblock dates
- **Responsive** — Works on mobile (bottom nav) and desktop (sidebar)

## Tech Stack

- [Next.js 16](https://nextjs.org) — App Router, server components, API routes
- [Tailwind CSS v4](https://tailwindcss.com) — Styling
- [shadcn/ui](https://ui.shadcn.com) — UI components
- [TanStack Query](https://tanstack.com/query) — Client-side data fetching and cache
- [date-fns](https://date-fns.org) — Date formatting
- [Hostaway API](https://api.hostaway.com/documentation) — OAuth 2.0 + REST

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/hostaway-dashboard.git
cd hostaway-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root:

```env
HOSTAWAY_CLIENT_ID=your_client_id
HOSTAWAY_CLIENT_SECRET=your_client_secret
```

You can obtain these credentials from your Hostaway account under **Settings → API**.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  page.tsx                  # Dashboard with live stats
  listings/
    page.tsx                # Listings grid
    [id]/page.tsx           # Listing detail
  reservations/
    page.tsx                # Reservations table + CRUD
  calendar/
    page.tsx                # Monthly calendar per listing
  api/
    listings/               # GET /api/listings
    listings/[id]/          # GET /api/listings/:id
    reservations/           # GET + POST /api/reservations
    reservations/[id]/      # PUT + DELETE /api/reservations/:id
    calendar/[id]/          # GET + PUT /api/calendar/:id
components/
  sidebar.tsx               # Desktop sidebar + mobile bottom nav
  providers.tsx             # React Query provider
  ui/                       # shadcn/ui components
lib/
  hostaway.ts               # OAuth token management + fetch wrapper
  utils.ts                  # Tailwind class utility
```

## Environment Variables

| Variable | Description |
|---|---|
| `HOSTAWAY_CLIENT_ID` | Your Hostaway API client ID |
| `HOSTAWAY_CLIENT_SECRET` | Your Hostaway API client secret |

These are never exposed to the browser — all Hostaway API calls are proxied through Next.js API routes.

## Deployment

Deploy to [Vercel](https://vercel.com) in one click. Set `HOSTAWAY_CLIENT_ID` and `HOSTAWAY_CLIENT_SECRET` as environment variables in the Vercel project settings.
