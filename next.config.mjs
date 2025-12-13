// next.config.mjs
import bundleAnalyzer from '@next/bundle-analyzer';
import withPWA from 'next-pwa';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
});

const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // Images - specific pattern matched first
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Fonts - specific pattern matched second
    {
      urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    // API routes - specific pattern matched third
    {
      urlPattern: /^\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
        networkTimeoutSeconds: 10,
      },
    },
    // Generic catch-all - matched last (narrowed to same-origin only)
    {
      urlPattern: ({ url }) => url.origin === self.location.origin,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
});

export default () => {
  /**
   * @type {import('next').NextConfig}
   */
  const nextConfig = {
    turbopack: {
    },

    compiler: {
      removeConsole: process.env.NODE_ENV === 'production',
    },

    async headers() {
      return [
        {
          
          source: '/:path*',
          headers: [
            {
              /**
               * X-Content-Type-Options: nosniff
               * 
               * What it does:
               * - Prevents browsers from "MIME-sniffing" (guessing file types)
               * - Forces browser to respect the Content-Type header sent by server
               * 
               * How MIME-sniffing attacks work:
               * 1. Attacker uploads a file disguised as an image (e.g., malicious.jpg)
               * 2. File actually contains JavaScript code
               * 3. Without this header, browser might detect JS and execute it
               * 4. With this header, browser treats it strictly as an image (safe)
               * 
               * Example scenario:
               * - User uploads avatar image to your app
               * - Attacker uploads malicious SVG with embedded JavaScript
               * - Without nosniff: Browser executes the JS (XSS attack)
               * - With nosniff: Browser refuses to execute it
               * 
               * Cookie security relation:
               * - Prevents attackers from stealing cookies via XSS
               * - Works alongside HttpOnly cookie attribute
               * - Part of defense-in-depth strategy
               * 
               * Browser support: All modern browsers (Chrome, Firefox, Safari, Edge)
               * 
               * Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
               */
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN',
            },
            
            
          ],
        },
      ];
    },
    

  };

  return withBundleAnalyzer(pwaConfig(nextConfig));
};
