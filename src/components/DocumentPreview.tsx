'use client';

import { useEffect, useRef } from 'react';

interface DocumentPreviewProps {
  htmlContent: string;
  title: string;
  className?: string;
}

export default function DocumentPreview({ htmlContent, title, className = '' }: DocumentPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && htmlContent) {
      containerRef.current.innerHTML = htmlContent;
    }
  }, [htmlContent]);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      </div>
      <div 
        ref={containerRef}
        className="p-6 max-h-96 overflow-y-auto document-preview"
        style={{
          fontFamily: 'Times New Roman, serif',
          fontSize: '12pt',
          lineHeight: '1.5',
        }}
      />
    </div>
  );
}
