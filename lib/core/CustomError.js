/**
 * @class CustomError
 * @extends Error
 * @description
 * Base class for all custom errors in the enterprise. Supports structured fields,
 * CAP-friendly error conversion, and logging to HDI tables.
 * 
 * @param {Object} options
 * @param {string} options.message - Human-readable error message.
 * @param {number} [options.status=500] - HTTP status code.
 * @param {string} [options.code="GENERIC_ERROR"] - Unique error code.
 * @param {string} [options.target] - Target field or entity causing the error.
 * @param {any} [options.details] - Additional error details (object/JSON).
 * @param {string} [options.module] - Module/domain where the error occurred.
 * @param {any} [options.internal] - Original internal error (DB, CPI, runtime) for logging.
 */
class CustomError extends Error {
    constructor({ message, status, code, target, details, module, internal }) {
        super(message);

        this.name = this.constructor.name;

        this.status = status || 500;
        this.code = code || "GENERIC_ERROR";
        this.target = target || null;
        this.details = details || null;
        this.module = module || null;
        this.internal = internal || null;

        /**
         * Error.captureStackTrace:
         * - Starts the stack trace from this constructor.
         * - Removes internal class constructor frames from stack.
         * - Shows only the line where the error was thrown in user code.
         */
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * @function logError
     * @async
     * @description Logs the error to the CAP HDI table `ErrorLogs`.
     * @param {object} cds - CAP runtime instance for DB operations.
     */
    async logError(cds) {
        try {
            const payload = {
                ID: cds.utils.uuid(),
                timestamp: new Date(),
                message: this.message,
                status: this.status,
                code: this.code,
                target: this.target,
                details: JSON.stringify(this.details || {}),
                module: this.module,
                internal: JSON.stringify(this.internal || {}),
                stack: this.stack
            };

            await cds.run(INSERT.into("ErrorLogs").entries(payload));
        } catch (e) {
            console.error("Failed to log error:", e);
        }
    }

    /**
     * @function toCdsError
     * @description Converts this error to a CAP-standard error object suitable for throwing.
     * @param {object} cds - CAP runtime instance.
     * @returns {object} CAP error object.
     */
    toCdsError(cds) {
        return cds.error(this.message, {
            status: this.status,
            code: this.code,
            target: this.target,
            details: this.details
        });
    }
}

module.exports = CustomError;
