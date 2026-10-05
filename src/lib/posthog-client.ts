import type { PostHog } from "posthog-js";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

export const posthogConfigured = Boolean(projectToken && host);

let ready: Promise<PostHog | null> | null = null;

// PostHog įkeliamas atskiru paketu tik kai jo prireikia (arba naršyklei
// atsilaisvinus), kad nestabdytų pirmo puslapio atvaizdavimo.
export function loadPosthog(): Promise<PostHog | null> {
  if (typeof window === "undefined" || !posthogConfigured) return Promise.resolve(null);
  ready ??= import("posthog-js")
    .then(({ default: posthog }) => {
      if (!posthog.__loaded) {
        posthog.init(projectToken!, {
          api_host: host,
          defaults: "2026-01-30",
          capture_exceptions: true,
          debug: process.env.NODE_ENV === "development",
        });
      }
      return posthog;
    })
    .catch(() => null);
  return ready;
}
