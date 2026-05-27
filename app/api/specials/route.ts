export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get('active');
    const dateRange = searchParams.get('dateRange'); // Optional: only include if within date range
    
    const now = new Date();
    
    const where: any = {};
    
    // Filter by active status if specified
    if (active !== null) {
      where.active = active === 'true';
    }
    
    // Only apply date range filter if explicitly requested
    if (dateRange === 'true') {
      where.startDate = { lte: now };
      where.endDate = { gte: now };
    }
    
    const specials = await prisma.special.findMany({
      where,
      include: {
        wine: true
      },
      orderBy: { startDate: 'desc' }
    });
    
    return NextResponse.json(specials);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error fetching specials" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { wineId, title, description, discount, startDate, endDate } = await req.json();
    
    if (!wineId || !title || !startDate || !endDate) {
      return NextResponse.json({ error: "wineId, title, startDate and endDate are required" }, { status: 400 });
    }
    
    // Check if wine exists
    const wine = await prisma.wine.findUnique({ where: { id: wineId } });
    if (!wine) return NextResponse.json({ error: "Wine not found" }, { status: 404 });
    
    const special = await prisma.special.create({
      data: {
        wineId,
        title,
        description: description ?? null,
        discount: discount ?? null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        active: true
      },
      include: {
        wine: true
      }
    });
    
    return NextResponse.json(special, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error creating special" }, { status: 500 });
  }
}
