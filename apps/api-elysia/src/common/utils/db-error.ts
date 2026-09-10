// src/common/utils/db-errors.ts

export function isPostgresMissingRelationError(error: unknown) {
  if (typeof error !== "object" || error === null) return false;

  const dbError = error as { code?: string; message?: string };
  return (
    dbError.code === "42P01" ||
    /relation .* does not exist/i.test(dbError.message ?? "")
  );
}

export function isDatabaseServiceUnavailableError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;

  const dbError = error as {
    code?: string;
    message?: string;
    name?: string;
    errno?: string | number;
    cause?: { code?: string; message?: string };
    errors?: unknown[];
  };

  const errorCode = dbError.code ?? dbError.cause?.code;
  const errorMessage = `${dbError.message ?? ""} ${dbError.cause?.message ?? ""}`;
  const childErrors = Array.isArray(dbError.errors) ? dbError.errors : [];

  const matchesLocal =
    errorCode === "ECONNREFUSED" ||
    errorCode === "ETIMEDOUT" ||
    errorCode === "EHOSTUNREACH" ||
    errorCode === "ENETUNREACH" ||
    errorCode === "ECONNRESET" ||
    errorCode === "EPIPE" ||
    errorCode === "08006" ||
    errorCode === "08001" ||
    errorCode === "57P03" ||
    errorCode === "57P01" ||
    (typeof dbError.errno === "string" &&
      /ECONNREFUSED|ETIMEDOUT|EHOSTUNREACH|ENETUNREACH|ECONNRESET|EPIPE/i.test(
        dbError.errno,
      )) ||
    (typeof dbError.name === "string" &&
      /PostgresError|AggregateError/i.test(dbError.name) &&
      /connection|connect|terminated|closed/i.test(errorMessage)) ||
    /connection refused/i.test(errorMessage) ||
    /server closed the connection unexpectedly/i.test(errorMessage) ||
    /could not connect to server/i.test(errorMessage) ||
    /terminating connection/i.test(errorMessage) ||
    /connection terminated/i.test(errorMessage) ||
    /connection was terminated/i.test(errorMessage) ||
    /connect failed/i.test(errorMessage);

  return (
    matchesLocal ||
    childErrors.some((childError) =>
      isDatabaseServiceUnavailableError(childError),
    )
  );
}
