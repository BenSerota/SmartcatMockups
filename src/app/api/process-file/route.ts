import { NextRequest, NextResponse } from 'next/server';

// Use dynamic imports to avoid compilation issues
let mammoth: any = null;
let pdfParse: any = null;

async function loadLibraries() {
  try {
    mammoth = await import('mammoth');
    pdfParse = await import('pdf-parse');
    console.log('Libraries loaded successfully');
  } catch (error) {
    console.error('Failed to load libraries:', error);
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

    let content = '';
    let processingSteps: string[] = [];

    // Process different file types
    if (fileType.includes('text/') || fileType.includes('application/json')) {
      // Text files
      processingSteps.push('Reading text content...');
      content = await file.text();
      processingSteps.push('Text content extracted successfully');
    } else if (fileType.includes('application/pdf') || fileName.endsWith('.pdf')) {
      // PDF files - actual text extraction
      processingSteps.push('Processing PDF document...');
      
      try {
        // Convert file to ArrayBuffer for pdf-parse
        const arrayBuffer = await file.arrayBuffer();
        
        // Extract text using pdf-parse
        const result = await pdfParse(Buffer.from(arrayBuffer));
        
        if (result.text) {
          content = result.text;
          processingSteps.push('PDF document text extracted successfully');
        } else {
          throw new Error('No text content found in PDF document');
        }
        
        // Add PDF metadata
        if (result.info) {
          processingSteps.push(`PDF info: ${result.info.Title || 'No title'}, ${result.info.Author || 'No author'}`);
        }
        
      } catch (pdfError) {
        console.error('PDF processing error:', pdfError);
        return NextResponse.json({
          success: false,
          error: `Unable to extract text from PDF: ${pdfError.message}. The file might be corrupted, password-protected, or image-based.`
        });
      }
    } else if (fileType.includes('word') || fileType.includes('document') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      // Word documents - actual text extraction
      processingSteps.push('Processing Word document...');
      
      try {
        // Check if mammoth is loaded
        if (!mammoth) {
          throw new Error('Mammoth library not loaded');
        }
        
        console.log('Processing Word document:', fileName, 'Type:', fileType, 'Size:', fileSize);
        
        // Convert file to ArrayBuffer for mammoth
        const arrayBuffer = await file.arrayBuffer();
        console.log('File converted to ArrayBuffer, size:', arrayBuffer.byteLength);
        
        // Extract text using mammoth
        const result = await mammoth.extractRawText({ arrayBuffer });
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
        console.error('Mammoth processing error:', mammothError);
        console.error('Error details:', {
          fileName,
          fileType,
          fileSize,
          errorMessage: mammothError.message,
          errorStack: mammothError.stack
        });
        
        // Try fallback method for .docx files
        if (fileName.endsWith('.docx') || fileType.includes('openxmlformats-officedocument.wordprocessingml.document')) {
          try {
            console.log('Trying fallback method for Word document...');
            processingSteps.push('Mammoth failed, trying fallback method...');
            
            // Try to read as text (some .docx files might be readable this way)
            const textContent = await file.text();
            if (textContent && textContent.trim().length > 0) {
              content = textContent;
              processingSteps.push('Word document processed with fallback method');
              console.log('Fallback method succeeded, content length:', content.length);
            } else {
              throw new Error('Fallback method also failed - no readable content');
            }
          } catch (fallbackError) {
            console.error('Fallback method also failed:', fallbackError);
            return NextResponse.json({
              success: false,
              error: `Unable to extract text from Word document: ${mammothError.message}. The file might be corrupted, password-protected, or in an unsupported format.`
            });
          }
        } else {
          return NextResponse.json({
            success: false,
            error: `Unable to extract text from Word document: ${mammothError.message}. The file might be corrupted, password-protected, or in an unsupported format.`
          });
        }
      }
    } else if (fileType.includes('html')) {
      // HTML files
      processingSteps.push('Processing HTML document...');
      const text = await file.text();
      // Enhanced HTML to text conversion
      content = text
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
        .replace(/<[^>]*>/g, ' ') // Remove remaining HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      processingSteps.push('HTML content extracted and cleaned');
    } else {
      return NextResponse.json({
        success: false,
        error: `Unsupported file type: ${fileType}. Please upload text, PDF, Word, or HTML files.`
      });
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No readable content found in the file.'
      });
    }

    // Truncate content if too long (limit to 50,000 characters)
    if (content.length > 50000) {
      content = content.substring(0, 50000) + '\n\n[Content truncated due to length - original file was too large]';
      processingSteps.push('Content truncated to fit API limits');
    }

    // Add processing summary
    const processingSummary = `\n\n--- Processing Summary ---\nFile: ${fileName}\nType: ${getFileTypeDescription(fileType)}\nSize: ${(fileSize / 1024).toFixed(1)} KB\nSteps: ${processingSteps.join(' → ')}\nCharacters: ${content.length}\n--- End Summary ---`;

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

function getFileTypeDescription(fileType: string): string {
  if (fileType.includes('text/plain')) return 'Text Document';
  if (fileType.includes('application/pdf')) return 'PDF Document';
  if (fileType.includes('word')) return 'Word Document';
  if (fileType.includes('html')) return 'HTML Document';
  if (fileType.includes('json')) return 'JSON Document';
  return 'Document';
}
