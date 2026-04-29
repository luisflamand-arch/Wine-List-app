import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const count = await prisma.physicalInventoryCount.findUnique({
      where: { id: params.id },
      include: { wine: true },
    });

    if (!count) {
      return NextResponse.json(
        { error: 'Physical inventory count not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(count);
  } catch (error) {
    console.error('Error fetching physical inventory count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch physical inventory count' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { physicalCount, notes } = body;

    // Get the existing count to get wineId
    const existingCount = await prisma.physicalInventoryCount.findUnique({
      where: { id: params.id },
    });

    if (!existingCount) {
      return NextResponse.json(
        { error: 'Physical inventory count not found' },
        { status: 404 }
      );
    }

    // Fetch the current wine stock for recalculation
    const wine = await prisma.wine.findUnique({
      where: { id: existingCount.wineId },
    });

    if (!wine) {
      return NextResponse.json({ error: 'Wine not found' }, { status: 404 });
    }

    const systemStock = wine.stock;
    const difference = (physicalCount ?? existingCount.physicalCount) - systemStock;

    const updatedCount = await prisma.physicalInventoryCount.update({
      where: { id: params.id },
      data: {
        physicalCount: physicalCount ?? existingCount.physicalCount,
        difference,
        notes,
      },
      include: { wine: true },
    });

    return NextResponse.json(updatedCount);
  } catch (error) {
    console.error('Error updating physical inventory count:', error);
    return NextResponse.json(
      { error: 'Failed to update physical inventory count' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const count = await prisma.physicalInventoryCount.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, deletedId: count.id });
  } catch (error) {
    console.error('Error deleting physical inventory count:', error);
    return NextResponse.json(
      { error: 'Failed to delete physical inventory count' },
      { status: 500 }
    );
  }
}
