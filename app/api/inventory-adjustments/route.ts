export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// GET - list adjustments (with optional date range filter)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const wineId = url.searchParams.get("wineId");

    const where: any = {};
    if (startDate) where.createdAt = { gte: new Date(startDate) };
    if (endDate) {
      if (!where.createdAt) where.createdAt = {};
      where.createdAt.lte = new Date(endDate);
    }
    if (wineId) where.wineId = wineId;

    const adjustments = await prisma.inventoryAdjustment.findMany({
      where,
      include: { wine: { select: { id: true, name: true, type: true, price: true, costPrice: true, grape: true, country: true, region: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(adjustments ?? []);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - create adjustment (increase or decrease stock)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { wineId, type, quantity, reason, notes } = body ?? {};
    if (!wineId || !type || !quantity) return NextResponse.json({ error: "Campos requeridos" }, { status: 400 });
    if (type !== "increase" && type !== "decrease") return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    if (type === "decrease" && !reason) return NextResponse.json({ error: "Razón requerida para disminución" }, { status: 400 });

    // Verify wine exists
    const wine = await prisma.wine.findUnique({ where: { id: wineId } });
    if (!wine) return NextResponse.json({ error: "Vino no encontrado" }, { status: 404 });

    const qty = parseInt(String(quantity));
    if (qty <= 0) return NextResponse.json({ error: "Cantidad debe ser mayor a 0" }, { status: 400 });

    // For decrease, check if we have enough stock
    if (type === "decrease" && wine.stock < qty) {
      return NextResponse.json({ error: "Stock insuficiente" }, { status: 400 });
    }

    // Create adjustment and update wine stock atomically
    const adjustment = await prisma.inventoryAdjustment.create({
      data: {
        wineId,
        type,
        quantity: qty,
        reason: reason || null,
        notes: notes || null,
      },
    });

    // Update wine stock
    const newStock = type === "increase" ? wine.stock + qty : wine.stock - qty;
    await prisma.wine.update({
      where: { id: wineId },
      data: { stock: newStock },
    });

    return NextResponse.json({ ...adjustment, newStock });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
