/**
 * @module enterprise-errors
 * @description
 * Centralized, reusable error-handling module for Node.js/CAP projects.
 * Provides a base CustomError class, error normalization, and common custom error types.
 */

const CustomError = require("./lib/core/CustomError");
const normalizeError = require("./lib/core/normalizeError");
const ValidationError = require("./lib/errorTypes/ValidationError");
const AuthorizationError = require("./lib/errorTypes/AuthorizationError");
const BusinessLogicError = require("./lib/errorTypes/BusinessLogicError");

/**
 * @namespace ErrorTypes
 * @description Commonly used enterprise custom errors.
 */
module.exports = {
    /**
     * @class
     * @description Base class for all custom errors. Supports structured error fields, logging, and CAP-friendly error conversion.
     */
    CustomError,

    /**
     * @function
     * @description Converts any raw JS, SQL, or integration error into a standardized CustomError instance.
     * @param {Error} err - The original error object
     * @param {string} [module] - The module or domain where the error occurred
     * @returns {CustomError} Normalized error instance
     */
    normalizeError,

    /**
     * @namespace ErrorTypes
     * @description Predefined, reusable custom error types for common enterprise scenarios.
     */
    ErrorTypes: {
        /**
         * @class
         * @extends CustomError
         * @description Used for input validation or schema errors. Typically returns HTTP 400.
         */
        ValidationError,

        /**
         * @class
         * @extends CustomError
         * @description Used for authentication and authorization failures. Typically returns HTTP 401/403.
         */
        AuthorizationError,

        /**
         * @class
         * @extends CustomError
         * @description Used for business rule violations. Typically returns HTTP 422.
         */
        BusinessLogicError
    }
};
