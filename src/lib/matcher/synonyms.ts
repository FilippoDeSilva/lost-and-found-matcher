/**
 * Universal Dynamic Semantic Engine
 * Powered by Live Translation & Universal Token Normalization
 */

export interface CanonicalCategory {
  id: string;
  category: string;
  canonicalName: string;
  primaryKeywords: string[];
}

export const CANONICAL_CATEGORIES: CanonicalCategory[] = [
  {
    id: 'AUDIO_EARBUDS',
    category: 'ELECTRONICS',
    canonicalName: 'Wireless Earbuds / Headphones / AirPods',
    primaryKeywords: ['earbud', 'earbuds', 'bud', 'buds', 'airpod', 'airpods', 'headphone', 'headphones', 'earphone', 'earphones', 'headset']
  },
  {
    id: 'BACKPACK_BAG',
    category: 'BAGS',
    canonicalName: 'Backpack / Bag / Rucksack',
    primaryKeywords: ['backpack', 'knapsack', 'rucksack', 'bag', 'bookbag', 'tote', 'duffel', 'pack', 'briefcase']
  },
  {
    id: 'WATER_BOTTLE',
    category: 'PERSONAL_ITEMS',
    canonicalName: 'Water Bottle / Hydro Flask / Canteen',
    primaryKeywords: ['bottle', 'water bottle', 'hydroflask', 'flask', 'canteen', 'thermos', 'tumbler', 'mug']
  },
  {
    id: 'SMARTPHONE',
    category: 'ELECTRONICS',
    canonicalName: 'Smartphone / Phone / iPhone',
    primaryKeywords: ['phone', 'smartphone', 'iphone', 'android', 'galaxy', 'mobile', 'cell']
  },
  {
    id: 'KEYS_KEYCHAIN',
    category: 'KEYS',
    canonicalName: 'Keys / Keychain / Fob',
    primaryKeywords: ['key', 'keys', 'keychain', 'keyring', 'fob']
  },
  {
    id: 'STUDENT_ID_CARDS',
    category: 'DOCUMENTS',
    canonicalName: 'Student ID / Wallet / Cards',
    primaryKeywords: ['id', 'student id', 'card', 'license', 'wallet', 'purse']
  }
];

export const UNIVERSAL_COLORS: Record<string, string[]> = {
  'BLACK_DARK': ['black', 'dark', 'charcoal', 'pitch', 'jet', 'shadow'],
  'WHITE_LIGHT': ['white', 'light', 'silver', 'grey', 'gray', 'off-white'],
  'BLUE': ['blue', 'navy', 'cyan', 'azure'],
  'RED': ['red', 'crimson', 'maroon'],
  'GREEN': ['green', 'lime', 'olive']
};

/**
 * Levenshtein distance for fuzzy typo matching (e.g. airpod <-> aerpod)
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Normalizes text by removing accents, symbols, and lowercasing
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .trim();
}

/**
 * Extracts canonical concepts & colors dynamically from normalized canonical text
 */
export function extractCanonicalConceptsFromText(text: string): {
  conceptIds: string[];
  colorGroups: string[];
  normalizedTokens: string[];
} {
  const cleanText = normalizeText(text);
  const tokens = cleanText.split(/\s+/).filter(Boolean);

  const matchedConcepts = new Set<string>();
  const matchedColors = new Set<string>();

  // Dynamic Keyword & Fuzzy Overlap
  for (const concept of CANONICAL_CATEGORIES) {
    for (const kw of concept.primaryKeywords) {
      if (cleanText.includes(kw)) {
        matchedConcepts.add(concept.id);
      } else if (kw.length > 4) {
        for (const token of tokens) {
          if (token.length > 4 && levenshteinDistance(token, kw) <= 1) {
            matchedConcepts.add(concept.id);
          }
        }
      }
    }
  }

  // Dynamic Color Extraction
  for (const [colorGroup, terms] of Object.entries(UNIVERSAL_COLORS)) {
    for (const term of terms) {
      if (cleanText.includes(term)) {
        matchedColors.add(colorGroup);
      }
    }
  }

  return {
    conceptIds: Array.from(matchedConcepts),
    colorGroups: Array.from(matchedColors),
    normalizedTokens: tokens
  };
}
