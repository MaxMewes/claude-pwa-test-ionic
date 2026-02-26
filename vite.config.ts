/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isApkBuild = mode === 'production'
  const buildTimestamp = Date.now()

  return {
    define: {
      __BUILD_TIMESTAMP__: buildTimestamp,
    },
    build: {
      rollupOptions: {
        output: isApkBuild
          ? {
              // Cache busting for APK build: Content hashes + timestamp in filenames
              entryFileNames: `assets/[name]-[hash]-${buildTimestamp}.js`,
              chunkFileNames: `assets/[name]-[hash]-${buildTimestamp}.js`,
              assetFileNames: `assets/[name]-[hash]-${buildTimestamp}.[ext]`,
            }
          : {},
      },
    },
    server: {
      port: parseInt(env.VITE_PORT) || 3000,
      headers: {
        // Security headers for development server
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(self), microphone=(), geolocation=(self), payment=()',
        // Development CSP - allows unsafe-inline/unsafe-eval for Vite HMR
        // Note: Ionic Web Components require 'unsafe-inline' for style-src even in production
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://dev.labgate.net https://*.labgate.net https://*.vireq.com wss: ws: http://localhost:*; media-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
      },
      proxy: {
        // Proxy API requests to avoid CORS issues during development
        '/api/v3': {
          target: env.VITE_API_URL || 'https://dev.labgate.net',
          changeOrigin: true,
          secure: true,
        },
        // labGate API V2 endpoints (authentication)
        '/Api/V2': {
          target: env.VITE_API_URL || 'https://dev.labgate.net',
          changeOrigin: true,
          secure: true,
        },
      },
    },
    preview: {
      port: parseInt(env.VITE_PORT) || 3000,
      headers: {
        // Production-grade security headers for vite preview
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(self), microphone=(), geolocation=(self), payment=()',
        // Production CSP - no unsafe-eval for scripts
        // Note: Ionic Web Components require 'unsafe-inline' for style-src (framework limitation)
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://dev.labgate.net https://*.labgate.net https://*.vireq.com wss:; media-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests",
      },
    },
    plugins: [
      react(),
      legacy(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'labGate - Medizinische Laborbefunde',
          short_name: 'labGate',
          description: 'Ihre Laborbefunde sicher und einfach auf dem Smartphone',
          theme_color: '#0066CC',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MiB - increased for legacy bundle
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\.labgate\.de\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24, // 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      exclude: ['node_modules', 'e2e/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: [
          'src/shared/**/*.{ts,tsx}',
          'src/features/**/store/**/*.{ts,tsx}',
          'src/features/**/hooks/**/*.{ts,tsx}',
          'src/config/**/*.{ts,tsx}',
        ],
        exclude: [
          'node_modules/',
          'src/setupTests.ts',
          '**/*.d.ts',
          '**/*.test.{ts,tsx}',
          '**/types/**',
          '**/mocks/**',
          '**/test/**',
          'src/main.tsx',
          'src/vite-env.d.ts',
          '**/index.ts',
        ],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
  }
})
