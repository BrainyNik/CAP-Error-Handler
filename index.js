
/**
 * @module enterprise-errors
 * @description
 * Centralized, reusable error-handling module for Node.js/CAP projects.
 * Provides:
 *  - Structured CustomError class
 *  - Error normalization utilities
 *  - Error-aware handler wrappers (HOF)
 *  - Optional email notification integration
 *  - Common enterprise error types
 */

const CustomError = require("./lib/core/CustomError");
const normalizeError = require("./lib/core/normalizeError");

const ValidationError = require("./lib/errorTypes/ValidationError");
const AuthorizationError = require("./lib/errorTypes/AuthorizationError");
const BusinessLogicError = require("./lib/errorTypes/BusinessLogicError");

const { createEmailNotifier } = require("./lib/email/createEmailNotifier");
const { buildErrorEmailBody } = require("./lib/email/templates/buildErrorEmailBody");

// Import the wrapper
const handleErrorsWrapper = require("./lib/utils/handleErrorsWrapper");
const extractRequestMetadata = require("./lib/utils/extractRequestMetadata");

module.exports = {

    /**
     * @class CustomError
     * @description
     * Base class for all structured enterprise errors.
     * Tracks request metadata, stack traces, and internal diagnostic information.
     */
    CustomError,

    /**
     * @function normalizeError
     * @description
     * Converts raw runtime/DB/CPI/unknown errors into a standardized CustomError instance.
     *
     * @param {Object} params
     * @param {Error} params.err - Raw error object
     * @param {string} [params.module] - Logical module origin
     * @param {Object} [params.req] - CAP request object
     * @returns {CustomError} Normalized error instance
     */
    normalizeError,

    /**
     * @namespace ErrorTypes
     * @description Predefined enterprise-grade error subclasses.
     */
    ErrorTypes: {
        ValidationError,
        AuthorizationError,
        BusinessLogicError
    },

    /**
     * @namespace Handlers
     * @description
     * Higher-order functions (HOFs) that wrap CAP handlers with reusable
     * enterprise error-handling logic.
     */
    Handlers: {

        /**
         * @function handleErrors
         * @description
         * Wraps a CAP handler function inside a standardized try–catch block.
         *
         * Centralizes:
         *  - Error normalization
         *  - Logging into HANA
         *  - Returning CAP-compliant error responses
         *
         * Ideal for `this.on()` and `this.before()/after()` handlers in CAP services.
         *
         * @param {Function} fn - Original CAP handler
         * @returns {Function} Wrapped handler with error interception
         *
         * @example
         * this.on("test", Handlers.handleErrors(async req => {
         *     let x = y.z; // Throws → automatically normalized + logged
         * }));
         */
        handleErrorsWrapper
    },

    /**
     * @function createEmailNotifier
     * @description
     * Higher-order function to bind email notifications to CAP/global error pipelines.
     *
     * Accepts any SMTP/CPI/OAuth email sender.
     *
     * @returns {Function} notifyError - Callable notifier
     */
    createEmailNotifier,

    /**
     * @function buildErrorEmailBody
     * @description
     * Generates the default, enterprise-ready Outlook-safe HTML body for error emails.
     */
    buildErrorEmailBody,
    /**
   * @namespace Utils
   * @description
   * General-purpose helper utilities for CAP error handling.
   */
    Utils: {

        /**
         * @function extractRequestMeta
         * @description
         * Utility to extract normalized request metadata from CAP request objects.
         * Used to populate CustomError.internal and build error email bodies.
         *
         * @param {Object} req - CAP request instance.
         * @returns {Object} Normalized request metadata.
         *
         * @example
         * this.before("*", req => {
         *    req.context._meta = Utils.extractRequestMeta(req);
         * });
         */
        extractRequestMetadata
    }
};
