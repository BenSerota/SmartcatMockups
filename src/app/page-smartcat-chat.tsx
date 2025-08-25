'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, MessageSquare, User, Bot, FileText, Upload, Languages, Settings, Globe, Zap, Users, Target, X, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { processFile, getFileTypeDescription } from '../utils/fileProcessor';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  file?: File;
  fileName?: string;
  isError?: boolean;
}

export default function SmartcatChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m Smartcat AI, your file translation assistant. I help you translate documents and files quickly and professionally. Upload a file to get started, or try the sample document at /sample-document.txt. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dropzone configuration
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      setIsProcessing(true);
      
      // Add file message to chat
      const fileMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: `Uploaded file: ${file.name}`,
        timestamp: new Date(),
        file: file,
        fileName: file.name
      };
      
      setMessages(prev => [...prev, fileMessage]);
      setIsTyping(true);
      
      try {
        // Step 1: Process the file and extract text content
        const fileResult = await processFile(file);
        
        if (!fileResult.success) {
          // Show file processing error
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: `❌ File processing error: ${fileResult.error}`,
            timestamp: new Date(),
            isError: true
          };
          setMessages(prev => [...prev, errorMessage]);
          setIsTyping(false);
          setUploadedFile(null);
          setIsProcessing(false);
          return;
        }
        
        // Step 2: Send extracted text content to translation API
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileContent: fileResult.content,
            fileName: fileResult.fileName,
            fileType: fileResult.fileType,
            language: selectedLanguage
          }),
        });
        
        // Step 3: Handle API response
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }));
          throw new Error(errorData.error || `API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Translation failed');
        }
        
        // Step 4: Display successful translation
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.translation,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
      } catch (error) {
        console.error('Translation error:', error);
        
        // Provide specific error messages based on error type
        let errorMessage = 'Unknown error occurred';
        
        if (error instanceof Error) {
          if (error.message.includes('API key')) {
            errorMessage = 'OpenAI API key not configured. Please check your environment variables.';
          } else if (error.message.includes('quota')) {
            errorMessage = 'OpenAI API quota exceeded. Please check your account limits.';
          } else if (error.message.includes('API error: 405')) {
            errorMessage = 'API method not allowed. Please check the server configuration.';
          } else if (error.message.includes('API error: 500')) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            errorMessage = error.message;
          }
        }
        
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `❌ Translation error: ${errorMessage}`,
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorResponse]);
      } finally {
        setIsTyping(false);
        setUploadedFile(null);
        setIsProcessing(false);
      }
    }
  }, [selectedLanguage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'text/html': ['.html', '.htm']
    },
    multiple: false,
    noClick: true, // Prevent click events from triggering file dialog
    noKeyboard: true // Prevent keyboard events from triggering file dialog
  });

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Send to translation API
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          language: selectedLanguage
        }),
      });
      
      // Handle API response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Translation failed');
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.translation,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Translation error:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'OpenAI API key not configured. Please check your environment variables.';
        } else if (error.message.includes('quota')) {
          errorMessage = 'OpenAI API quota exceeded. Please check your account limits.';
        } else if (error.message.includes('API error: 405')) {
          errorMessage = 'API method not allowed. Please check the server configuration.';
        } else if (error.message.includes('API error: 500')) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ Translation error: ${errorMessage}`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileUpload = () => {
    // Trigger the file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.docx,.doc,.txt,.pdf,.html,.htm';
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        onDrop([target.files[0]]);
      }
    };
    fileInput.click();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(35, 29, 51)' }}>
      {/* Header - Smartcat Style */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-white mr-3" />
              <h1 className="text-xl font-semibold text-white">
                Smartcat AI Assistant
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Languages className="h-4 w-4 text-white/60" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-gray-800">
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <button className="text-white/70 hover:text-white transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Smartcat Style */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            AI Translation Assistant
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Get instant help with translations, language questions, and cultural context. 
            Your AI assistant is here to make global communication seamless.
          </p>
        </div>

                            {/* Chat Interface */}
                    <div className="max-w-4xl mx-auto">
                      <div 
                        {...getRootProps()}
                        className={`relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 ${
                          isDragActive 
                            ? 'border-teal-400 bg-teal-400/10 scale-[1.02] shadow-2xl shadow-teal-400/20' 
                            : ''
                        }`}
                      >
                        <input {...getInputProps()} />
                        
                        {/* Drag Overlay */}
                        {isDragActive && (
                          <div className="absolute inset-0 bg-teal-400/20 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                            <div className="text-center">
                              <Upload className="mx-auto h-16 w-16 text-teal-400 mb-4 animate-pulse" />
                              <h3 className="text-2xl font-bold text-white mb-2">Drop your file here</h3>
                              <p className="text-white/80 text-lg">Release to upload and translate</p>
                              <p className="text-white/60 text-sm mt-2">Supports: .docx, .doc, .txt, .pdf, .html</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Chat Header */}
                        <div className="bg-white/10 px-6 py-4 border-b border-white/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <MessageSquare className="h-5 w-5 text-teal-400" />
                              <h3 className="text-lg font-semibold text-white">Smartcat AI Assistant</h3>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-white/60">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span>Smartcat AI Online</span>
                            </div>
                          </div>
                        </div>

            {/* Messages Container */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-teal-400 text-white' 
                        : 'bg-white/10 text-white'
                    }`}>
                      {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-teal-400 text-white'
                        : message.isError
                        ? 'bg-red-500/20 border border-red-400/30 text-red-100'
                        : 'bg-white/10 text-white'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      
                      {/* File attachment display */}
                      {message.file && (
                        <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/20">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-teal-400" />
                            <span className="text-xs font-medium">{message.fileName}</span>
                            <span className="text-xs text-white/60">
                              ({formatFileSize(message.file.size)})
                            </span>
                            <span className="text-xs text-white/40">
                              • {getFileTypeDescription(message.file.type)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <p className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-teal-100' : 'text-white/50'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
                                        {isTyping && (
                            <div className="flex justify-start">
                              <div className="flex items-start space-x-3 max-w-[80%]">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                  <Bot className="h-4 w-4 text-white" />
                                </div>
                                <div className="bg-white/10 rounded-2xl px-4 py-3">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex space-x-1">
                                      <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
                                      <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                      <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                    <span className="text-xs text-white/60">
                                      {isProcessing ? 'Processing file...' : 'Thinking...'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
              
              <div ref={messagesEndRef} />
            </div>

                                    {/* Input Area */}
                        <div className="bg-white/10 px-6 py-4 border-t border-white/20">
                          <div className="flex items-end space-x-3">
                            <div className="flex-1">
                              <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me about translations, languages, or upload a document..."
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 resize-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                                rows={1}
                                style={{ minHeight: '44px', maxHeight: '120px' }}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={handleFileUpload}
                                className="p-2 text-white/60 hover:text-white transition-colors"
                                title="Upload file"
                              >
                                <Upload className="h-5 w-5" />
                              </button>
                              <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim()}
                                className="p-3 bg-teal-400 text-white rounded-xl hover:bg-teal-500 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-colors"
                              >
                                <Send className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                          
                          {/* File Upload Hint */}
                          <div className="mt-3 text-center">
                            <p className="text-white/40 text-xs">
                              💡 Tip: You can also drag and drop files anywhere in the chat area
                            </p>
                          </div>
                        </div>
          </div>
        </div>

        {/* Features Section - Smartcat Style */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
            <Zap className="h-12 w-12 mx-auto mb-4 text-teal-400" />
            <h3 className="text-xl font-semibold text-white mb-2">Instant Translation</h3>
            <p className="text-white/70">Get real-time translations with cultural context and explanations.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-teal-400" />
            <h3 className="text-xl font-semibold text-white mb-2">File Processing</h3>
            <p className="text-white/70">Upload documents via drag & drop or button. Supports Word, PDF, and text files.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-teal-400" />
            <h3 className="text-xl font-semibold text-white mb-2">Cultural Insights</h3>
            <p className="text-white/70">Understand cultural nuances and context for better translations.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <p className="text-white/60 mb-4">Quick Actions:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Upload a file for translation",
              "Change target language",
              "Set translation tone",
              "Help with file types",
              "Translation settings",
              "Quality preferences"
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  if (action.includes("Upload") || action.includes("Analyze")) {
                    handleFileUpload();
                  } else {
                    setInputValue(action);
                  }
                }}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors text-sm"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
