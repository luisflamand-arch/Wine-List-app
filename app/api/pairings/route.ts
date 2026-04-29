import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const wineSelect = {
  id: true,
  name: true,
  type: true,
  country: true,
  region: true,
  grape: true,
  price: true,
  stock: true,
  imageUrl: true,
  description: true,
  tastingNotes: true,
  classification: true,
  vintage: true,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const admin = searchParams.get('admin') === 'true';

    const pairings = await prisma.menuPairing.findMany({
      include: {
        premiumWine: { select: wineSelect },
        mediumWine: { select: wineSelect },
        economicWine: { select: wineSelect },
      },
      orderBy: { dishName: 'asc' },
    });

    // For admin, return raw data
    if (admin) {
      return NextResponse.json(pairings);
    }

    // For public, filter wines by stock > 0
    const processed = pairings.map((p: any) => {
      const wines: any[] = [];
      if (p.premiumWine && p.premiumWine.stock > 0) wines.push(p.premiumWine);
      if (p.mediumWine && p.mediumWine.stock > 0) wines.push(p.mediumWine);
      if (p.economicWine && p.economicWine.stock > 0) wines.push(p.economicWine);
      return {
        id: p.id,
        dishName: p.dishName,
        dishDescription: p.dishDescription,
        dishImageUrl: p.dishImageUrl,
        wines,
      };
    });

    return NextResponse.json(processed);
  } catch (error) {
    console.error('Error en GET /api/pairings:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { dishName, dishDescription, dishImageUrl, premiumWineId, mediumWineId, economicWineId } = body;

    if (!dishName || !premiumWineId || !mediumWineId || !economicWineId) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const pairing = await prisma.menuPairing.create({
      data: { dishName, dishDescription, dishImageUrl, premiumWineId, mediumWineId, economicWineId },
    });

    return NextResponse.json(pairing);
  } catch (error: any) {
    console.error('Error en POST /api/pairings:', error);
    return NextResponse.json({ error: error?.message ?? 'Error al crear maridaje' }, { status: 500 });
  }
}
