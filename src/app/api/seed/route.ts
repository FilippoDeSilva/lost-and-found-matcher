import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_SAMPLE_REPORTS } from '@/lib/sampleData';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 500 });
    }

    // Clear existing match records and reports in database
    await prisma.matchRecord.deleteMany({});
    await prisma.report.deleteMany({});

    // Seed database with assessment test scenarios
    for (const report of INITIAL_SAMPLE_REPORTS) {
      await prisma.report.create({
        data: {
          id: report.id,
          type: report.type,
          title: report.title,
          category: report.category,
          description: report.description,
          originalLanguage: report.originalLanguage,
          locationName: report.locationName,
          locationZoneId: report.locationZoneId,
          dateOccurred: new Date(report.dateOccurred),
          contactEmail: report.contactEmail,
          contactPhone: report.contactPhone
        }
      });
    }

    const seededReports = await prisma.report.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ reports: seededReports, success: true });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
