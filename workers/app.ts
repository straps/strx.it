import { createRequestHandler } from "react-router";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

/** Private pages: never cached by the edge or the browser, never indexed. */
const PRIVATE_PATH = /^\/(trading-accounts|health)(\/|\.data$|$)/;

/** Old Aurum URLs, renamed to /trading: keep every published link working. */
const OLD_AURUM = /^\/aurum(\/accounts)?\/?$/;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const old = OLD_AURUM.exec(url.pathname);
    if (old) return Response.redirect(`${url.origin}/trading${old[1] ?? ""}${url.search}`, 301);
    const response = await requestHandler(request);
    if (!PRIVATE_PATH.test(new URL(request.url).pathname)) return response;
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "private, no-store");
    headers.set("X-Robots-Tag", "noindex, nofollow");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
} satisfies ExportedHandler<Env>;
