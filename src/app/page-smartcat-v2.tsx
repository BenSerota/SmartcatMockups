'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Languages, ArrowRight, MessageSquare, Globe, Settings, Users, Zap, Target } from 'lucide-react';
import DocumentPreviewSmartcat from '@/components/DocumentPreviewSmartcat';

interface TranslationResult {
  sourceText: string;
  sourceHtml: string;
  translatedText: string;
  translatedHtml: string;
  targetLanguage: string;
}

export default function HomeSmartcatV2() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [activeTab, setActiveTab] = useState<'translate' | 'chat' | 'settings'>('translate');

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
      alert('Translation failed. Please try again.');
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
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(35, 29, 51)' }}>
      {/* Header - Smartcat Style */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-white mr-3" />
              <h1 className="text-xl font-semibold text-white">
                Smartcat Translator
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-white/70 hover:text-white transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Smartcat Style */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            One AI translation platform for<br />
            <span style={{ color: 'rgb(53, 199, 180)' }}>content in any language</span>
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Smartcat covers all your language needs with AI translation, AI content generation and AI human workflows.
          </p>
          
          {/* CTA Buttons - Smartcat Style */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <button className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Book a demo
            </button>
            <button className="px-8 py-4 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Sign up free
            </button>
          </div>
        </div>

        {/* Content Types - Smartcat Style */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-12">
          {['File', 'Website', 'Software', 'E-learning', 'Video', 'Design'].map((type) => (
            <div key={type} className="bg-white/5 rounded-lg p-4 text-center hover:bg-white/10 transition-colors cursor-pointer">
              <p className="text-white font-medium">{type}</p>
            </div>
          ))}
        </div>

        {/* Trust Badge - Smartcat Style */}
        <div className="text-center mb-12">
          <p className="text-white/60 text-sm">Trusted by Fortune 1000 brands to power global content.</p>
        </div>

        {/* Main Content Area */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8">
          {/* Tab Navigation - Smartcat Style */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              {[
                                 { id: 'translate', label: 'AI Translation', icon: Zap },
                 { id: 'chat', label: 'AI Chat', icon: MessageSquare },
                 { id: 'settings', label: 'Settings', icon: Settings }
               ].map((tab) => {
                 const IconComponent = tab.icon;
                 return (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as 'translate' | 'chat' | 'settings')}
                    className={`py-3 px-4 rounded-lg font-medium text-sm transition-colors flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'bg-white text-gray-900'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          {activeTab === 'translate' && (
            <div className="space-y-8">
              {/* Quick Access to Chat */}
              <div className="bg-gradient-to-r from-teal-400/20 to-purple-400/20 rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Try Our AI Chat Assistant</h3>
                    <p className="text-white/80 mb-4">Get instant help with translations, language questions, and cultural context.</p>
                    <a 
                      href="/chat" 
                      className="inline-flex items-center px-4 py-2 bg-teal-400 text-white rounded-lg hover:bg-teal-500 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Open Chat Interface
                    </a>
                  </div>
                  <MessageSquare className="h-12 w-12 text-teal-400" />
                </div>
              </div>
              
              {/* File Upload Section - Smartcat Style */}
              <div className="bg-white/5 rounded-xl p-8 border border-white/10">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                    <FileText className="mr-3 h-6 w-6" style={{ color: 'rgb(53, 199, 180)' }} />
                    Upload Document
                  </h2>
                  
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
                      isDragActive
                        ? 'border-teal-400 bg-teal-400/10'
                        : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto h-16 w-16 text-white/40 mb-6" />
                    {isDragActive ? (
                      <p className="text-teal-400 font-medium text-lg">Drop the Word document here...</p>
                    ) : (
                      <div>
                        <p className="text-white/80 mb-3 font-medium text-lg">
                          Drag and drop a Word document here, or click to select
                        </p>
                        <p className="text-white/60 text-sm">
                          Supports .docx files only
                        </p>
                      </div>
                    )}
                  </div>

                  {file && (
                    <div className="mt-6 p-4 bg-teal-400/10 border border-teal-400/20 rounded-lg">
                      <p className="text-teal-400 text-sm">
                        <strong>Selected file:</strong> {file.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Language Selection - Smartcat Style */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Languages className="mr-2 h-5 w-5" style={{ color: 'rgb(53, 199, 180)' }} />
                    Target Language
                  </h3>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-gray-800">
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Translate Button - Smartcat Style */}
                <button
                  onClick={handleTranslate}
                  disabled={!file || isProcessing}
                  className="w-full py-4 px-8 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-3"></div>
                      Translating...
                    </div>
                  ) : (
                    <>
                      <ArrowRight className="mr-3 h-6 w-6" />
                      Translate Document
                    </>
                  )}
                </button>
              </div>

              {/* Translation Results - Smartcat Style */}
              {translationResult && (
                <div className="bg-white/5 rounded-xl p-8 border border-white/10">
                  <h2 className="text-2xl font-semibold text-white mb-6">
                    Translation Results
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Source Document */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
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
                      <h3 className="text-lg font-semibold text-white mb-4">
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

          {/* AI Chat Interface - Smartcat Style */}
          {activeTab === 'chat' && (
            <div className="bg-white/5 rounded-xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <MessageSquare className="mr-3 h-6 w-6" style={{ color: 'rgb(53, 199, 180)' }} />
                AI Translation Assistant
              </h2>
              <div className="bg-white/5 rounded-xl p-8 h-96 overflow-y-auto border border-white/10">
                <div className="text-white/60 text-center">
                  <MessageSquare className="mx-auto h-16 w-16 mb-6" />
                  <p className="text-xl font-medium mb-4">AI chat interface coming soon...</p>
                  <p className="text-lg">Ask questions about your translation, request style changes, or get context explanations.</p>
                </div>
              </div>
            </div>
          )}

          {/* Settings - Smartcat Style */}
          {activeTab === 'settings' && (
            <div className="bg-white/5 rounded-xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <Settings className="mr-3 h-6 w-6" style={{ color: 'rgb(53, 199, 180)' }} />
                Settings
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-medium text-white mb-3">
                    Default Target Language
                  </label>
                  <select className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-teal-400 focus:border-transparent">
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-gray-800">
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-medium text-white mb-3">
                    Auto-translate on upload
                  </label>
                  <div className="flex items-center">
                    <input type="checkbox" className="h-5 w-5 text-teal-400 focus:ring-teal-400 border-white/20 rounded bg-white/10" />
                    <span className="ml-3 text-white/80">Enable automatic translation when files are uploaded</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features Section - Smartcat Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
            <Zap className="h-12 w-12 mx-auto mb-4" style={{ color: 'rgb(53, 199, 180)' }} />
            <h3 className="text-xl font-semibold text-white mb-2">AI Translation</h3>
            <p className="text-white/70">AI-powered translations in 280+ languages with near-human accuracy.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
            <Users className="h-12 w-12 mx-auto mb-4" style={{ color: 'rgb(53, 199, 180)' }} />
            <h3 className="text-xl font-semibold text-white mb-2">AI Human Workflows</h3>
            <p className="text-white/70">Collaborate with professional translators and editors seamlessly.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
            <Target className="h-12 w-12 mx-auto mb-4" style={{ color: 'rgb(53, 199, 180)' }} />
            <h3 className="text-xl font-semibold text-white mb-2">AI Content Generation</h3>
            <p className="text-white/70">Create any content in any language with AI agents.</p>
          </div>
        </div>

        {/* Stats Section - Smartcat Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">70%</div>
            <div className="text-white/70">Cost savings</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">85%</div>
            <div className="text-white/70">AI language accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">400%</div>
            <div className="text-white/70">Faster turnaround time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
