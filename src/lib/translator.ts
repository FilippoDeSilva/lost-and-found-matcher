import { Language } from '@/types';

// In-memory translation cache for zero latency on repeated strings
const translationCache = new Map<string, string>();

/**
 * Live Dynamic Translation Function
 * Translates any string dynamically into the target UI language
 */
export async function translateText(
  text: string,
  targetLang: Language,
  sourceLang: string = 'autodetect'
): Promise<string> {
  if (!text || !text.trim()) return '';

  const cacheKey = `${sourceLang}_${targetLang}_${text.trim()}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // If already in target language and source is known
  if (sourceLang === targetLang) {
    return text;
  }

  try {
    const langPair = sourceLang && sourceLang !== 'autodetect' 
      ? `${sourceLang}|${targetLang}` 
      : `autodetect|${targetLang}`;

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
    
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        const translated = data.responseData.translatedText;
        translationCache.set(cacheKey, translated);
        return translated;
      }
    }
  } catch (err) {
    console.warn('Live translation API request failed, using original text:', err);
  }

  return text; // Fallback to original text if offline
}
