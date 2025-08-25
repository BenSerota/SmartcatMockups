'use client';

import { useState } from 'react';
import { Search, Palette, Type, Layout, Code, Loader2 } from 'lucide-react';

interface DesignAnalysis {
  colors: {
    primary: string[];
    secondary: string[];
    background: string[];
    text: string[];
  };
  typography: {
    fonts: string[];
    fontSizes: string[];
    lineHeights: string[];
  };
  layout: {
    maxWidths: string[];
    spacing: string[];
    breakpoints: string[];
  };
  components: {
    buttons: any[];
    inputs: any[];
    cards: any[];
    navigation: any[];
  };
  cssVariables: Record<string, string>;
  rawCSS: string;
}

export default function DesignAnalyzer() {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<DesignAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeWebsite = async () => {
    if (!url) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze website');
      }

      setAnalysis(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const ColorSwatch = ({ color, label }: { color: string; label: string }) => (
    <div className="flex items-center space-x-2">
      <div 
        className="w-6 h-6 rounded border border-gray-300"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Website Design Analyzer
        </h1>
        <p className="text-gray-600">
          Analyze any website's design system, colors, typography, and components
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL (e.g., https://example.com)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={analyzeWebsite}
            disabled={!url || loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Analyze</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Colors */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Palette className="mr-2 h-5 w-5 text-blue-600" />
              Color Palette
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Primary Colors</h3>
                <div className="space-y-2">
                  {analysis.colors.primary.slice(0, 5).map((color, index) => (
                    <ColorSwatch key={index} color={color} label={color} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Text Colors</h3>
                <div className="space-y-2">
                  {analysis.colors.text.slice(0, 5).map((color, index) => (
                    <ColorSwatch key={index} color={color} label={color} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Type className="mr-2 h-5 w-5 text-blue-600" />
              Typography
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Fonts</h3>
                <div className="space-y-1">
                  {analysis.typography.fonts.slice(0, 5).map((font, index) => (
                    <p key={index} className="text-sm text-gray-600">{font}</p>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Font Sizes</h3>
                <div className="space-y-1">
                  {analysis.typography.fontSizes.slice(0, 5).map((size, index) => (
                    <p key={index} className="text-sm text-gray-600">{size}</p>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Line Heights</h3>
                <div className="space-y-1">
                  {analysis.typography.lineHeights.slice(0, 5).map((height, index) => (
                    <p key={index} className="text-sm text-gray-600">{height}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Components */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Layout className="mr-2 h-5 w-5 text-blue-600" />
              Components
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Buttons ({analysis.components.buttons.length})</h3>
                <div className="space-y-2">
                  {analysis.components.buttons.slice(0, 3).map((btn, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      <p className="font-medium">{btn.text || 'Button'}</p>
                      <p className="text-xs">{btn.classes}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Inputs ({analysis.components.inputs.length})</h3>
                <div className="space-y-2">
                  {analysis.components.inputs.slice(0, 3).map((input, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      <p className="font-medium">{input.type || 'input'}</p>
                      <p className="text-xs">{input.placeholder || 'No placeholder'}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Cards ({analysis.components.cards.length})</h3>
                <div className="space-y-2">
                  {analysis.components.cards.slice(0, 3).map((card, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      <p className="font-medium">{card.content || 'Card content'}</p>
                      <p className="text-xs">{card.classes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CSS Variables */}
          {Object.keys(analysis.cssVariables).length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Code className="mr-2 h-5 w-5 text-blue-600" />
                CSS Variables
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(analysis.cssVariables).slice(0, 10).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-mono text-blue-600">{key}</span>
                    <span className="text-gray-600">: {value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
