export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body ?? {};
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashed, name: name ?? "", role: "admin" },
    });
    return NextResponse.json({ id: user?.id, email: user?.email });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
