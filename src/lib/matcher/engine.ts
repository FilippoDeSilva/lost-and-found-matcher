import { ItemReport, MatchResult, MatchBreakdown, Language } from '../../types';
import { extractCanonicalConceptsFromText, CANONICAL_CATEGORIES, levenshteinDistance } from './synonyms';
import { calculateLocationProximity } from './locations';
import { translateText } from '../translator';

/**
 * Universal Dynamic Matching Engine
 * Uses Live Translation to compare reports across ANY language without hardcoded language dictionaries
 */
export async function calculateReportMatchAsync(
  lostReport: ItemReport,
  foundReport: ItemReport
): Promise<MatchResult> {
  const reasons: string[] = [];

  if (!lostReport || !foundReport) {
    return createEmptyMatchResult(lostReport, foundReport);
  }

  // 1. Live Dynamic Translation to Canonical Language (English) for matching
  const lostCanonicalText = lostReport.originalLanguage !== 'en' 
    ? await translateText(`${lostReport.title} ${lostReport.description}`, 'en', lostReport.originalLanguage)
    : `${lostReport.title} ${lostReport.description}`;

  const foundCanonicalText = foundReport.originalLanguage !== 'en'
    ? await translateText(`${foundReport.title} ${foundReport.description}`, 'en', foundReport.originalLanguage)
    : `${foundReport.title} ${foundReport.description}`;

  // --- 1. CATEGORY & CANONICAL CONCEPT SCORE (25% Weight) ---
  const lostConcepts = extractCanonicalConceptsFromText(lostCanonicalText);
  const foundConcepts = extractCanonicalConceptsFromText(foundCanonicalText);

  let categoryScore = 0;
  let conceptMatchedName: string | null = null;

  if (lostReport.category && foundReport.category && lostReport.category === foundReport.category) {
    categoryScore += 50;
    reasons.push(`Matching category: ${lostReport.category}`);
  }

  const sharedConcepts = lostConcepts.conceptIds.filter(id => foundConcepts.conceptIds.includes(id));
  if (sharedConcepts.length > 0) {
    categoryScore += 50;
    const conceptObj = CANONICAL_CATEGORIES.find(c => c.id === sharedConcepts[0]);
    conceptMatchedName = conceptObj ? conceptObj.canonicalName : sharedConcepts[0];
    reasons.push(`Identified common item concept: "${conceptMatchedName}"`);
  } else if (categoryScore === 0) {
    categoryScore = 25;
  }
  categoryScore = Math.min(100, categoryScore);

  // --- 2. TEXT & SEMANTIC SIMILARITY SCORE (35% Weight) ---
  let textScore = 0;

  const sharedColors = lostConcepts.colorGroups.filter(c => foundConcepts.colorGroups.includes(c));
  if (sharedColors.length > 0) {
    textScore += 35;
    reasons.push(`Matching color profile: ${sharedColors.join(', ').replace('_', ' ')}`);
  }

  const set1 = new Set(lostConcepts.normalizedTokens);
  const set2 = new Set(foundConcepts.normalizedTokens);

  let fuzzyMatches = 0;
  for (const t1 of set1) {
    for (const t2 of set2) {
      if (t1 === t2 || (t1.length > 4 && t2.length > 4 && levenshteinDistance(t1, t2) <= 1)) {
        fuzzyMatches++;
        break;
      }
    }
  }

  const totalTokens = Math.max(1, Math.min(set1.size, set2.size));
  const overlapRatio = Math.min(1.0, fuzzyMatches / totalTokens);
  textScore += Math.round(overlapRatio * 65);
  textScore = Math.min(100, textScore);

  if (overlapRatio > 0.15) {
    reasons.push(`Keyword overlap in item descriptions`);
  }

  // --- 3. LOCATION PROXIMITY SCORE (20% Weight) ---
  const locResult = calculateLocationProximity(
    { name: lostReport.locationName || '', zoneId: lostReport.locationZoneId || '' },
    { name: foundReport.locationName || '', zoneId: foundReport.locationZoneId || '' }
  );
  const locationScore = locResult.score;
  reasons.push(locResult.reason);

  // --- 4. TEMPORAL RELEVANCE SCORE (20% Weight) ---
  let timeScore = 50;
  const lostTime = lostReport.dateOccurred ? new Date(lostReport.dateOccurred).getTime() : NaN;
  const foundTime = foundReport.dateOccurred ? new Date(foundReport.dateOccurred).getTime() : NaN;

  if (!isNaN(lostTime) && !isNaN(foundTime)) {
    const diffHours = (foundTime - lostTime) / (1000 * 60 * 60);

    if (diffHours >= 0 && diffHours <= 24) {
      timeScore = 100;
      reasons.push(`Found within 24 hours of lost report`);
    } else if (diffHours > 24 && diffHours <= 72) {
      timeScore = 85;
      reasons.push(`Found within 3 days of lost report`);
    } else if (diffHours > 72 && diffHours <= 168) {
      timeScore = 60;
      reasons.push(`Found within a week of lost report`);
    } else if (diffHours > 168 && diffHours <= 336) {
      timeScore = 40;
      reasons.push(`Found 1-2 weeks after lost report`);
    } else if (diffHours > 336) {
      timeScore = 25;
      reasons.push(`Found over two weeks after lost report`);
    } else {
      const hoursBefore = Math.abs(diffHours);
      if (hoursBefore <= 24) {
        timeScore = 40;
        reasons.push(`Found slightly before lost report date (reporting delay buffer)`);
      } else {
        timeScore = 0;
        reasons.push(`Found date precedes lost date significantly`);
      }
    }
  } else {
    reasons.push(`Date comparison estimated (missing date metadata)`);
  }

  // --- OVERALL WEIGHTED SCORE ---
  const overallScore = Math.round(
    (categoryScore * 0.25) +
    (textScore * 0.35) +
    (locationScore * 0.20) +
    (timeScore * 0.20)
  );

  let confidence: MatchResult['confidence'] = 'LOW';
  if (overallScore >= 75) confidence = 'HIGH';
  else if (overallScore >= 50) confidence = 'MEDIUM';

  const breakdown: MatchBreakdown = {
    categoryScore,
    textScore,
    locationScore,
    timeScore,
    canonicalConceptMatched: conceptMatchedName
  };

  return {
    id: `match_${lostReport.id}_${foundReport.id}`,
    lostReport,
    foundReport,
    overallScore,
    confidence,
    breakdown,
    reasons
  };
}

