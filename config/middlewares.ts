module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            '*.trycloudflare.com',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            '*.trycloudflare.com',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: (ctx) => {
        const origin = ctx.request.header.origin;

        // Check if origin matches your Vercel pattern
        // localhost:3000 for local debugging
        // yammer.inf.ed.ac.uk:3000 for deployment on Dice
        if (
            origin === 'http://localhost:3000' ||
            origin === 'http://yammer.inf.ed.ac.uk:3000' ||
            (origin && origin.match(/^https:\/\/cseg-frontend.*\.vercel\.app$/))
        ) {
          return origin; // Allow this origin
        }

        return ''; // Deny CORS
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];