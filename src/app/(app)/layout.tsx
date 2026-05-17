"use client";

import type { ReactElement } from "react";
import type { PropsWithChildren } from "react";
import { useFolderConfigGuard } from "@/hooks/useFolderConfigGuard";

/**
 * Layout for all protected routes.
 *
 * Applies the client-side folder config guard so every route inside the
 * `(app)` group is protected automatically. Adding a new protected route
 * only requires placing its `page.tsx` inside this directory — no
 * per-page guard boilerplate needed.
 *
 * The route group `(app)` is transparent to URLs: a page at
 * `(app)/library/page.tsx` is still served at `/library`.
 */
export default function AppLayout({ children }: PropsWithChildren): ReactElement {
  useFolderConfigGuard();
  return <>{children}</>;
}
