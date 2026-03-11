import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const readCentralEnvValue = (key: string): string => {
  const direct = process.env[key];
  if (direct) return direct;
  try {
    const home = process.env.HOME || '/home/evo';
    const centralEnvPath = path.join(home, '.env');
    const raw = fs.readFileSync(centralEnvPath, 'utf8');
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(new RegExp(`^${key}=([\\s\\S]+)$`));
      if (match?.[1]) return match[1].trim();
    }
  } catch {
    // no-op
  }
  return '';
};

const extractOpenAiStyleText = (payload: unknown): string => {
  const data = payload as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>;
      };
    }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter((part) => part && part.type === 'text' && typeof part.text === 'string')
      .map((part) => part.text as string)
      .join('\n')
      .trim();
  }
  return '';
};

const buildInvestorProfilePrompt = (payload: {
  entityName?: string;
  stableName?: string;
  website?: string;
  socialLinks?: string[];
  notes?: string;
  otherContext?: string;
  limitedContext?: boolean;
}, kindLabel: string): string => `Write exactly no more then 3, no less then 2 sentences for an investor-facing profile of this New Zealand racing ${kindLabel}.

Use only verified facts from the provided fields/context. Prioritize in this order:
1) role + base location + stable/operation identity,
2) strongest verified performance proof (best horse, notable win/result, stakes/class level),
3) current focus and why this profile is relevant to investors.
If a detail is not clearly verified, omit it. Do not guess age. Keep tone factual and concise.
Return plain text only.

Entity name: ${payload.entityName ?? ''}
Stable name: ${payload.stableName ?? ''}
Website: ${payload.website ?? ''}
Social: ${(payload.socialLinks ?? []).join(', ')}
Bio/notes: ${payload.notes ?? ''}
Other context: ${payload.otherContext ?? ''}
Limited context flag: ${payload.limitedContext ? 'true' : 'false'}`;

const INVESTOR_UPDATES_ROOT = readCentralEnvValue('SSOT_UPDATES_ROOT_ABS')
  || path.join(process.cwd(), 'data', 'generated', 'investor_updates');

const slugSegment = (value: string): string =>
  value.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'unknown';

const readJsonBody = async <T = Record<string, unknown>>(req: any): Promise<T> => {
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const bodyText = Buffer.concat(chunks).toString('utf8');
  return JSON.parse(bodyText || '{}') as T;
};

const isLoopbackAddress = (address: string): boolean => {
  const normalized = address.replace(/^::ffff:/, '');
  return normalized === '127.0.0.1' || normalized === '::1';
};

const requireLocalRequest = (req: any, res: any): boolean => {
  const remoteAddress = req?.socket?.remoteAddress ?? '';
  const hostHeader = String(req?.headers?.host ?? '').toLowerCase();
  const host = hostHeader.split(':')[0];
  const hostAllowed = host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '';

  if (isLoopbackAddress(remoteAddress) && hostAllowed) return true;
  res.statusCode = 403;
  res.end('Local access only');
  return false;
};

