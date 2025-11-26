# @yourorg/error-service

### Centralized Enterprise Error Handling for Node.js & SAP CAP

A reusable, organization-wide **error-handling framework** designed specifically for **Node.js** and **SAP CAP** applications.  
It standardizes error structures, logging, notifications, and request metadata across all microservices and modules.

---

# 📌 Features

- Enterprise-grade CustomError
- Standard error types
- Request metadata extraction
- HDI logging
- Email notifiers (CPI/SMTP/etc)
- Handler wrappers
- Normalization of CAP, DBTech, Axios, and unknown errors

---

# 📦 Installation

```bash
npm install @yourorg/error-service
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

# ✉ Email Notifier Examples

## 1. Basic CPI Email Notifier

```js
const {
  createEmailNotifier,
  buildErrorEmailBody,
} = require("@yourorg/error-service");

const sendEmailFn = require("./sendEmailCPI");

const notifyError = createEmailNotifier({
  sendEmailFn,
  TO: ["devteam@yourorg.com"],
  CC: ["lead@yourorg.com"],
  emailBodyBuilderFn: buildErrorEmailBody,
});
```

## 2. SMTP Transport Example (Nodemailer)

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

## 3. Logging-only Notifier (no email)

```js
const { createEmailNotifier } = require("@yourorg/error-service");

const notifyError = createEmailNotifier({
  sendEmailFn: null, // disabled
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

# 📘 API Reference

- CustomError
- ErrorTypes
- normalizeError()
- createEmailNotifier()
- buildErrorEmailBody()
- Handlers.handleErrors()
- Utils.extractRequestMeta()

---

# 🏆 Best Practices

- Wrap handlers with `handleErrors()`
- Use global error hook
- Log all errors
- Use notifiers in QA/PROD
- Keep email sender outside business code

---

# 📄 License

Proprietary. Internal use only.
