import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data: any = {};
    if (body.dishName !== undefined) data.dishName = body.dishName;
    if (body.dishDescription !== undefined) data.dishDescription = body.dishDescription;
    if (body.dishImageUrl !== undefined) data.dishImageUrl = body.dishImageUrl;
    if (body.premiumWineId !== undefined) data.premiumWineId = body.premiumWineId;
    if (body.mediumWineId !== undefined) data.mediumWineId = body.mediumWineId;
    if (body.economicWineId !== undefined) data.economicWineId = body.economicWineId;

    const pairing = await prisma.menuPairing.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(pairing);
  } catch (error: any) {
    console.error('Error en PUT /api/pairings/[id]:', error);
    return NextResponse.json({ error: error?.message ?? 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.menuPairing.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error en DELETE /api/pairings/[id]:', error);
    return NextResponse.json({ error: error?.message ?? 'Error al eliminar' }, { status: 500 });
  }
}
