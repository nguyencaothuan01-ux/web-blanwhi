import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { PancakeService } from "@/lib/pancake/pancake-service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const level = url.searchParams.get("level") || "provinces";
    const pancake = new PancakeService();
    const data = level === "districts"
      ? await pancake.districts(url.searchParams.get("provinceId") || "")
      : level === "communes"
        ? await pancake.communes(url.searchParams.get("provinceId") || "", url.searchParams.get("districtId") || "")
        : await pancake.provinces();
    return NextResponse.json({ data }, { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
  } catch (error) {
    return jsonError(error);
  }
}
