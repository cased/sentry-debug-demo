import * as Sentry from "@sentry/nextjs";

console.log("[Sentry] Initializing with DSN:", process.env.NEXT_PUBLIC_SENTRY_DSN ? "present" : "MISSING");

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration(),
  ],
  debug: true, // Enable debug mode to see what's happening
});
