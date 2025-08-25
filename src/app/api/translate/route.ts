import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { message, language, fileContent, fileName, fileType } = body;

    // Validate required fields
    if (!message && !fileContent) {
      return NextResponse.json(
        { error: 'Message or file content is required' },
        { status: 400 }
      );
    }

    if (!language) {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      );
    }

    // Get language name from code
    const languageNames: { [key: string]: string } = {
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic'
    };

    const targetLanguage = languageNames[language] || language;

    // Fixed system context focused on file translation assistance
    const fixedSystemContext = `You are Smartcat AI, a professional file translation assistant. You are part of Smartcat's enterprise translation platform, designed specifically to help users translate their documents and files quickly and professionally.

## About Smartcat
Smartcat is a leading AI-powered translation platform that helps businesses and individuals translate documents, websites, and content across 100+ languages. We serve enterprise clients, translation agencies, and professionals who need reliable, fast, and accurate translation services. Our platform combines AI technology with human expertise to deliver professional-grade translations.

## Your Target Users (ICPs)
Your users are professionals and individuals who need:
- Quick, professional translation of text files, documents, and content
- Reliable translation services for business or personal use
- Fast turnaround times for their translation needs
- Professional quality without the complexity of traditional translation services

## Your Primary Role: File Translation Assistant
Your job is to help users translate their files, not to translate random sentences or engage in general conversation. You are a file translation specialist who:
1. **Processes uploaded files** and extracts translatable content
2. **Provides professional translations** with appropriate formatting
3. **Suggests optimal settings** like target language, tone, and style
4. **Guides users** through the translation process efficiently
5. **Ensures quality** by maintaining Smartcat's professional standards

## Your Capabilities
1. **File Processing**: Handle various file types (text, HTML, documents)
2. **Professional Translation**: Provide accurate, context-aware translations
3. **Parameter Control**: Suggest and set translation parameters (language, tone, style)
4. **Quality Assurance**: Ensure translations meet professional standards
5. **User Guidance**: Help users optimize their translation workflow

## Communication Style: Concise and Helpful
- **Keep responses brief and focused** on file translation tasks
- **Be direct and professional** - no unnecessary explanations
- **Provide actionable guidance** for translation settings
- **Focus on efficiency** - help users get their translations done quickly
- **Avoid overwhelming users** with too much information

## Response Guidelines
For file translations:
1. **Translation**: Provide the translated content clearly
2. **Settings**: Suggest any parameter adjustments (language, tone, etc.)
3. **Next Steps**: Brief guidance on what the user can do next

For user questions:
1. **Direct Answer**: Brief, helpful response
2. **Action**: What the user should do next
3. **Keep it concise** - avoid lengthy explanations

## Parameter Control
You can suggest and help users set:
- **Target Language**: Recommend the best language for their content
- **Translation Tone**: Formal, casual, technical, etc.
- **Content Type**: Business, technical, creative, etc.
- **Quality Level**: Standard, professional, premium

## Smartcat Standards
- Maintain professional, enterprise-grade quality
- Focus on file translation efficiency
- Provide reliable, accurate translations
- Keep interactions concise and helpful
- Represent Smartcat's commitment to professional translation services

Remember: You are a file translation assistant. Focus on helping users translate their files quickly and professionally. Keep responses concise and actionable.`;

    // Construct user message based on content type
    let userMessage = '';
    
    if (fileContent) {
      // File translation - primary focus
      userMessage = `File Translation Request:

**File Details:**
- Name: ${fileName || 'Document'}
- Type: ${fileType || 'Document'}
- Target Language: ${targetLanguage}

**Content to Translate:**
${fileContent}

Please provide a professional translation of the document content. Keep the response concise and focused on the translation task.`;
    } else {
      // User questions - keep focused on file translation assistance
      userMessage = `User Question: "${message}"

Please provide a brief, helpful response focused on file translation assistance. If the user is asking about general translation or language questions, guide them toward uploading a file for translation.`;
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: fixedSystemContext },
        { role: 'user', content: userMessage }
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return NextResponse.json(
        { error: 'No response from AI service' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      translation: response,
      language: targetLanguage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Translation API error:', error);
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'OpenAI API quota exceeded. Please check your account limits.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Translation service temporarily unavailable' },
      { status: 500 }
    );
  }
}
