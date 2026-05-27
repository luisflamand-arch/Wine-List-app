export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dish = await prisma.dish.findUnique({
      where: { id: params.id },
      include: {
        pairings: {
          include: { wine: true }
        }
      }
    });
    
    if (!dish) return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    return NextResponse.json(dish);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error fetching dish" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { name, description, imageUrl, cloudStoragePath, isPublicImage, active } = await req.json();
    
    const dish = await prisma.dish.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(cloudStoragePath !== undefined && { cloudStoragePath }),
        ...(isPublicImage !== undefined && { isPublicImage }),
        ...(active !== undefined && { active })
      }
    });
    
    return NextResponse.json(dish);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error updating dish" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    await prisma.dish.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error deleting dish" }, { status: 500 });
  }
}
