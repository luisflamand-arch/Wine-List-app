export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const totalWines = await prisma.wine.count();
    const activeWines = await prisma.wine.count({ where: { stock: { gt: 0 }, active: true } });
    const outOfStock = await prisma.wine.count({ where: { stock: 0 } });
    
    const allWines = await prisma.wine.findMany({ select: { type: true, country: true, stock: true, minStock: true, price: true, costPrice: true } });
    const lowStock = (allWines ?? []).filter((w: any) => (w?.stock ?? 0) > 0 && (w?.stock ?? 0) <= (w?.minStock ?? 3)).length;
    
    const byType: Record<string, number> = {};
    const byCountry: Record<string, number> = {};
    let totalValue = 0;
    
    for (const w of allWines ?? []) {
      const t = w?.type ?? "Otro";
      const c = w?.country ?? "Otro";
      byType[t] = (byType[t] ?? 0) + 1;
      byCountry[c] = (byCountry[c] ?? 0) + 1;
      // Use ONLY costPrice for inventory value (acquisition cost)
      totalValue += (w?.costPrice ?? 0) * (w?.stock ?? 0);
    }

    return NextResponse.json({ totalWines, activeWines, outOfStock, lowStock, byType, byCountry, totalValue });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
