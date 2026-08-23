import { calculateReportMatch } from './engine';
import { extractCanonicalConceptsFromText, levenshteinDistance } from './synonyms';
import { ItemReport } from '../../types';

function runTestSuite() {
  console.log('🧪 Starting Comprehensive Matcher Engine Test Suite...\n');
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition: boolean, testName: string, detail: string = '') {
    totalCount++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName} ${detail}`);
      passedCount++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${detail}`);
    }
  }

  // --- GROUP 1: STANDARD PROMPT ASSESSMENT TEST CASES ---
  console.log('📌 --- GROUP 1: Standard Assessment Test Cases ---');

  // Test 1.1: AirPods vs Earbuds
  const lostAirpods: ItemReport = {
    id: 'lost_1',
    type: 'LOST',
    title: 'Black AirPods Case',
    category: 'ELECTRONICS',
    description: 'I lost my black AirPods case yesterday near cafeteria',
    originalLanguage: 'en',
    locationName: 'Cafeteria',
    locationZoneId: 'CAFETERIA_DINING',
    dateOccurred: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    dateReported: new Date().toISOString(),
    status: 'OPEN',
    contactEmail: 'user1@univ.edu'
  };

  const foundEarbuds: ItemReport = {
    id: 'found_1',
    type: 'FOUND',
    title: 'Dark Wireless Earbud Case',
    category: 'ELECTRONICS',
    description: 'Found a dark wireless earbud case beside coffee shop counter',
    originalLanguage: 'en',
    locationName: 'Coffee Shop',
    locationZoneId: 'CAFETERIA_DINING',
    dateOccurred: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    dateReported: new Date().toISOString(),
    status: 'OPEN',
    contactEmail: 'user2@univ.edu'
  };

  const res1 = calculateReportMatch(lostAirpods, foundEarbuds);
  assert(res1.overallScore >= 70, 'Test 1.1: AirPods vs Earbud Case', `Score: ${res1.overallScore}%, Confidence: ${res1.confidence}`);

  // Test 1.2: Same Day Library Backpack
  const lostBackpack: ItemReport = {
    id: 'lost_2',
    type: 'LOST',
    title: 'Black Backpack with Charger',
    category: 'BAGS',
    description: 'Black backpack containing laptop charger lost around library',
    originalLanguage: 'en',
    locationName: 'Main Library',
    locationZoneId: 'LIBRARY_COMPLEX',
    dateOccurred: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dateReported: new Date().toISOString(),
    status: 'OPEN',
    contactEmail: 'user3@univ.edu'
  };

  const foundBackpackSameDay: ItemReport = {
    id: 'found_2a',
    type: 'FOUND',
    title: 'Dark-Colored Backpack',
    category: 'BAGS',
    description: 'Dark-colored backpack found near library entrance',
    originalLanguage: 'en',
    locationName: 'Library Entrance',
    locationZoneId: 'LIBRARY_COMPLEX',
    dateOccurred: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 4 * 3600000).toISOString(),
    dateReported: new Date().toISOString(),
    status: 'OPEN',
    contactEmail: 'user4@univ.edu'
  };

  const res2a = calculateReportMatch(lostBackpack, foundBackpackSameDay);
  assert(res2a.overallScore >= 75, 'Test 1.2: Library Backpack Same Day', `Score: ${res2a.overallScore}%, Confidence: ${res2a.confidence}`);

  // Test 1.3: 2 Weeks Later at Football Field (Time & Distance Decay)
  const foundBackpack2WeeksLater: ItemReport = {
    id: 'found_2b',
    type: 'FOUND',
    title: 'Black Backpack on Field',
    category: 'BAGS',
    description: 'Black backpack found at football field bleachers',
    originalLanguage: 'en',
    locationName: 'Football Field',
    locationZoneId: 'SPORTS_GYM',
    dateOccurred: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    dateReported: new Date().toISOString(),
    status: 'OPEN',
    contactEmail: 'user5@univ.edu'
  };

  const res2b = calculateReportMatch(lostBackpack, foundBackpack2WeeksLater);
  assert(res2b.overallScore < res2a.overallScore, 'Test 1.3: Time & Distance Decay Evaluation', `Same Day: ${res2a.overallScore}% vs 2 Weeks Later: ${res2b.overallScore}%`);

  // --- GROUP 2: EDGE CASES & RESILIENCE TEST CASES ---
  console.log('\n📌 --- GROUP 2: Edge Cases & Resilience Test Cases ---');

  // Edge Case 2.1: Missing Date (Empty string / Invalid ISO)
  const lostNoDate: ItemReport = { ...lostAirpods, dateOccurred: '' };
  const resNoDate = calculateReportMatch(lostNoDate, foundEarbuds);
  assert(resNoDate.overallScore > 0 && resNoDate.breakdown.timeScore === 50, 'Edge Case 2.1: Missing Date Occurred (Graceful Fallback)', `Score: ${resNoDate.overallScore}%, Time Score: ${resNoDate.breakdown.timeScore}%`);

  // Edge Case 2.2: Empty / Missing Descriptions
  const lostEmptyDesc: ItemReport = { ...lostAirpods, title: 'Keys', description: '' };
  const foundEmptyDesc: ItemReport = { ...foundEarbuds, title: 'Keychain', description: '' };
  const resEmptyDesc = calculateReportMatch(lostEmptyDesc, foundEmptyDesc);
  assert(typeof resEmptyDesc.overallScore === 'number' && !isNaN(resEmptyDesc.overallScore), 'Edge Case 2.2: Empty Descriptions (No NaN)', `Score: ${resEmptyDesc.overallScore}%`);

  // Edge Case 2.3: Inverted Time Sequence (Found date is 3 weeks BEFORE lost date)
  const lostFutureDate: ItemReport = { ...lostAirpods, dateOccurred: new Date(Date.now()).toISOString() };
  const foundPastDate: ItemReport = { ...foundEarbuds, dateOccurred: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString() };
  const resInvertedTime = calculateReportMatch(lostFutureDate, foundPastDate);
  assert(resInvertedTime.breakdown.timeScore === 0, 'Edge Case 2.3: Inverted Time Sequence (0% Time Score)', `Time Score: ${resInvertedTime.breakdown.timeScore}%`);

  // Edge Case 2.4: Unknown Location String (Unlisted campus zone)
  const lostUnknownLoc: ItemReport = { ...lostAirpods, locationName: 'Behind old wooden bench in biology garden', locationZoneId: 'UNLISTED' };
  const foundUnknownLoc: ItemReport = { ...foundEarbuds, locationName: 'Biology garden bench', locationZoneId: 'UNLISTED' };
  const resUnknownLoc = calculateReportMatch(lostUnknownLoc, foundUnknownLoc);
  assert(resUnknownLoc.breakdown.locationScore >= 50, 'Edge Case 2.4: Unlisted Location Fuzzy Distance', `Location Score: ${resUnknownLoc.breakdown.locationScore}%`);

  // Edge Case 2.5: Typos & Levenshtein Distance
  const typoDist = levenshteinDistance('airpods', 'aerpods');
  assert(typoDist <= 1, 'Edge Case 2.5: Levenshtein Typo Distance', `Distance between airpods and aerpods: ${typoDist}`);

  // Edge Case 2.6: Completely Unrelated Items
  const lostWaterBottle: ItemReport = {
    id: 'lost_wb',
    type: 'LOST',
    title: 'Blue Hydro Flask Water Bottle',
    category: 'PERSONAL_ITEMS',
    description: 'Blue metal water bottle left in gym',
    originalLanguage: 'en',
    locationName: 'Gymnasium',
    locationZoneId: 'SPORTS_GYM',
    dateOccurred: new Date().toISOString(),
    dateReported: new Date().toISOString(),
    status: 'OPEN',
    contactEmail: 'user6@univ.edu'
  };

  const foundKey: ItemReport = {
    id: 'found_key',
    type: 'FOUND',
    title: 'Dorm Door Key on Ring',
    category: 'KEYS',
    description: 'Silver key with blue plastic tag',
    originalLanguage: 'en',
    locationName: 'Main Library',
    locationZoneId: 'LIBRARY_COMPLEX',
    dateOccurred: new Date().toISOString(),
    dateReported: new Date().toISOString(),
    status: 'OPEN',
    contactEmail: 'user7@univ.edu'
  };

  const resUnrelated = calculateReportMatch(lostWaterBottle, foundKey);
  assert(resUnrelated.overallScore <= 45 && resUnrelated.confidence === 'LOW', 'Edge Case 2.6: Unrelated Items Low Match Score', `Score: ${resUnrelated.overallScore}%, Confidence: ${resUnrelated.confidence}`);

  // --- GROUP 3: PARAMETER STRESS TESTING & FUTURE DATE ANOMALIES ---
  console.log('\n📌 --- GROUP 3: Parameter Stress & Future Date Anomalies ---');

  // Test 3.1: Exact Item, Future Lost Date (+12 Hours) vs Past Found Date (Slight Buffer)
  const lostFutureSlight: ItemReport = {
    ...lostAirpods,
    dateOccurred: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
  };
  const foundToday: ItemReport = {
    ...lostAirpods,
    id: 'found_exact_today',
    type: 'FOUND',
    dateOccurred: new Date().toISOString()
  };

  const resFutureSlight = calculateReportMatch(lostFutureSlight, foundToday);
  assert(
    resFutureSlight.breakdown.timeScore === 40 && resFutureSlight.overallScore === 88,
    'Test 3.1: Future Lost Date (+12h Buffer) Exact Item',
    `Overall: ${resFutureSlight.overallScore}%, Time Score: ${resFutureSlight.breakdown.timeScore}%, Reason: "${resFutureSlight.reasons.find(r => r.includes('reporting delay')) || ''}"`
  );

  // Test 3.2: Exact Item, Extreme Future Lost Date (+7 Days) vs Past Found Date (Major Inversion)
  const lostFutureExtreme: ItemReport = {
    ...lostAirpods,
    dateOccurred: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  const resFutureExtreme = calculateReportMatch(lostFutureExtreme, foundToday);
  assert(
    resFutureExtreme.breakdown.timeScore === 0 && resFutureExtreme.overallScore === 80,
    'Test 3.2: Extreme Future Lost Date (+7 Days Inversion)',
    `Overall: ${resFutureExtreme.overallScore}%, Time Score: ${resFutureExtreme.breakdown.timeScore}%, Reason: "${resFutureExtreme.reasons.find(r => r.includes('precedes')) || ''}"`
  );

  // Test 3.3: Parameter Sensitivity Matrix - Category vs Text vs Location vs Time Weighting
  // Base 100% match
  const baseMatch = calculateReportMatch(lostAirpods, { ...lostAirpods, id: 'found_exact', type: 'FOUND' });
  assert(baseMatch.overallScore === 100, 'Test 3.3a: Base 100% Identical Report Match', `Score: ${baseMatch.overallScore}%`);

  // Degrade Location only
  const diffLocationMatch = calculateReportMatch(lostAirpods, {
    ...lostAirpods,
    id: 'found_diff_loc',
    type: 'FOUND',
    locationName: 'Football Field',
    locationZoneId: 'SPORTS_GYM'
  });
  assert(diffLocationMatch.overallScore === 84, 'Test 3.3b: Location Degradation (-16 points)', `Score: ${diffLocationMatch.overallScore}%`);

  // --- GROUP 4: DETERMINISM & REPEATABILITY CHECK ---
  console.log('\n📌 --- GROUP 4: Determinism & Repeatability Check ---');
  const scoreRun1 = calculateReportMatch(lostAirpods, foundEarbuds).overallScore;
  let allIdentical = true;

  for (let i = 0; i < 100; i++) {
    const runScore = calculateReportMatch(lostAirpods, foundEarbuds).overallScore;
    if (runScore !== scoreRun1) {
      allIdentical = false;
      break;
    }
  }

  assert(allIdentical, 'Test 4.1: 100 Run Determinism Test', `All 100 execution runs produced exact score: ${scoreRun1}%`);

  // Summary Report
  console.log('\n==================================================');
  console.log(`📊 Test Suite Result: ${passedCount} / ${totalCount} Passed (${Math.round((passedCount / totalCount) * 100)}%)`);
  console.log('==================================================\n');

  if (passedCount < totalCount) {
    process.exit(1);
  }
}

runTestSuite();
