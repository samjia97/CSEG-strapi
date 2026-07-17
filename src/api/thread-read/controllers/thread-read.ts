import { factories } from '@strapi/strapi';

const THREAD_UID = 'api::forum-thread.forum-thread';
const COMMENT_UID = 'plugin::comments.comment';
const RELATION_PREFIX = `${THREAD_UID}:`; // comments store related as "<uid>:<id>"

/**
 * Per-user forum read tracking. Every action is scoped to ctx.state.user —
 * a user can only ever read or write their own rows (never trusted from input).
 * Exposed via a custom router (mark + status only); no default CRUD.
 */
export default factories.createCoreController('api::thread-read.thread-read', ({ strapi }) => ({
  // POST /thread-reads/mark   body: { threadDocumentId }
  async mark(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const threadDocumentId = ctx.params?.threadDocumentId;
    if (typeof threadDocumentId !== 'string' || !threadDocumentId) {
      return ctx.badRequest('threadDocumentId is required.');
    }

    try {
      const now = new Date();
      const existing = await strapi.documents('api::thread-read.thread-read').findMany({
        filters: { user: { id: user.id }, threadDocumentId },
        limit: 1,
      });
      if (existing.length > 0) {
        await strapi.documents('api::thread-read.thread-read').update({
          documentId: existing[0].documentId,
          data: { lastReadAt: now },
        });
      } else {
        await strapi.documents('api::thread-read.thread-read').create({
          data: { user: user.id, threadDocumentId, lastReadAt: now },
        });
      }
      return { ok: true };
    } catch (err) {
      strapi.log.error('[thread-read.mark] failed:', err);
      // Surface as 500 with the real message (distinct from the 400 above) so
      // the cause is visible if this still fails.
      return ctx.throw(500, (err as Error)?.message ?? 'Failed to mark read.');
    }
  },

  // GET /thread-reads/status
  // → { reads: { [threadDocumentId]: lastReadAtISO },
  //     lastReplies: { [threadDocumentId]: latestVisibleReplyISO } }
  async status(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    // 1. This user's read marks.
    const rows = await strapi.db.query('api::thread-read.thread-read').findMany({
      where: { user: { id: user.id } },
      select: ['threadDocumentId', 'lastReadAt'],
    });
    const reads: Record<string, string> = {};
    for (const r of rows) {
      if (r.threadDocumentId && r.lastReadAt) {
        reads[r.threadDocumentId] = new Date(r.lastReadAt).toISOString();
      }
    }

    // 2. Latest visible reply per thread. We filter blocked/removed in JS on
    //    purpose: `$ne: true` in SQL drops NULL rows, and blocked/removed default
    //    to NULL (= not blocked), which would wrongly exclude most comments.
    const comments = await strapi.db.query(COMMENT_UID).findMany({
      where: { related: { $startsWith: RELATION_PREFIX } },
      select: ['related', 'createdAt', 'blocked', 'blockedThread', 'removed'],
    });
    const lastReplies: Record<string, string> = {};
    for (const c of comments) {
      if (c.blocked === true || c.blockedThread === true || c.removed === true) continue;
      if (!c.related || !c.createdAt) continue;
      const key = String(c.related).slice(RELATION_PREFIX.length); // thread id/documentId
      const iso = new Date(c.createdAt).toISOString();
      if (!lastReplies[key] || iso > lastReplies[key]) lastReplies[key] = iso;
    }

    return { reads, lastReplies };
  },
}));
