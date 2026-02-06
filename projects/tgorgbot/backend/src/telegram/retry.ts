type RetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
};

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_BASE_DELAY_MS = 500;

type ErrorWithMetadata = {
  code?: unknown;
  retry_after?: unknown;
  parameters?: {
    retry_after?: unknown;
  };
  response?: {
    error_code?: unknown;
    parameters?: {
      retry_after?: unknown;
    };
  };
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function extractErrorCode(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }
  const metadata = error as ErrorWithMetadata;
  if (isFiniteNumber(metadata.code)) {
    return metadata.code;
  }
  if (isFiniteNumber(metadata.response?.error_code)) {
    return metadata.response?.error_code;
  }
  return undefined;
}

function extractRetryAfterSeconds(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }
  const metadata = error as ErrorWithMetadata;
  if (isFiniteNumber(metadata.retry_after)) {
    return metadata.retry_after;
  }
  if (isFiniteNumber(metadata.parameters?.retry_after)) {
    return metadata.parameters?.retry_after;
  }
  if (isFiniteNumber(metadata.response?.parameters?.retry_after)) {
    return metadata.response?.parameters?.retry_after;
  }
  return undefined;
}

function isRetryableError(error: unknown): boolean {
  const code = extractErrorCode(error);
  if (code === 429) {
    return true;
  }
  if (code !== undefined && code >= 500) {
    return true;
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("timeout") ||
      message.includes("timed out") ||
      message.includes("network") ||
      message.includes("socket") ||
      message.includes("econnreset") ||
      message.includes("ehostunreach")
    ) {
      return true;
    }
  }
  return false;
}

export async function withTelegramRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  let attempt = 0;

  while (true) {
    attempt += 1;
    try {
      return await operation();
    } catch (error) {
      const retryAfterSeconds = extractRetryAfterSeconds(error);
      if (!isRetryableError(error) || attempt >= maxAttempts) {
        throw error;
      }

      const delayMs = retryAfterSeconds
        ? retryAfterSeconds * 1000
        : baseDelayMs * Math.pow(2, attempt - 1);
      await sleep(delayMs);
    }
  }
}
