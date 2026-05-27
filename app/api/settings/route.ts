export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    return NextResponse.json(settings ?? { restaurantName: "La Vinoteca", primaryColor: "#8B6914", secondaryColor: "#1A1A2E", accentColor: "#D4AF37" });
  } catch {
    return NextResponse.json({ restaurantName: "La Vinoteca", primaryColor: "#8B6914", secondaryColor: "#1A1A2E", accentColor: "#D4AF37" });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const settings = await prisma.settings.upsert({
      where: { id: "default" },
      update: body ?? {},
      create: { id: "default", ...(body ?? {}) },
    });
    return NextResponse.json(settings);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
