const CustomError = require("../core/CustomError");

/**
 * @class AuthorizationError
 * @extends CustomError
 * @description
 * Represents authorization failures such as missing roles, invalid privileges,
 * or forbidden access to protected resources. Defaults to HTTP 401 but may be
 * set to 403 depending on the scenario. Supports structured metadata for API clients.
 *
 * @typedef {Object} AuthorizationErrorParams
 * @property {string} [message]               - Authorization failure message.
 * @property {number} [status=401]            - HTTP status code (401 or 403).
 * @property {string} [module]                - Logical module where the failure occurred.
 * @property {Object} [req]                   - CAP request object for context logging.
 * @property {any} [internal]                 - Internal debugging metadata or original error.
 * @property {Array<Object>} [details]        - List of sub-errors describing specific authorization issues.
 * @property {string} [details[].message]     - Description of the specific permission failure.
 * @property {string} [details[].target]      - Resource or permission that failed.
 * @property {string} [details[].code]        - Sub-error code (optional).
 * @property {string} [target]                - Primary permission/resource violated.
 *
 * @param {AuthorizationErrorParams} params
 */
class AuthorizationError extends CustomError {
    constructor({ message, status, module, req, internal, code, details, target } = {}) {
        super({
            message: message || "You are not authorized to perform this action",
            status: status || 401,
            module,
            code: code || "AUTHORIZATION_ERR",
            internal,
            req,
            details,
            target
        });
    }
}

module.exports = AuthorizationError;
