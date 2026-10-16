import { env } from "cloudflare:workers";

interface Jwk extends JsonWebKey {
  kid?: string;
}

const KEYS_TTL_MS = 60 * 60 * 1000;
let keysCache: { team: string; fetchedAt: number; keys: Jwk[] } | undefined;

const decode = (part: string) => Uint8Array.from(atob(part.replace(/-/g, "+").replace(/_/g, "/")), (char) => char.charCodeAt(0));
const parse = (part: string) => JSON.parse(new TextDecoder().decode(decode(part)));

async function signingKeys(team: string, force = false) {
  if (!force && keysCache?.team === team && Date.now() - keysCache.fetchedAt < KEYS_TTL_MS) return keysCache.keys;
  const response = await fetch(`https://${team}/cdn-cgi/access/certs`);
  if (!response.ok) throw new Error(`Access keys unavailable: ${response.status}`);
  const { keys } = (await response.json()) as { keys: Jwk[] };
  keysCache = { team, fetchedAt: Date.now(), keys };
  return keys;
}

async function isValid(token: string, team: string, audience: string) {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return false;
  const { kid, alg } = parse(header) as { kid?: string; alg?: string };
  if (alg !== "RS256") return false;

  // A rotated key is not in the cached set: refetch once before giving up.
  let jwk = (await signingKeys(team)).find((key) => key.kid === kid);
  jwk ??= (await signingKeys(team, true)).find((key) => key.kid === kid);
  if (!jwk) return false;

  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const signed = new TextEncoder().encode(`${header}.${payload}`);
  if (!(await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, decode(signature), signed))) return false;

  const claims = parse(payload) as { aud?: string[] | string; iss?: string; exp?: number; nbf?: number };
  const now = Date.now() / 1000;
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  return claims.iss === `https://${team}` && audiences.includes(audience) && (claims.exp ?? 0) > now && (claims.nbf ?? 0) <= now;
}

/**
 * Cloudflare Access sits in front of the private pages, but the Worker is also reachable through
 * workers.dev and preview URLs that bypass it, so every private loader verifies the Access JWT itself.
 * Fails closed: without ACCESS_TEAM_DOMAIN and ACCESS_AUD configured the answer is always 404.
 * Only `vite dev` skips the check.
 */
export async function requireAccess(request: Request) {
  if (import.meta.env.DEV) return;
  const team = env.ACCESS_TEAM_DOMAIN;
  const audience = env.ACCESS_AUD;
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  let allowed = false;
  if (team && audience && token) {
    try {
      allowed = await isValid(token, team, audience);
    } catch {
      allowed = false;
    }
  }
  if (!allowed) throw new Response("Not Found", { status: 404 });
}
