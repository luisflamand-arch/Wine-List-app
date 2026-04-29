export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// GET single order
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: params?.id },
      include: { items: { include: { wine: true } } },
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}

// PUT - update order (mark as sent, update items)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { status, notes } = body ?? {};
    const data: any = {};
    if (status) data.status = status;
    if (notes !== undefined) data.notes = notes;
    const order = await prisma.purchaseOrder.update({
      where: { id: params?.id },
      data,
      include: { items: { include: { wine: { select: { id: true, name: true, type: true, grape: true, country: true, region: true, costPrice: true } } } } },
    });
    return NextResponse.json(order);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await prisma.purchaseOrder.delete({ where: { id: params?.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
