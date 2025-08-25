'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Languages, ArrowRight, MessageSquare } from 'lucide-react';
import DocumentPreview from '@/components/DocumentPreview';
import { processFile } from '@/utils/fileProcessor';

interface TranslationResult {
  sourceText: string;
  sourceHtml: string;
  translatedText: string;
  translatedHtml: string;
  targetLanguage: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: Notification['type'], title: string, message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile && uploadedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setFile(uploadedFile);
      setTranslationResult(null);
    } else {
      addNotification('error', 'Invalid File Type', 'Please upload a valid Word document (.docx)');
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
      // Step 1: Process the file using the proper file processor
      const fileResult = await processFile(file);
      
      if (!fileResult.success) {
        addNotification('error', 'File Processing Failed', fileResult.error || 'Unknown error');
        return;
      }

      // Step 2: Send to translation API
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileContent: fileResult.content,
          fileName: fileResult.fileName,
          fileType: fileResult.fileType,
          language: targetLanguage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Translation failed');
      }

      // Step 3: Format the results
      setTranslationResult({
        sourceText: fileResult.content,
        sourceHtml: `<div style="white-space: pre-wrap;">${fileResult.content}</div>`,
        translatedText: data.translation,
        translatedHtml: `<div style="white-space: pre-wrap;">${data.translation}</div>`,
        targetLanguage,
      });

      addNotification('success', 'Translation Complete', `Successfully translated to ${languages.find(l => l.code === targetLanguage)?.name}`);

    } catch (error) {
      console.error('Translation error:', error);
      addNotification('error', 'Translation Failed', error instanceof Error ? error.message : 'Unknown error');
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

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatInput,
          language: targetLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Chat failed');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.translation,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg max-w-sm ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              notification.type === 'warning' ? 'bg-yellow-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            <div className="font-semibold">{notification.title}</div>
            <div className="text-sm opacity-90">{notification.message}</div>
          </div>
        ))}
      </div>

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
              
              {/* Chat Messages */}
              <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4">
                {messages.length === 0 ? (
                  <div className="text-gray-500 text-center">
                    <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                    <p>Ask me anything about translation!</p>
                    <p className="text-sm">I can help with translation questions, style guidance, and more.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : message.isError
                              ? 'bg-red-100 text-red-800'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about translation, request style changes..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
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
