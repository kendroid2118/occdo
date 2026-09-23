export type SecurityHeader = {
  key: string;
  value: string;
};

export type SecurityHeaderSource = {
  source: string;
  headers: SecurityHeader[];
};

export const HSTS_VALUE = "max-age=63072000; includeSubDomains; preload";

export const SECURITY_HEADER_SOURCE = "/(.*)";

function contentSecurityPolicy(isProduction: boolean): string {
  const scriptSrc = isProduction
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
  const connectSrc = isProduction ? "connect-src 'self'" : "connect-src 'self' ws: wss:";
  const directives = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    connectSrc,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  if (isProduction) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export function buildSecurityHeaders(isProduction: boolean): SecurityHeader[] {
  const headers: SecurityHeader[] = [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(isProduction) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    },
  ];

  if (isProduction) {
    headers.push({ key: "Strict-Transport-Security", value: HSTS_VALUE });
  }

  return headers;
}

export function securityHeaderEntries(isProduction: boolean): SecurityHeaderSource[] {
  return [
    {
      source: SECURITY_HEADER_SOURCE,
      headers: buildSecurityHeaders(isProduction),
    },
  ];
}
