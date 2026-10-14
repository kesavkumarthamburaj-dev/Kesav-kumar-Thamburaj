import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import path from 'path';
import { pathToFileURL } from 'url';

function apiRoutesPlugin() {
  return {
    name: 'vite-plugin-api-routes',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];
        const routeMap = {
          '/api/contact': './api/contact.js',
          '/api/visit': './api/visit.js',
          '/api/visit-delete': './api/visit-delete.js',
          '/api/admin-visitors': './api/admin-visitors.js',
        };

        const moduleRelative = routeMap[url];
        if (!moduleRelative) {
          return next();
        }

        try {
          // Parse query string for req.query
          const queryString = req.url?.split('?')[1] || '';
          const urlParams = new URLSearchParams(queryString);
          req.query = Object.fromEntries(urlParams.entries());

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

          // Dynamically import handler using absolute file URL
          const absolutePath = path.resolve(process.cwd(), moduleRelative);
          const fileUrl = pathToFileURL(absolutePath).href;
          const apiModule = await import(fileUrl);
          const handler = apiModule.default;
          await handler(req, res);
        } catch (err) {
          console.error(`[Vite Dev API Error: ${url}]`, err);
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
  if (env.KV_REST_API_URL && !process.env.KV_REST_API_URL) {
    process.env.KV_REST_API_URL = env.KV_REST_API_URL;
  }
  if (env.KV_REST_API_TOKEN && !process.env.KV_REST_API_TOKEN) {
    process.env.KV_REST_API_TOKEN = env.KV_REST_API_TOKEN;
  }
  if (env.UPSTASH_REDIS_REST_URL && !process.env.UPSTASH_REDIS_REST_URL) {
    process.env.UPSTASH_REDIS_REST_URL = env.UPSTASH_REDIS_REST_URL;
  }
  if (env.UPSTASH_REDIS_REST_TOKEN && !process.env.UPSTASH_REDIS_REST_TOKEN) {
    process.env.UPSTASH_REDIS_REST_TOKEN = env.UPSTASH_REDIS_REST_TOKEN;
  }
  if (env.ADMIN_KEY && !process.env.ADMIN_KEY) {
    process.env.ADMIN_KEY = env.ADMIN_KEY;
  }
  if (env.USE_MOCK_REDIS && !process.env.USE_MOCK_REDIS) {
    process.env.USE_MOCK_REDIS = env.USE_MOCK_REDIS;
  }

  return {
    plugins: [react(), tailwindcss(), apiRoutesPlugin()],
    server: {
      watch: {
        ignored: [
          /[\\/]\.chrome.*[\\/]/,
          /[\\/]scratch[\\/]/,
          /[\\/]temp_.*[\\/]/,
          /[\\/].*_extracted[\\/]/,
          '**/.chrome*/**',
          '**/scratch/**',
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
