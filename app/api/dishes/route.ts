export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get('active');
    
    const dishes = await prisma.dish.findMany({
      where: active !== null ? { active: active === 'true' } : undefined,
      include: {
        pairings: {
          include: { wine: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(dishes);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error fetching dishes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { name, description, imageUrl, cloudStoragePath, isPublicImage } = await req.json();
    
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    
    const dish = await prisma.dish.create({
      data: {
        name,
        description,
        imageUrl,
        cloudStoragePath,
        isPublicImage: isPublicImage ?? true,
        active: true
      }
    });
    
    return NextResponse.json(dish, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error creating dish" }, { status: 500 });
  }
}
