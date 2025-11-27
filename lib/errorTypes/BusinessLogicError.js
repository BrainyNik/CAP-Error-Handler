const CustomError = require("../core/CustomError");

/**
 * @class BusinessLogicError
 * @extends CustomError
 * @description
 * Represents violations of domain or business rules. Triggered when an operation
 * breaks functional constraints even though the request is syntactically valid.
 * Defaults to HTTP 422 and supports structured metadata for API clients and logs.
 *
 * @typedef {Object} BusinessLogicErrorParams
 * @property {string} [message]               - High-level business rule violation message.
 * @property {string} [module]                - Module or domain where the rule failed.
 * @property {Object} [req]                   - CAP request object for contextual logging.
 * @property {any} [internal]                 - Internal debugging metadata or original error.
 * @property {Array<Object>} [details]        - List of sub-errors describing specific rule failures.
 * @property {string} [details[].message]     - Description of the rule violation.
 * @property {string} [details[].target]      - Field/entity related to the violation.
 * @property {string} [details[].code]        - Sub-error code (optional).
 * @property {string} [target]                - Field/entity representing the primary violation.
 * @property {string} code                     - Sub-error code.
 * @property {number} [status=400]            - HTTP status code.
 * 
 *
 * @param {BusinessLogicErrorParams} params
 */
class BusinessLogicError extends CustomError {
    constructor({ message, module, req, internal, code, details, target, status } = {}) {
        super({
            message: message || "Business rule violation occurred",
            status: status || 422,
            code: code || "BUSINESS_ERR",
            module,
            req,
            internal,
            details,
            target
        });
    }
}

module.exports = BusinessLogicError;
