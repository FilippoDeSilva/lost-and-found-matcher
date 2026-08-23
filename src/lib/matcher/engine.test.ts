import { calculateReportMatch } from './engine';
import { ItemReport } from '../../types';

function runTests() {
  console.log('🧪 Running Lost & Found Matcher Engine Tests...\n');

  // Test Case 1: Assessment Prompt Scenario - AirPods Case
  const lostAirpods: ItemReport = {
    id: 'lost_1',
    type: 'LOST',
    title: 'Black AirPods case',
    category: 'ELECTRONICS',
    description: 'I lost my black AirPods case yesterday near the cafeteria.',
    originalLanguage: 'en',
    locationName: 'Cafeteria',
    locationZoneId: 'CAFETERIA_DINING',
    dateOccurred: '2026-08-22T10:00:00Z',
    dateReported: '2026-08-22T12:00:00Z',
    status: 'OPEN',
    contactEmail: 'student1@university.edu'
  };

  const foundAirpods: ItemReport = {
    id: 'found_1',
    type: 'FOUND',
    title: 'Dark wireless earbud case',
    category: 'ELECTRONICS',
    description: 'Found a dark wireless earbud case beside the coffee shop.',
    originalLanguage: 'en',
    locationName: 'Coffee Shop',
    locationZoneId: 'CAFETERIA_DINING',
    dateOccurred: '2026-08-22T14:00:00Z',
    dateReported: '2026-08-22T15:00:00Z',
    status: 'OPEN',
    contactEmail: 'finder1@university.edu'
  };

  const res1 = calculateReportMatch(lostAirpods, foundAirpods);
  console.log(`[TEST 1] AirPods vs Earbud Case Match Score: ${res1.overallScore}% (${res1.confidence})`);
  console.assert(res1.overallScore >= 75, 'Expected high confidence match for AirPods vs Earbud case');
  console.log('Reasons:', res1.reasons);
  console.log('---');

  // Test Case 2: Assessment Prompt Scenario - Backpack same day vs 2 weeks later
  const lostBackpack: ItemReport = {
    id: 'lost_2',
    type: 'LOST',
    title: 'Black backpack containing laptop charger',
    category: 'BAGS',
    description: 'Lost around the library on Monday afternoon.',
    originalLanguage: 'en',
    locationName: 'Main Library',
    locationZoneId: 'LIBRARY_COMPLEX',
    dateOccurred: '2026-08-15T14:00:00Z',
    dateReported: '2026-08-15T15:00:00Z',
    status: 'OPEN',
    contactEmail: 'student2@university.edu'
  };

  const foundBackpackSameDay: ItemReport = {
    id: 'found_2a',
    type: 'FOUND',
    title: 'Dark-colored backpack',
    category: 'BAGS',
    description: 'Found near the library entrance Monday evening.',
    originalLanguage: 'en',
    locationName: 'Library Entrance',
    locationZoneId: 'LIBRARY_COMPLEX',
    dateOccurred: '2026-08-15T19:00:00Z',
    dateReported: '2026-08-15T20:00:00Z',
    status: 'OPEN',
    contactEmail: 'finder2@university.edu'
  };

  const foundBackpack2WeeksLater: ItemReport = {
    id: 'found_2b',
    type: 'FOUND',
    title: 'Black backpack',
    category: 'BAGS',
    description: 'Found at the football field two weeks later.',
    originalLanguage: 'en',
    locationName: 'Football Field',
    locationZoneId: 'SPORTS_GYM',
    dateOccurred: '2026-08-29T14:00:00Z',
    dateReported: '2026-08-29T15:00:00Z',
    status: 'OPEN',
    contactEmail: 'finder3@university.edu'
  };

  const res2a = calculateReportMatch(lostBackpack, foundBackpackSameDay);
  const res2b = calculateReportMatch(lostBackpack, foundBackpack2WeeksLater);

  console.log(`[TEST 2A] Library Backpack Same Day Score: ${res2a.overallScore}% (${res2a.confidence})`);
  console.log(`[TEST 2B] Football Field Backpack 2 Weeks Later Score: ${res2b.overallScore}% (${res2b.confidence})`);
  console.assert(res2a.overallScore > res2b.overallScore, 'Same day library match should score higher than 2 weeks later football field');
  console.log('---');

  // Test Case 3: Multilingual Cross-Language Test (French vs English)
  const lostFrenchBag: ItemReport = {
    id: 'lost_3',
    type: 'LOST',
    title: 'Sac à dos noir',
    category: 'BAGS',
    description: 'J ai perdu mon sac à dos près de la bibliothèque',
    originalLanguage: 'fr',
    locationName: 'Bibliothèque',
    locationZoneId: 'LIBRARY_COMPLEX',
    dateOccurred: '2026-08-15T10:00:00Z',
    dateReported: '2026-08-15T11:00:00Z',
    status: 'OPEN',
    contactEmail: 'french_student@university.edu'
  };

  const res3 = calculateReportMatch(lostFrenchBag, foundBackpackSameDay);
  console.log(`[TEST 3] French "Sac à dos" vs English "Backpack" Score: ${res3.overallScore}% (${res3.confidence})`);
  console.assert(res3.overallScore >= 70, 'Multilingual concept canonicalizer should match Sac à dos to Backpack');
  console.log('---');

  console.log('✅ All matcher engine tests completed successfully!');
}

runTests();
