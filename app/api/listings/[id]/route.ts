import { hostawayFetch } from "@/lib/hostaway";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await hostawayFetch(`/v1/listings/${id}?includeResources=1`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ status: "fail", message: String(err) }, { status: 500 });
  }
}
