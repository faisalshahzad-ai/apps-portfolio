import express, { Request, Response } from 'express';
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

// Initialize GoogleGenAI SDK server-side
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory persistent database store for simulated orders and audit events
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  customizations?: string[];
}

export interface StoredOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  role: 'customer' | 'staff' | 'admin';
  items: OrderItem[];
  subtotal: number;
  commission: number; // 5-15% platform fee
  deliveryFee: number;
  total: number;
  status: 'received' | 'prepping' | 'quality_check' | 'out_for_delivery' | 'delivered' | 'cancelled';
  fulfillmentType: 'delivery' | 'pickup' | 'dine_in';
  deliveryAddress: string;
  courier: {
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    lat: number;
    lng: number;
  };
  trackingCode: string;
  paymentMethod: 'apple_pay' | 'google_pay' | 'credit_card';
  createdAt: string;
  estimatedDeliveryTime: string;
}

const mockOrders: StoredOrder[] = [
  {
    id: 'TC-9042',
    customerName: 'Alex Rivera',
    customerPhone: '+1 (555) 392-8172',
    role: 'customer',
    items: [
      { id: 'item-1', name: 'Artisanal Birria Quesa-Tacos (Trio)', quantity: 1, price: 16.50, customizations: ['Extra Consomé', 'Oaxaca Cheese Crispy'] },
      { id: 'item-5', name: 'Loaded Artisanal Nachos', quantity: 1, price: 13.99, customizations: ['Smoky Crema', 'Pickled Jalapeños'] },
      { id: 'item-8', name: 'Horchata Cold Brew', quantity: 2, price: 5.50 }
    ],
    subtotal: 41.49,
    commission: 4.15,
    deliveryFee: 2.99,
    total: 48.63,
    status: 'out_for_delivery',
    fulfillmentType: 'delivery',
    deliveryAddress: '742 Evergreen Terrace, Apt 4B',
    courier: {
      name: 'Mateo Hernandez',
      phone: '+1 (555) 718-2991',
      vehicle: 'Electric Vespa (Silver #44)',
      rating: 4.96,
      lat: 37.7749,
      lng: -122.4194
    },
    trackingCode: 'TRK-TC-882194',
    paymentMethod: 'apple_pay',
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
    estimatedDeliveryTime: '12-15 min'
  },
  {
    id: 'TC-9041',
    customerName: 'Elena Rostova',
    customerPhone: '+1 (555) 830-4100',
    role: 'customer',
    items: [
      { id: 'item-2', name: 'Flame Al Pastor Street Tacos', quantity: 2, price: 14.50, customizations: ['Charred Roasted Pineapple', 'Salsa Verde'] }
    ],
    subtotal: 29.00,
    commission: 2.90,
    deliveryFee: 0,
    total: 31.90,
    status: 'prepping',
    fulfillmentType: 'pickup',
    deliveryAddress: 'Kitchen Counter Pickup - Station 2',
    courier: {
      name: 'Counter Express',
      phone: '+1 (555) 880-0000',
      vehicle: 'Counter',
      rating: 5.0,
      lat: 37.7750,
      lng: -122.4180
    },
    trackingCode: 'TRK-TC-882193',
    paymentMethod: 'google_pay',
    createdAt: new Date(Date.now() - 6 * 60000).toISOString(),
    estimatedDeliveryTime: '6-8 min'
  }
];

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'TacoCraft',
    version: '2.4.0',
    geminiEnabled: !!aiClient,
    timestamp: new Date().toISOString()
  });
});

// Orders API
app.get('/api/orders', (_req: Request, res: Response) => {
  res.json({ success: true, orders: mockOrders });
});

