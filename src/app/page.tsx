'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Home as HomeIcon, 
  Briefcase, 
  MessageSquare, 
  FolderOpen, 
  Grid3X3, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Mic,
  Send,
  FileText,
  MoreHorizontal,
  User,
  Video,
  Image,
  FileText as FileTextIcon,
  Code
} from 'lucide-react';
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
  file?: File;
  fileName?: string;
  isFileUpload?: boolean;
  isTranslationRequest?: boolean;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showDocumentView, setShowDocumentView] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const addNotification = (type: Notification['type'], title: string, message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('onDrop called with files:', acceptedFiles);
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile && uploadedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('Valid Word document detected:', uploadedFile.name);
      handleFileUpload(uploadedFile);
    } else {
      console.log('Invalid file type:', uploadedFile?.type);
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

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setTranslationResult(null);
    setShowDocumentView(false);
    setShowChatInterface(true);

    // Add file upload message to chat
    const fileMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: `Uploaded: ${uploadedFile.name}`,
      timestamp: new Date(),
      file: uploadedFile,
      fileName: uploadedFile.name,
      isFileUpload: true
    };

    setMessages(prev => [...prev, fileMessage]);

    // Simulate processing progress
    setProcessingProgress(0);
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    // Process the file
    try {
      const fileResult = await processFile(uploadedFile);
      
      if (!fileResult.success) {
        addNotification('error', 'File Processing Failed', fileResult.error || 'Unknown error');
        return;
      }

      setProcessingProgress(100);
      clearInterval(progressInterval);

      // Add processing complete message
      const processingMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Document processed successfully! I can help you translate this content. What language would you like to translate it to?`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, processingMessage]);

    } catch (error) {
      clearInterval(progressInterval);
      addNotification('error', 'File Processing Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleTranslate = async () => {
    if (!file) return;

    setIsProcessing(true);
    setIsTyping(true);

    // Add translation request message
    const languageNames: { [key: string]: string } = {
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic'
    };

    const translationRequestMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: `Translate from English to ${languageNames[targetLanguage]}`,
      timestamp: new Date(),
      isTranslationRequest: true
    };

    setMessages(prev => [...prev, translationRequestMessage]);

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
        sourceHtml: `<div style="white-space: pre-wrap; font-family: 'Inter', sans-serif; line-height: 1.6;">${fileResult.content}</div>`,
        translatedText: data.translation,
        translatedHtml: `<div style="white-space: pre-wrap; font-family: 'Inter', sans-serif; line-height: 1.6;">${data.translation}</div>`,
        targetLanguage,
      });

      // Add translation complete message
      const translationCompleteMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Translation complete! I've translated your document to ${languageNames[targetLanguage]}. You can view the side-by-side comparison on the right.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, translationCompleteMessage]);
      setShowDocumentView(true);

      addNotification('success', 'Translation Complete', `Successfully translated to ${languageNames[targetLanguage]}`);

    } catch (error) {
      console.error('Translation error:', error);
      addNotification('error', 'Translation Failed', error instanceof Error ? error.message : 'Unknown error');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setIsTyping(false);
    }
  };

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

    // Check if this is a translation request
    const translationMatch = chatInput.toLowerCase().match(/translate.*to\s+(\w+)/);
    if (translationMatch && file) {
      const requestedLanguage = translationMatch[1];
      const languageMap: { [key: string]: string } = {
        'spanish': 'es',
        'french': 'fr',
        'german': 'de',
        'italian': 'it',
        'portuguese': 'pt',
        'russian': 'ru',
        'japanese': 'ja',
        'korean': 'ko',
        'chinese': 'zh',
        'arabic': 'ar'
      };
      
      const languageCode = languageMap[requestedLanguage];
      if (languageCode) {
        setTargetLanguage(languageCode);
        // Trigger translation
        setTimeout(() => handleTranslate(), 100);
        return;
      }
    }

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
    <div className="min-h-screen bg-gray-50 flex">
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

      {/* Left Sidebar */}
      <div className="w-16 bg-gray-900 flex flex-col items-center py-6 space-y-6">
        {/* Smartcat Logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold text-xs">
            SC
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-4">
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <HomeIcon className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <Briefcase className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-blue-600 rounded-lg">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <FolderOpen className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </nav>

        {/* User Profile */}
        <div className="mt-auto">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Chat Interface or Welcome Page */}
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
          {!showChatInterface ? (
            // Welcome Page
            <div 
              {...getRootProps()}
              className={`flex-1 flex flex-col items-center justify-center p-8 ${
                isDragActive ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
              }`}
            >
              <input {...getInputProps()} />
              {/* Top Bar */}
              <div className="absolute top-4 right-4 flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-purple-100 px-3 py-1 rounded-full">
                  <span className="text-purple-600 font-semibold">60,053</span>
                </div>
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Main Content */}
              <div className="text-center max-w-2xl">
                <h1 className="text-4xl font-serif text-gray-900 mb-8">
                  What's on your mind today, Ben?
                </h1>
                {isDragActive && (
                  <div className="mb-8 p-4 bg-blue-100 border-2 border-blue-300 rounded-lg">
                    <p className="text-blue-700 font-medium">Drop your Word document here to get started!</p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mb-8">💡 Tip: You can drag and drop a Word document anywhere on this page, or click to select a file</p>
                
                {/* Main Input */}
                <div className="mb-8">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="How do I work with media files?"
                      className="w-full p-4 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="absolute right-2 top-2 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Suggested Actions */}
                <div className="grid grid-cols-2 gap-4 mb-12">
                  <button className="p-4 bg-blue-500 text-white rounded-xl flex items-center space-x-3 hover:bg-blue-600 transition-colors">
                    <Video className="w-5 h-5" />
                    <span>How do I work with media files?</span>
                  </button>
                  <button className="p-4 bg-orange-500 text-white rounded-xl flex items-center space-x-3 hover:bg-orange-600 transition-colors">
                    <Image className="w-5 h-5" />
                    <span>How do I translate images?</span>
                  </button>
                  <button className="p-4 bg-red-500 text-white rounded-xl flex items-center space-x-3 hover:bg-red-600 transition-colors">
                    <FileTextIcon className="w-5 h-5" />
                    <span>How do I translate PDFs?</span>
                  </button>
                  <button className="p-4 bg-green-500 text-white rounded-xl flex items-center space-x-3 hover:bg-green-600 transition-colors">
                    <Code className="w-5 h-5" />
                    <span>How do I translate courses?</span>
                  </button>
                </div>

                {/* Agent Team Section */}
                <div className="text-left">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif text-gray-900">Meet your agent team</h2>
                    <div className="flex items-center space-x-2">
                      <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Agent Library</span>
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex space-x-6 mb-6">
                    <button className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium">Recents 3</button>
                    <button className="text-gray-500 hover:text-gray-700">Recommended 10</button>
                    <button className="text-gray-500 hover:text-gray-700">Custom 5</button>
                    <button className="text-gray-500 hover:text-gray-700">Integrations 1</button>
                  </div>

                  {/* Agent Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Document Translator</h3>
                      <p className="text-sm text-gray-500">Translates documents while preserving formatting</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                        <Video className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Media Translator</h3>
                      <p className="text-sm text-gray-500">Handles video and audio translation</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                        <Code className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Course Translator</h3>
                      <p className="text-sm text-gray-500">Specialized in educational content</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Chat Interface
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold text-xs">
                    SC
                  </div>
                  <div>
                    <h1 className="font-semibold text-gray-900">Smartcat</h1>
                    <p className="text-sm text-gray-500">I'm here to help</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg hover:bg-gray-100">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100">
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Chat Messages - Entire area is droppable */}
              <div 
                {...getRootProps()}
                className={`flex-1 overflow-y-auto p-6 space-y-4 ${
                  isDragActive ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
                }`}
              >
                <input {...getInputProps()} />
                
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Welcome to Smartcat!</p>
                    <p className="text-sm">Drop a Word document here or type a message to get started.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : message.isError
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {message.isFileUpload && (
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm font-medium">{message.fileName}</span>
                          </div>
                        )}
                        {message.isTranslationRequest && (
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium">Translation Request</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Processing Progress */}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg max-w-md">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Processing document...</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${processingProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{processingProgress}% complete</p>
                    </div>
                  </div>
                )}

                {/* Typing Indicator */}
                {isTyping && !isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-gray-200">
                <form onSubmit={handleChatSubmit} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isTyping}
                  />
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Mic className="w-5 h-5 text-gray-500" />
                  </button>
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isTyping}
                    className="p-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Right Panel - Document View */}
        <div className="w-1/2 bg-white flex flex-col">
          {!showDocumentView ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Document Preview</p>
                <p className="text-sm">Upload a document and translate it to see the side-by-side comparison.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Document Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Original: English (USA)</span>
                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Translation: {languages.find(l => l.code === targetLanguage)?.name} (2)</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Download PDFs</span>
                </button>
              </div>

              {/* Document Content */}
              <div className="flex-1 flex">
                {/* Original Document */}
                <div className="w-1/2 border-r border-gray-200 p-6 overflow-y-auto">
                  <div 
                    className="max-w-none"
                    dangerouslySetInnerHTML={{ __html: translationResult?.sourceHtml || '' }}
                  />
                </div>

                {/* Translated Document */}
                <div className="w-1/2 p-6 overflow-y-auto">
                  <div 
                    className="max-w-none"
                    dangerouslySetInnerHTML={{ __html: translationResult?.translatedHtml || '' }}
                  />
                </div>
              </div>

              {/* Page Navigation */}
              <div className="p-4 border-t border-gray-200 flex items-center justify-center">
                <span className="text-sm text-gray-500">Page 1</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
