# NeoToons AI Service - Environment Configuration Guide

## Overview

The NeoToons AI system requires three API keys for full functionality:

1. **OpenRouter API** (Primary - Required)
2. **Hugging Face API** (Image generation - Optional)
3. **Gemini API** (Fallback - Optional)

## API Key Setup

### 1. OpenRouter API Key (Primary Provider)

OpenRouter provides cost-effective access to multiple LLM models. This is the **primary provider** for all text generation.

**Steps:**
1. Visit [https://openrouter.ai](https://openrouter.ai)
2. Sign up or log in
3. Go to **Account Settings** → **API Keys**
4. Create new API key and copy it
5. Add to `.env.local`:
   ```
   OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

**Pricing:** ~$0.001-0.05 per 1K tokens (varies by model)

**Models in Use:**
- `meta-llama/llama-2-7b` - Fast (quick captions, short hooks)
- `mistral-7b` - Quality (standard scripts, stories)
- `gpt-3.5-turbo` - Premium (complex narratives)
- `gpt-4-turbo` - Ultra (advanced multi-part content)

---

### 2. Hugging Face API Key (Image Generation)

Hugging Face provides image generation capabilities via Stable Diffusion models.

**Steps:**
1. Visit [https://huggingface.co](https://huggingface.co)
2. Sign up or log in
3. Go to **Account Settings** → **Access Tokens**
4. Create new **Read** token
5. Add to `.env.local`:
   ```
   HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

**Pricing:** Free tier available; paid inference APIs available

**Models in Use:**
- `stabilityai/stable-diffusion-2` - Fast
- `stabilityai/stable-diffusion-2-1` - Quality
- `runwayml/stable-diffusion-v1-5` - Premium

---

### 3. Gemini API Key (Fallback Provider)

Google's Gemini API serves as a fallback when primary providers are unavailable.

**Steps:**
1. Visit [https://ai.google.dev](https://ai.google.dev)
2. Click **Get API Key**
3. Sign in with Google account
4. Create new API key
5. Add to `.env.local`:
   ```
   GEMINI_API_KEY=AIzaSy_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

**Pricing:** Free tier available (60 requests/minute)

---

## Complete `.env.local` Template

Create `.env.local` file in the workspace root:

```env
# OpenRouter (Primary - REQUIRED)
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Hugging Face (Image Generation - Optional)
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Gemini (Fallback - Optional)
GEMINI_API_KEY=AIzaSy_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Email Service (optional)
EMAIL_USER=your@email.com
EMAIL_PASSWORD=your_app_password
```

---

## Quick Testing

### Test OpenRouter Connection

```bash
curl -X POST https://api.openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/llama-2-7b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Test Hugging Face Connection

```bash
curl -X POST https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2 \
  -H "Authorization: Bearer $HUGGINGFACE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "A beautiful sunset"}'
```

### Test via NeoToons API

```bash
# Generate text content
curl -X POST http://localhost:5000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userInput": "Create a viral TikTok script about coffee",
    "contentType": "script",
    "platform": "tiktok",
    "tone": "funny"
  }'

# Check health
curl http://localhost:5000/api/ai/health

# Get stats
curl http://localhost:5000/api/ai/stats
```

---

## Provider Selection Strategy

The AI Router automatically selects the best provider based on:

1. **Content Type:**
   - `image-prompt` → Hugging Face (specialized image generation)
   - All text types → OpenRouter (primary)

2. **Complexity:**
   - Low complexity → `meta-llama` (fast, 2-3 tokens/sec)
   - Medium complexity → `mistral-7b` (quality, balanced)
   - High complexity → `gpt-3.5-turbo` or `gpt-4-turbo` (premium)

3. **Fallback Chain:**
   - OpenRouter fails → Gemini (backup)
   - Both fail → Circuit breaker opens (prevent cascading failures)

---

## Circuit Breaker Pattern

The fallback provider implements a circuit breaker to prevent cascading failures:

- **Threshold:** 5 consecutive failures
- **State:** `CLOSED` (normal) → `OPEN` (failing) → `RESET` after 1 minute
- **Check Status:** `GET /api/ai/stats`

Example response:
```json
{
  "circuitBreakerStatus": {
    "isOpen": false,
    "failureCount": 0,
    "status": "CLOSED"
  }
}
```

---

## Cost Optimization Tips

### 1. Request Caching
- Identical requests cached for 5 minutes
- Check cache statistics: `GET /api/ai/stats`
- Clear cache: `POST /api/ai/clear-cache`

### 2. Model Selection
- Start with `fast` models for captions/hooks
- Use `quality` for standard content
- Reserve `premium`/`ultra` for complex narratives

### 3. Batch Requests
- Use `POST /api/ai/batch` for multiple requests
- Max 10 requests per batch
- Better than sequential requests

### 4. Monitor Usage
- Track `tokensUsed` in responses
- Monitor `generationTime` for latency
- Set up cost alerts on OpenRouter dashboard

---

## Troubleshooting

### "OPENROUTER_API_KEY is not configured"
**Solution:** Add key to `.env.local` and restart server

```bash
# Verify it's loaded
curl http://localhost:5000/api/ai/health
```

### "Rate Limited - Gemini API quota exceeded"
**Solution:** 
- Wait 60 seconds before retrying
- Upgrade to paid Gemini tier
- Reduce request frequency

### "Unstable Diffusion API timeout"
**Solution:**
- Try with a simpler image prompt
- Use `fast` model quality instead of `premium`
- Check Hugging Face status page

### High generation latency
**Solution:**
- Check provider health: `GET /api/ai/health`
- Reduce request complexity
- Use smaller model tier
- Consider caching if content is repetitive

---

## Production Checklist

- [ ] All three API keys configured in production `.env`
- [ ] API key restrictions set (IP whitelist) on OpenRouter
- [ ] Rate limits configured per user
- [ ] Request caching enabled
- [ ] Circuit breaker monitoring set up
- [ ] Error logging configured
- [ ] Usage metrics exported to analytics
- [ ] Cost budget alerts configured
- [ ] Fallback providers tested
- [ ] Health checks running every 5 minutes

---

## Next Steps

1. **Add API keys** to `.env.local`
2. **Test endpoints** using curl examples above
3. **Integrate** into components using `useAIGeneration()` hook
4. **Monitor** via `/api/ai/health` and `/api/ai/stats`
5. **Optimize** based on usage patterns

For integration examples, see [[INTEGRATION_EXAMPLES.md]].
