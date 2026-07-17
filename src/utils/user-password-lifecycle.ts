import type {Core} from '@strapi/strapi';


export const registerPasswordResetLifecycle = (strapi: Core.Strapi) => {
  strapi.db.lifecycles.subscribe({
    models: ['plugin::users-permissions.user'],
    beforeUpdate(event) {
      const {data} = event.params;
      if (data && typeof data.password === 'string' && data.mustResetPassword === undefined) {
        data.mustResetPassword = false;
      }
    },
  });
};
