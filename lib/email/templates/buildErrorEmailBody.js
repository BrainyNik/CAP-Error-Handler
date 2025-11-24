/**
 * @function buildErrorEmailBody
 * @description
 * Generates an HTML email body for exception reporting.  
 * Accepts CustomError metadata, request context, and environment information.  
 * Produces an Outlook-safe, responsive, fully wrapped HTML body.
 *
 * @param {Object} params
 * @param {string} params.env - Deployment environment (DEV/QA/PROD).
 * @param {Object} params.error - CustomError instance.
 * @param {string} params.error.message - Main error message.
 * @param {number} params.error.status - HTTP status code.
 * @param {string} params.error.code - Application error code.
 * @param {string|null} params.error.target - Target field/module.
 * @param {Object} params.error.details - Additional error details.
 * @param {string} params.error.module - Module name where error occurred.
 * @param {string} params.error.stack - Cleaned stack trace.
 * @param {Object} params.internal - Internal metadata collected by CustomError.
 * @param {Object} params.internal.data - req.data snapshot.
 * @param {Object} params.internal.user - req.user snapshot.
 * @param {string} params.internal.url - Request URL.
 * @param {string} params.internal.method - HTTP method.
 * @param {string} params.internal.event - CAP event name.
 * @returns {string} HTML email body
 */

function buildErrorEmailBody({ env, error, internal }) {
    const reqMeta = internal || {};

    const formattedInternal = JSON.stringify(reqMeta, null, 2);
    const formattedDetails = JSON.stringify(error.details || {}, null, 2);

    const safeJson = (obj) =>
        typeof obj === "string" ? obj : JSON.stringify(obj || {}, null, 2);

    return `
    <div style="font-family:Arial; padding:16px; border:1px solid #e0e0e0; border-radius:6px; ">



        <p style="margin-top:16px; font-size:16px;">
            Timestamp: <strong>${new Date().toISOString()}</strong>
        </p>

        
        <h2 style="color:#b00020; margin-bottom:6px;">Exception Alert</h2>
        <p>An exception occurred in the <strong>${env}</strong> environment.</p>

        <!-- GENERAL ERROR INFO -->
        <h3 style="margin-top:20px;">Error Summary</h3>
        <table style="border-collapse:collapse; width:100%; font-size:14px; table-layout:fixed;">
            <tr>
                <td style="border:1px solid #ccc; padding:8px; width:180px;"><strong>Message</strong></td>
                <td style="border:1px solid #ccc; padding:8px;">${error.message || ""}</td>
            </tr>
            <tr>
                <td style="border:1px solid #ccc; padding:8px;"><strong>Status</strong></td>
                <td style="border:1px solid #ccc; padding:8px;">${error.status}</td>
            </tr>
            <tr>
                <td style="border:1px solid #ccc; padding:8px;"><strong>Error Code</strong></td>
                <td style="border:1px solid #ccc; padding:8px;">${error.code}</td>
            </tr>
            <tr>
                <td style="border:1px solid #ccc; padding:8px;"><strong>Target</strong></td>
                <td style="border:1px solid #ccc; padding:8px;">${error.target || ""}</td>
            </tr>
            <tr>
                <td style="border:1px solid #ccc; padding:8px;"><strong>Module</strong></td>
                <td style="border:1px solid #ccc; padding:8px;">${error.module || ""}</td>
            </tr>
        </table>

        <!-- REQUEST METADATA -->
        <h3 style="margin-top:20px;">Request Metadata</h3>
        <table style="border-collapse:collapse; width:100%; font-size:12px; table-layout:fixed;">
            <tr>
                <td style="border:1px solid #ccc; padding:8px; width:180px;"><strong>URL</strong></td>
                <td style="border:1px solid #ccc; padding:8px; overflow-wrap:break-word;">${reqMeta.url || ""}</td>
            </tr>
            <tr>
                <td style="border:1px solid #ccc; padding:8px;"><strong>Method</strong></td>
                <td style="border:1px solid #ccc; padding:8px;">${reqMeta.method || ""}</td>
            </tr>
            <tr>
                <td style="border:1px solid #ccc; padding:8px;"><strong>Event</strong></td>
                <td style="border:1px solid #ccc; padding:8px;">${reqMeta.event || ""}</td>
            </tr>
            <tr>
                <td style="border:1px solid #ccc; padding:8px;"><strong>User</strong></td>
                <td style="border:1px solid #ccc; padding:8px;">${reqMeta.user?.id || ""}</td>
            </tr>
        </table>

        <!-- DETAILS -->
        <h3 style="margin-top:20px;">Error Details</h3>
        <div style="border:1px solid #ccc; padding:5px; background:#fafafa; font-size:12px;
            font-family:Consolas, monospace; word-wrap:break-word; white-space:normal;">
${formattedDetails}
        </div>

        <!-- INTERNAL METADATA -->
        <h3 style="margin-top:20px;">Internal Metadata</h3>
        <div style="border:1px solid #ccc; padding:5px;; background:#fafafa; font-size:12px;
            font-family:Consolas, monospace; word-wrap:break-word; white-space:normal;">
${formattedInternal}
        </div>

        <!-- STACKTRACE -->
        <h3 style="margin-top:20px;">Stack Trace</h3>
        <div style="border:1px solid #ccc; padding:5px;; background:#fafafa; font-size:12px;
            font-family:Consolas, monospace; word-wrap:break-word; white-space:normal;">
${safeJson(error.stack)}
        </div>


    </div>`;
}
