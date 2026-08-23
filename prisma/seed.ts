import { PrismaClient, ReportType, ReportCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Lost & Found Matcher Campus Database...');

  // Clear existing records to ensure clean seed state
  await prisma.matchRecord.deleteMany({});
  await prisma.report.deleteMany({});

  // 1. AirPods Scenario (Prompt Example 1)
  const lostAirpods = await prisma.report.create({
    data: {
      type: ReportType.LOST,
      title: 'Black AirPods Case',
      category: ReportCategory.ELECTRONICS,
      description: 'I lost my black AirPods case yesterday near the cafeteria. Has a tiny scratch on the back.',
      originalLanguage: 'en',
      locationName: 'Cafeteria',
      locationZoneId: 'CAFETERIA_DINING',
      dateOccurred: new Date(Date.now() - 24 * 60 * 60 * 1000),
      contactEmail: 'alex.s@university.edu',
      contactPhone: '+1 555-0192'
    }
  });

  const foundEarbuds = await prisma.report.create({
    data: {
      type: ReportType.FOUND,
      title: 'Dark Wireless Earbud Case',
      category: ReportCategory.ELECTRONICS,
      description: 'Found a dark wireless earbud case beside the coffee shop counter.',
      originalLanguage: 'en',
      locationName: 'Coffee Shop',
      locationZoneId: 'CAFETERIA_DINING',
      dateOccurred: new Date(Date.now() - 18 * 60 * 60 * 1000),
      contactEmail: 'coffee_staff@university.edu',
      contactPhone: '+1 555-0144'
    }
  });

  // 2. Library Backpack Scenario (Prompt Example 2)
  const lostBackpack = await prisma.report.create({
    data: {
      type: ReportType.LOST,
      title: 'Black Backpack with Laptop Charger',
      category: ReportCategory.BAGS,
      description: 'Black backpack containing a laptop charger and notebook. Lost around the library on Monday afternoon.',
      originalLanguage: 'en',
      locationName: 'Main Library',
      locationZoneId: 'LIBRARY_COMPLEX',
      dateOccurred: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      contactEmail: 'jordan.m@university.edu'
    }
  });

  const foundBackpackSameDay = await prisma.report.create({
    data: {
      type: ReportType.FOUND,
      title: 'Dark-Colored Backpack',
      category: ReportCategory.BAGS,
      description: 'Dark-colored backpack found near the library entrance Monday evening.',
      originalLanguage: 'en',
      locationName: 'Library Entrance',
      locationZoneId: 'LIBRARY_COMPLEX',
      dateOccurred: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 3600000),
      contactEmail: 'library_desk@university.edu'
    }
  });

  const foundBackpack2Weeks = await prisma.report.create({
    data: {
      type: ReportType.FOUND,
      title: 'Black Backpack on Field',
      category: ReportCategory.BAGS,
      description: 'Black backpack found at the football field bleachers.',
      originalLanguage: 'en',
      locationName: 'Football Field',
      locationZoneId: 'SPORTS_GYM',
      dateOccurred: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      contactEmail: 'athletics@university.edu'
    }
  });

  // 3. Multilingual Cross-Language Match (French Lost / Spanish Found)
  const lostFrenchBag = await prisma.report.create({
    data: {
      type: ReportType.LOST,
      title: 'Sac à dos bleu avec gourde',
      category: ReportCategory.BAGS,
      description: 'J ai perdu mon sac à dos bleu avec une bouteille d eau près du centre étudiant.',
      originalLanguage: 'fr',
      locationName: 'Centre Étudiant',
      locationZoneId: 'STUDENT_UNION',
      dateOccurred: new Date(Date.now() - 12 * 60 * 60 * 1000),
      contactEmail: 'camille.d@university.edu'
    }
  });

  const foundSpanishBag = await prisma.report.create({
    data: {
      type: ReportType.FOUND,
      title: 'Mochila azul con termo',
      category: ReportCategory.BAGS,
      description: 'Encontrada una mochila azul con una botella de agua en el centro estudiantil.',
      originalLanguage: 'es',
      locationName: 'Centro Estudiantil',
      locationZoneId: 'STUDENT_UNION',
      dateOccurred: new Date(Date.now() - 11 * 60 * 60 * 1000),
      contactEmail: 'mateo.g@university.edu'
    }
  });

  console.log('✅ Database seeded successfully with 7 campus reports!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
