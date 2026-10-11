import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function apiContactPlugin() {
  return {
    name: 'vite-plugin-api-contact',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url !== '/api/contact') {
          return next();
        }

        try {
          // Read request body stream
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          const rawBody = Buffer.concat(chunks).toString('utf-8');

          let parsedBody = {};
          if (rawBody) {
            try {
              parsedBody = JSON.parse(rawBody);
            } catch {
              parsedBody = rawBody;
            }
          }
          req.body = parsedBody;

          // Provide res.status and res.json helpers to match Vercel Serverless Function response interface
          res.status = function (statusCode) {
            res.statusCode = statusCode;
            return res;
          };
          res.json = function (data) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return res;
          };

          // Dynamically import handler
          const contactModule = await import('./api/contact.js');
          const handler = contactModule.default;
          await handler(req, res);
        } catch (err) {
          console.error('[Vite Dev API Error]', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'server_error', message: err?.message || 'Server error' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.RESEND_API_KEY && !process.env.RESEND_API_KEY) {
    process.env.RESEND_API_KEY = env.RESEND_API_KEY;
  }
  if (env.CONTACT_TO_EMAIL && !process.env.CONTACT_TO_EMAIL) {
    process.env.CONTACT_TO_EMAIL = env.CONTACT_TO_EMAIL;
  }

  return {
    plugins: [react(), tailwindcss(), apiContactPlugin()],
    server: {
      watch: {
        ignored: [
          '**/canva_extracted/**',
          '**/*_extracted/**',
          '**/temp_assets/**',
          '**/temp_*/**',
          '**/__MACOSX/**',
          '**/*.zip',
          '**/.git/**',
        ],
      },
    },
  };
});
