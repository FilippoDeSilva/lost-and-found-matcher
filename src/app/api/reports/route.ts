import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_SAMPLE_REPORTS } from '@/lib/sampleData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ reports: INITIAL_SAMPLE_REPORTS, source: 'fallback' });
    }
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (reports.length === 0) {
      return NextResponse.json({ reports: INITIAL_SAMPLE_REPORTS, source: 'fallback' });
    }

    return NextResponse.json({ reports, source: 'database' });
  } catch (error) {
    console.warn('Prisma DB lookup fallback to sample data:', error);
    return NextResponse.json({ reports: INITIAL_SAMPLE_REPORTS, source: 'fallback' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, title, category, description, originalLanguage, locationName, locationZoneId, dateOccurred, contactEmail, contactPhone } = body;

    if (!prisma) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const report = await prisma.report.create({
      data: {
        type,
        title,
        category,
        description,
        originalLanguage: originalLanguage || 'en',
        locationName,
        locationZoneId,
        dateOccurred: new Date(dateOccurred),
        contactEmail,
        contactPhone
      }
    });

    return NextResponse.json({ report, success: true });
  } catch (error) {
    console.error('Error creating report in DB:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}
