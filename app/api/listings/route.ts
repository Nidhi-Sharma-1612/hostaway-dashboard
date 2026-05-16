import { hostawayFetch } from "@/lib/hostaway";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await hostawayFetch("/v1/listings?limit=50&includeResources=1");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ status: "fail", message: String(err) }, { status: 500 });
  }
}
