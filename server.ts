import express from 'express';
import path from 'path';
import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();

  // Parse JSON payloads up to 25mb for images
  app.use(express.json({ limit: '25mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Deep Image Analysis via Gemini
  app.post('/api/analyze-vibe', async (req, res) => {
    try {
      let { imageBase64, imageUrl, mimeType = 'image/jpeg' } = req.body;

      if (!imageBase64 && imageUrl && typeof imageUrl === 'string') {
        try {
          if (imageUrl.startsWith('data:image')) {
            imageBase64 = imageUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
          } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            const fetchRes = await fetch(imageUrl);
            if (fetchRes.ok) {
              const buf = await fetchRes.arrayBuffer();
              imageBase64 = Buffer.from(buf).toString('base64');
            }
          } else if (imageUrl.startsWith('/')) {
            const fs = await import('fs');
            const localPath = path.join(process.cwd(), 'public', imageUrl.replace(/^\//, ''));
            if (fs.existsSync(localPath)) {
              imageBase64 = fs.readFileSync(localPath).toString('base64');
            }
          }
        } catch (fetchErr) {
          console.warn('[Gemini Vision] Could not fetch imageUrl on server:', fetchErr);
        }
      }

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.status(400).json({ error: 'Missing imageBase64 or valid imageUrl payload' });
        return;
      }

      // Strip data url prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

      const ai = getGeminiClient();
      if (!ai) {
        res.json({
          success: false,
          fallback: true,
          message: 'GEMINI_API_KEY is not configured',
        });
        return;
      }

      const prompt = `Analyze this photo deeply as an editorial visual director and music soundtrack curator for VIBE MATCH.
Understand its visual characteristics, emotional atmosphere, lighting style, color palette, and narrative vibe.
Extract a structured Vibe Profile.

VIBE LABELS MUST BE CHOSEN FROM:
['Dreamy', 'Romantic', 'Cinematic', 'Peaceful', 'Confident', 'Mysterious', 'Happy', 'Nostalgic', 'Cute', 'Elegant', 'Energetic', 'Dark', 'Travel', 'Friendship']

LIGHTING MUST BE ONE OF:
['Golden Hour', 'Moody Shadows', 'Soft Pastel', 'Vivid Electric', 'Natural Sunlight', 'Deep Night']

ENERGY LEVEL MUST BE ONE OF:
['Calm & Flowing', 'Atmospheric & Deep', 'Warm & Nostalgic', 'High Energy & Bold']`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          primaryVibe: {
            type: Type.STRING,
            description: 'The dominant visual & emotional mood from the allowed list.',
          },
          secondaryVibe: {
            type: Type.STRING,
            description: 'The supporting secondary emotional mood from the allowed list.',
          },
          secondaryVibes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2 to 3 related visual or emotional vibe descriptors (e.g. ["Vintage", "Peaceful", "Aesthetic"]).',
          },
          energy: {
            type: Type.NUMBER,
            description: 'Visual and emotional energy level of the image from 0 (ultra-still/ambient) to 100 (explosive/fast).',
          },
          softness: {
            type: Type.NUMBER,
            description: 'Visual softness/delicacy from 0 (sharp/harsh/intense) to 100 (airy/pastel/gentle).',
          },
          nostalgia: {
            type: Type.NUMBER,
            description: 'Nostalgic, retro or memory resonance from 0 (ultra-modern) to 100 (deep vintage/memory).',
          },
          romance: {
            type: Type.NUMBER,
            description: 'Sensual, tender or romantic emotional weight from 0 to 100.',
          },
          cinematic: {
            type: Type.NUMBER,
            description: 'Cinematic, dramatic framing or film still quality from 0 to 100.',
          },
          confidence: {
            type: Type.NUMBER,
            description: 'Boldness, swagger, editorial coolness from 0 (subdued/shy) to 100 (commanding).',
          },
          darkness: {
            type: Type.NUMBER,
            description: 'Shadow depth, moody nocturnal tone or noir feeling from 0 (high-key/bright) to 100 (shadowed/deep night).',
          },
          visualStyle: {
            type: Type.STRING,
            description: 'Precise visual style description (e.g. "warm vintage mirror portrait", "neon rainy night skyline", "sun-drenched coastal drive").',
          },
          aestheticDescriptor: {
            type: Type.STRING,
            description: 'Poetic, concise editorial descriptor of the photo aesthetic (e.g., "Warm 90s analog grain with amber morning glow").',
          },
          description: {
            type: Type.STRING,
            description: 'Two to three sentences describing the emotional weight, atmosphere, and visual narrative.',
          },
          lighting: {
            type: Type.STRING,
            description: 'The dominant lighting quality from the allowed list.',
          },
          energyLevel: {
            type: Type.STRING,
            description: 'The overall tempo and emotional energy level from the allowed list.',
          },
          setting: {
            type: Type.STRING,
            description: 'Short description of the scene or environment (e.g., "Intimate vintage bedroom mirror", "Misty pine ridge").',
          },
          emotionalResonance: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3-4 evocative mood adjectives (e.g. Wistful, Introspective, Cozy).',
          },
          palette: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                hex: { type: Type.STRING, description: 'Hex code like #D8B88C' },
                name: { type: Type.STRING, description: 'Descriptive color name' },
              },
              required: ['hex', 'name'],
            },
            description: '4 dominant, harmonized colors present in the image.',
          },
        },
        required: [
          'primaryVibe',
          'secondaryVibe',
          'secondaryVibes',
          'energy',
          'softness',
          'nostalgia',
          'romance',
          'cinematic',
          'confidence',
          'darkness',
          'visualStyle',
          'aestheticDescriptor',
          'description',
          'lighting',
          'energyLevel',
          'setting',
          'emotionalResonance',
          'palette',
        ],
      };

      // Model fallback cascade for resilience against temporary 503 high demand spikes
      const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest'];
      let vibeProfile: any = null;
      let modelUsed: string = '';
      let lastError: any = null;

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: cleanBase64,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
            config: {
              responseMimeType: 'application/json',
              responseSchema,
            },
          });

          const responseText = response.text?.trim();
          if (responseText) {
            vibeProfile = JSON.parse(responseText);
            modelUsed = model;
            break;
          }
        } catch (err: any) {
          lastError = err;
          const isHighDemand =
            err?.status === 503 ||
            err?.code === 503 ||
            String(err?.message || '').includes('503') ||
            String(err?.message || '').includes('high demand');

          console.warn(
            `[Gemini Vision] Model '${model}' call notice (${err?.status || err?.code || 'info'}): ${
              isHighDemand ? 'Temporary high demand spike' : err?.message || 'Error'
            }. Trying fallback...`
          );

          if (isHighDemand) {
            // Brief backoff before fallback attempt
            await new Promise((resolve) => setTimeout(resolve, 450));
          }
        }
      }

      if (vibeProfile) {
        res.json({
          success: true,
          source: 'gemini-vision',
          modelUsed,
          vibeProfile,
        });
        return;
      }

      // If all AI models are temporarily busy / in high demand, gracefully activate fallback
      console.warn('[Gemini Vision] Upstream model temporarily unavailable or in high demand. Providing graceful fallback response.');
      res.json({
        success: false,
        fallback: true,
        source: 'optical-fallback',
        message: 'Vision model temporarily experiencing high demand. Seamlessly using optical tone analysis.',
      });
    } catch (err: any) {
      console.warn('[Gemini Vision] Route handler fallback caught:', err?.message || err);
      res.json({
        success: false,
        fallback: true,
        source: 'optical-fallback',
        error: err?.message || 'Failed to analyze image vibe',
      });
    }
  });

  // Music Provider Proxy endpoints (keeps external API calls robust & server-side)
  const previewCache = new Map<string, { previewUrl: string | null; artworkUrl: string | null; listenUrl: string | null; resolvedTitle?: string }>();

  async function resolveTrackPreview(title?: string, artist?: string, genre?: string, language?: string) {
    const safeArtist = (artist || '').trim();
    const safeTitle = (title || '').trim();
    const key = `${safeArtist.toLowerCase()}:::${safeTitle.toLowerCase()}`;
    if (previewCache.has(key)) {
      return previewCache.get(key)!;
    }

    let track: any = null;

    // 1. Try artist + clean title (strip "Part 1", "Part 2", etc.)
    const cleanTitle = safeTitle.replace(/\s*\([Pp]art\s*\d+\)/g, '').trim();
    if (safeArtist && cleanTitle) {
      try {
        const term = encodeURIComponent(`${safeArtist} ${cleanTitle}`);
        const resp = await fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=3`);
        if (resp.ok) {
          const data: any = await resp.json();
          track = (data.results || []).find((r: any) => !!r.previewUrl) || data.results?.[0];
        }
      } catch (e) {
        // ignore
      }
    }

    // 2. If no preview yet, search by artist alone (gives genuine top hits by that artist)
    if ((!track || !track.previewUrl) && safeArtist) {
      try {
        const term = encodeURIComponent(safeArtist);
        const resp = await fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=5`);
        if (resp.ok) {
          const data: any = await resp.json();
          const candidate = (data.results || []).find((r: any) => !!r.previewUrl);
          if (candidate) {
            track = candidate;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // 3. If still no preview, search by genre + language
    if ((!track || !track.previewUrl) && (genre || language)) {
      try {
        const term = encodeURIComponent(`${genre || ''} ${language || ''}`.trim());
        const resp = await fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=3`);
        if (resp.ok) {
          const data: any = await resp.json();
          const candidate = (data.results || []).find((r: any) => !!r.previewUrl);
          if (candidate) {
            track = candidate;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    const result = {
      previewUrl: track?.previewUrl || null,
      artworkUrl: track?.artworkUrl100?.replace('100x100bb', '300x300bb') || track?.artworkUrl100 || null,
      listenUrl: track?.trackViewUrl || (safeArtist ? `https://open.spotify.com/search/${encodeURIComponent(`${safeArtist} ${safeTitle}`)}` : null),
      resolvedTitle: track?.trackName || safeTitle,
    };

    if (result.previewUrl) {
      previewCache.set(key, result);
    }
    return result;
  }

  app.get('/api/music/resolve-preview', async (req, res) => {
    try {
      const { title, artist, genre, language } = req.query;
      if (!title && !artist) {
        return res.status(400).json({ error: 'Missing title or artist query param' });
      }
      const result = await resolveTrackPreview(
        title as string | undefined,
        artist as string | undefined,
        genre as string | undefined,
        language as string | undefined
      );
      res.json({
        success: !!result.previewUrl,
        previewUrl: result.previewUrl,
        artworkUrl: result.artworkUrl,
        listenUrl: result.listenUrl,
        resolvedTitle: result.resolvedTitle,
      });
    } catch (err: any) {
      console.warn('Error in /api/music/resolve-preview:', err?.message || err);
      res.json({ success: false, previewUrl: null });
    }
  });

  app.post('/api/music/resolve-batch', async (req, res) => {
    try {
      const { songs } = req.body;
      if (!Array.isArray(songs)) {
        return res.status(400).json({ error: 'Expected songs array' });
      }
      const resolvedMap: Record<string, any> = {};
      await Promise.all(
        songs.slice(0, 15).map(async (s: any) => {
          if (!s || !s.id) return;
          const resObj = await resolveTrackPreview(s.title, s.artist, s.genre, s.language);
          resolvedMap[s.id] = resObj;
        })
      );
      res.json({ success: true, resolved: resolvedMap });
    } catch (err: any) {
      console.warn('Error in /api/music/resolve-batch:', err?.message || err);
      res.json({ success: false, resolved: {} });
    }
  });

  app.get('/api/music/search', async (req, res) => {
    try {
      const { q, limit = '5' } = req.query;
      if (!q) {
        return res.status(400).json({ error: 'Missing query parameter q' });
      }
      const term = encodeURIComponent(String(q));
      const response = await fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=${limit}`);
      if (!response.ok) {
        return res.json({ success: false, results: [] });
      }
      const data: any = await response.json();
      res.json({
        success: true,
        results: (data.results || []).map((r: any) => ({
          id: String(r.trackId),
          title: r.trackName,
          artist: r.artistName,
          previewUrl: r.previewUrl || null,
          artworkUrl: r.artworkUrl100?.replace('100x100bb', '300x300bb') || r.artworkUrl100 || null,
          listenUrl: r.trackViewUrl || null,
        })),
      });
    } catch (err: any) {
      console.warn('Error in /api/music/search:', err?.message || err);
      res.json({ success: false, results: [] });
    }
  });

  // Audio proxy endpoint to reliably stream audio without CORS restrictions
  app.get('/api/music/audio-proxy', async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        return res.status(400).send('Invalid url parameter');
      }
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).send('Failed to fetch remote audio');
      }
      res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/m4a');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.warn('Error in /api/music/audio-proxy:', err?.message || err);
      res.status(500).send('Audio proxy error');
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use('/Vibe-Match', express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VIBE MATCH] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[VIBE MATCH] Server startup failed:', err);
  process.exit(1);
});
