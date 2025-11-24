# Error Service

**Enterprise-wide standardized error handling module for Node.js/CAP projects**

## Features

- `CustomError` base class with structured fields
- Predefined error types:
  - `ValidationError` (HTTP 400)
  - `AuthorizationError` (HTTP 401/403)
  - `BusinessLogicError` (HTTP 422)
- `normalizeError()` function to convert JS runtime, SAP HANA, CPI, and unknown errors into `CustomError`
- CAP-friendly `toCdsError()` and HDI logging with `logError()`
- Fully documented with JSDoc

## Installation

### NPM

```bash
npm install @yourorg/error-service

        OR

npm install @yourorg/error-service --registry https://npm.pkg.github.com/


```

## USAGE

### 1. Global CAP Error Handling (cds.on("error"))

#### Automatically handles, normalizes, and logs all errors in your CAP services:

const cds = require('@sap/cds');
const { normalizeError } = require('@yourorg/error-service');

cds.on('error', async (err, req) => {
const error = normalizeError(err, req?.target?.name);
await error.logError({cds,tableName : "ErrorLogTableName"});

return error.toCdsError(cds);
});

### 2. Local try/catch Error Handling

#### Handle errors at a specific business logic level:

const { ErrorTypes, normalizeError } = require('@yourorg/error-service');

try {
if (!input.email) {
throw new ErrorTypes.ValidationError({ message: "Email is required" });
}

    await someServiceOperation();

} catch (err) {
const error = normalizeError(err, "UserModule");
await error.logError({cds,tableName : "ErrorLogTableName"});
throw error.toCdsError(cds); // CAP-friendly error for UI
}
