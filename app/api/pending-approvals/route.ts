export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// GET - list pending approvals for mesero
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orders = await prisma.wineRequest.findMany({
      where: {
        approvalStatus: "waiting",
        status: "pending_approval",
      },
      include: {
        wine: {
          select: {
            id: true,
            name: true,
            type: true,
            price: true,
            stock: true,
            imageUrl: true,
            grape: true,
            region: true,
            country: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
