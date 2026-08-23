import { NextResponse } from 'next/server';
import { translateText } from '@/lib/translator';
import { Language } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { text, targetLang, sourceLang } = await request.json();

    if (!text || !targetLang) {
      return NextResponse.json({ error: 'Text and targetLang required' }, { status: 400 });
    }

    const translatedText = await translateText(text, targetLang as Language, sourceLang || 'autodetect');
    return NextResponse.json({ translatedText, originalText: text, targetLang });
  } catch (error) {
    console.error('Error in translate API endpoint:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
