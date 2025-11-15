const CustomError = require("../core/CustomError");

/**
 * @class ValidationError
 * @extends CustomError
 * @description
 * Represents input validation errors such as missing fields, invalid formats, or schema violations.
 * Typically returns HTTP 400. Can carry internal details for logging and debugging.
 * 
 * @param {Object} options
 * @param {string} options.message - Custom error message describing the validation failure.
 * @param {number} [options.status=400] - HTTP status code.
 * @param {string} [options.module] - Optional module/domain where the error occurred.
 * @param {any} [options.internal] - Optional internal details or original error object for logging/debugging.
 * @param {Object} params.req - CAP request object (optional)
 
 */
class ValidationError extends CustomError {
    constructor({ message, status, module, internal, req } = {}) {
        super({
            message,
            status: status || 400,
            code: "VALIDATION_ERR",
            module,
            internal: internal || "Internal",
            req
        });
    }
}

module.exports = ValidationError;
