export interface FileProcessingResult {
  content: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  success: boolean;
  error?: string;
}

export async function processFile(file: File): Promise<FileProcessingResult> {
  try {
    const fileName = file.name;
    const fileType = file.type;
    const fileSize = file.size;

    // Check file size (limit to 10MB)
    if (fileSize > 10 * 1024 * 1024) {
      return {
        content: '',
        fileName,
        fileType,
        fileSize,
        success: false,
        error: 'File size too large. Please upload files smaller than 10MB.'
      };
    }

    // For now, only handle text files on client side
    if (fileType.includes('text/') || fileType.includes('application/json')) {
      const content = await file.text();
      return {
        content: content,
        fileName,
        fileType,
        fileSize,
        success: true
      };
    } else {
      // For other file types, use server-side API
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/process-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        return {
          content: '',
          fileName,
          fileType,
          fileSize,
          success: false,
          error: data.error || 'File processing failed'
        };
      }

      return {
        content: data.content,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        success: true
      };
    }

  } catch (error) {
    return {
      content: '',
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      success: false,
      error: `Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export function getFileTypeDescription(fileType: string): string {
  if (fileType.includes('text/plain')) return 'Text Document';
  if (fileType.includes('application/pdf')) return 'PDF Document';
  if (fileType.includes('word')) return 'Word Document';
  if (fileType.includes('html')) return 'HTML Document';
  if (fileType.includes('json')) return 'JSON Document';
  return 'Document';
}
