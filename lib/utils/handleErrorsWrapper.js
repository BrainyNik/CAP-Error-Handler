const normalizeError = require("../core/normalizeError");

/**
 * @function handleErrors
 * @description
 * Higher-Order Function (HOF) that wraps a CAP handler inside a standardized
 * try–catch layer. It centralizes:
 *
 *  - Error normalization via the enterprise error-service
 *  - Optional email alerting through a provided notifier
 *  - Optional persistent logging into a HANA table
 *  - CAP-compliant error response formatting
 *
 * This wrapper ensures consistent enterprise error behavior across all CAP
 * service handlers without duplicating try–catch logic.
 *
 * @param {Function} fn
 *   The original CAP handler function (e.g., for this.on() or this.before()).
 *
 * @param {Object} [options]
 *   Optional configuration parameters.
 *
 * @param {Function} [options.notify]
 *   Function returned by createEmailNotifier(). If provided, an email alert is
 *   sent before logging the error.
 *
 * @param {Object} [options.cds]
 *   CAP cds instance, required only when database logging is desired.
 *
 * @param {string} [options.tableName]
 *   HANA table name for error persistence (e.g., "ERRORLOGS").
 *
 * @param {string} [options.module]
 *   Logical module name used during normalization (e.g., "DSM", "Billing").
 *
 * @param {string} [options.env]
 *   Deployment environment identifier (DEV, QA, PROD), passed to email templates.
 *
 * @returns {Function}
 *   A wrapped async handler function with centralized error interception.
 *
 * @example
 * const handleErrors = require("@yourorg/error-service/lib/utils/handleErrors");
 *
 * this.on(
 *   "test",
 *   handleErrors(async req => {
 *     let x = y.z;       // throws → normalized + emailed + logged
 *   }, {
 *     notify,
 *     cds,
 *     tableName: "ERRORLOGS",
 *     module: "DSM",
 *     env: process.env.NODE_ENV
 *   })
 * );
 */
module.exports = function handleErrors(fn, options = {}) {

    const { notify, cds, tableName, module, env } = options;

    return async function (req) {
        try {
            return await fn(req);

        } catch (err) {

            const normalized = normalizeError({
                err,
                module,
                req
            });



            // Optional DB logging
            if (cds && tableName) {
                await normalized.logError({
                    cds,
                    tableName
                });
            }

            // Optional notifier
            if (notify) {
                await notify({
                    env: env || "",
                    error: normalized
                });
            }

            // CAP-compliant error response
            req.error(normalized.toCdsError());
        }
    };
};
