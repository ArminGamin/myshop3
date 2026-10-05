import { loadPosthog, posthogConfigured } from "@/lib/posthog-client";

if (!posthogConfigured) {
  if (process.env.NODE_ENV === "development") {
    const missingVariable = !process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
      ? "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN"
      : "NEXT_PUBLIC_POSTHOG_HOST";

    throw new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`
    );
  }
} else {
  // Inicializuojame, kai naršyklė laisva: PostHog nebeblokuoja hidratacijos.
  const start = () => void loadPosthog();
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(start, { timeout: 4000 });
  } else {
    setTimeout(start, 2500);
  }
}
