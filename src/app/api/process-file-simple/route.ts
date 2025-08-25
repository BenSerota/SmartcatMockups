import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      });
    }

    const fileName = file.name;
    const fileType = file.type;
    const fileSize = file.size;

    // Only handle text files for now
    if (fileType.includes('text/') || fileType.includes('application/json')) {
      const content = await file.text();
      
      return NextResponse.json({
        success: true,
        content: content,
        fileName,
        fileType,
        fileSize
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `Unsupported file type: ${fileType}. Please upload text files only.`
      });
    }

  } catch (error) {
    console.error('File processing error:', error);
    return NextResponse.json({
      success: false,
      error: `Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}
