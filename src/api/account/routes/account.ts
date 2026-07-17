export default {
  routes: [
    {
      method: 'PUT',
      path: '/account/profile',
      handler: 'account.updateProfile',
      config: { auth: false },
    },
  ],
};
