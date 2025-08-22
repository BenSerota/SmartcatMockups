'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

interface FileUploadSmartcatProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  className?: string;
}

export default function FileUploadSmartcat({
  onFileSelect,
  onFileRemove,
  selectedFile,
  accept = {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  },
  maxFiles = 1,
  className = '',
}: FileUploadSmartcatProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    multiple: false,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? isDragReject
                ? 'border-red-400 bg-red-50'
                : 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className={`p-3 rounded-full ${
                isDragActive
                  ? isDragReject
                    ? 'bg-red-100'
                    : 'bg-blue-100'
                  : 'bg-gray-100'
              }`}>
                <Upload className={`h-8 w-8 ${
                  isDragActive
                    ? isDragReject
                      ? 'text-red-500'
                      : 'text-blue-500'
                    : 'text-gray-400'
                }`} />
              </div>
            </div>
            
            <div>
              {isDragActive ? (
                isDragReject ? (
                  <p className="text-red-600 font-medium">File type not supported</p>
                ) : (
                  <p className="text-blue-600 font-medium">Drop the file here...</p>
                )
              ) : (
                <div>
                  <p className="text-gray-600 font-medium mb-2">
                    Drag and drop your document here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse files
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                    <span>Supports: .docx</span>
                    <span>•</span>
                    <span>Max size: 10MB</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
            </div>
            <button
              onClick={onFileRemove}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
