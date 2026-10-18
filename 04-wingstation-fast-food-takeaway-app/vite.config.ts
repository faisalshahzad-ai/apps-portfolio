import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';

function apiServerPlugin(): Plugin {
  return {
    name: 'wingstation-server-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/ai/chat' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { message, history, userPreferences } = JSON.parse(body || '{}');
              const apiKey = process.env.GEMINI_API_KEY;

              if (apiKey) {
                try {
                  const ai = new GoogleGenAI({
                    apiKey,
                    httpOptions: {
                      headers: { 'User-Agent': 'aistudio-build' },
                    },
                  });

                  const prompt = `You are "WingBot", the enthusiastic, culinary-expert AI Copilot for WingStation - the premier fast-food & takeaway destination known for crispy wings, craft dry rubs, gourmet glazes, and blazing Nashville hot sauces.
Our heat scale ranges from:
1: Lemon Herb / Garlic Parmesan (Mild, 0 Scoville)
2: Smokey Honey BBQ / Sweet Teriyaki (Mild-Sweet)
3: Classic Buffalo / Mango Habanero (Medium, 35k Scoville)
4: Nashville Hot Fire / Ghost Sriracha (Hot, 250k Scoville)
5: The Carolina Reaper Inferno (Ultra Hot, 1.5M Scoville)
Dips: House Buttermilk Ranch, Blue Cheese with Gorgonzola chunks, Honey Mustard, Spicy Garlic Aioli.
Sides: Seasoned Waffle Fries, Truffle Tots, Crispy Fried Pickles, Cajun Slaw.
Keep answers under 80 words, food-loving, and helpful.
User Preferences: ${JSON.stringify(userPreferences || {})}
Chat History: ${JSON.stringify(history?.slice(-3) || [])}
User: ${message}`;

                  const response = await ai.models.generateContent({
                    model: 'gemini-3.8-flash',
                    contents: prompt,
                  });

                  const reply = response.text || "Craving crispy wings! What heat level are you feeling today?";
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ reply }));
                  return;
                } catch (aiErr) {
                  console.warn('Gemini API call failed, falling back to local culinary knowledge:', aiErr);
                }
              }

              // Contextual culinary fallback
              const lower = (message || '').toLowerCase();
              let reply = "Welcome to WingStation! I can help you select your heat level, dips, and sides.";
              if (lower.includes('mild') || lower.includes('garlic') || lower.includes('sweet')) {
                reply = "For rich savory crunch without the burn, our Garlic Parmesan wings or Smokey Honey BBQ are customer favorites!";
              } else if (lower.includes('reaper') || lower.includes('spicy') || lower.includes('hot')) {
                reply = "Our Carolina Reaper Inferno packs 1,500,000 SHU! Make sure to order extra House Buttermilk Ranch or Gorgonzola Blue Cheese to extinguish the flames!";
              } else if (lower.includes('deal') || lower.includes('coupon') || lower.includes('promo')) {
                reply = "Use promo code 'WINGVIP20' at checkout to receive 20% off all feasts today!";
              } else if (lower.includes('order') || lower.includes('track') || lower.includes('where')) {
                reply = "You can track your order's live GPS route and oil fryer status anytime in the Live GPS tab!";
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ reply }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Internal error' }));
            }
          });
          return;
        }

        if (req.url === '/api/ai/recommend' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { spiceTolerance, appetite, mood } = JSON.parse(body || '{}');
              const apiKey = process.env.GEMINI_API_KEY;

              let recommendation = {
                title: 'MVP 12-Piece Fire Feast Box',
                flavors: ['Nashville Hot Fire', 'Garlic Parmesan'],
                side: 'Truffle Parmesan Waffle Fries',
                drink: 'Strawberry Dragonfruit Lemonade',
                reasoning: 'Crispy savory crunch paired with refreshing citrus lemonade.',
                scovilleScore: '250,000 SHU (Comfortable Thrill)',
              };

              if (apiKey) {
                try {
                  const ai = new GoogleGenAI({
                    apiKey,
                    httpOptions: {
                      headers: { 'User-Agent': 'aistudio-build' },
                    },
                  });

                  const response = await ai.models.generateContent({
                    model: 'gemini-3.8-flash',
                    contents: `User Preferences:
Spice Tolerance: ${spiceTolerance || 'Medium'}
Appetite: ${appetite || 'Regular'}
Mood: ${mood || 'Hungry for wings'}

Return ONLY valid JSON with keys:
"title" (string), "flavors" (array of strings), "side" (string), "drink" (string), "reasoning" (string under 20 words), "scovilleScore" (string).`,
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

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(recommendation));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Internal error' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
