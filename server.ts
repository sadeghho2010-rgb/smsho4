import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Endpoint for Gemini AI consultation
  app.post('/api/chat', async (req: express.Request, res: express.Response): Promise<void> => {
    const { prompt, history, apiKey: userApiKey } = req.body;

    const apiKey = userApiKey;
    if (!apiKey) {
      res.status(400).json({
        error: "کلید API برای مدل هوش مصنوعی Gemini تنظیم نشده است. لطفاً از بخش تنظیمات کلید API اقدام نمایید."
      });
      return;
    }

    try {
      const client = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await client.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          { role: 'user', parts: [{ text: "شما یک مشاور حرفه‌ای برای برنامه‌ریزی مناسبت‌ها هستید. پاسخ‌ها را به فارسی بدهید." }] },
          ...(history?.map((m: any) => ({
            role: m.role,
            parts: [{ text: m.parts[0].text }]
          })) || []),
          { role: 'user', parts: [{ text: prompt }] }
        ]
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API call failed:', error);
      res.status(500).json({ 
        error: error.message || 'خطایی در ارتباط با سرور هوش مصنوعی رخ داده است.' 
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite Middleware Setup
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start fullstack server:', err);
});
