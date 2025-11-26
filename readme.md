# @yourorg/error-service

### Centralized Enterprise Error Handling for Node.js & SAP CAP

A reusable, organization-wide **error-handling framework** designed specifically for **Node.js** and **SAP CAP** applications.  
It standardizes error structures, logging, notifications, and request metadata across all microservices and modules.

---

# 📌 Features

- Enterprise-grade `CustomError`
- Predefined error types (Validation, Authorization, Business Logic)
- Request metadata extraction
- HDI logging (`logError()`)
- Email notification system (CPI, SMTP, etc.)
- Handler wrapper (`handleErrors()`)
- Error normalization (`normalizeError()`)

| Feature                           | Benefit                                           |
| --------------------------------- | ------------------------------------------------- |
| Standardized status codes         | Consistent API behavior                           |
| Structured metadata               | Better debugging and monitoring                   |
| Built-in module + request context | Full traceability                                 |
| Sub-error support (`details[]`)   | UI-friendly validation and domain errors          |
| Unified logging                   | Same structure across all CAP services            |
| Works with email notifiers        | Every error can trigger alerts with full metadata |

---

# 📦 Installation

```bash
npm install @yourorg/error-service
```

---

# 🎯 Using `handleErrors` Wrapper (Recommended)

```js
const { Handlers } = require("@yourorg/error-service");

this.on(
  "createUser",
  Handlers.handleErrors(
    async (req) => {
      let x = y.z; // throws
    },
    {
      notify,
      cds,
      tableName: "ERRORLOGS",
      module: "UserService",
      env: process.env.NODE_ENV,
    }
  )
);
```

---

# 🚨 Global Error Handling Example

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

this.on("error", async (err, req) => {
  const normalized = normalizeError({ err, req, module: "DSM" });

  await normalized.logError({ cds, tableName: "ERRORLOGS" });

  await notifyError({
    env: process.env.NODE_ENV,
    error: normalized,
  });

  return normalized.toCdsError(cds);
});
```

---

# ✉ Email Notifier Examples

## **1. Basic CPI Email Notifier**

```js
const {
  createEmailNotifier,
  buildErrorEmailBody,
} = require("@yourorg/error-service");

const sendEmailFn = require("./utils/sendEmailCPI");

const notifyError = createEmailNotifier({
  sendEmailFn,
  TO: ["devteam@yourorg.com"],
  CC: ["lead@yourorg.com"],
  emailBodyBuilderFn: buildErrorEmailBody,
});
```

---

## **2. SMTP Transport (Nodemailer)**

```js
const nodemailer = require("nodemailer");
const { createEmailNotifier } = require("@yourorg/error-service");

const transporter = nodemailer.createTransport({
  host: "smtp.yourorg.com",
  port: 587,
  secure: false,
  auth: { user: "bot@yourorg.com", pass: "password" },
});

async function sendEmailFn({ subject, body, to, cc }) {
  await transporter.sendMail({
    from: "bot@yourorg.com",
    to,
    cc,
    subject,
    html: body,
  });
}

const notifyError = createEmailNotifier({
  sendEmailFn,
  TO: ["ops@yourorg.com"],
  CC: ["lead@yourorg.com"],
});
```

---

# 🧩 Request Metadata Extraction

```js
const { Utils } = require("@yourorg/error-service");

this.before("*", (req) => {
  req.context._meta = Utils.extractRequestMeta(req);
});
```

---

# 🧱 Predefined Error Types

## **ValidationError (400)**

For input, schema, and format issues.

```js
throw new ErrorTypes.ValidationError({
  message: "Email format is invalid",
  module: "UserRegistration",
  target: "email",
  req,
  details: [
    { message: "Must contain @", target: "email", code: "INVALID_FORMAT" },
  ],
});
```

---

## **AuthorizationError (401/403)**

For missing roles, invalid privileges, forbidden access.

```js
throw new ErrorTypes.AuthorizationError({
  message: "Not authorized",
  status: 403,
  module: "OrderApproval",
  req,
  details: [
    { message: "Role APPROVER missing", target: "role", code: "MISSING_ROLE" },
  ],
});
```

---

## **BusinessLogicError (422)**

For domain constraint violations and business rule failures.

```js
throw new ErrorTypes.BusinessLogicError({
  message: "Order cannot be cancelled after shipment",
  module: "OrderService",
  req,
  details: [{ message: "Status = SHIPPED", target: "OrderStatus" }],
});
```

---

# 📥 Example Normalized Error Payload

```json
{
  "code": "VALIDATION_ERR",
  "message": "Email format is invalid",
  "status": 400,
  "target": "email",
  "details": [],
  "module": "UserManagement",
  "internal": {
    "data": { "email": "abc" },
    "event": "createUser",
    "url": "/user/create",
    "method": "POST",
    "user": "admin"
  }
}
```

---

# 📘 API Reference

### `CustomError`

Base structured enterprise error.

### `normalizeError({ err, req, module })`

Transforms any error into standardized structure.

### `createEmailNotifier(config)`

Creates an async email notifier.

### `Handlers.handleErrors(fn, options)`

Wraps handlers with try–catch + notification + logging.

### `Utils.extractRequestMeta(req)`

Extracts normalized metadata from CAP requests.

### `buildErrorEmailBody()`

Generates Outlook-safe HTML.

---

# 🏆 Best Practices

- Always wrap handlers with `handleErrors()`
- Use service-level `on("error")`
- Log all errors to HANA
- Enable email alerts in QA/PROD
- Keep email sending isolated
- Normalize all errors for consistent API responses

---

# 📄 License

Proprietary. Internal use only.
