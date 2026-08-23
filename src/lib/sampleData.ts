import { ItemReport } from '@/types';

export const INITIAL_SAMPLE_REPORTS: ItemReport[] = [
  // --- Scenario 1: Prompt Example 1 (AirPods / Earbud Case) ---
  {
    id: 'rep_lost_airpods',
    type: 'LOST',
    title: 'Black AirPods Case',
    category: 'ELECTRONICS',
    description: 'I lost my black AirPods case yesterday near the cafeteria. Has a tiny scratch on the back.',
    originalLanguage: 'en',
    locationName: 'Cafeteria',
    locationZoneId: 'CAFETERIA_DINING',
    dateOccurred: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    dateReported: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    status: 'OPEN',
    contactEmail: 'alex.s@university.edu',
    contactPhone: '+1 555-0192',
    tags: ['airpods', 'black', 'earbud case']
  },
  {
    id: 'rep_found_earbuds',
    type: 'FOUND',
    title: 'Dark Wireless Earbud Case',
    category: 'ELECTRONICS',
    description: 'Found a dark wireless earbud case beside the coffee shop counter.',
    originalLanguage: 'en',
    locationName: 'Coffee Shop',
    locationZoneId: 'CAFETERIA_DINING',
    dateOccurred: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    dateReported: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    status: 'OPEN',
    contactEmail: 'coffee_staff@university.edu',
    contactPhone: '+1 555-0144',
    tags: ['dark', 'earbud', 'case']
  },

  // --- Scenario 2: Prompt Example 2 (Library Backpack vs Football Field Backpack) ---
  {
    id: 'rep_lost_backpack',
    type: 'LOST',
    title: 'Black Backpack with Laptop Charger',
    category: 'BAGS',
    description: 'Black backpack containing a laptop charger and notebook. Lost around the library on Monday afternoon.',
    originalLanguage: 'en',
    locationName: 'Main Library',
    locationZoneId: 'LIBRARY_COMPLEX',
    dateOccurred: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dateReported: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
    status: 'OPEN',
    contactEmail: 'jordan.m@university.edu',
    tags: ['backpack', 'black', 'charger']
  },
  {
    id: 'rep_found_backpack_sameday',
    type: 'FOUND',
    title: 'Dark-Colored Backpack',
    category: 'BAGS',
    description: 'Dark-colored backpack found near the library entrance Monday evening.',
    originalLanguage: 'en',
    locationName: 'Library Entrance',
    locationZoneId: 'LIBRARY_COMPLEX',
    dateOccurred: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 3600000).toISOString(),
    dateReported: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 6 * 3600000).toISOString(),
    status: 'OPEN',
    contactEmail: 'library_desk@university.edu',
    tags: ['dark', 'backpack']
  },
  {
    id: 'rep_found_backpack_2weeks',
    type: 'FOUND',
    title: 'Black Backpack on Field',
    category: 'BAGS',
    description: 'Black backpack found at the football field bleachers.',
    originalLanguage: 'en',
    locationName: 'Football Field',
    locationZoneId: 'SPORTS_GYM',
    dateOccurred: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    dateReported: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
    status: 'OPEN',
    contactEmail: 'athletics@university.edu',
    tags: ['backpack', 'football field']
  },

  // --- Scenario 3: Multilingual Cross-Language Match (French <-> Spanish <-> English) ---
  {
    id: 'rep_lost_french_bag',
    type: 'LOST',
    title: 'Sac à dos bleu avec gourde',
    category: 'BAGS',
    description: 'J ai perdu mon sac à dos bleu avec une bouteille d eau près du centre étudiant.',
    originalLanguage: 'fr',
    locationName: 'Centre Étudiant',
    locationZoneId: 'STUDENT_UNION',
    dateOccurred: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    dateReported: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    status: 'OPEN',
    contactEmail: 'camille.d@university.edu',
    tags: ['sac', 'bleu', 'gourde']
  },
  {
    id: 'rep_found_spanish_bag',
    type: 'FOUND',
    title: 'Mochila azul con termo',
    category: 'BAGS',
    description: 'Encontrada una mochila azul con una botella de agua en el centro estudiantil.',
    originalLanguage: 'es',
    locationName: 'Centro Estudiantil',
    locationZoneId: 'STUDENT_UNION',
    dateOccurred: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
    dateReported: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    status: 'OPEN',
    contactEmail: 'mateo.g@university.edu',
    tags: ['mochila', 'azul', 'botella']
  },

  // --- Scenario 4: Amharic Lost Item ---
  {
    id: 'rep_lost_amharic_phone',
    type: 'LOST',
    title: 'ጥቁር ስልክ (Black Phone)',
    category: 'ELECTRONICS',
    description: 'ጥቁር ስልክ እና የጆሮ ማዳመጫ በሳይንስ ህንፃ ተጣለ (Black phone lost near science hall)',
    originalLanguage: 'am',
    locationName: 'Academic Quad',
    locationZoneId: 'ACADEMIC_QUAD',
    dateOccurred: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    dateReported: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    status: 'OPEN',
    contactEmail: 'tewodros.b@university.edu',
    tags: ['ስልክ', 'ጥቁር']
  }
];
