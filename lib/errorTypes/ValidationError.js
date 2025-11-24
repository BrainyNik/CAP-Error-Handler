const CustomError = require("../core/CustomError");

/**
 * @class ValidationError
 * @extends CustomError
 * @description
 * Represents request validation failures such as missing fields, invalid formats,
 * or schema violations. Always mapped to HTTP 400 and carries structured metadata
 * for UI and API clients.
 *
 * @typedef {Object} ValidationErrorParams
 * @property {string} message                 - Human-readable description of the validation error.
 * @property {number} [status=400]            - HTTP status code.
 * @property {string} [module]                - Logical module or domain where the error originated.
 * @property {Object} [req]                   - CAP request object (optional, for context logging).
 * @property {any} [internal]                 - Additional internal metadata or original error.
 * @property {Array<Object>} [details]        - Sub-error list describing field-level issues.
 * @property {string} [details[].message]     - Specific issue description.
 * @property {string} [details[].target]      - Field or path causing the issue.
 * @property {string} [details[].code]        - Sub-error code (optional).
 * @property {string} [target]                - Primary field/path related to the main error.
 *
 * @param {ValidationErrorParams} params
 */
class ValidationError extends CustomError {
    constructor({ message, status, module, req, internal, details, target } = {}) {
        super({
            message,
            status: status || 400,
            code: "VALIDATION_ERR",
            module,
            req,
            internal,
            details,
            target
        });
    }
}

module.exports = ValidationError;
