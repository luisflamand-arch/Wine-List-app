export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// GET - list purchase orders or get low-stock wines for new order
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "low-stock") {
      // Get wines below minStock
      const wines = await prisma.wine.findMany({
        where: { active: true, stock: { gt: -1 } },
        orderBy: { name: "asc" },
      });
      const lowStock = (wines ?? []).filter((w: any) => (w?.stock ?? 0) <= (w?.minStock ?? 3));
      return NextResponse.json(lowStock);
    }

    // List orders
    const orders = await prisma.purchaseOrder.findMany({
      include: { items: { include: { wine: { select: { id: true, name: true, type: true, grape: true, country: true, region: true, costPrice: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders ?? []);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - create a purchase order from low-stock items
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { items, notes } = body ?? {};
    // items: [{ wineId, quantity }]
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Se requieren items" }, { status: 400 });
    }

    const order = await prisma.purchaseOrder.create({
      data: {
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            wineId: item.wineId,
            quantity: Math.max(1, parseInt(String(item.quantity ?? 1))),
          })),
        },
      },
      include: { items: { include: { wine: { select: { id: true, name: true, type: true, grape: true, country: true, region: true, costPrice: true } } } } },
    });

    return NextResponse.json(order);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
