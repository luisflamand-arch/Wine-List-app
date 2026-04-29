export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Function to normalize strings for accent-insensitive search
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove diacritical marks
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const country = url.searchParams.get("country");
    const region = url.searchParams.get("region");
    const grape = url.searchParams.get("grape");
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const search = url.searchParams.get("search");
    const showAll = url.searchParams.get("showAll") === "true";

    const where: any = {};
    if (!showAll) {
      where.stock = { gt: 0 };
      where.active = true;
    }
    if (type) where.type = type;
    if (country) where.country = country;
    if (region) where.region = region;
    if (grape) where.grape = grape;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // For search without accent sensitivity, we need to fetch first and filter in JS
    if (search) {
      delete where.OR; // Remove OR clause if it exists
      
      // Fetch all wines matching the other criteria
      const allWines = await prisma.wine.findMany({ where, orderBy: { name: "asc" } });
      
      // Filter by search term (accent-insensitive)
      const normalizedSearch = normalizeString(search);
      const filteredWines = allWines.filter(wine => 
        normalizeString(wine.name).includes(normalizedSearch) ||
        normalizeString(wine.grape || "").includes(normalizedSearch) ||
        normalizeString(wine.region || "").includes(normalizedSearch) ||
        normalizeString(wine.country || "").includes(normalizedSearch)
      );
      
      return NextResponse.json(filteredWines ?? []);
    }

    const wines = await prisma.wine.findMany({ where, orderBy: { name: "asc" } });
    return NextResponse.json(wines ?? []);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json([], { status: 500 });
  }
}
