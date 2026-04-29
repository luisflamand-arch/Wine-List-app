export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "startDate y endDate requeridos" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const adjustments = await prisma.inventoryAdjustment.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      include: { wine: true },
      orderBy: { createdAt: "desc" },
    });

    // Group by wine
    const byWine: Record<string, any> = {};
    for (const adj of adjustments ?? []) {
      if (!byWine[adj.wineId]) {
        byWine[adj.wineId] = {
          wine: adj.wine,
          adjustments: [],
          totalIncrease: 0,
          totalDecrease: 0,
        };
      }
      byWine[adj.wineId].adjustments.push(adj);
      if (adj.type === "increase") {
        byWine[adj.wineId].totalIncrease += adj.quantity;
      } else {
        byWine[adj.wineId].totalDecrease += adj.quantity;
      }
    }

    return NextResponse.json({
      startDate,
      endDate,
      totalAdjustments: adjustments.length,
      byWine,
      raw: adjustments,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
