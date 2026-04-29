import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear all wine stock
    const result = await prisma.wine.updateMany({
      data: {
        stock: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Inventory cleared. ${result.count} wines updated.`,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error('Error clearing inventory:', error);
    return NextResponse.json(
      { error: 'Failed to clear inventory' },
      { status: 500 }
    );
  }
}
