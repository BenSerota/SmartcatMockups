'use client';

import { useState, useCallback } from 'react';
import { FileText, Languages, ArrowRight, MessageSquare, Globe, Settings } from 'lucide-react';
import DocumentPreviewSmartcat from '@/components/DocumentPreviewSmartcat';
import FileUploadSmartcat from '@/components/FileUploadSmartcat';
import NotificationSmartcat, { NotificationType } from '@/components/NotificationSmartcat';

interface TranslationResult {
  sourceText: string;
  sourceHtml: string;
  translatedText: string;
  translatedHtml: string;
  targetLanguage: string;
}

export default function HomeSmartcat() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState<'translate' | 'chat' | 'settings'>('translate');
  const [notification, setNotification] = useState<{
    type: NotificationType;
    title: string;
    message?: string;
    show: boolean;
  } | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setTranslationResult(null);
    setNotification({
      type: 'success',
      title: 'File uploaded successfully',
      message: `${selectedFile.name} has been uploaded`,
      show: true,
    });
  };

  const handleFileRemove = () => {
    setFile(null);
    setTranslationResult(null);
  };

  const handleTranslate = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
      const text = await file.text();
      const demoTranslation = getDemoTranslation(text, targetLanguage);
      
      setTranslationResult({
        sourceText: text,
        sourceHtml: `<p>${text}</p>`,
        translatedText: demoTranslation,
        translatedHtml: `<p>${demoTranslation}</p>`,
        targetLanguage,
      });

    } catch (error) {
      console.error('Translation error:', error);
      setNotification({
        type: 'error',
        title: 'Translation failed',
        message: 'Please try again with a different file.',
        show: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getDemoTranslation = (text: string, targetLang: string): string => {
    const languagePrefixes: { [key: string]: string } = {
      'es': 'Traducido al español: ',
      'fr': 'Traduit en français: ',
      'de': 'Ins Deutsche übersetzt: ',
      'it': 'Tradotto in italiano: ',
      'pt': 'Traduzido para português: ',
      'ru': 'Переведено на русский: ',
      'ja': '日本語に翻訳: ',
      'ko': '한국어로 번역: ',
      'zh': '翻译成中文: ',
      'ar': 'مترجم إلى العربية: ',
    };
    
    const prefix = languagePrefixes[targetLang] || '';
    return prefix + text;
  };

  const languages = [
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Smartcat Translator
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('translate')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'translate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="inline mr-2 h-4 w-4" />
              Translate
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="inline mr-2 h-4 w-4" />
              AI Chat
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="inline mr-2 h-4 w-4" />
              Settings
            </button>
          </nav>
        </div>

        {/* Main Content */}
        {activeTab === 'translate' && (
          <div className="space-y-6">
            {/* File Upload Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  Upload Document
                </h2>
                
                <FileUploadSmartcat
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  selectedFile={file}
                />
              </div>

              {/* Language Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Languages className="mr-2 h-4 w-4 text-blue-600" />
                  Target Language
                </h3>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Translate Button */}
              <button
                onClick={handleTranslate}
                disabled={!file || isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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

            {/* Translation Results */}
            {translationResult && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  Translation Results
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Source Document */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Original Document
                    </h3>
                    <DocumentPreviewSmartcat
                      htmlContent={translationResult.sourceHtml}
                      title="Source Document"
                      className="h-96"
                    />
                  </div>

                  {/* Translated Document */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Translated Document ({languages.find(l => l.code === translationResult.targetLanguage)?.name})
                    </h3>
                    <DocumentPreviewSmartcat
                      htmlContent={translationResult.translatedHtml}
                      title="Translated Document"
                      className="h-96"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Chat Interface */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
              AI Translation Assistant
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 h-96 overflow-y-auto">
              <div className="text-gray-500 text-center">
                <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg font-medium mb-2">AI chat interface coming soon...</p>
                <p className="text-sm">Ask questions about your translation, request style changes, or get context explanations.</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Settings className="mr-2 h-5 w-5 text-blue-600" />
              Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Target Language
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-translate on upload
                </label>
                <div className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700">Enable automatic translation when files are uploaded</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <NotificationSmartcat
          type={notification.type}
          title={notification.title}
          message={notification.message}
          show={notification.show}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
