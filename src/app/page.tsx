import type { ReactElement } from "react";

/**
 * Library view — the root route of the app.
 *
 * Middleware already verified the folder-configured cookie before this
 * page renders. If the cookie was absent, the user was redirected to
 * /onboarding. Reaching here means the user is configured.
 */
export default function Home(): ReactElement {
  return (
    <main>
      <p>Library</p>
    </main>
  );
}
