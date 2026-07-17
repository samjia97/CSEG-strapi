import { factories } from '@strapi/strapi';

/**
 * forum-thread content-API controller.
 */
export default factories.createCoreController('api::forum-thread.forum-thread', ({ strapi }) => ({
  async create(ctx) {
    const data = ctx.request.body?.data ?? {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let common: any;
    try {
      common = strapi.plugin('comments')?.service('common');
    } catch {
      common = undefined;
    }

    // Reuse Comments bad word check when creating new thread.
    if (common && typeof common.checkBadWords === 'function') {
      try {
        await common.checkBadWords(data.title);
        await common.checkBadWords(data.body);
      } catch {
        return ctx.badRequest('Bad language detected. Please check your post.');
      }
    }

    const forumTagIds: string[] = Array.isArray(data.forum_tags) ? data.forum_tags : [];
    delete data.forum_tags;
    ctx.request.body.data = data;

    const response = await super.create(ctx);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const documentId = (response as any)?.data?.documentId;
    if (documentId && forumTagIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const relationData: any = { forum_tags: forumTagIds };
      try {
        await strapi.documents('api::forum-thread.forum-thread').update({ documentId, data: relationData });
      } catch (error) {
        strapi.log.error('Forum thread create: failed to attach topics', error);
      }
    }

    // Mark the author's own new thread as read, so it doesn't show as unread to them.
    const userId = ctx.state.user?.id;
    if (documentId && userId) {
      try {
        await strapi.documents('api::thread-read.thread-read').create({
          data: { user: userId, threadDocumentId: documentId, lastReadAt: new Date() },
        });
      } catch (error) {
        strapi.log.error('Forum thread create: failed to mark author read', error);
      }
    }

    return response;
  },
}));
