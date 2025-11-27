class CustomError extends Error {
    /**
     * @param {Object} params
     * @param {string} params.message - Error message
     * @param {number} params.status - HTTP status code
     * @param {string} params.code - Error code
     * @param {string|null} params.target - Target field or module
     * @param {any} params.details - Additional error details
     * @param {string} params.module - Module name
     * @param {any} params.internal - Original error or internal info
     * @param {Object} params.req - CAP request object (optional)
     */
    constructor({ message, status, code, target, details, module, internal, req }) {
        super(message);

        this.name = this.constructor.name;
        this.status = status || 500;
        this.code = code || "GENERIC_ERROR";
        this.target = target || null;
        this.details = details || null;
        this.module = module || null;

        // Build internal object with request context
        this.internal = {
            ...(internal || {}),
            ...(req ? {
                data: req.data,
                user: req.user,
                event: req.event,
                url: req._?.req?.originalUrl || "",
                method: req._?.req?.method || ''
            } : {})
        };

        // Capture stack trace starting from the original error (skip normalizeError)
        if (internal instanceof Error && internal.stack) {
            // Remove normalizeError frames
            const stackLines = internal.stack.split("\n");
            // Remove unwanted internal frames
            const filtered = stackLines.filter(line =>
                !line.includes("normalizeError") &&
                !line.includes("toCdsError") &&        // NEW: remove AuthorizationError.toCdsError
                !line.includes("@custom/error-service")       // OPTIONAL: remove all internal class frames
            );
            this.stack = [stackLines[0], ...filtered.slice(1)].join("\n");
        } else {
            /**
                * Error.captureStackTrace:
                * - Starts the stack trace from this constructor.
                * - Removes internal class constructor frames from stack.
                * - Shows only the line where the error was thrown in user code.
            */
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Log error to HDI table
     * @param Object
     * @param {cds} cds - CAP instance
     * @param tableName String -  error log table - name
     */
    async logError({ cds, tableName }) {
        let tx = null;
        try {
            tx = cds.transaction();
            await tx.begin();
            if (tableName && cds) {
                const payload = {
                    // ID: cds.utils.uuid(),
                    // timestamp: new Date(),
                    crtdt: new Date().toISOString().split('T')[0],
                    crttm: new Date().toISOString().split('T')[1].split('.')[0],
                    message: this.message,
                    status: this.status,
                    code: this.code,
                    target: this.target,
                    details: JSON.stringify(this.details || {}),
                    module: this.module,
                    internal: JSON.stringify(this.internal || {}),
                    stack: this.stack
                };
                await tx.run(INSERT.into(tableName).entries(payload));
            }
            await tx.commit();
        } catch (e) {
            console.error("Failed to log error:", e);
        } finally {
            if (tx) {
                await tx.commit();

            }
        }
    }

    /**
  * Converts the current error instance into a CAP-compliant `cds.error` object.
  *
  * @function toCdsError
  * @returns {Object} Structured CAP error representation.
  * @returns {string} return.message - Error message describing the failure.
  * @returns {number} return.status - HTTP status code associated with the error.
  * @returns {string} return.code - Application-specific error code.
  * @returns {string} [return.target] - Optional field indicating the data target or entity.
  * @returns {Array<Object>} [return.details] - Additional error metadata or nested error details.
  */
    toCdsError() {
        return {
            message: this.message,
            status: this.status,
            code: this.code,
            target: this.target,
            details: this.details
        };
    }

}

module.exports = CustomError;
