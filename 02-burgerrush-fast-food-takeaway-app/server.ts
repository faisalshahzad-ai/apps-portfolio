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

// Initialize GoogleGenAI server-side with telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory telemetry/audit logger
const auditLogs: Array<{
  id: string;
  actorId: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string;
}> = [];

// Gemini Support Chat endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history, userRole, currentOrder } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (ai) {
      const systemInstruction = `You are "RushCopilot", the real-time AI dining & takeaway support assistant for BurgerRush.
BurgerRush is a high-speed, gourmet fast-food takeaway brand with signature smash burgers, truffle fries, brioche buns, craft shakes, and priority delivery dispatch.
Current User Context:
- Role: ${userRole || 'Customer'}
- Active Order Context: ${currentOrder ? JSON.stringify(currentOrder) : 'None currently active'}

Tone: Friendly, efficient, ultra-helpful, appetizing, concise (max 2-3 short sentences for mobile readability).
Capabilities:
- Can answer questions on ingredients, allergens, halal/vegan status, spice levels.
- Can help customers modify orders, add special sauce requests, check delivery ETA.
- If a user reports a cold burger, missing items, or delivery delay, apologize warmly, offer an instant $5 BurgerRush Gold credit or offer immediate human supervisor escalation.
- Return responses with concise, actionable suggestions.`;

      const contents = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const h of history.slice(-6)) {
          contents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text || '' }],
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || "I'm right here to help you get the best burger experience!";
      return res.json({ reply, provider: 'gemini-3.8-flash' });
    }

    // Fallback if API key is not configured
    let smartReply = "Thanks for reaching out to BurgerRush! Our kitchen team has your order prioritized. Need extra sauce or an ETA update?";
    const lower = message.toLowerCase();
    if (lower.includes('vegan') || lower.includes('halal') || lower.includes('allergy') || lower.includes('gluten')) {
      smartReply = "All our beef smash patties are 100% Halal certified Angus beef. We also feature the 'Green Rush Vegan Smash' with plant-based melted cheddar and house-baked gluten-free brioche upon request!";
    } else if (lower.includes('delay') || lower.includes('late') || lower.includes('cold') || lower.includes('missing')) {
      smartReply = "We sincerely apologize for the inconvenience! We've flagged this to Dispatch Supervisor Marcus. We've credited 500 RushPoints ($5.00) to your account immediately.";
    } else if (lower.includes('sauce') || lower.includes('extra') || lower.includes('fry') || lower.includes('burger')) {
      smartReply = "Noted! Our signature Rush Sauce is smoked paprika aioli with caramelized shallots. We've added a note for the kitchen to include an extra ramekin on the house!";
    }

    return res.json({ reply: smartReply, provider: 'offline-smart-copilot' });
  } catch (error: unknown) {
    console.error('Gemini chat error:', error);
    const errMessage = error instanceof Error ? error.message : 'Internal error';
    return res.status(500).json({ error: errMessage, reply: "I'm experiencing a momentary network blip, but our kitchen is firing your order at full speed!" });
  }
});

// Contextual AI recommendations endpoint
app.post('/api/gemini/recommend', async (req, res) => {
  try {
    const { craving, dietary, timeOfDay } = req.body;
    if (ai) {
      const prompt = `Recommend 2 specific items from a gourmet fast food takeaway menu (Burgers, Truffle Sides, Craft Shakes) based on:
Craving: ${craving || 'Savory & Crispy'}
Dietary Preference: ${dietary || 'None'}
Time of Day: ${timeOfDay || 'Dinner'}

Return valid JSON in this exact format:
{
  "recommendations": [
    { "title": "Double Smoked Truffle Smash", "reason": "Packed with umami and aged cheddar crispiness", "tag": "Best Seller" },
    { "title": "Golden Parmesan Truffle Fries", "reason": "Hand-cut daily with rosemary dust and garlic aioli", "tag": "Chef Special" }
  ]
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    }

    // Default curated fallback
    return res.json({
      recommendations: [
        { title: "Double Smoked Truffle Smash", reason: "Dual Angus beef smashed thin with crispy edges, aged gouda & black truffle glaze", tag: "Crowd Favorite" },
        { title: "Crispy Parmesan Truffle Fries", reason: "Triple-cooked russet potatoes with rosemary salt and roasted garlic aioli", tag: "Must Have Side" },
      ],
    });
  } catch (error) {
    console.error('Gemini recommendation error:', error);
    return res.json({
      recommendations: [
        { title: "Classic Rush Double Smash", reason: "Our benchmark smash burger with secret Rush sauce and house pickles", tag: "Signature" },
      ],
    });
  }
});

// Audit and telemetry logging
app.post('/api/telemetry/log', (req, res) => {
  const { actorId, eventType, payload } = req.body;
  const log = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    actorId: actorId || 'guest',
    eventType: eventType || 'action',
    payload: payload || {},
    createdAt: new Date().toISOString(),
  };
  auditLogs.unshift(log);
  if (auditLogs.length > 100) auditLogs.pop();
  return res.json({ status: 'ok', logId: log.id });
});

app.get('/api/telemetry/logs', (_req, res) => {
  return res.json({ logs: auditLogs });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'BurgerRush API Gateway',
    geminiConfigured: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// Setup Vite middlewares or static files
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BurgerRush server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