app.post('/api/orders', (req: Request, res: Response) => {
  const newOrder: StoredOrder = {
    id: `TC-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: req.body.customerName || 'Taco Explorer',
    customerPhone: req.body.customerPhone || '+1 (555) 234-5678',
    role: 'customer',
    items: req.body.items || [],
    subtotal: req.body.subtotal || 0,
    commission: Number((((req.body.subtotal || 0) * 0.1)).toFixed(2)),
    deliveryFee: req.body.deliveryFee || 2.99,
    total: req.body.total || 0,
    status: 'received',
    fulfillmentType: req.body.fulfillmentType || 'delivery',
    deliveryAddress: req.body.deliveryAddress || '742 Evergreen Terrace',
    courier: {
      name: 'Carlos Mendez',
      phone: '+1 (555) 492-9182',
      vehicle: 'Super73 E-Bike (Black #12)',
      rating: 4.98,
      lat: 37.7760,
      lng: -122.4170
    },
    trackingCode: `TRK-TC-${Math.floor(100000 + Math.random() * 900000)}`,
    paymentMethod: req.body.paymentMethod || 'apple_pay',
    createdAt: new Date().toISOString(),
    estimatedDeliveryTime: '20-25 min'
  };

  mockOrders.unshift(newOrder);
  res.status(201).json({ success: true, order: newOrder });
});

app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = mockOrders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  order.status = status;
  res.json({ success: true, order });
});

// Gemini AI Chatbot / Support Concierge endpoint
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  const { message, history, currentOrder, userPreferences } = req.body;

  if (!aiClient) {
    // Intelligent fallback assistant with culinary knowledge and order resolution
    return res.json({
      text: `Hello from TacoCraft Concierge! I see you're asking about "${message}".\n\nOur kitchen is currently firing up orders fresh on the plancha. For your active order #${currentOrder?.id || 'TC-9042'}, the chef is crafting our signature slow-braised Birria with melted Oaxaca cheese. Can I adjust your heat level, add extra fresh cilantro/lime, or help check delivery telemetry?`
    });
  }

  try {
    const systemPrompt = `You are "TacoCraft Concierge", the ultra-friendly, knowledgeable AI culinary assistant and support copilot for TacoCraft (the premier Fast Food & Takeaway app).
Our Brand Colors: Flame Orange & Charcoal.
Key Offerings:
1. Artisanal Birria Quesa-Tacos with 14-hour slow simmered chili broth (Consomé)
2. Flame Al Pastor with trompo-roasted marinated pork & sweet pineapple
3. Charbroiled Prime Carne Asada skirt steak with fresh creamy guacamole & cotija
4. Baja Beer-Battered Crispy Fish Tacos with crunchy purple slaw & chipotle crema
5. Loaded Skillet Nachos with Oaxaca cheese, black beans, pico & smoky crema
6. Refreshments: Fresh Horchata Cold Brew, Hibiscus Agua Fresca, Frozen Blood Orange Margarita

Your capabilities:
- Answering questions about taco ingredients, calorie macros, gluten-free / halal / keto modifications.
- Guiding custom ingredient builds (extra crispy cheese crown, double meat, roasted habanero salsa).
- Helping with live delivery inquiries, ETA updates, and ticket escalation for refunds/order modifications.
- Tone: Warm, energetic, concise, food-enthusiastic, and helpful. Use clean plain text and subtle bullet points.`;

    const chatHistory = (history || []).map((h: { sender: string; text: string }) => ({
      role: h.sender === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    const contents = [
      ...chatHistory,
      {
        role: 'user',
        parts: [
          {
            text: `Customer Context:
- Active Order: ${JSON.stringify(currentOrder || mockOrders[0])}
- Dietary Preferences: ${JSON.stringify(userPreferences || { spicy: 'high', dietary: ['Gluten-Friendly'] })}
Customer Message: ${message}`
          }
        ]
      }
    ];

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const reply = response.text || "I'm right here! Let me double check with the TacoCraft kitchen team.";
    res.json({ text: reply });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Gemini API chat error:', errorMsg);
    res.json({
      text: `Thanks for messaging TacoCraft! Our kitchen has received your inquiry: "${message}". We're prioritizing your order freshness and guarantee crisp tortillas within 20 minutes!`
    });
  }
});

// Gemini AI Smart Flavor Profiler & Recommendation endpoint
app.post('/api/gemini/recommend', async (req: Request, res: Response) => {
  const { spiceTolerance, dietary, hungerLevel } = req.body;

  if (!aiClient) {
    return res.json({
      recommendations: [
        {
          name: 'The Birria Supreme Combo',
          reason: 'Matches your craving for deep savory richness with custom mild-to-fiery dipping consommé.',
          pairings: ['Horchata Cold Brew', 'Crispy Churro Bites with Mexican Cajeta'],
          estimatedPrep: '9 mins'
        },
        {
          name: 'Baja Crispy Trio & Guacamole Molcajete',
          reason: 'Fresh, crunchy textures with zesty lime crema that balances perfectly with light snacking.',
          pairings: ['Hibiscus Agua Fresca', 'Charred Corn Street Slaw'],
          estimatedPrep: '7 mins'
        }
      ]
    });
  }

  try {
    const prompt = `Recommend two bespoke TacoCraft meals tailored to:
- Spice Tolerance: ${spiceTolerance || 'Medium'}
- Dietary Restrictions: ${dietary || 'None'}
- Hunger Level: ${hungerLevel || 'Normal'}

Return JSON containing an array of 2 recommendations with fields: name, reason, pairings (array of strings), estimatedPrep.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err) {
    console.error('Gemini recommend error:', err);
    res.json({
      recommendations: [
        {
          name: 'Signature Quesa-Birria Feast',
          reason: 'Our top-rated trio paired with 14-hour chili consomme broth and cilantro crunch.',
          pairings: ['Fresh Horchata', 'Spiced Street Corn Elote'],
          estimatedPrep: '8 mins'
        }
      ]
    });
  }
});

// Admin Report Export (JSON/Cryptographic Summary simulation)
app.post('/api/reports/export', (_req: Request, res: Response) => {
  const report = {
    reportId: `RPT-TC-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    totalGrossMerchandiseValue: 14890.50,
    platformTakeRate: '10.8%',
    totalCommissionRevenue: 1608.17,
    ordersProcessed: 384,
    averageFulfillmentTimeMinutes: 18.4,
    customerSatisfactionScore: 4.92,
    cryptographicSignature: `SHA256:${Buffer.from(String(Date.now())).toString('base64').substring(0, 32)}...CONFIRMED_AUDIT`
  };
  res.json({ success: true, report });
});

// Bootstrapping: Dev mode with Vite middleware or Production static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌮 TacoCraft Full-Stack Engine running on port ${PORT}`);
  });
}

startServer();
