import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const targetLanguage = formData.get('targetLanguage') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!targetLanguage) {
      return NextResponse.json(
        { error: 'No target language provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract both raw text and HTML content
    const textResult = await mammoth.extractRawText({ buffer });
    const htmlResult = await mammoth.convertToHtml({ buffer });
    
    const sourceText = textResult.value;
    const sourceHtml = htmlResult.value;

    if (!sourceText) {
      return NextResponse.json(
        { error: 'Could not extract text from document' },
        { status: 400 }
      );
    }

    // DeepL translation function
    const translateText = async (text: string, targetLang: string): Promise<string> => {
      try {
        // DeepL API key from environment variable
        const apiKey = process.env.DEEPL_API_KEY;
        
        if (!apiKey) {
          console.log('DeepL API key not found, using demo translation');
          return getDemoTranslation(text, targetLang);
        }

        // Map language codes to DeepL format
        const deeplLangMap: { [key: string]: string } = {
          'es': 'ES',
          'fr': 'FR', 
          'de': 'DE',
          'it': 'IT',
          'pt': 'PT',
          'ru': 'RU',
          'ja': 'JA',
          'ko': 'KO',
          'zh': 'ZH',
          'ar': 'AR'
        };

        const deeplTargetLang = deeplLangMap[targetLang] || targetLang.toUpperCase();

        const response = await fetch('https://api-free.deepl.com/v2/translate', {
          method: 'POST',
          headers: {
            'Authorization': `DeepL-Auth-Key ${apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            text: text,
            target_lang: deeplTargetLang,
          }),
        });

        if (!response.ok) {
          throw new Error(`DeepL API error: ${response.status}`);
        }

        const result = await response.json();
        return result.translations?.[0]?.text || text;
      } catch (error) {
        console.error('Translation error:', error);
        // Fallback to demo translation if API fails
        return getDemoTranslation(text, targetLang);
      }
    };

    // Fallback demo translation function
    const getDemoTranslation = (text: string, targetLang: string): string => {
      const languagePrefixes: { [key: string]: string } = {
        'es': 'Traducido al español: ',
        'fr': 'Traduit en français: ',
        'de': 'Ins Deutsche übersetzt: ',
        'it': 'Tradotto in italiano: ',
        'pt': 'Traduzido para português: ',
        'ru': 'Переведено на русский: ',
        'ja': '日本語に翻訳: ',
        'ko': '한국어로 번역: ',
        'zh': '翻译成中文: ',
        'ar': 'مترجم إلى العربية: ',
      };
      
      const prefix = languagePrefixes[targetLang] || '';
      return prefix + text;
    };

    const translatedText = await translateText(sourceText, targetLanguage);
    
    // Create translated HTML by properly translating each paragraph
    let translatedHtml = sourceHtml;
    const paragraphMatches = sourceHtml.match(/<p[^>]*>(.*?)<\/p>/g);
    
    if (paragraphMatches) {
      for (const match of paragraphMatches) {
        const contentMatch = match.match(/<p[^>]*>(.*?)<\/p>/);
        if (contentMatch) {
          const content = contentMatch[1];
          const translatedContent = await translateText(content, targetLanguage);
          translatedHtml = translatedHtml.replace(content, translatedContent);
        }
      }
    }

    return NextResponse.json({
      sourceText,
      sourceHtml,
      translatedText,
      translatedHtml,
      targetLanguage,
    });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
