import {PLUGIN_ID} from './pluginId';
import {Initializer} from './components/Initializer';
import {PluginIcon} from './components/PluginIcon';

export default {
  register(app: any) {
    app.addMenuLink({
      to: `plugins/custom-content-manager3/collection-types/plugin::users-permissions.user`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: 'CSEG User accounts',
      },
      // Only admins who can read member accounts see this link.
      // So only Super Admin has this permission (and bypasses checks anyway)
      // Organiser should not see this link
      permissions: [
        { action: 'plugin::content-manager.explorer.read', subject: 'plugin::users-permissions.user' },
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
