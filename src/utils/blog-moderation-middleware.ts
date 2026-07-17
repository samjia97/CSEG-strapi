// escapeHTML helper: sanitises user text before it goes into HTML emails.
import { escapeHTML } from "./helper-functions";

// documentIds we are currently mutating ourselves and skip moderation for these.
const inFlight = new Set<string>();

// Email the blog's author the moderation outcome (published, or the feedback).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function notifyAuthor(documentId: string, decision: 'approved' | 'rejected', data: any) {
  // Load the fields needed for the email (author, title, feedback).
  const blog = await strapi.documents('api::blog.blog').findOne({
    documentId,
    fields: ['title', 'authorName', 'authorEmail', 'feedback'],
  });

  // Work out who to email; if there's no address, just log and stop.
  const to = data?.authorEmail ?? blog?.authorEmail;
  strapi.log.info(`[blog-moderation] notify ${decision} doc=${documentId} to=${to ?? 'NONE'}`);
  if (!to) {
    strapi.log.warn(`Blog moderation: ${documentId} → ${decision} but no author email; skipping notification`);
    return;
  }

  // Escape the name/title so they're safe inside the HTML body.
  const name = escapeHTML(blog?.authorName) || 'there';
  const title = escapeHTML(blog?.title) || 'your blog';

  // Build the subject + body: a "published" note, or the feedback on rejection.
  let subject: string;
  let html: string;
  if (decision === 'approved') {
    subject = 'Your blog has been published';
    html = `Hi ${name},

Thank you for submitting your blog "${title}". After review, it is now published on the CSEG website.

Thank you for contributing!

Regards,
CSEG Team`;
  } else {
    const feedback = escapeHTML(data?.feedback ?? blog?.feedback) || '(no additional feedback was provided)';
    subject = 'Your blog submission needs some changes';
    html = `Hi ${name},

Thank you for submitting your blog "${title}". After review, it won't be published now.

Here's the suggestion from our team:
${feedback}

You're welcome to revise it and submit again.

Regards,
CSEG Team`;
  }

  // Send the email via the configured provider (newlines become <br/>).
  await strapi.plugin('email').service('email').send({
    to,
    subject,
    html: html.replace(/\r\n|\r|\n/g, '<br/>'),
  });
  strapi.log.info(`[blog-moderation] email sent (${decision}) to ${to}`);
}

// Document-service middleware that runs the blog moderation workflow.
export const blogModerationMiddleware = () => {
  return async (context, next) => {
    // Ignore anything that isn't a blog operation.
    if (context.uid !== 'api::blog.blog') {
      return next();
    }

    // Only react to update/publish on one document; let everything else pass.
    const action = context.action;
    const documentId = context.params?.documentId;
    if (!documentId || (action !== 'update' && action !== 'publish')) {
      return next();
    }

    // Our own internal publish/update/unpublish calls — pass through untouched.
    if (inFlight.has(documentId)) {
      return next();
    }

    // The fields being written by this operation.
    const data = context.params?.data ?? {};

    // Read the current status so we only notify on a real transition.
    let prevStatus: string | undefined;
    try {
      const existing = await strapi.documents('api::blog.blog').findOne({
        documentId,
        fields: ['moderationStatus'],
      });
      prevStatus = existing?.moderationStatus;
    } catch (error) {
      strapi.log.error('Blog moderation: failed to read previous status', error);
    }

    // --- Rejection: email the author the feedback, then remove the draft ---
    if (action === 'update' && data.moderationStatus === 'rejected' && prevStatus !== 'rejected') {
      const result = await next();
      inFlight.add(documentId);
      try {
        // Email first — we must read authorEmail/feedback before deleting.
        await notifyAuthor(documentId, 'rejected', data);
        // Delete the rejected draft so nothing is left behind.
        try {
          await strapi.documents('api::blog.blog').delete({ documentId });
        } catch (error) {
          strapi.log.error('Blog moderation: delete after reject failed', error);
        }
      } catch (error) {
        strapi.log.error('Blog moderation: rejection handling failed', error);
      } finally {
        inFlight.delete(documentId);
      }
      return result;
    }

    // Approval: triggered by status→approved, or by the native Publish button.
    const approveViaUpdate =
      action === 'update' && data.moderationStatus === 'approved' && prevStatus !== 'approved';
    const approveViaPublish = action === 'publish' && prevStatus !== 'approved';

    if (approveViaUpdate || approveViaPublish) {
      const result = await next();
      inFlight.add(documentId);
      try {
        // Converge on approved + published regardless of which path got us here.
        try {
          await strapi.documents('api::blog.blog').update({
            documentId,
            data: { moderationStatus: 'approved' },
          });
          await strapi.documents('api::blog.blog').publish({ documentId });
        } catch (error) {
          strapi.log.error('Blog moderation: approve/publish failed', error);
        }
        // Tell the author their blog is now live.
        await notifyAuthor(documentId, 'approved', data);
      } catch (error) {
        strapi.log.error('Blog moderation: approval handling failed', error);
      } finally {
        inFlight.delete(documentId);
      }
      return result;
    }

    // No moderation trigger matched — let the operation proceed normally.
    return next();
  };
};
