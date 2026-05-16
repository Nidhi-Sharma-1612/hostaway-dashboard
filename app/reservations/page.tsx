"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Reservation {
  id: number;
  listingMapId?: number;
  guestName?: string;
  guestFirstName?: string;
  guestLastName?: string;
  confirmationCode?: string;
  arrivalDate?: string;
  departureDate?: string;
  numberOfGuests?: number;
  totalPrice?: number;
  currency?: string;
  channelName?: string;
  status?: string;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700",
  new: "bg-blue-100 text-blue-700",
  modified: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  inquiry: "bg-purple-100 text-purple-700",
};

function statusColor(status?: string) {
  return STATUS_COLORS[status?.toLowerCase() ?? ""] ?? "bg-slate-100 text-slate-600";
}

function CreateModal({
  open,
  onClose,
  listings,
}: {
  open: boolean;
  onClose: () => void;
  listings: { id: number; name: string }[];
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    listingMapId: "",
    guestFirstName: "",
    guestLastName: "",
    guestEmail: "",
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: "1",
    totalPrice: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr("");
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingMapId: Number(form.listingMapId),
          channelId: 2000,
          guestFirstName: form.guestFirstName,
          guestLastName: form.guestLastName,
          guestEmail: form.guestEmail,
          arrivalDate: form.checkInDate,
          departureDate: form.checkOutDate,
          numberOfGuests: Number(form.numberOfGuests),
          totalPrice: Number(form.totalPrice),
        }),
      });
      const data = await res.json();
      if (data.status === "success" || data.result) {
        qc.invalidateQueries({ queryKey: ["reservations"] });
        onClose();
      } else {
        setErr(data.message ?? JSON.stringify(data));
      }
    } catch (e) {
      setErr(String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Reservation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div>
            <Label className="text-xs">Property</Label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              value={form.listingMapId}
              onChange={(e) => set("listingMapId", e.target.value)}
              required
            >
              <option value="">Select a listing</option>
              {listings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">First Name</Label>
              <Input
                className="mt-1"
                value={form.guestFirstName}
                onChange={(e) => set("guestFirstName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="text-xs">Last Name</Label>
              <Input
                className="mt-1"
                value={form.guestLastName}
                onChange={(e) => set("guestLastName", e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Guest Email</Label>
            <Input
              type="email"
              className="mt-1"
              value={form.guestEmail}
              onChange={(e) => set("guestEmail", e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Check-in</Label>
              <Input
                type="date"
                className="mt-1"
                value={form.checkInDate}
                onChange={(e) => set("checkInDate", e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="text-xs">Check-out</Label>
              <Input
                type="date"
                className="mt-1"
                value={form.checkOutDate}
                onChange={(e) => set("checkOutDate", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Guests</Label>
              <Input
                type="number"
                min={1}
                className="mt-1"
                value={form.numberOfGuests}
                onChange={(e) => set("numberOfGuests", e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="text-xs">Total Price</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="mt-1"
                value={form.totalPrice}
                onChange={(e) => set("totalPrice", e.target.value)}
                required
              />
            </div>
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating..." : "Create Reservation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditModal({
  reservation,
  onClose,
  listings,
}: {
  reservation: Reservation;
  onClose: () => void;
  listings: { id: number; name: string }[];
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    listingMapId: String(reservation.listingMapId ?? ""),
    guestFirstName: reservation.guestFirstName ?? "",
    guestLastName: reservation.guestLastName ?? "",
    guestEmail: "",
    checkInDate: reservation.arrivalDate ?? "",
    checkOutDate: reservation.departureDate ?? "",
    numberOfGuests: String(reservation.numberOfGuests ?? 1),
    totalPrice: String(reservation.totalPrice ?? ""),
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr("");
    try {
      const res = await fetch(`/api/reservations/${reservation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingMapId: Number(form.listingMapId),
          channelId: 2000,
          guestFirstName: form.guestFirstName,
          guestLastName: form.guestLastName,
          guestEmail: form.guestEmail || undefined,
          arrivalDate: form.checkInDate,
          departureDate: form.checkOutDate,
          numberOfGuests: Number(form.numberOfGuests),
          totalPrice: Number(form.totalPrice),
        }),
      });
      const data = await res.json();
      if (data.status === "success" || data.result) {
        qc.invalidateQueries({ queryKey: ["reservations"] });
        onClose();
      } else {
        setErr(data.message ?? JSON.stringify(data));
      }
    } catch (e) {
      setErr(String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Reservation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div>
            <Label className="text-xs">Property</Label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              value={form.listingMapId}
              onChange={(e) => set("listingMapId", e.target.value)}
              required
            >
              <option value="">Select a listing</option>
              {listings.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">First Name</Label>
              <Input className="mt-1" value={form.guestFirstName} onChange={(e) => set("guestFirstName", e.target.value)} required />
            </div>
            <div>
              <Label className="text-xs">Last Name</Label>
              <Input className="mt-1" value={form.guestLastName} onChange={(e) => set("guestLastName", e.target.value)} required />
            </div>
          </div>
          <div>
            <Label className="text-xs">Guest Email (optional)</Label>
            <Input type="email" className="mt-1" value={form.guestEmail} onChange={(e) => set("guestEmail", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Check-in</Label>
              <Input type="date" className="mt-1" value={form.checkInDate} onChange={(e) => set("checkInDate", e.target.value)} required />
            </div>
            <div>
              <Label className="text-xs">Check-out</Label>
              <Input type="date" className="mt-1" value={form.checkOutDate} onChange={(e) => set("checkOutDate", e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Guests</Label>
              <Input type="number" min={1} className="mt-1" value={form.numberOfGuests} onChange={(e) => set("numberOfGuests", e.target.value)} required />
            </div>
            <div>
              <Label className="text-xs">Total Price</Label>
              <Input type="number" min={0} step="0.01" className="mt-1" value={form.totalPrice} onChange={(e) => set("totalPrice", e.target.value)} required />
            </div>
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirm({
  reservation,
  onClose,
}: {
  reservation: Reservation;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setErr("");
    try {
      const res = await fetch(`/api/reservations/${reservation.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status !== "fail") {
        qc.invalidateQueries({ queryKey: ["reservations"] });
        onClose();
      } else {
        setErr(data.message ?? `Failed to delete (${res.status})`);
      }
    } catch (e) {
      setErr(String(e));
    } finally {
      setDeleting(false);
    }
  }

  const guestName =
    [reservation.guestFirstName, reservation.guestLastName].filter(Boolean).join(" ") ||
    reservation.guestName ||
    reservation.confirmationCode ||
    `#${reservation.id}`;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Reservation</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600 mt-2">
          Are you sure you want to delete the reservation for <strong>{guestName}</strong>? This cannot be undone.
        </p>
        {err && <p className="text-xs text-red-500 mt-2">{err}</p>}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ReservationsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [deletingReservation, setDeletingReservation] = useState<Reservation | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      const res = await fetch("/api/reservations");
      return res.json();
    },
  });

  const { data: listingsData } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const res = await fetch("/api/listings");
      return res.json();
    },
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading reservations...
      </div>
    );

  if (error || data?.status === "fail")
    return <div className="text-red-500 p-4">Failed to load reservations.</div>;

  const reservations: Reservation[] = data?.result ?? [];
  const listings: { id: number; name: string }[] = listingsData?.result ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reservations</h1>
          <p className="text-slate-500 text-sm mt-1">{reservations.length} bookings</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> New Reservation
        </Button>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No reservations found.</div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs">Guest</TableHead>
                <TableHead className="text-xs">Check-in</TableHead>
                <TableHead className="text-xs">Check-out</TableHead>
                <TableHead className="text-xs">Guests</TableHead>
                <TableHead className="text-xs">Total</TableHead>
                <TableHead className="text-xs">Channel</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((r) => (
                <TableRow key={r.id} className="text-sm">
                  <TableCell className="font-medium">
                    {[r.guestFirstName, r.guestLastName].filter(Boolean).join(" ") ||
                      r.guestName ||
                      (r.confirmationCode ? (
                        <span className="text-slate-400 font-mono text-xs">{r.confirmationCode}</span>
                      ) : "—")}
                  </TableCell>
                  <TableCell>
                    {r.arrivalDate ? format(new Date(r.arrivalDate), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    {r.departureDate ? format(new Date(r.departureDate), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell>{r.numberOfGuests ?? "—"}</TableCell>
                  <TableCell>
                    {r.totalPrice != null ? `${r.totalPrice} ${r.currency ?? ""}` : "—"}
                  </TableCell>
                  <TableCell className="capitalize">{r.channelName ?? "—"}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(r.status)}`}>
                      {r.status ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingReservation(r)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingReservation(r)}
                        className="p-1 rounded hover:bg-red-50 text-slate-500 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
      )}

      <CreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        listings={listings}
      />

      {editingReservation && (
        <EditModal
          reservation={editingReservation}
          onClose={() => setEditingReservation(null)}
          listings={listings}
        />
      )}

      {deletingReservation && (
        <DeleteConfirm
          reservation={deletingReservation}
          onClose={() => setDeletingReservation(null)}
        />
      )}
    </div>
  );
}
