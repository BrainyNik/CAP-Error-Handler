/**
 * @function extractRequestMeta
 * @description
 * Extracts standardized request metadata from a CAP request object.
 * This metadata is commonly used for:
 *   - Error normalization
 *   - Email notifications
 *   - Database error logging
 *   - Monitoring / auditing
 *
 * The structure is consistent with CustomError.internal.
 *
 * @param {Object} req
 *   CAP request object.
 *
 * @returns {Object}
 *   A metadata object containing event, user, input data, URL, headers, and
 *   other request diagnostics.
 *
 * @example
 * const meta = extractRequestMeta(req);
 * console.log(meta.originalUrl, meta.user);
 */
module.exports = function extractRequestMeta(req) {
    return {
        data: req.data,
        event: req.event,
        user: req.user,
        target: req.target?.name,
        method: req._?.req?.method || "",
        originalUrl: req._?.req?.originalUrl || "",
        headers: req.headers
    };
};
