export default {
  async beforeCreate(event: any) {
    const { data } = event.params;
    if (data.author) return;

    const ctx = strapi.requestContext.get();
    const user = ctx?.state?.user;

    if (user) {
      const fullName = [user.firstname, user.lastname]
        .filter(Boolean)
        .join(' ')
        .trim();
      data.author = fullName || user.email || 'Unknown';
    }
  },
};
