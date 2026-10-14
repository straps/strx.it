import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

import { ButtonLink, Container, Eyebrow } from "./components/ui";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#020817" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let status = "error";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    status = String(error.status);
    details = error.status === 404 ? "This page does not exist." : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main>
      <title>{`${status} · strx.it`}</title>
      <Container className="flex min-h-dvh flex-col justify-center gap-6 py-16">
        <Eyebrow>{status}</Eyebrow>
        <h1 className="m-0 text-3xl font-bold">{details}</h1>
        <div>
          <ButtonLink href="/">Back to strx.it</ButtonLink>
        </div>
        {stack && (
          <pre className="overflow-x-auto rounded-xl border border-border bg-surface p-4 text-xs">
            <code>{stack}</code>
          </pre>
        )}
      </Container>
    </main>
  );
}
