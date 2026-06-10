import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/lora/400.css";
import "@fontsource/lora/400-italic.css";
import "@fontsource/lora/500.css";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { ReadingProgress, BackToTop } from "@/components/reading-aids";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-serif text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-medium text-foreground">This page doesn't exist</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Let's get you back to something useful.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const errorId = (typeof window !== "undefined" ? window.crypto?.randomUUID?.().slice(0, 8) : null)
    ?.toUpperCase() ?? "LOCAL";
  const [copied, setCopied] = useState(false);
  const copyId = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(errorId).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="max-w-md w-full">
        <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-brand mb-7">
          <span className="size-1.5 rounded-full bg-brand" /> Vocare
        </div>
        <h1 className="text-3xl font-serif italic leading-tight text-foreground">Something paused on our side.</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          This page hit an unexpected error. We've logged it — your progress is saved in this browser, so retrying usually picks up right where you were.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <a href="/" className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
            Go home
          </a>
          <button
            onClick={copyId}
            className="rounded-full px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? "Copied" : "Copy error ID"}
          </button>
        </div>
        <div className="mt-5 text-[11px] tracking-[0.04em] text-muted-foreground">
          Error reference{" "}
          <code className="ml-1 rounded bg-muted px-1.5 py-0.5 text-brand font-mono">{errorId}</code>
        </div>
      </div>
    </div>
  );
}


export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Vocare — Find the medical specialty that fits your mind, life, and identity." },
      { name: "description", content: "A premium psychometric assessment that maps your cognitive style, emotional resilience, and lifestyle vision to 40+ medical specialties." },
      { property: "og:title", content: "Vocare — Find the medical specialty that fits your mind, life, and identity." },
      { property: "og:description", content: "A premium psychometric assessment that maps your cognitive style, emotional resilience, and lifestyle vision to 40+ medical specialties." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Vocare — Find the medical specialty that fits your mind, life, and identity." },
      { name: "twitter:description", content: "A premium psychometric assessment that maps your cognitive style, emotional resilience, and lifestyle vision to 40+ medical specialties." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/56c5c40d-746d-4ab7-980e-ddec256cf347/id-preview-e05a43fe--9402acde-78d0-48af-a327-958fb0a97d18.lovable.app-1779938627874.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/56c5c40d-746d-4ab7-980e-ddec256cf347/id-preview-e05a43fe--9402acde-78d0-48af-a327-958fb0a97d18.lovable.app-1779938627874.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ReadingProgress />
      <Outlet />
      <BackToTop />
    </QueryClientProvider>
  );
}

