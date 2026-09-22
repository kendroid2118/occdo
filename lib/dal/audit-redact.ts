const REDACTED = "[REDACTED]";

const SECRET_KEY_PATTERN =
  /^(password|passwordhash|passwd|secret|token|accesstoken|refreshtoken|idtoken|sessiontoken|authorization|authsecret|cookie|cookies|setcookie|apikey|databaseurl|connectionstring)$/i;

function normalizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9]/g, "");
}

export function isSecretMetadataKey(key: string): boolean {
  return SECRET_KEY_PATTERN.test(normalizeKey(key));
}

export function redactAuditMetadata(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => redactAuditMetadata(entry));
  }

  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(record)) {
      next[key] = isSecretMetadataKey(key) ? REDACTED : redactAuditMetadata(nested);
    }
    return next;
  }

  return value;
}
