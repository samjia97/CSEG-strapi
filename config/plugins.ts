export default ({env}) => ({
  'users-permissions': {
    config: {
      // Enforce the password policy server-side too (change-password /
      // reset-password endpoints), so it holds even if the frontend is bypassed.
      // Mirrors the frontend rule in CSEG-frontend/lib/password.ts.
      validationRules: {
        validatePassword(password: string) {
          const ok =
            typeof password === 'string' &&
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[^A-Za-z0-9]/.test(password);
          if (!ok) {
            throw new Error(
              'Password must be at least 8 characters and include an uppercase letter, a lowercase letter and a special symbol.'
            );
          }
          return true;
        },
      },
    },
  },
  upload: {
    config: {
      sizeLimit: 5 * 1024 * 1024, // 5 MB per file
    },
  },
  email: {
    config: {
      provider: '@strapi/provider-email-nodemailer',
      providerOptions: {
        // not working now, use your own email instead
        host: 'smtp.gmail.com',
        port: 587,
        secure: true,
        auth: {
          // not working now, use your own email instead
          user: 'noreply.cseg@gmail.com',
          // SMTP credentials
          pass: env('GMAIL_APP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: 'noreply.cseg@gmail.com',
      },
    },
  },
  comments: {
    enabled: true,
    config: {
      badWords: true,
      moderatorRoles: ['Authenticated'],
      enabledCollections: ['api::forum-thread.forum-thread', 'api::blog.blog'],
      blockedAuthorProps: ['email'],
    },
  },

  'custom-content-manager3': {
    enabled: true,
    resolve: './src/plugins/custom-content-manager3',
  },

  'membership-list':{
    enabled: true,
    resolve: './src/plugins/membership-list',
  },
  'user-accounts-plugin':{
    enabled: true,
    resolve: './src/plugins/user-accounts-plugin',
  },
  'tester-plugin':{
    enabled: false,
    resolve: './src/plugins/tester-plugin',
  },
  'shared':{
    enabled: false,
  },
  'events-plugin':{
    enabled: true,
    resolve: './src/plugins/events-plugin'
  },
  'publication-plugin':{
    enabled: true,
    resolve: './src/plugins/publication-plugin'
  },
  'member-application-plugin':{
    enabled: true,
    resolve: './src/plugins/member-application-plugin'
  },
  'contact-plugin':{
    enabled: true,
    resolve: './src/plugins/contact-plugin'
  },
  'documentation-viewer':{
    enabled: true,
    resolve: './src/plugins/documentation-viewer'
  },
  'research-plugin':{
    enabled: true,
    resolve: './src/plugins/research-plugin'
  },
  'news-plugin':{
    enabled: true,
    resolve: './src/plugins/news-plugin'
  },
  'forum-plugin':{
    enabled: true,
    resolve: './src/plugins/forum-plugin'
  },
  'blog-plugin':{
    enabled: true,
    resolve: './src/plugins/blog-plugin'
  },
  'keyword-list':{
    enabled: true,
    resolve: './src/plugins/keyword-list'
  }
});
