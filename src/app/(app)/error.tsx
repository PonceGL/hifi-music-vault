"use client";

import type { ReactElement } from "react";

interface LibraryErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LibraryError({
  error,
  reset,
}: LibraryErrorProps): ReactElement {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm text-text-secondary">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
      >
        Reintentar
      </button>
    </div>
  );
}
