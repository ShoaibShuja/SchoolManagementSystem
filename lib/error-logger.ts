export type ErrorContext = Record<string, string | number | boolean | undefined>;

export function logError(error: unknown, context: ErrorContext = {}) {
  const errorName = error instanceof Error ? error.name : "UnknownError";

  if (process.env.NODE_ENV !== "production") {
    console.error("Application error", { errorName, ...context });
  }

  // Add an approved server-side monitoring transport here. Never send credentials,
  // session tokens, form values, or raw database errors.
}
