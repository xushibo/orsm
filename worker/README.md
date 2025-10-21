# ORSM AI Worker

Cloudflare Worker for AI-powered object recognition and story generation.

## Features

- Receives images via multipart/form-data POST requests
- Integrates with Google AI Gemini 1.5 Pro API
- Returns object recognition and story generation results
- Secure API key management via Cloudflare Secrets

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

Set your Gemini API key as a Cloudflare Secret:

```bash
wrangler secret put GEMINI_API_KEY
```

When prompted, enter your Google AI Gemini API key.

### 3. Deploy

```bash
npm run deploy
```

## API Usage

### Endpoint

**Custom Domain**: `POST https://orsm-ai.xushibo.cn/`

**Worker URL**: `POST https://orsm-ai-worker.your-subdomain.workers.dev/`

### Request Format

- Method: POST
- Content-Type: multipart/form-data
- Body: Form data with `image` field containing image file

### Response Format

#### Success (200 OK)
```json
{
  "word": "apple",
  "story": "This is a red apple. It's sweet and crunchy!"
}
```

#### Error (4xx/5xx)
```json
{
  "error": "Error description"
}
```

### Example Usage

#### Using curl
```bash
# Using custom domain
curl -X POST \
  -F "image=@/path/to/your/image.jpg" \
  https://orsm-ai.xushibo.cn/

# Using worker URL
curl -X POST \
  -F "image=@/path/to/your/image.jpg" \
  https://orsm-ai-worker.your-subdomain.workers.dev/
```

#### Using JavaScript
```javascript
const formData = new FormData();
formData.append('image', imageFile);

// Using custom domain
const response = await fetch('https://orsm-ai.xushibo.cn/', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.word, result.story);
```

## Development

### Local Development

```bash
npm run dev
```

### Testing

```bash
npm test
```

## Error Handling

The worker handles various error scenarios:

- **400 Bad Request**: No image provided, invalid file type
- **405 Method Not Allowed**: Non-POST requests
- **500 Internal Server Error**: API key not configured, Gemini API errors
- **502 Bad Gateway**: Gemini API unavailable

## Environment Variables

- `GEMINI_API_KEY`: Google AI Gemini API key (required)

## Security

- API keys are stored as Cloudflare Secrets
- Input validation for file types
- Error messages don't expose sensitive information
