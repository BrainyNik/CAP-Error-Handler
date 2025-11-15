const CustomError = require("../core/CustomError");

/**
 * @class AuthorizationError
 * @extends CustomError
 * @description
 * Represents an authorization failure, such as missing permissions or forbidden access.
 * Typically returns HTTP 401 or 403. Can carry internal details for logging.
 * 
 * @param {Object} options
 * @param {string} [options.message] - Custom error message (default: "You are not authorized to perform this action").
 * @param {number} [options.status=401] - HTTP status code for the error.
 * @param {string} [options.module] - Optional module/domain where the error occurred.
 * @param {any} [options.internal] - Optional internal details or original error object for logging/debugging.
 * @param {Object} params.req - CAP request object (optional)
 */
class AuthorizationError extends CustomError {
    constructor({ message, status, module, internal, req } = {}) {
        super({
            message: message || "You are not authorized to perform this action",
            status: status || 401,
            module,
            internal: internal || "Internal",
            code: "AUTHORIZATION_ERR", req
        });
    }
}

module.exports = AuthorizationError;
