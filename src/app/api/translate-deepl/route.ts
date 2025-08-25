import { NextRequest, NextResponse } from 'next/server';
import * as deepl from 'deepl-node';

// Initialize DeepL translator
const translator = new deepl.Translator(process.env.DEEPL_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { text, targetLanguage } = body;

    // Validate required fields
    if (!text) {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    if (!targetLanguage) {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      );
    }

    // Validate DeepL API key
    if (!process.env.DEEPL_API_KEY) {
      return NextResponse.json(
        { error: 'DeepL API key not configured. Please add DEEPL_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // Translate using DeepL with auto-detection
    const result = await translator.translateText(text, null, targetLanguage as deepl.TargetLanguageCode);
    
    return NextResponse.json({
      success: true,
      translation: result.text,
      detectedSourceLanguage: result.detectedSourceLang,
      targetLanguage: targetLanguage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('DeepL Translation API error:', error);
    
    // Handle specific DeepL errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'DeepL API key is invalid or not configured.' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'DeepL API quota exceeded. Please check your account limits.' },
          { status: 429 }
        );
      }

      if (error.message.includes('target_lang')) {
        return NextResponse.json(
          { error: 'Invalid target language code.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Translation service temporarily unavailable' },
      { status: 500 }
    );
  }
}
