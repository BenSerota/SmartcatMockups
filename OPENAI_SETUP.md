# OpenAI API Setup Guide

## Overview

The Smartcat Chat Interface now includes real AI-powered translation capabilities using OpenAI's GPT models. This guide will help you set up the required API key and configuration.

## Prerequisites

1. **OpenAI Account**: You need an OpenAI account with API access
2. **API Key**: A valid OpenAI API key with sufficient credits
3. **Node.js Environment**: The application is already configured for Next.js

## Setup Instructions

### 1. Get Your OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to "API Keys" in your dashboard
4. Click "Create new secret key"
5. Copy the generated API key (keep it secure!)

### 2. Configure Environment Variables

Create a `.env.local` file in your project root with the following content:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_actual_api_key_here

# Optional: Configure model and settings
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.3

# App Configuration
NEXT_PUBLIC_APP_NAME=Smartcat Translator
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**Important**: Replace `your_actual_api_key_here` with your real OpenAI API key.

### 3. Restart the Development Server

After creating the `.env.local` file, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## Features

### Real AI Translation
- **Document Translation**: Upload files and get AI-powered translations
- **Conversational AI**: Ask questions about languages and get intelligent responses
- **Cultural Context**: AI provides cultural insights and explanations
- **Grammar Help**: Get explanations for grammar and usage

### Supported File Types
- **Text Files** (.txt, .json)
- **HTML Documents** (.html, .htm)
- **PDF Documents** (.pdf) - Basic support
- **Word Documents** (.docx, .doc) - Basic support

### Language Support
- Spanish (🇪🇸)
- French (🇫🇷)
- German (🇩🇪)
- Italian (🇮🇹)
- Portuguese (🇵🇹)
- Russian (🇷🇺)
- Japanese (🇯🇵)
- Korean (🇰🇷)
- Chinese (🇨🇳)
- Arabic (🇸🇦)

## API Configuration Options

### Model Selection
- **gpt-4o-mini** (default): Fast, cost-effective, good for most translations
- **gpt-4o**: More advanced, better for complex documents
- **gpt-3.5-turbo**: Budget-friendly option

### Temperature Setting
- **0.3** (default): Balanced creativity and accuracy
- **0.1**: More conservative, literal translations
- **0.7**: More creative, adaptive translations

### Token Limits
- **4000** (default): Good for most documents
- **8000**: For longer documents (higher cost)
- **2000**: For shorter responses (lower cost)

## Usage Examples

### Document Translation
1. Drag and drop a file into the chat area
2. Select your target language
3. The AI will process and translate the document
4. Review the translation and cultural notes

### Conversational Translation
1. Type your message in the chat
2. Ask for translations, explanations, or cultural context
3. Get intelligent, contextual responses

### Quick Actions
- Use the quick action buttons for common requests
- Upload documents directly from the interface
- Get instant language help and cultural insights

## Cost Considerations

### OpenAI Pricing (as of 2024)
- **gpt-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **gpt-4o**: ~$2.50 per 1M input tokens, ~$10.00 per 1M output tokens
- **gpt-3.5-turbo**: ~$0.50 per 1M input tokens, ~$1.50 per 1M output tokens

### Typical Usage Costs
- **Short message**: ~$0.001-0.005
- **Medium document**: ~$0.01-0.05
- **Long document**: ~$0.05-0.20

## Troubleshooting

### Common Issues

**"OpenAI API key not configured"**
- Check that your `.env.local` file exists
- Verify the API key is correct
- Restart the development server

**"API quota exceeded"**
- Check your OpenAI account balance
- Consider switching to a different model
- Monitor your usage in the OpenAI dashboard

**"Translation failed"**
- Check your internet connection
- Verify the API key has sufficient credits
- Try with a shorter message first

### Error Messages
- **401 Unauthorized**: Invalid API key
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Check server logs

## Security Notes

1. **Never commit your API key** to version control
2. **Use environment variables** for all sensitive data
3. **Monitor your API usage** regularly
4. **Set up billing alerts** in your OpenAI account

## Next Steps

Once configured, you can:
1. Test with simple text messages
2. Upload documents for translation
3. Explore different languages and features
4. Customize the AI prompts for your specific needs

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key and configuration
3. Test with the OpenAI API directly
4. Review the application logs

---

**Happy translating! 🚀**
