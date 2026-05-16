import { hostawayFetch } from "@/lib/hostaway";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const res = await hostawayFetch(`/v1/reservations/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 400 });
  } catch (err) {
    return NextResponse.json({ status: "fail", message: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await hostawayFetch(`/v1/reservations/${id}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({ status: "success" }));
    return NextResponse.json(data, { status: res.ok ? 200 : 400 });
  } catch (err) {
    return NextResponse.json({ status: "fail", message: String(err) }, { status: 500 });
  }
}
