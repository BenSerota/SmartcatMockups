import { NextRequest, NextResponse } from 'next/server';

// Use dynamic imports to avoid compilation issues
let mammoth: any = null;

async function loadLibraries() {
  try {
    const mammothModule = await import('mammoth');
    mammoth = mammothModule.default || mammothModule;
    console.log('Mammoth library loaded successfully');
  } catch (error) {
    console.error('Failed to load mammoth library:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Load libraries
    await loadLibraries();
    
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

    // Check file size (limit to 10MB)
    if (fileSize > 10 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'File size too large. Please upload files smaller than 10MB.'
      });
    }

    // Only process Word documents
    if (!fileType.includes('word') && !fileType.includes('document') && !fileName.endsWith('.docx') && !fileName.endsWith('.doc')) {
      return NextResponse.json({
        success: false,
        error: 'Only Word documents (.docx, .doc) are supported. Please upload a Word document.'
      });
    }

    let content = '';
    let processingSteps: string[] = [];

    // Process Word documents
    processingSteps.push('Processing Word document...');
    
    try {
      // Check if mammoth is loaded
      if (!mammoth) {
        throw new Error('Mammoth library not loaded');
      }
      
      console.log('Processing Word document:', fileName, 'Type:', fileType, 'Size:', fileSize);
      
      // Convert file to Buffer for mammoth
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log('File converted to Buffer, size:', buffer.length);
      
      // Extract text using mammoth
      const result = await mammoth.extractRawText({ buffer });
      console.log('Mammoth result:', result);
      
      if (result.value) {
        content = result.value;
        processingSteps.push('Word document text extracted successfully');
        console.log('Text extracted, length:', content.length);
      } else {
        throw new Error('No text content found in Word document');
      }
      
      // Add any messages from mammoth
      if (result.messages && result.messages.length > 0) {
        const messages = result.messages.map((msg: any) => msg.message).join(', ');
        processingSteps.push(`Processing notes: ${messages}`);
        console.log('Mammoth messages:', messages);
      }
      
    } catch (mammothError) {
      console.error('Word document processing error:', mammothError);
      return NextResponse.json({
        success: false,
        error: `Unable to extract text from Word document: ${mammothError.message}. The file might be corrupted or password-protected.`
      });
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No readable content found in the Word document.'
      });
    }

    // Truncate content if too long (limit to 50,000 characters)
    if (content.length > 50000) {
      content = content.substring(0, 50000) + '\n\n[Content truncated due to length - original file was too large]';
      processingSteps.push('Content truncated to fit API limits');
    }

    // Add processing summary
    const processingSummary = `\n\n--- Processing Summary ---\nFile: ${fileName}\nType: Word Document\nSize: ${(fileSize / 1024).toFixed(1)} KB\nSteps: ${processingSteps.join(' → ')}\nCharacters: ${content.length}\n--- End Summary ---`;

    return NextResponse.json({
      success: true,
      content: content + processingSummary,
      fileName,
      fileType,
      fileSize
    });

  } catch (error) {
    console.error('File processing error:', error);
    return NextResponse.json({
      success: false,
      error: `Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}
