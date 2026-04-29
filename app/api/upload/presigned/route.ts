export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { generatePresignedUploadUrl } from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { fileName, contentType, isPublic } = await req.json();
    const result = await generatePresignedUploadUrl(fileName ?? "file", contentType ?? "image/jpeg", isPublic ?? true);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Upload error" }, { status: 500 });
  }
}