const attachAppMiddlewares = (middlewares: { use: (path: string, handler: (req: any, res: any) => Promise<void>) => void }) => {
  middlewares.use('/__save_investor_update', async (req, res) => {
    try {
      if (!requireLocalRequest(req, res)) return;
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method not allowed');
        return;
      }
      const payload = await readJsonBody<{
        horseId?: string;
        horseName?: string;
        template?: 'standard' | 'quarterly';
        headline?: string;
        asOfDate?: string;
        html?: string;
      }>(req);
      const horseId = (payload.horseId || '').trim();
      const horseName = (payload.horseName || '').trim();
      const html = (payload.html || '').trim();
      if (!horseId || !horseName || !html) {
        res.statusCode = 400;
        res.setHeader('content-type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'horseId, horseName, and html are required.' }));
        return;
      }
      const dateToken = (payload.asOfDate || new Date().toISOString().slice(0, 10)).replace(/[^0-9]/g, '') || '00000000';
      const typeToken = payload.template === 'quarterly' ? 'Quarterly' : 'Update';
      const headlineToken = slugSegment(payload.headline || typeToken);
      const fileName = `${slugSegment(horseName)}-${typeToken}-${headlineToken}-${dateToken}.html`;
      const horseFolder = `${slugSegment(horseName)}_${slugSegment(horseId)}`;
      const targetDir = path.join(INVESTOR_UPDATES_ROOT, horseFolder);
      const filePath = path.join(targetDir, fileName);
      await fs.promises.mkdir(targetDir, { recursive: true });
      await fs.promises.writeFile(filePath, html, 'utf8');
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({
        fileName,
        filePath,
        savedAt: new Date().toISOString(),
      }));
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Save failed' }));
    }
  });

  middlewares.use('/__url_proxy', async (req, res) => {
    try {
      if (!requireLocalRequest(req, res)) return;
      const origin = 'http://localhost';
      const parsed = new URL(req.url ?? '', origin);
      const target = parsed.searchParams.get('url');
      if (!target) {
        res.statusCode = 400;
        res.end('Missing url');
        return;
      }
      const safeTarget = new URL(target);
      if (!['http:', 'https:'].includes(safeTarget.protocol)) {
        res.statusCode = 400;
        res.end('Unsupported protocol');
        return;
      }
      const upstream = await fetch(safeTarget.toString(), { redirect: 'follow' });
      const body = await upstream.text();
      res.statusCode = upstream.status;
      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.end(body);
    } catch (error) {
      res.statusCode = 500;
      res.end(error instanceof Error ? error.message : 'Proxy error');
    }
  });
  middlewares.use('/__anthropic_profile', async (req, res) => {
    try {
      if (!requireLocalRequest(req, res)) return;
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method not allowed');
        return;
      }
      const apiKey = readCentralEnvValue('ANTHROPIC_API_KEY');
      if (!apiKey) {
        res.statusCode = 500;
        res.end('Missing ANTHROPIC_API_KEY');
        return;
      }
      const chunks: Uint8Array[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const bodyText = Buffer.concat(chunks).toString('utf8');
      const payload = JSON.parse(bodyText || '{}') as {
        entityType?: 'trainer' | 'owner';
        entityName?: string;
        stableName?: string;
        website?: string;
        socialLinks?: string[];
        notes?: string;
        otherContext?: string;
        limitedContext?: boolean;
      };

      const kindLabel = payload.entityType === 'owner' ? 'owner' : 'trainer or stable';
      const prompt = buildInvestorProfilePrompt(payload, kindLabel);

      const upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await upstream.json() as { content?: Array<{ text?: string }> };
      if (!upstream.ok) {
        res.statusCode = upstream.status;
        res.setHeader('content-type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(data));
        return;
      }
      const text = data.content?.[0]?.text ?? '';
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ text }));
    } catch (error) {
      res.statusCode = 500;
      res.end(error instanceof Error ? error.message : 'AI proxy error');
    }
  });
  middlewares.use('/__glm_profile', async (req, res) => {
    try {
      if (!requireLocalRequest(req, res)) return;
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method not allowed');
        return;
      }
      const apiKey = readCentralEnvValue('GLM_API_KEY') || readCentralEnvValue('ZHIPU_API_KEY');
      if (!apiKey) {
        res.statusCode = 500;
        res.end('Missing GLM_API_KEY (or ZHIPU_API_KEY)');
        return;
      }

      const chunks: Uint8Array[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const bodyText = Buffer.concat(chunks).toString('utf8');
      const payload = JSON.parse(bodyText || '{}') as {
        entityType?: 'trainer' | 'owner';
        entityName?: string;
        stableName?: string;
        website?: string;
        socialLinks?: string[];
        notes?: string;
        otherContext?: string;
        limitedContext?: boolean;
      };

      const kindLabel = payload.entityType === 'owner' ? 'owner' : 'trainer or stable';
      const prompt = buildInvestorProfilePrompt(payload, kindLabel);

      const model = readCentralEnvValue('GLM_MODEL') || 'glm-5';
      const baseUrl = (readCentralEnvValue('GLM_BASE_URL') || 'https://open.bigmodel.cn/api/paas/v4').replace(/\/+$/, '');
      const endpoint = `${baseUrl}/chat/completions`;
      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await upstream.json();
      if (!upstream.ok) {
        res.statusCode = upstream.status;
        res.setHeader('content-type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(data));
        return;
      }
      const text = extractOpenAiStyleText(data);
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ text }));
    } catch (error) {
      res.statusCode = 500;
      res.end(error instanceof Error ? error.message : 'GLM proxy error');
    }
  });
  middlewares.use('/__groq_profile', async (req, res) => {
    try {
      if (!requireLocalRequest(req, res)) return;
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method not allowed');
        return;
      }
      const apiKey = readCentralEnvValue('GROQ_API_KEY');
      if (!apiKey) {
        res.statusCode = 500;
        res.end('Missing GROQ_API_KEY');
        return;
      }

      const chunks: Uint8Array[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const bodyText = Buffer.concat(chunks).toString('utf8');
      const payload = JSON.parse(bodyText || '{}') as {
        entityType?: 'trainer' | 'owner';
        entityName?: string;
        stableName?: string;
        website?: string;
        socialLinks?: string[];
        notes?: string;
        otherContext?: string;
        limitedContext?: boolean;
      };

      const kindLabel = payload.entityType === 'owner' ? 'owner' : 'trainer or stable';
      const prompt = buildInvestorProfilePrompt(payload, kindLabel);

      const model = readCentralEnvValue('GROQ_MODEL') || 'llama-3.3-70b-versatile';
      const endpoint = `${(readCentralEnvValue('GROQ_BASE_URL') || 'https://api.groq.com/openai/v1').replace(/\/+$/, '')}/chat/completions`;
      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await upstream.json();
      if (!upstream.ok) {
        res.statusCode = upstream.status;
        res.setHeader('content-type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(data));
        return;
      }
      const text = extractOpenAiStyleText(data);
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ text }));
    } catch (error) {
      res.statusCode = 500;
      res.end(error instanceof Error ? error.message : 'Groq proxy error');
    }
  });
  middlewares.use('/__gemini_profile', async (req, res) => {
    try {
      if (!requireLocalRequest(req, res)) return;
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method not allowed');
        return;
      }
      const apiKey = readCentralEnvValue('GEMINI_API_KEY');
      if (!apiKey) {
        res.statusCode = 500;
        res.end('Missing GEMINI_API_KEY');
        return;
      }

      const chunks: Uint8Array[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const bodyText = Buffer.concat(chunks).toString('utf8');
      const payload = JSON.parse(bodyText || '{}') as {
        entityType?: 'trainer' | 'owner';
        entityName?: string;
        stableName?: string;
        website?: string;
        socialLinks?: string[];
        notes?: string;
        otherContext?: string;
        limitedContext?: boolean;
      };

      const kindLabel = payload.entityType === 'owner' ? 'owner' : 'trainer or stable';
      const prompt = buildInvestorProfilePrompt(payload, kindLabel);

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          tools: [
            { url_context: {} },
            { google_search: {} },
          ],
          generationConfig: {
            temperature: 0.2,
          },
        }),
      });
      const data = await upstream.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      if (!upstream.ok) {
        res.statusCode = upstream.status;
        res.setHeader('content-type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(data));
        return;
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ text }));
    } catch (error) {
      res.statusCode = 500;
      res.end(error instanceof Error ? error.message : 'Gemini proxy error');
    }
  });
};

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/routes/DashboardRoute')) return 'route-dashboard';
          if (id.includes('/src/routes/LeaseRoute') || id.includes('/src/routes/ReferenceRoute')) return 'route-operations';
          if (id.includes('/src/lib/lazyExports')) return 'document-export-helpers';

          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'react-core';
          if (id.includes('/docx/') || id.includes('/jszip/')) return 'document-docx';
          if (id.includes('/jspdf/')) return 'document-pdf';
          if (id.includes('/html2canvas/') || id.includes('/canvg/') || id.includes('/css-line-break/')) return 'document-capture';
          if (id.includes('/lucide-react/')) return 'ui-icons';
          return undefined;
        },
      },
    },
  },
  server: {
    port: 3000,
    host: '127.0.0.1',
    proxy: {
      '/__loveracing_proxy': {
        target: 'https://loveracing.nz',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/__loveracing_proxy/, ''),
      },
    },
  },
  plugins: [
    react(),
    {
      name: 'url-proxy-middleware',
      configureServer(server) {
        attachAppMiddlewares(server.middlewares);
      },
      configurePreviewServer(server) {
        attachAppMiddlewares(server.middlewares);
      },
    },
  ],
});
