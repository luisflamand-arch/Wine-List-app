export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const special = await prisma.special.findUnique({
      where: { id: params.id },
      include: {
        wine: true
      }
    });
    
    if (!special) return NextResponse.json({ error: "Special not found" }, { status: 404 });
    return NextResponse.json(special);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error fetching special" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { title, description, discount, startDate, endDate, active } = await req.json();
    
    const special = await prisma.special.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(discount !== undefined && { discount }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(active !== undefined && { active })
      },
      include: {
        wine: true
      }
    });
    
    return NextResponse.json(special);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error updating special" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    await prisma.special.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error deleting special" }, { status: 500 });
  }
}
