import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// System prompt for WingStation AI assistant
const WINGSTATION_SYSTEM_PROMPT = `You are "WingBot", the enthusiastic, culinary-expert AI Copilot for WingStation - the premier fast-food & takeaway destination known for crispy wings, craft dry rubs, gourmet glazes, and blazing Nashville hot sauces.
Our heat scale ranges from:
1: Lemon Herb / Garlic Parmesan (Mild, 0 Scoville)
2: Smokey Honey BBQ / Sweet Teriyaki (Mild-Sweet)
3: Classic Buffalo / Mango Habanero (Medium, 35k Scoville)
4: Nashville Hot Fire / Ghost Sriracha (Hot, 250k Scoville)
5: The Carolina Reaper Inferno (Ultra Hot, 1.5M Scoville - signed waiver required!)

Dips: House Buttermilk Ranch, Blue Cheese with Gorgonzola chunks, Honey Mustard, Spicy Garlic Aioli.
Sides: Seasoned Waffle Fries, Truffle Tots, Crispy Fried Pickles, Cajun Slaw, Churros with Cinnamon Dip.
Drinks: Fresh Lemonade (Classic, Strawberry, Dragonfruit), Craft Sodas, Cold Brew Shakes.

Keep responses snappy, helpful, food-app-friendly, appetizing, and concise (under 120 words). If asked about orders, dispatch, or spicy challenges, give clear, encouraging guidance.`;

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history = [], userPreferences } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (ai) {
      try {
        const promptContents = [
          {
            role: 'user',
            parts: [
              {
                text: `${WINGSTATION_SYSTEM_PROMPT}
User context: ${JSON.stringify(userPreferences || {})}
Chat History: ${JSON.stringify(history.slice(-4))}
User: ${message}`,
              },
            ],
          },
        ];

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptContents,
        });

        const reply = response.text || "I'm craving some crispy wings! What heat level are you feeling today?";
        return res.json({ reply });
      } catch (genError) {
        console.warn('Gemini API call failed, using intelligent fallback:', genError);
      }
    }

    // Smart fallback if API key is not configured or offline
    const lower = (message || '').toLowerCase();
    let reply = "Welcome to WingStation! How can I help you find your perfect wing combo today?";
    if (lower.includes('spicy') || lower.includes('hot') || lower.includes('heat') || lower.includes('reaper')) {
      reply = "Our legendary Carolina Reaper Inferno packs 1.5M Scoville! We recommend pairing with double House Ranch or Blue Cheese to survive the heat!";
    } else if (lower.includes('mild') || lower.includes('sweet') || lower.includes('garlic')) {
      reply = "For milder cravings, our Garlic Parmesan crunch or Smokey Honey BBQ wings are customer favorites—crispy, savory, and crowd-pleasing!";
    } else if (lower.includes('deal') || lower.includes('coupon') || lower.includes('promo') || lower.includes('discount')) {
      reply = "Use promo code 'WINGVIP20' at checkout for 20% off all 16-piece & 24-piece combos today!";
    } else if (lower.includes('track') || lower.includes('order') || lower.includes('where')) {
      reply = "You can view your order's live GPS dispatch and fryer progress anytime via the Live Status tab in the app!";
    } else if (lower.includes('recommend') || lower.includes('best')) {
      reply = "Chef's recommendation: 10pc Bone-In Mango Habanero with loaded Truffle Tots and House Ranch dip!";
    }

    res.json({ reply });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal error' });
  }
});

// AI Wing Matchmaker recommendation endpoint
app.post('/api/ai/recommend', async (req, res) => {
  try {
    const { spiceTolerance, mood, appetite, dietary } = req.body;
    let recommendation = {
      title: 'Chef Special: Signature 12-Piece Flavor Sampler',
      flavors: ['Mango Habanero', 'Garlic Parmesan', 'Nashville Hot'],
      side: 'Truffle Waffle Fries',
      drink: 'Strawberry Sparkling Lemonade',
      reasoning: 'Balanced sweet-heat profile with crispy crunch and cooling citrus finish.',
      scovilleScore: '45,000 SHU (Comfortable Thrill)',
    };

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Given the user preferences:
Spice Tolerance: ${spiceTolerance || 'Medium'}
Mood: ${mood || 'Hungry & adventerous'}
Appetite: ${appetite || 'Regular (10-12 wings)'}
Dietary: ${dietary || 'None'}

Return ONLY a valid JSON object with keys:
"title" (string), "flavors" (array of strings), "side" (string), "drink" (string), "reasoning" (string under 25 words), "scovilleScore" (string).`,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          recommendation = JSON.parse(response.text);
        }
      } catch (e) {
        console.warn('AI recommend fallback used');
      }
    }

    res.json(recommendation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🍗 WingStation server active at http://0.0.0.0:${PORT}`);
  });
}

startServer();
