import { factories } from '@strapi/strapi';

const LABEL_MAX = 30;   // matches label.labelName maxLength
const LABEL_LIMIT = 5;  // max labels per blog

export default factories.createCoreController('api::blog.blog', ({ strapi }) => ({
  async create(ctx) {
    const data = ctx.request.body?.data ?? {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let common: any;
    try {
      common = strapi.plugin('comments')?.service('common');
    } catch {
      common = undefined;
    }

    if (common && typeof common.checkBadWords === 'function') {
      try {
        await common.checkBadWords(data.title);
        await common.checkBadWords(data.body);
        if (data.abstract) await common.checkBadWords(data.abstract);
      } catch {
        return ctx.badRequest('Bad language detected. Please check your post.');
      }
    }

    // Relations are attached AFTER create via the document service (below), so they do
    // not go through the authenticated content-API create as backend would reject them
    // unless the caller's role can read Topics/Labels. Pull blog_tags out of the payload.
    const blogTagIds: string[] = Array.isArray(data.blog_tags) ? data.blog_tags : [];
    delete data.blog_tags;

    // Cover image is uploaded separately by the member; attach it after create (below).
    // Media attaches by numeric file id, not documentId.
    const coverImageId = ctx.request.body?.coverImageId;

    const labelIds: string[] = [];
    const rawLabels = ctx.request.body?.labelNames;
    if (Array.isArray(rawLabels) && rawLabels.length > 0) {
      const names: string[] = [];
      const seen = new Set<string>();
      for (const item of rawLabels) {
        if (typeof item !== 'string') continue;
        const name = item.trim();
        if (!name || name.length > LABEL_MAX) continue;
        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        names.push(name);
        if (names.length >= LABEL_LIMIT) break;
      }
      // Screen each label for bad language (reuses the same Comments check).
      if (common && typeof common.checkBadWords === 'function') {
        try {
          for (const name of names) await common.checkBadWords(name);
        } catch {
          return ctx.badRequest('Bad language detected in a label. Please revise it.');
        }
      }
      // Reuse an existing label (case-insensitive) or create it.
      for (const name of names) {
        const existing = await strapi.documents('api::label.label').findMany({
          filters: { labelName: { $eqi: name } }, fields: ['labelName'], limit: 1,
        });
        if (existing?.[0]?.documentId) { labelIds.push(existing[0].documentId); continue; }
        const created = await strapi.documents('api::label.label').create({ data: { labelName: name } });
        if (created?.documentId) labelIds.push(created.documentId);
      }
    }

    // Create with scalar fields only — this is the authenticated content-API call.
    ctx.request.body.data = data;
    const response = await super.create(ctx);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const documentId = (response as any)?.data?.documentId;
    if (documentId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const relationData: any = {};
      if (blogTagIds.length > 0) relationData.blog_tags = blogTagIds;
      if (labelIds.length > 0) relationData.labels = labelIds;
      if (coverImageId) relationData.coverImage = coverImageId;
      if (Object.keys(relationData).length > 0) {
        try {
          await strapi.documents('api::blog.blog').update({ documentId, data: relationData });
        } catch (error) {
          strapi.log.error('Blog create: failed to attach relations', error);
        }
      }

      // Force the freshly created blog to be a draft (pending moderation).
      try {
        await strapi.documents('api::blog.blog').unpublish({ documentId });
      } catch {
        // Already a draft (or unpublish unavailable) — safe to ignore.
      }
    }

    return response;
  },
}));
