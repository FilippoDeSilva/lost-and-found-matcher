export type ReportType = 'LOST' | 'FOUND';

export type ReportCategory = 
  | 'ELECTRONICS' 
  | 'BAGS' 
  | 'CLOTHING' 
  | 'KEYS' 
  | 'DOCUMENTS' 
  | 'PERSONAL_ITEMS' 
  | 'OTHER';

export type ReportStatus = 'OPEN' | 'MATCHED' | 'RESOLVED';

export type Language = 'en' | 'es' | 'fr' | 'am';

export interface ItemReport {
  id: string;
  type: ReportType;
  title: string;
  category: ReportCategory;
  description: string;
  originalLanguage: Language;
  locationName: string;
  locationZoneId: string;
  dateOccurred: string; // ISO date string
  dateReported: string; // ISO date string
  status: ReportStatus;
  contactEmail: string;
  contactPhone?: string;
  tags?: string[];
  imageUrl?: string;
}

export interface MatchBreakdown {
  categoryScore: number; // 0 - 100
  textScore: number;     // 0 - 100
  locationScore: number; // 0 - 100
  timeScore: number;     // 0 - 100
  canonicalConceptMatched?: string | null;
}

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface MatchResult {
  id: string;
  lostReport: ItemReport;
  foundReport: ItemReport;
  overallScore: number; // 0 - 100
  confidence: ConfidenceLevel;
  breakdown: MatchBreakdown;
  reasons: string[];
  translatedReasons?: Record<Language, string[]>;
}

export interface CampusZone {
  id: string;
  name: string;
  areaGroup: string;
  adjacentZoneIds: string[];
}
