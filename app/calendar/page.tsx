"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";

interface CalendarDay {
  date: string;
  status: string;
  isAvailable?: number;
  isBooked?: number;
  price?: number;
  minimumStay?: number;
}

interface Listing {
  id: number;
  name: string;
  internalListingName?: string;
}

const DAY_COLORS: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer",
  booked: "bg-blue-100 text-blue-800 cursor-not-allowed",
  blocked: "bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer",
  unavailable: "bg-slate-100 text-slate-400 cursor-not-allowed",
};

function dayColor(day: CalendarDay): string {
  if (day.isBooked) return DAY_COLORS.booked;
  if (!day.isAvailable) return DAY_COLORS.blocked;
  return DAY_COLORS.available;
}

function dayLabel(day: CalendarDay): string {
  if (day.isBooked) return "Booked";
  if (!day.isAvailable) return "Blocked";
  return "Available";
}

export default function CalendarPage() {
  const [selectedListingId, setSelectedListingId] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blocking, setBlocking] = useState<string | null>(null);
  const [blockError, setBlockError] = useState("");
  const qc = useQueryClient();

  const { data: listingsData } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const res = await fetch("/api/listings");
      return res.json();
    },
  });

  const listings: Listing[] = listingsData?.result ?? [];

  const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");

  const { data: calData, isLoading: calLoading } = useQuery({
    queryKey: ["calendar", selectedListingId, startDate],
    queryFn: async () => {
      if (!selectedListingId) return null;
      const res = await fetch(
        `/api/calendar/${selectedListingId}?startDate=${startDate}&endDate=${endDate}`
      );
      return res.json();
    },
    enabled: !!selectedListingId,
  });

  const calDays: CalendarDay[] = calData?.result ?? [];
  const dayMap: Record<string, CalendarDay> = {};
  for (const d of calDays) dayMap[d.date] = d;

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayOfWeek = getDay(startOfMonth(currentMonth));

  async function handleDayClick(dateStr: string) {
    const day = dayMap[dateStr];
    if (!day || day.isBooked) return;

    const isBlocked = !day.isAvailable;
    setBlocking(dateStr);
    setBlockError("");
    try {
      const res = await fetch(`/api/calendar/${selectedListingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: dateStr,
          endDate: dateStr,
          status: isBlocked ? "available" : "blocked",
          isAvailable: isBlocked ? 1 : 0,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setBlockError(data.message ?? `Failed to ${isBlocked ? "unblock" : "block"} date (${res.status})`);
        return;
      }
      qc.invalidateQueries({ queryKey: ["calendar", selectedListingId, startDate] });
    } catch (e) {
      setBlockError(String(e));
    } finally {
      setBlocking(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
        <p className="text-slate-500 text-sm mt-1">View availability and block dates</p>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <select
          className="border rounded-md px-3 py-2 text-sm w-full sm:min-w-55 sm:w-auto"
          value={selectedListingId}
          onChange={(e) => setSelectedListingId(e.target.value)}
        >
          <option value="">Select a property</option>
          {listings.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name || l.internalListingName}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 sm:ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium w-32 text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-3 text-xs mb-4">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-200 inline-block" /> Available (click to block)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-200 inline-block" /> Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-200 inline-block" /> Blocked (click to unblock)
        </span>
      </div>

      {!selectedListingId && (
        <div className="text-center py-16 text-slate-400">Select a property to view its calendar.</div>
      )}

      {selectedListingId && calLoading && (
        <div className="text-center py-16 text-slate-400">Loading calendar...</div>
      )}

      {blockError && (
        <p className="text-sm text-red-500 mb-3">{blockError}</p>
      )}

      {selectedListingId && !calLoading && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {monthDays.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const calDay = dayMap[dateStr];
                const isBlocking = blocking === dateStr;
                return (
                  <div
                    key={dateStr}
                    onClick={() => handleDayClick(dateStr)}
                    title={calDay ? dayLabel(calDay) : "No data"}
                    className={`
                      rounded-md text-xs text-center py-1 sm:py-2 transition-colors select-none
                      ${calDay ? dayColor(calDay) : "bg-slate-50 text-slate-300"}
                      ${isBlocking ? "opacity-50" : ""}
                    `}
                  >
                    <div className="font-medium">{format(day, "d")}</div>
                    {calDay?.price ? (
                      <div className="text-[10px] opacity-70">${calDay.price}</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
