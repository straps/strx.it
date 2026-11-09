import { env } from "cloudflare:workers";

/** Constant-time string comparison (length is not secret here, the value is). */
function safeEqual(a: string, b: string) {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

/**
 * The health page is private: it answers 404 unless the request carries the secret key
 * (?k=...) that matches the HEALTH_KEY Worker secret. No secret configured = always 404.
 * Only `vite dev` skips the check.
 */
export function requireHealthKey(request: Request) {
  if (import.meta.env.DEV) return;
  const expected = (env as { HEALTH_KEY?: string }).HEALTH_KEY;
  const given = new URL(request.url).searchParams.get("k");
  if (!expected || expected.length < 24 || !given || !safeEqual(given, expected)) {
    throw new Response("Not Found", { status: 404 });
  }
}
