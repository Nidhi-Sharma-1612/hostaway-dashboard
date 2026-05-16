import { hostawayFetch } from "@/lib/hostaway";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") ?? "50";
    const res = await hostawayFetch(
      `/v1/reservations?limit=${limit}&sortOrder=latestActivityAsc`
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ status: "fail", message: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await hostawayFetch("/v1/reservations", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 400 });
  } catch (err) {
    return NextResponse.json({ status: "fail", message: String(err) }, { status: 500 });
  }
}
