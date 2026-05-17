import type { ReactElement } from "react";

/**
 * Library view — root route of the app ("/").
 *
 * Both server-side (middleware via cookie) and client-side
 * (AppLayout via useFolderConfigGuard) guards have already validated that
 * the folder config exists before this page renders.
 */
export default function Home(): ReactElement {
  return (
    <main>
      <p>Library</p>
    </main>
  );
}
