'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Languages, ArrowRight, MessageSquare } from 'lucide-react';
import DocumentPreview from '@/components/DocumentPreview';

interface TranslationResult {
  sourceText: string;
  sourceHtml: string;
  translatedText: string;
  translatedHtml: string;
  targetLanguage: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [showChat, setShowChat] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile && uploadedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setFile(uploadedFile);
      setTranslationResult(null);
    } else {
      alert('Please upload a valid Word document (.docx)');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const handleTranslate = async () => {
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetLanguage', targetLanguage);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setTranslationResult(result);
      } else {
        alert('Translation failed. Please try again.');
      }
    } catch (error) {
      console.error('Translation error:', error);
      alert('Translation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Next-Gen Smartcat
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            AI Chat-First Translation Platform
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showChat 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="inline mr-2 h-4 w-4" />
              AI Chat Mode
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* File Upload Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="mr-2 h-6 w-6 text-blue-600" />
                Upload Document
              </h2>
              
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                {isDragActive ? (
                  <p className="text-blue-600">Drop the Word document here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Drag and drop a Word document here, or click to select
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports .docx files only
                    </p>
                  </div>
                )}
              </div>

              {file && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800">
                    <strong>Selected file:</strong> {file.name}
                  </p>
                </div>
              )}
            </div>

            {/* Language Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Languages className="mr-2 h-5 w-5 text-blue-600" />
                Target Language
              </h3>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Translate Button */}
            <button
              onClick={handleTranslate}
              disabled={!file || isProcessing}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Translating...
                </div>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Translate Document
                </>
              )}
            </button>
          </div>

          {/* AI Chat Interface */}
          {showChat && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="mr-2 h-6 w-6 text-blue-600" />
                AI Translation Assistant
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto">
                <div className="text-gray-500 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                  <p>AI chat interface coming soon...</p>
                  <p className="text-sm">Ask questions about your translation, request style changes, or get context explanations.</p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Document Preview */}
          {translationResult && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Document Preview
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Source Document */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Original Document
                  </h3>
                  <DocumentPreview
                    htmlContent={translationResult.sourceHtml}
                    title="Source Document"
                    className="h-96"
                  />
                </div>

                {/* Translated Document */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Translated Document ({languages.find(l => l.code === translationResult.targetLanguage)?.name})
                  </h3>
                  <DocumentPreview
                    htmlContent={translationResult.translatedHtml}
                    title="Translated Document"
                    className="h-96"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
