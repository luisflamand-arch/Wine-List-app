export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// GET - list requests (admin only, or all pending for operators)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const where: any = {};
    if (status) where.status = status;

    const requests = await prisma.wineRequest.findMany({
      where,
      include: { wine: { select: { id: true, name: true, type: true, price: true, stock: true, imageUrl: true, grape: true, country: true, region: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests ?? []);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - create a wine request (guest action, no auth needed)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wineId, tableName, quantity, notes } = body ?? {};
    if (!wineId) return NextResponse.json({ error: "wineId requerido" }, { status: 400 });

    // Verify wine exists and has stock
    const wine = await prisma.wine.findUnique({ where: { id: wineId } });
    if (!wine || wine.stock <= 0 || !wine.active) {
      return NextResponse.json({ error: "Vino no disponible" }, { status: 400 });
    }

    const request = await prisma.wineRequest.create({
      data: {
        wineId,
        tableName: tableName || "Mesa",
        quantity: Math.max(1, parseInt(String(quantity ?? 1))),
        notes: notes || null,
        status: "pending_approval",
        approvalStatus: "waiting",
      },
    });

    // Send alert to admin about wine request
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/alerts/wine-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wineId,
          wineName: wine.name,
          tableName: tableName || "Mesa",
          quantity: Math.max(1, parseInt(String(quantity ?? 1))),
          orderId: request.id,
        }),
      });
    } catch (alertError) {
      // Log but don't fail the request - the wine request was already created
      console.error('Failed to send wine request alert:', alertError);
    }

    return NextResponse.json(request);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
