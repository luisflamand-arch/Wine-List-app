import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const country = searchParams.get('country');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const whereConditions: any = {};
    if (startDate) {
      whereConditions.createdAt = { gte: new Date(startDate) };
    }
    if (endDate) {
      if (whereConditions.createdAt) {
        whereConditions.createdAt.lte = new Date(endDate);
      } else {
        whereConditions.createdAt = { lte: new Date(endDate) };
      }
    }

    let counts = await prisma.physicalInventoryCount.findMany({
      where: whereConditions,
      include: {
        wine: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Client-side filtering by type and country if needed
    if (type || country) {
      counts = counts.filter((count: any) => {
        const matchType = !type || count.wine.type === type;
        const matchCountry = !country || count.wine.country === country;
        return matchType && matchCountry;
      });
    }

    return NextResponse.json(counts);
  } catch (error) {
    console.error('Error fetching physical inventory counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch physical inventory counts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { wineId, physicalCount, notes } = body;

    if (!wineId || physicalCount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: wineId, physicalCount' },
        { status: 400 }
      );
    }

    // Fetch the current wine stock
    const wine = await prisma.wine.findUnique({
      where: { id: wineId },
    });

    if (!wine) {
      return NextResponse.json({ error: 'Wine not found' }, { status: 404 });
    }

    const systemStock = wine.stock;
    const difference = physicalCount - systemStock;

    // Create the physical inventory count
    const count = await prisma.physicalInventoryCount.create({
      data: {
        wineId,
        physicalCount,
        systemStock,
        difference,
        notes,
      },
      include: {
        wine: true,
      },
    });

    return NextResponse.json(count, { status: 201 });
  } catch (error) {
    console.error('Error creating physical inventory count:', error);
    return NextResponse.json(
      { error: 'Failed to create physical inventory count' },
      { status: 500 }
    );
  }
}
