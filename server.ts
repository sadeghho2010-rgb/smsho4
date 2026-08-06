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

  // Gemini Proxy Endpoint
  app.post('/api/gemini', async (req, res) => {
    const { apiKey: rawApiKey, history, message } = req.body;
    const apiKey = (rawApiKey || '').trim();

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    try {
      const client = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const systemInstruction = "شما یک مشاور حرفه‌ای برای برنامه‌ریزی مناسبت‌ها، خرید هدیه و برگزاری جشن‌ها هستید. پاسخ‌های خود را به زبان فارسی و با لحنی دوستانه و محترمانه ارائه دهید. اگر کاربر در مورد موضوعات غیرمرتبط سوال کرد، محترمانه او را به موضوعات برنامه‌ریزی و هدایا هدایت کنید.";

      const contents = [];
      if (history && Array.isArray(history) && history.length > 0) {
        contents.push(...history);
      }
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await client.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini Server Error:', error);
      // Check for specific error types if needed
      res.status(500).json({ 
        error: error.message || 'Internal Server Error',
        status: error.status || 500
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
