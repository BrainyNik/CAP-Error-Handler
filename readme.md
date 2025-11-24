# Enterprise Error Service

A centralized, reusable, organization-wide **error-handling module** for Node.js & SAP CAP applications.  
Provides consistent error structures, HDI logging, normalization, and optional email notifications.

---

# Features

- Base `CustomError` with enterprise-grade structured metadata
- Standard error types: ValidationError (400), AuthorizationError (401/403), BusinessLogicError (422)
- `normalizeError()` for CAP, runtime, HANA DBTech, Axios/CPI, and unknown errors
- HDI logging using `logError()`
- Outlook-safe HTML email templates via `createEmailNotifier()` & `buildErrorEmailBody()`

---

# Installation

```bash
npm install @yourorg/error-service
```

or

```bash
npm install @yourorg/error-service --registry https://npm.pkg.github.com/
```

---

# Usage Guide

# Global Error Handling (Recommended Setup)

#### in each service handler we can add

```js
const cds = require("@sap/cds");
const {
  normalizeError,
  createEmailNotifier,
  buildErrorEmailBody,
} = require("@yourorg/error-service");

const sendEmailFn = require("./utils/sendEmailClient");

const notifyError = createEmailNotifier({
  sendEmailFn,
  TO: ["alerts@yourorg.com"],
  CC: ["lead@yourorg.com"],
  emailBodyBuilderFn: buildErrorEmailBody,
});

// catches all the errors of this service handler
this.on("error", async (err, req) => {
  console.log("Error triggered");

  const normalized = normalizeError({
    err,
    req,
    module: "DSM",
  });

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

## Local Try/Catch Error Handling

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

## Using Predefined Error Types

```js
const { ErrorTypes } = require("@yourorg/error-service");

throw new ErrorTypes.AuthorizationError({
  message: "Access denied",
  module: "AccessControl",
  req,
  status: 400 || 401 || 402,
  code: "AUTH_ERR",
});
```

---

# Email Notification System

## Creating an Email Notifier

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

## Example sendEmailFn

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

# Example Error Payload

```json
{
  "code": "VALIDATION_ERR",
  "message": "Email format is invalid",
  "status": 400,
  "target": "email",
  "details": [
    {
      "code": "INVALID_FORMAT",
      "message": "Email does not match expected pattern",
      "target": "email"
    }
  ],
  "module": "UserManagement",
  "internal": {
    "data": {
      "email": "abc"
    },
    "event": "createUser",
    "url": "/user-service/createUser",
    "method": "POST",
    "user": "admin"
  }
}
```

---

# API Reference

### CustomError

Defines standard enterprise error structure.

### normalizeError({ err, req, module })

Converts any thrown error into a `CustomError`.

### createEmailNotifier(config)

Returns an async function to send enterprise error alerts.

### buildErrorEmailBody()

Generates an Outlook-safe HTML email template.

---

# Best Practices

- Always normalize errors globally
- Use predefined error classes
- Enable email alerts only in QA/PROD
- Store error metadata (user, event, payload, request info)
- Keep project email sender separate
- Centralize all error logic for maintainability
