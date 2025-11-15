const CustomError = require("./CustomError");

/**
 * @function isHanaError
 * @description Detects SAP HANA SQL errors based on error code patterns or message.
 * @param {Error} err - The original error object.
 * @returns {boolean} True if the error is identified as a HANA/SQL error.
 */
function isHanaError(err) {
    return err.code && err.message && (
        err.code.startsWith("HY") ||
        err.code.startsWith("3A") ||
        err.message.includes("SAP DBTech")
    );
}

/**
 * @function isCpiHttpError
 * @description Detects CPI or external HTTP errors (axios/fetch) by presence of a response object with status.
 * @param {Error} err - The original error object.
 * @returns {boolean} True if the error has an HTTP response structure.
 */
function isCpiHttpError(err) {
    return err.response && err.response.status;
}

/**
 * @function normalizeError
 * @description Converts any raw JS, SAP HANA, CPI, or unknown error into a structured CustomError.
 * This ensures consistent error handling and logging across CAP services.
 * 
 * @param {Error} params.err - Original error object (could be runtime, SQL, CPI, etc.)
 * @param {string} params.[module] - Optional module or domain where the error occurred.
 * @param {Object} params.req - CAP request object (optional)
 * @returns {CustomError} A normalized CustomError instance.
 * 
 */
function normalizeError(err, module, req) {
    // Already a CustomError → pass through
    if (err instanceof CustomError) return err;

    // --- Syntax Errors ---
    if (err instanceof SyntaxError) {
        return new CustomError({
            message: "Invalid Syntax Encountered",
            status: 500,
            code: "SYNTAX_ERR",
            module,
            internal: err,
            req
        });
    }

    // --- Common JS runtime errors ---
    if (err instanceof TypeError || err instanceof ReferenceError || err instanceof RangeError) {
        return new CustomError({
            message: "Unexpected server error",
            status: 500,
            code: "RUNTIME_ERR",
            module,
            internal: err,
            req
        });
    }

    // --- SAP HANA / SQL Errors ---
    if (isHanaError(err)) {
        return new CustomError({
            message: "Database execution failed",
            status: 500,
            code: "HANA_DB_ERR",
            module,
            internal: err,
            req
        });
    }

    // --- CPI / HTTP Errors ---
    if (isCpiHttpError(err)) {
        return new CustomError({
            message: `CPI request failed with status ${err.response.status}`,
            status: err.response.status,
            code: "CPI_HTTP_ERR",
            module,
            internal: {
                status: err.response.status,
                data: err.response.data,
                headers: err.response.headers
            },
            req
        });
    }

    // --- Fallback for unknown errors ---
    return new CustomError({
        message: err.message || "Unknown failure",
        status: 500,
        code: "UNKNOWN_ERR",
        module,
        internal: err,
        req
    });
}

module.exports = normalizeError;
