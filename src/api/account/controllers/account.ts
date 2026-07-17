/**
 * Let a logged-in member edit their own profile: the display name (the account
 * `username`, shown as the author across blogs, the forum and comments) and a
 * short self-description they can reuse on their blogs. Login is still by email.
 */
export default {
  async updateProfile(ctx: any) {
    const authHeader = ctx.request.header.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ctx.unauthorized();
    }
    const token = authHeader.slice(7);

    let payload: any;
    try {
      payload = await strapi.plugin('users-permissions').service('jwt').verify(token);
    } catch {
      return ctx.unauthorized();
    }
    const userId = payload?.id;
    if (!userId) return ctx.unauthorized();

    const body = ctx.request.body ?? {};
    const data: Record<string, unknown> = {};

    // Display name (username) — validate + enforce uniqueness.
    if (body.name !== undefined) {
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (name.length < 3) return ctx.badRequest('Name must be at least 3 characters.');
      if (name.length > 100) return ctx.badRequest('Name must be 100 characters or fewer.');

      const clash = await strapi
        .query('plugin::users-permissions.user')
        .findOne({ where: { username: name } });
      if (clash && clash.id !== userId) {
        return ctx.badRequest('That name is already taken. Please choose another.');
      }
      data.username = name;
    }

    // Self-description — optional, may be cleared by sending an empty string.
    if (body.description !== undefined) {
      const description = typeof body.description === 'string' ? body.description.trim() : '';
      if (description.length > 500) {
        return ctx.badRequest('Description must be 500 characters or fewer.');
      }
      data.description = description;
    }

    if (Object.keys(data).length === 0) {
      return ctx.badRequest('Nothing to update.');
    }

    try {
      await strapi.plugin('users-permissions').service('user').edit(userId, data);
    } catch (error) {
      strapi.log.error('Failed to update account profile:', error);
      return ctx.badRequest('Could not update your profile. Please try again.');
    }

    return ctx.send({
      name: data.username ?? undefined,
      description: data.description ?? undefined,
    });
  },
};