/**
 * Synchronous wrapper for instant client-side rendering
 */
export function calculateReportMatch(
  lostReport: ItemReport,
  foundReport: ItemReport
): MatchResult {
  const lostCanonicalText = `${lostReport.title || ''} ${lostReport.description || ''}`;
  const foundCanonicalText = `${foundReport.title || ''} ${foundReport.description || ''}`;

  const lostConcepts = extractCanonicalConceptsFromText(lostCanonicalText);
  const foundConcepts = extractCanonicalConceptsFromText(foundCanonicalText);

  let categoryScore = 0;
  let conceptMatchedName: string | null = null;
  const reasons: string[] = [];

  if (lostReport.category && foundReport.category && lostReport.category === foundReport.category) {
    categoryScore += 50;
    reasons.push(`Matching category: ${lostReport.category}`);
  }

  const sharedConcepts = lostConcepts.conceptIds.filter(id => foundConcepts.conceptIds.includes(id));
  if (sharedConcepts.length > 0) {
    categoryScore += 50;
    const conceptObj = CANONICAL_CATEGORIES.find(c => c.id === sharedConcepts[0]);
    conceptMatchedName = conceptObj ? conceptObj.canonicalName : sharedConcepts[0];
    reasons.push(`Identified common item concept: "${conceptMatchedName}"`);
  } else if (categoryScore === 0) {
    categoryScore = 25;
  }
  categoryScore = Math.min(100, categoryScore);

  let textScore = 0;
  const sharedColors = lostConcepts.colorGroups.filter(c => foundConcepts.colorGroups.includes(c));
  if (sharedColors.length > 0) {
    textScore += 35;
    reasons.push(`Matching color profile: ${sharedColors.join(', ').replace('_', ' ')}`);
  }

  const set1 = new Set(lostConcepts.normalizedTokens);
  const set2 = new Set(foundConcepts.normalizedTokens);
  let fuzzyMatches = 0;
  for (const t1 of set1) {
    for (const t2 of set2) {
      if (t1 === t2 || (t1.length > 4 && t2.length > 4 && levenshteinDistance(t1, t2) <= 1)) {
        fuzzyMatches++;
        break;
      }
    }
  }
  const overlapRatio = Math.min(1.0, fuzzyMatches / Math.max(1, Math.min(set1.size, set2.size)));
  textScore += Math.round(overlapRatio * 65);
  textScore = Math.min(100, textScore);
  if (overlapRatio > 0.15) {
    reasons.push(`Keyword overlap in item descriptions`);
  }

  const locResult = calculateLocationProximity(
    { name: lostReport.locationName || '', zoneId: lostReport.locationZoneId || '' },
    { name: foundReport.locationName || '', zoneId: foundReport.locationZoneId || '' }
  );
  reasons.push(locResult.reason);

  let timeScore = 50;
  const lostTime = lostReport.dateOccurred ? new Date(lostReport.dateOccurred).getTime() : NaN;
  const foundTime = foundReport.dateOccurred ? new Date(foundReport.dateOccurred).getTime() : NaN;

  if (!isNaN(lostTime) && !isNaN(foundTime)) {
    const diffHours = (foundTime - lostTime) / (1000 * 60 * 60);
    if (diffHours >= 0 && diffHours <= 24) {
      timeScore = 100;
      reasons.push(`Found within 24 hours of lost report`);
    } else if (diffHours > 24 && diffHours <= 72) {
      timeScore = 85;
      reasons.push(`Found within 3 days of lost report`);
    } else if (diffHours > 72 && diffHours <= 168) {
      timeScore = 60;
      reasons.push(`Found within a week of lost report`);
    } else if (diffHours > 168 && diffHours <= 336) {
      timeScore = 40;
      reasons.push(`Found 1-2 weeks after lost report`);
    } else if (diffHours > 336) {
      timeScore = 25;
      reasons.push(`Found over two weeks after lost report`);
    } else {
      const hoursBefore = Math.abs(diffHours);
      if (hoursBefore <= 24) {
        timeScore = 40;
        reasons.push(`Found slightly before lost report date (reporting delay buffer)`);
      } else {
        timeScore = 0;
        reasons.push(`Found date precedes lost date significantly`);
      }
    }
  } else {
    reasons.push(`Date comparison estimated (missing date metadata)`);
  }

  const overallScore = Math.round(
    (categoryScore * 0.25) +
    (textScore * 0.35) +
    (locResult.score * 0.20) +
    (timeScore * 0.20)
  );

  let confidence: MatchResult['confidence'] = 'LOW';
  if (overallScore >= 75) confidence = 'HIGH';
  else if (overallScore >= 50) confidence = 'MEDIUM';

  return {
    id: `match_${lostReport.id}_${foundReport.id}`,
    lostReport,
    foundReport,
    overallScore,
    confidence,
    breakdown: { categoryScore, textScore, locationScore: locResult.score, timeScore, canonicalConceptMatched: conceptMatchedName },
    reasons
  };
}

function createEmptyMatchResult(lost: ItemReport, found: ItemReport): MatchResult {
  return {
    id: `match_empty`,
    lostReport: lost,
    foundReport: found,
    overallScore: 0,
    confidence: 'LOW',
    breakdown: { categoryScore: 0, textScore: 0, locationScore: 0, timeScore: 0 },
    reasons: ['Incomplete report metadata']
  };
}
