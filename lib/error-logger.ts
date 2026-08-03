export type ErrorContext = Record<string, string | number | boolean | undefined>;

export function logError(error: unknown, context: ErrorContext = {}) {
  const errorName = error instanceof Error ? error.name : "UnknownError";

  // Do not include messages, request bodies, record identifiers, database
  // details, cookies, or headers in logs. Keep a safe correlation point only.
  console.error("Application error", { errorName, ...context });

  // Add an approved server-side monitoring transport here. Never send credentials,
  // session tokens, form values, or raw database errors.
}
