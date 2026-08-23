import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { lostReportId, foundReportId, overallScore, confidence, categoryScore, textScore, locationScore, timeScore, reasons } = await request.json();

    if (!lostReportId || !foundReportId) {
      return NextResponse.json({ error: 'Missing report IDs' }, { status: 400 });
    }

    if (!prisma) {
      return NextResponse.json({ success: true, mode: 'local' });
    }

    // Persist confirmed match record in Prisma DB
    const matchRecord = await prisma.matchRecord.create({
      data: {
        lostReportId,
        foundReportId,
        overallScore: Math.round(overallScore),
        confidence,
        categoryScore: Math.round(categoryScore),
        textScore: Math.round(textScore),
        locationScore: Math.round(locationScore),
        timeScore: Math.round(timeScore),
        reasons: JSON.stringify(reasons),
        status: 'CONFIRMED'
      }
    });

    // Update report statuses in DB
    await prisma.report.updateMany({
      where: { id: { in: [lostReportId, foundReportId] } },
      data: { status: 'MATCHED' }
    });

    return NextResponse.json({ matchRecord, success: true });
  } catch (error) {
    console.error('Error confirming match in Prisma DB:', error);
    return NextResponse.json({ error: 'Failed to confirm match' }, { status: 500 });
  }
}
