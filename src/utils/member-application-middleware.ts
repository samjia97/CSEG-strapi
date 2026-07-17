import {env, errors} from "@strapi/utils";
import {escapeHTML} from "./helper-functions";
import {randomBytes} from "node:crypto";

function generateTempPassword(): string {
  return randomBytes(12).toString("hex");
}

/**
 * The account's `username` is what's shown as the author across blogs, the forum
 * and comments, so we set it to the applicant's collected name. `username` is
 * unique + min length 3 in Strapi, so fall back to the email when the name is
 * too short and append a counter on the rare duplicate.
 */
async function buildUniqueUsername(name: string, email: string): Promise<string> {
  const base = name.trim().length >= 3 ? name.trim() : email;
  let candidate = base;
  let n = 1;
  while (
    await strapi.query('plugin::users-permissions.user').findOne({ where: { username: candidate } })
  ) {
    n += 1;
    candidate = `${base} ${n}`;
  }
  return candidate;
}

/**
 * Middleware to handle member application processing.
 * - On create: Sends email notification to administrators
 * - On update (when approved): Creates a login account + a new member record
 */
export const memberApplicationMiddleware = () => {
  const pageActions = ['create','update']
  return async (context, next) => {
    // Only process member applications
    if (!(context.uid === 'api::member-application.member-application' && pageActions.includes(context.action))) {
      return next();
    }

    const applicationData = context.params.data;

    let previousApplicationStatus: string | undefined;
    if (context.action === 'update' && context.params.documentId) {
      try {
        const existingApplication = await strapi.documents('api::member-application.member-application').findOne({
          documentId: context.params.documentId,
          fields: ['applicationStatus'],
        });
        previousApplicationStatus = existingApplication?.applicationStatus;
      } catch (error) {
        strapi.log.error('Failed to read existing member application before update:', error);
      }
    }

    const isApprovalUpdate =
      context.action === 'update' &&
      context.params.documentId &&
      applicationData.applicationStatus === 'approved' &&
      previousApplicationStatus !== 'approved';

    if (isApprovalUpdate) {
      // On approval the incoming update usually carries only applicationStatus,
      // so read the applicant's details from the stored record.
      const storedApplication = await strapi.documents('api::member-application.member-application').findOne({
        documentId: context.params.documentId,
        fields: ['email', 'fullName', 'preferredName'],
      });

      const candidateEmail = applicationData.email ?? storedApplication?.email;
      // preferredName is optional and is submitted as "" (not undefined) when the
      // applicant leaves it blank, so pick the first genuinely non-empty name
      // rather than relying on `??` (which only skips null/undefined).
      const candidateName =
        [
          applicationData.preferredName,
          storedApplication?.preferredName,
          applicationData.fullName,
          storedApplication?.fullName,
        ]
          .map((v) => (typeof v === 'string' ? v.trim() : ''))
          .find((v) => v.length > 0) ?? '';

      // Create a login account for the applicant, unless one already exists for this email.
      let tempPassword: string | undefined;
      let createdUserId: number | undefined;
      const existingUser = candidateEmail
        ? await strapi.query('plugin::users-permissions.user').findOne({ where: { email: candidateEmail } })
        : null;

      if (!existingUser && candidateEmail) {
        try {
          const defaultRole = await strapi
            .query('plugin::users-permissions.role')
            .findOne({ where: { type: 'authenticated' } });

          tempPassword = generateTempPassword();
          const username = await buildUniqueUsername(candidateName, candidateEmail);

          const createdUser = await strapi.plugin('users-permissions').service('user').add({
            username,
            email: candidateEmail,
            password: tempPassword,
            provider: 'local',
            confirmed: true,
            role: defaultRole?.id,
            mustResetPassword: true,
          });
          createdUserId = createdUser.id;
        } catch (error) {
          strapi.log.error('Failed to create login account for approved applicant:', error);
          throw new errors.ApplicationError('Member application was not approved because the login account could not be created.');
        }
      } else if (existingUser) {
        strapi.log.info(`Member application approval: account already exists for ${candidateEmail}, skipping creation.`);
      }

      try {
        const subject = `Welcome to CSEG`;
        const html = `Dear applicant,

          Congratulations! Your application to join CSEG has been approved.
          ${tempPassword ? `
          You can now log in to the CSEG website with:
          Email: ${escapeHTML(candidateEmail)}
          Temporary password: ${tempPassword}

          Please log in and change your password as soon as possible.
          ` : ''}
          Looking forward to see you at our next event.
          Regards,
          CSEG Organisers`;

        await strapi.plugin('email').service('email').send({
          to: candidateEmail,
          subject: subject,
          html: html.replace(/\r\n|\r|\n/g, "<br/>"),
        });
      } catch (error) {
        strapi.log.error('Failed to send member approval email. Aborting approval update:', error);
        // Roll back the account we just created — no email means no way for the applicant to get the password.
        if (createdUserId) {
          try {
            await strapi.plugin('users-permissions').service('user').remove({ id: createdUserId });
          } catch (cleanupError) {
            strapi.log.error('Failed to roll back login account after email failure:', cleanupError);
          }
        }
        throw new errors.ApplicationError('Member application was not approved because the confirmation email could not be sent.');
      }
    }

    // Execute the create/update operation
    const result = await next();

    // Handle new member approval after successful update.
    if (isApprovalUpdate) {
      try {
        const approvedApplication = await strapi.documents('api::member-application.member-application').findOne({
          documentId: context.params.documentId,
          populate: ['member_type'],
        });

        if (!approvedApplication) {
          strapi.log.warn(`Approved member application ${context.params.documentId} not found after update`);
          return result;
        }

        await strapi.documents('api::member.member').create({
          data: {
            fullName: approvedApplication.fullName,
            preferredName: approvedApplication.preferredName ?? '',
            affiliations: approvedApplication.affiliations ?? '',
            email: approvedApplication.email ?? '',
            aboutYou: approvedApplication.aboutYou ?? '',
            topics: approvedApplication.topics ?? '',
            member_type: approvedApplication.member_type ?? undefined,
          }
        });
      } catch (error) {
        strapi.log.error('Failed to create member from approved application:', error);
        // Keep the application update successful even if member/email side effects fail.
      }
    }

    // Handle new application - send notification email after creation
    if (context.action === 'create') {
      try {
        const subject = `CSEG Member application from ${escapeHTML(applicationData.fullName)}`;
        const html = `Dear administrator,

Kindly review this membership application:

fullname: ${escapeHTML(applicationData.fullName)}

Preferred name: ${escapeHTML(applicationData.preferredName)}

Affiliations: ${escapeHTML(applicationData.affiliations)}

Email: ${escapeHTML(applicationData.email)}

About you: ${escapeHTML(applicationData.aboutYou)}

Topics of interest: ${escapeHTML(applicationData.topics)}

Please login to the Strapi admin panel to approve or reject this application.

Regards,
CSEG Website System`;

        await strapi.plugin('email').service('email').send({
          to: env('MEMBER_APPLICATION_REVIEWER'),
          subject: subject,
          html: html.replace(/\r\n|\r|\n/g, "<br/>"),
        });
      } catch (error) {
        strapi.log.error('Failed to send member application notification email:', error);
      }
    }

    return result;
  };
};
