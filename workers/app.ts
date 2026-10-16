import { createRequestHandler } from "react-router";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

/** Private pages: never cached by the edge or the browser, never indexed. */
const PRIVATE_PATH = /^\/trading-accounts(\/|\.data$|$)/;

export default {
  async fetch(request) {
    const response = await requestHandler(request);
    if (!PRIVATE_PATH.test(new URL(request.url).pathname)) return response;
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "private, no-store");
    headers.set("X-Robots-Tag", "noindex, nofollow");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
} satisfies ExportedHandler<Env>;
