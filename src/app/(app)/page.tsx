"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";

type FolderConfig = {
  downloadsPath: string;
  libraryPath: string;
};

/**
 * Library — temporary test render.
 * Fetches folder paths from /api/fs/config (cookie-based, no localStorage)
 * to confirm the guard implementation works end-to-end.
 */
export default function Home(): ReactElement {
  const [config, setConfig] = useState<FolderConfig | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    fetch("/api/fs/config")
      .then((r) => r.json())
      .then((body: { success: boolean; data: FolderConfig | null }) => {
        if (body.success && body.data) {
          setConfig(body.data);
          setStatus("ok");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Library — config test</h1>

      {status === "loading" && <p>Loading…</p>}

      {status === "ok" && config && (
        <dl>
          <dt>Downloads</dt>
          <dd>{config.downloadsPath}</dd>
          <dt>Library</dt>
          <dd>{config.libraryPath}</dd>
        </dl>
      )}

      {status === "error" && (
        <p style={{ color: "red" }}>
          Could not read config from API. Cookie may be missing or invalid.
        </p>
      )}
    </main>
  );
}
