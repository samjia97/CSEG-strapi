import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { KeywordIcon } from './keyword-icon';

export default {
  register(app: any) {
    app.addMenuLink({
      // Reuse the custom content manager to list/edit/delete blog keywords (labels).
      to: `plugins/custom-content-manager3/collection-types/api::label.label`,
      icon: KeywordIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: 'Blog Keywords',
      },
      // Only roles that can read the Label collection (Organiser once granted, and
      // Super Admin who bypasses checks) see this link.
      permissions: [
        { action: 'plugin::content-manager.explorer.read', subject: 'api::label.label' },
      ],
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);
          return { data, locale };
        } catch {
          // Try base language (e.g., "en" for "en-GB")
          try {
            const baseLocale = locale.split('-')[0];
            const { default: data } = await import(`./translations/${baseLocale}.json`);
            return { data, locale };
          } catch {
            return { data: {}, locale };
          }
        }
      })
    );
  },
};
