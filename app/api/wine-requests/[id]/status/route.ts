export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - get status of a wine request (for blocking modal)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const request = await prisma.wineRequest.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        status: true,
        approvalStatus: true,
        tableName: true,
        quantity: true,
      },
    });

    if (!request) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json(request);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
