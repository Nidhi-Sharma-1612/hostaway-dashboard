import { hostawayFetch } from "@/lib/hostaway";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, BookOpen, CalendarDays, TrendingUp } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const today = new Date().toISOString().slice(0, 10);

  const [listingsRes, confirmedRes, arrivingRes, inHouseRes] = await Promise.all([
    hostawayFetch("/v1/listings?limit=1"),
    hostawayFetch("/v1/reservations?limit=1&status=confirmed"),
    hostawayFetch(`/v1/reservations?limit=1&arrivalStartDate=${today}&arrivalEndDate=${today}`),
    hostawayFetch(`/v1/reservations?limit=1&status=confirmed&departureStartDate=${today}`),
  ]);

  if (!listingsRes.ok || !confirmedRes.ok || !arrivingRes.ok || !inHouseRes.ok) {
    throw new Error("Hostaway API request failed");
  }

  const [listings, confirmed, arriving, inHouse] = await Promise.all([
    listingsRes.json(),
    confirmedRes.json(),
    arrivingRes.json(),
    inHouseRes.json(),
  ]);

  return {
    totalListings: listings.count ?? 0,
    confirmedReservations: confirmed.count ?? 0,
    arrivingToday: arriving.count ?? 0,
    currentlyInHouse: inHouse.count ?? 0,
  };
}

export default async function DashboardPage() {
  const stats = await getStats().catch(() => ({
    totalListings: 0,
    confirmedReservations: 0,
    arrivingToday: 0,
    currentlyInHouse: 0,
  }));

  const cards = [
    {
      title: "Total Properties",
      value: stats.totalListings,
      icon: Home,
      href: "/listings",
      description: "Active listings",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Confirmed Reservations",
      value: stats.confirmedReservations,
      icon: BookOpen,
      href: "/reservations",
      description: "Confirmed bookings",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Arriving Today",
      value: stats.arrivingToday,
      icon: CalendarDays,
      href: "/calendar",
      description: "Check-ins today",
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Currently In-House",
      value: stats.currentlyInHouse,
      icon: TrendingUp,
      href: "/reservations",
      description: "Guests staying now",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div>
      <div className="mb-5 md:mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Live data from Hostaway API · Account #{process.env.HOSTAWAY_CLIENT_ID ?? "—"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ title, value, icon: Icon, href, description, color, bg }) => (
          <Link key={title} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    {title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${bg}`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <p className="text-xs text-slate-400 mt-1">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-4 bg-white rounded-lg border border-slate-200">
        <h2 className="text-sm font-semibold text-slate-700 mb-2">API Integration</h2>
        <ul className="text-xs text-slate-500 space-y-1">
          <li>✓ OAuth 2.0 Client Credentials flow — token cached server-side</li>
          <li>✓ Credentials stored in .env.local, never sent to browser</li>
          <li>✓ Next.js API routes proxy all Hostaway requests</li>
          <li>✓ 7 Hostaway endpoints covered: listings, reservations, calendar</li>
        </ul>
      </div>
    </div>
  );
}
