# Enterprise Error Service

A centralized, reusable, organization-wide **error-handling module** for Node.js & SAP CAP projects.  
Designed for consistent error structures, HDI logging, normalization, and optional email notifications.

---

## Features

- **CustomError** base class with structured metadata
- Predefined enterprise error types:
  - ValidationError (HTTP 400)
  - AuthorizationError (HTTP 401/403)
  - BusinessLogicError (HTTP 422)
- `normalizeError()` to convert any runtime, SQL, CPI, or unknown error into a standardized format
- CAP-friendly error handling:
  - `toCdsError()` for UI-safe responses
  - `logError()` for HDI table logging
- Optional **email notifications**:
  - `createEmailNotifier()` (Higher-Order Function)
  - `buildErrorEmailBody()` (Outlook-safe HTML template)

---

## Installation

```bash
npm install @yourorg/error-service

# OR (GitHub Packages)
npm install @yourorg/error-service --registry https://npm.pkg.github.com/
```

---

# Usage Guide

---

## 1. Global CAP Error Handling (Recommended)

Captures and processes **all errors application-wide**.

```js
const cds = require("@sap/cds");
const {
  normalizeError,
  createEmailNotifier,
  buildErrorEmailBody,
} = require("@yourorg/error-service");

// Project-defined email sender (CPI/SMTP/MS Graph/etc.)
const sendEmailFn = require("./utils/sendEmailClient");

// Create notifier
const notifyError = createEmailNotifier({
  sendEmailFn,
  TO: ["alerts@yourorg.com"],
  CC: ["lead@yourorg.com"],
  emailBodyBuilderFn: buildErrorEmailBody,
});

cds.on("error", async (err, req) => {
  const normalized = normalizeError({ err, req, module: req?.target?.name });

  await normalized.logError({
    cds,
    tableName: "ErrorLogs",
  });

  await notifyError({
    env: process.env.NODE_ENV,
    error: normalized,
  });

  return normalized.toCdsError(cds);
});
```

---

## 2. Local Try/Catch Error Handling

```js
const { ErrorTypes, normalizeError } = require("@yourorg/error-service");

srv.on("createUser", async (req) => {
  try {
    if (!req.data.email) {
      throw new ErrorTypes.ValidationError({
        message: "Email is required",
        module: "UserManagement",
      });
    }

    await createUser(req.data);
  } catch (err) {
    const normalized = normalizeError({ err, req, module: "UserManagement" });
    await normalized.logError({ cds, tableName: "ErrorLogs" });
    throw normalized.toCdsError(cds);
  }
});
```

---

## 3. Using Predefined Error Types

```js
const { ErrorTypes } = require("@yourorg/error-service");

throw new ErrorTypes.AuthorizationError({
  message: "Access denied",
  module: "AccessControl",
});
```

---

# Email Notification System

## 4. Creating an Email Notifier (Higher-Order Function)

```js
const {
  createEmailNotifier,
  buildErrorEmailBody,
} = require("@yourorg/error-service");
const sendEmailFn = require("../utils/sendEmailCPI");

module.exports = createEmailNotifier({
  sendEmailFn,
  TO: ["devteam@yourorg.com"],
  CC: ["lead@yourorg.com"],
  emailBodyBuilderFn: buildErrorEmailBody,
});
```

---

## 5. Example sendEmailFn (CPI/MS Graph)

```js
module.exports = async function sendEmailFn({ subject, body, to, cc }) {
  return executeHttpRequest(
    { destinationName: "CPI" },
    {
      method: "POST",
      url: "/http/sendMail",
      data: {
        message: {
          subject,
          body: { contentType: "HTML", content: body },
          toRecipients: to.map((x) => ({ emailAddress: { address: x } })),
          ccRecipients: cc.map((x) => ({ emailAddress: { address: x } })),
        },
      },
    }
  );
};
```

---

# API Reference

## CustomError

Structured error class containing:

- message
- status
- code
- target
- module
- details
- internal request metadata
- cleaned stack trace

Methods:

- `logError({ cds, tableName })`
- `toCdsError(cds)`

---

## normalizeError({ err, req, module })

Normalizes:

- JS runtime errors
- Syntax errors
- SAP DBTech HANA errors
- CPI/HTTP/Axios errors
- Unknown thrown values

Returns a `CustomError`.

---

## createEmailNotifier(config)

Config options:

```
{
  sendEmailFn: Function (required),
  emailBodyBuilderFn?: Function,
  TO?: string[],
  CC?: string[]
}
```

Returns:

```
notifyError({ env, error })
```

Recommended for `cds.on("error")`.

---

## buildErrorEmailBody()

Outputs a fully wrapped, Outlook-safe HTML template containing:

- Error summary
- Request metadata
- Details
- Internal metadata
- Stacktrace

---

# Best Practices

- Always enable `normalizeError()` globally
- Use predefined error types for cleaner code
- Enable email alerts only in QA/PROD
- Store errors in HDI with timestamps & metadata
- Keep `sendEmailFn` project or client-specific
- Centralize error handling for maintainability

---

# Support

For improvements, enhancements, or internal training sessions, contact your org’s platform engineering team.
