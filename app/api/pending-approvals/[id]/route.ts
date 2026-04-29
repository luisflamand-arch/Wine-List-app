export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// PUT - mesero approves or rejects a pending order
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.user?.role !== "mesero" && session.user?.role !== "admin") {
      return NextResponse.json({ error: "Solo meseros pueden aprobar ordenes" }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body ?? {};

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "action debe ser approve o reject" }, { status: 400 });
    }

    const order = await prisma.wineRequest.findUnique({
      where: { id: params.id },
      include: { wine: true },
    });

    if (!order) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });

    if (order.approvalStatus !== "waiting") {
      return NextResponse.json({ error: "Esta orden ya fue procesada" }, { status: 400 });
    }

    const data: any = {
      approvedAt: new Date(),
      approvedBy: session.user?.id,
    };

    if (action === "approve") {
      data.approvalStatus = "approved";
    } else if (action === "reject") {
      data.approvalStatus = "rejected";
      data.status = "rejected";
    }

    const updated = await prisma.wineRequest.update({
      where: { id: params.id },
      data,
      include: {
        wine: {
          select: {
            id: true,
            name: true,
            type: true,
            price: true,
            stock: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
