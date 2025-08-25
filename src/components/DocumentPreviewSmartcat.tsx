'use client';

import { useEffect, useRef } from 'react';
import { FileText, Download, Copy, Eye } from 'lucide-react';

interface DocumentPreviewSmartcatProps {
  htmlContent: string;
  title: string;
  className?: string;
  showActions?: boolean;
}

export default function DocumentPreviewSmartcat({ 
  htmlContent, 
  title, 
  className = '',
  showActions = true 
}: DocumentPreviewSmartcatProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && htmlContent) {
      containerRef.current.innerHTML = htmlContent;
    }
  }, [htmlContent]);

  const handleCopy = () => {
    if (containerRef.current) {
      const text = containerRef.current.innerText;
      navigator.clipboard.writeText(text);
      // You could add a toast notification here
    }
  };

  const handleDownload = () => {
    if (containerRef.current) {
      const text = containerRef.current.innerText;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`bg-white/5 border border-white/20 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-white/10 px-4 py-3 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-4 w-4 text-white/60 mr-2" />
            <h3 className="text-sm font-medium text-white">{title}</h3>
          </div>
          {showActions && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="p-1 text-white/60 hover:text-white transition-colors"
                title="Copy content"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={handleDownload}
                className="p-1 text-white/60 hover:text-white transition-colors"
                title="Download as text"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div 
        ref={containerRef}
        className="p-6 max-h-96 overflow-y-auto document-preview-smartcat"
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '14px',
          lineHeight: '1.6',
          color: 'rgba(255, 255, 255, 0.9)',
        }}
      />
    </div>
  );
}
