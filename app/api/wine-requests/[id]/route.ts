export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// PUT - approve/reject or confirm a request
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action, approvalStatus } = body ?? {};
    // action can be: "approve", "reject", "confirm"
    // approvalStatus can be: "approved", "rejected"
    // status can be: "confirmed", "rejected", "pending_approval"

    if (!action) {
      return NextResponse.json({ error: "action requerido" }, { status: 400 });
    }

    const request = await prisma.wineRequest.findUnique({ where: { id: params?.id } });
    if (!request) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const data: any = {};

    // Mesero aprueba/rechaza
    if (action === "approve") {
      if (request.approvalStatus !== "waiting") {
        return NextResponse.json({ error: "Ya fue procesada por el mesero" }, { status: 400 });
      }
      data.approvalStatus = "approved";
      data.approvedAt = new Date();
      data.approvedBy = session.user?.id;
    } else if (action === "reject") {
      if (request.approvalStatus !== "waiting") {
        return NextResponse.json({ error: "Ya fue procesada por el mesero" }, { status: 400 });
      }
      data.approvalStatus = "rejected";
      data.status = "rejected";
      data.approvedAt = new Date();
      data.approvedBy = session.user?.id;
    } else if (action === "confirm") {
      // Admin confirma la venta (solo si fue aprobada)
      if (request.approvalStatus !== "approved") {
        return NextResponse.json({ error: "No fue aprobada por el mesero" }, { status: 400 });
      }

      const wine = await prisma.wine.findUnique({ where: { id: request.wineId } });
      if (!wine || wine.stock < request.quantity) {
        return NextResponse.json({ error: "Stock insuficiente" }, { status: 400 });
      }

      await prisma.wine.update({
        where: { id: request.wineId },
        data: { stock: { decrement: request.quantity } },
      });

      // Create inventory adjustment record for the sale
      await prisma.inventoryAdjustment.create({
        data: {
          wineId: request.wineId,
          type: "decrease",
          quantity: request.quantity,
          reason: "venta",
          notes: `Venta confirmada - Mesa: ${request.tableName}`,
        },
      });

      data.status = "confirmed";
      data.confirmedAt = new Date();
    } else {
      return NextResponse.json({ error: "action inválido" }, { status: 400 });
    }

    const updated = await prisma.wineRequest.update({
      where: { id: params?.id },
      data,
      include: { wine: { select: { id: true, name: true, type: true, price: true, stock: true, imageUrl: true } } },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await prisma.wineRequest.delete({ where: { id: params?.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
