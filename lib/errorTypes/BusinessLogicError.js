const CustomError = require("../core/CustomError");

/**
 * @class BusinessLogicError
 * @extends CustomError
 * @description
 * Represents a business rule violation or domain-level error.
 * Typically used when an operation violates business logic. Returns HTTP 422 by default.
 * Can carry internal details for logging and debugging.
 * 
 * @param {Object} [options]
 * @param {string} [options.message] - Custom error message (default: "Business rule violation occurred").
 * @param {string} [options.module] - Optional module/domain where the error occurred.
 * @param {any} [options.internal] - Optional internal details or original error object for logging/debugging.
 * @param {Object} params.req - CAP request object (optional)
 */
class BusinessLogicError extends CustomError {
    constructor({ message, module, req } = {}) {
        super({
            message: message || "Business rule violation occurred",
            status: 422,
            code: "BUSINESS_ERR",
            module,
            req
        });
    }
}

module.exports = BusinessLogicError;
