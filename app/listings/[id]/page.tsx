"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bed, Bath, Users, MapPin, Star } from "lucide-react";

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const res = await fetch(`/api/listings/${id}`);
      return res.json();
    },
  });

  if (isLoading)
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>;

  if (error || !data?.result)
    return <div className="text-red-500 p-4">Failed to load listing.</div>;

  const l = data.result;
  const images: { url: string; sortOrder: number }[] = (l.listingImages ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const location = [l.address, l.city, l.state, l.country].filter(Boolean).join(", ");
  const amenities: string[] = l.amenities ?? [];

  return (
    <div>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <div className="flex flex-col gap-6">
        {images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.slice(0, 5).map((img, i) => (
              <img
                key={i}
                src={img.url}
                alt={`Photo ${i + 1}`}
                className="h-48 w-72 object-cover rounded-lg shrink-0"
              />
            ))}
          </div>
        )}

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">{l.name || l.internalListingName}</h1>
            {location && (
              <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" /> {location}
              </p>
            )}
          </div>
          <Badge variant={l.isActive ? "default" : "secondary"}>
            {l.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Bed, label: "Bedrooms", value: l.bedroomsNumber ?? "—" },
            { icon: Bath, label: "Bathrooms", value: l.bathroomsNumber ?? "—" },
            { icon: Users, label: "Max Guests", value: l.personCapacity ?? "—" },
            {
              icon: Star,
              label: "Price/Night",
              value: l.price ? `${l.price} ${l.currencyCode ?? ""}` : "—",
            },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label}>
              <CardContent className="py-3 flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="font-semibold text-sm">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {l.description && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 whitespace-pre-line line-clamp-10">
                {l.description}
              </p>
            </CardContent>
          </Card>
        )}

        {amenities.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Amenities ({amenities.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <Badge key={a} variant="outline" className="text-xs">
                    {a}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
