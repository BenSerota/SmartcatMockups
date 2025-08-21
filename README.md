# Iterative Translator

A modern web application for translating Word documents with a beautiful side-by-side interface.

## Features

- 📄 Upload Word documents (.docx files)
- 🌍 Support for multiple target languages
- 👀 Side-by-side preview of original and translated text
- 🎨 Modern, responsive UI with drag-and-drop functionality
- ⚡ Real-time translation processing

## Supported Languages

- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- Arabic (ar)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd iterative_translator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional for demo):
Create a `.env.local` file in the root directory:
```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_KEY_FILE=path/to/your/key-file.json
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload Document**: Drag and drop a Word document (.docx) or click to select one
2. **Choose Language**: Select your target language from the dropdown
3. **Translate**: Click the "Translate Document" button
4. **View Results**: See the side-by-side comparison of original and translated text

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **File Processing**: Mammoth.js for Word document parsing
- **Translation**: Google Cloud Translate API (configurable)
- **UI Components**: Lucide React icons, React Dropzone

## Development

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── translate/
│   │       └── route.ts          # Translation API endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main application page
├── components/                   # Reusable components (future)
└── types/                        # TypeScript type definitions (future)
```

### API Endpoints

- `POST /api/translate` - Handles file upload and translation

### Environment Variables

- `GOOGLE_CLOUD_PROJECT_ID` - Google Cloud Project ID
- `GOOGLE_CLOUD_KEY_FILE` - Path to Google Cloud service account key file

## Deployment

This application can be deployed to Vercel, Netlify, or any other Next.js-compatible platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
