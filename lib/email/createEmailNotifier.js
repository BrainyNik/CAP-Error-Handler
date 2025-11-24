const buildErrorEmailBody = require("./templates/buildErrorEmailBody");

/**
 * Higher-Order Email Notifier
 *
 * @param {Function} sendEmailFn - User-provided function that actually sends the email.
 * @param {Function} emailBodyBuilderFn - Optional custom body builder.
 * @param {Array<string>} TO - Global TO recipients for this project/client.
 * @param {Array<string>} CC - Global CC recipients.
 */
function createEmailNotifier({ sendEmailFn, emailBodyBuilderFn, TO = [], CC = [] }) {

    return async function notifyError({ env, error }) {

        if (!sendEmailFn) return; // email is optional per project

        // 1. Build email body (fallback to default template)
        const body = emailBodyBuilderFn
            ? emailBodyBuilderFn({ env, error, internal: error.internal })
            : buildErrorEmailBody({ env, error, internal: error.internal });

        // 2. Build email payload
        const emailPayload = {
            subject: `Exception occurred in ${env}`,
            body,
            to: TO,
            cc: CC
        };

        // 3. Send using user-defined email implementation
        if (emailPayload.to?.length > 0) {
            await sendEmailFn(emailPayload);
        }
    };
}

module.exports = { createEmailNotifier };
