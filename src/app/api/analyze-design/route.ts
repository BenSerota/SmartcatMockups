import { NextRequest, NextResponse } from 'next/server';
import { WebsiteDesignAnalyzer } from '@/utils/websiteDesignAnalyzer';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const analyzer = new WebsiteDesignAnalyzer();
    const analysis = await analyzer.analyzeWebsite(url);
    await analyzer.close();

    return NextResponse.json({
      success: true,
      data: analysis,
      url,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Design analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze website design',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
