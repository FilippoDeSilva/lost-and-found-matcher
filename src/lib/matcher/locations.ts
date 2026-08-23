import { CampusZone } from '../../types';

export const CAMPUS_ZONES: CampusZone[] = [
  {
    id: 'CAFETERIA_DINING',
    name: 'Dining & Cafeteria Zone',
    areaGroup: 'Central Campus',
    adjacentZoneIds: ['STUDENT_UNION', 'LIBRARY_COMPLEX']
  },
  {
    id: 'LIBRARY_COMPLEX',
    name: 'Main Library & Study Area',
    areaGroup: 'Central Campus',
    adjacentZoneIds: ['CAFETERIA_DINING', 'ACADEMIC_QUAD']
  },
  {
    id: 'STUDENT_UNION',
    name: 'Student Union & Lounge',
    areaGroup: 'Central Campus',
    adjacentZoneIds: ['CAFETERIA_DINING', 'SPORTS_GYM']
  },
  {
    id: 'SPORTS_GYM',
    name: 'Sports Complex & Football Field',
    areaGroup: 'West Campus',
    adjacentZoneIds: ['STUDENT_UNION']
  },
  {
    id: 'ACADEMIC_QUAD',
    name: 'Academic Quad & Science Hall',
    areaGroup: 'North Campus',
    adjacentZoneIds: ['LIBRARY_COMPLEX']
  }
];

// Sub-location keywords mapping to zone IDs
const LOCATION_KEYWORDS: Record<string, string> = {
  'cafeteria': 'CAFETERIA_DINING',
  'coffee shop': 'CAFETERIA_DINING',
  'coffee': 'CAFETERIA_DINING',
  'dining': 'CAFETERIA_DINING',
  'food court': 'CAFETERIA_DINING',
  
  'library': 'LIBRARY_COMPLEX',
  'library entrance': 'LIBRARY_COMPLEX',
  'study hall': 'LIBRARY_COMPLEX',
  'bookstore': 'LIBRARY_COMPLEX',

  'student union': 'STUDENT_UNION',
  'student center': 'STUDENT_UNION',
  'lounge': 'STUDENT_UNION',
  
  'gym': 'SPORTS_GYM',
  'football field': 'SPORTS_GYM',
  'stadium': 'SPORTS_GYM',
  'fitness center': 'SPORTS_GYM',
  'sports field': 'SPORTS_GYM',

  'quad': 'ACADEMIC_QUAD',
  'science hall': 'ACADEMIC_QUAD',
  'engineering': 'ACADEMIC_QUAD',
  'lecture hall': 'ACADEMIC_QUAD'
};

/**
 * Derives Campus Zone ID from location string or defaults to nearest match
 */
export function resolveLocationZone(locationName: string): string {
  const clean = locationName.toLowerCase();
  for (const [keyword, zoneId] of Object.entries(LOCATION_KEYWORDS)) {
    if (clean.includes(keyword)) {
      return zoneId;
    }
  }
  return 'CAFETERIA_DINING'; // Fallback zone
}

/**
 * Calculates location proximity score (0 - 100) between two location zones/names
 */
export function calculateLocationProximity(
  loc1: { name: string; zoneId: string },
  loc2: { name: string; zoneId: string }
): { score: number; reason: string } {
  // Direct name match or substring match
  const n1 = loc1.name.toLowerCase();
  const n2 = loc2.name.toLowerCase();

  if (n1 === n2 || (n1.length > 3 && n2.includes(n1)) || (n2.length > 3 && n1.includes(n2))) {
    return { score: 100, reason: `Exact/Direct location match (${loc1.name})` };
  }

  const z1 = loc1.zoneId || resolveLocationZone(loc1.name);
  const z2 = loc2.zoneId || resolveLocationZone(loc2.name);

  if (z1 === z2) {
    return { score: 90, reason: `Same campus zone (${z1.replace('_', ' ')})` };
  }

  const zone1Obj = CAMPUS_ZONES.find(z => z.id === z1);
  if (zone1Obj && zone1Obj.adjacentZoneIds.includes(z2)) {
    return { score: 75, reason: `Adjacent campus zones (${z1} <-> ${z2})` };
  }

  if (zone1Obj && zone1Obj.areaGroup === CAMPUS_ZONES.find(z => z.id === z2)?.areaGroup) {
    return { score: 50, reason: `Same general campus area group` };
  }

  return { score: 20, reason: `Different campus zones (${loc1.name} vs ${loc2.name})` };
}
