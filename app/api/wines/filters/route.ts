export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const selectedType = url.searchParams.get("type") || "";
    const selectedCountry = url.searchParams.get("country") || "";
    const selectedRegion = url.searchParams.get("region") || "";

    // Base filter: only active wines with stock > 0
    const baseWhere: any = { stock: { gt: 0 }, active: true };

    // Get all available wines for top-level options
    const allWines = await prisma.wine.findMany({
      where: baseWhere,
      select: { type: true, country: true, region: true, grape: true, price: true },
    });

    // Types are always all available (not filtered by other selections)
    const types = [...new Set((allWines ?? []).map((w: any) => w?.type).filter(Boolean))].sort();

    // Countries: filter by selected type if any
    const countryPool = selectedType
      ? (allWines ?? []).filter((w: any) => w?.type === selectedType)
      : allWines;
    const countries = [...new Set((countryPool ?? []).map((w: any) => w?.country).filter(Boolean))].sort();

    // Regions: filter by selected type + country
    const regionPool = (allWines ?? []).filter((w: any) => {
      if (selectedType && w?.type !== selectedType) return false;
      if (selectedCountry && w?.country !== selectedCountry) return false;
      return true;
    });
    const regions = [...new Set((regionPool ?? []).map((w: any) => w?.region).filter(Boolean))].sort();

    // Grapes: filter by selected type + country + region
    const grapePool = (allWines ?? []).filter((w: any) => {
      if (selectedType && w?.type !== selectedType) return false;
      if (selectedCountry && w?.country !== selectedCountry) return false;
      if (selectedRegion && w?.region !== selectedRegion) return false;
      return true;
    });
    const grapes = [...new Set((grapePool ?? []).map((w: any) => w?.grape).filter(Boolean))].sort();

    // Price range based on current filter context
    const pricePool = grapePool;
    const prices = (pricePool ?? []).map((w: any) => w?.price ?? 0);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 2000;

    return NextResponse.json({ types, countries, regions, grapes, minPrice, maxPrice });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ types: [], countries: [], regions: [], grapes: [], minPrice: 0, maxPrice: 2000 }, { status: 500 });
  }
}
