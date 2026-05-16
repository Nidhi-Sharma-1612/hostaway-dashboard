"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Users, MapPin, DollarSign } from "lucide-react";
import Link from "next/link";

interface Listing {
  id: number;
  name: string;
  internalListingName?: string;
  city?: string;
  state?: string;
  country?: string;
  bedroomsNumber?: number;
  bathroomsNumber?: number;
  personCapacity?: number;
  price?: number;
  currencyCode?: string;
  listingImages?: { url: string; sortOrder: number }[];
  isActive?: number;
}

export default function ListingsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const res = await fetch("/api/listings");
      return res.json();
    },
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading listings...
      </div>
    );

  if (error || data?.status === "fail")
    return (
      <div className="text-red-500 p-4">
        Failed to load listings: {data?.message ?? String(error)}
      </div>
    );

  const listings: Listing[] = data?.result ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Listings</h1>
        <p className="text-slate-500 text-sm mt-1">{listings.length} properties found</p>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No listings found in your account.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {listings.map((listing) => {
            const image = listing.listingImages?.slice().sort((a, b) => a.sortOrder - b.sortOrder)[0];
            const location = [listing.city, listing.state, listing.country]
              .filter(Boolean)
              .join(", ");
            return (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full overflow-hidden">
                  {image && (
                    <div className="h-40 overflow-hidden bg-slate-100">
                      <img
                        src={image.url}
                        alt={listing.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {!image && (
                    <div className="h-40 bg-linear-to-br from-blue-100 to-violet-100 flex items-center justify-center">
                      <span className="text-4xl">🏠</span>
                    </div>
                  )}
                  <CardHeader className="pb-2 pt-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">
                        {listing.name || listing.internalListingName}
                      </CardTitle>
                      <Badge
                        variant={listing.isActive ? "default" : "secondary"}
                        className="shrink-0 text-xs"
                      >
                        {listing.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-500 space-y-1.5">
                    {location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      {listing.bedroomsNumber != null && (
                        <span className="flex items-center gap-1">
                          <Bed className="w-3 h-3" />
                          {listing.bedroomsNumber} bed{listing.bedroomsNumber !== 1 ? "s" : ""}
                        </span>
                      )}
                      {listing.personCapacity != null && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {listing.personCapacity} guests
                        </span>
                      )}
                      {listing.price != null && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {listing.price} {listing.currencyCode ?? ""}/night
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
