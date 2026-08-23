import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { reportIds } = await request.json();

    if (!reportIds || !Array.isArray(reportIds)) {
      return NextResponse.json({ error: 'reportIds array required' }, { status: 400 });
    }

    if (!prisma) {
      return NextResponse.json({ success: true, mode: 'local' });
    }

    await prisma.report.updateMany({
      where: { id: { in: reportIds } },
      data: { status: 'RESOLVED' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resolving reports in DB:', error);
    return NextResponse.json({ error: 'Failed to resolve reports' }, { status: 500 });
  }
}
