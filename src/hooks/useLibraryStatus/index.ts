"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLibraryStatus } from "@/lib/libraryStatus";
import type { StatusResponseDto } from "@/app/api/library/status/dtos/status.dto";
import type { AppHttpError } from "@/lib/http";

export type LibraryStatus = "A" | "B" | "C" | "D";

export interface UseLibraryStatusReturn {
  status: LibraryStatus | undefined;
  data: StatusResponseDto | undefined;
  isLoading: boolean;
  isError: boolean;
  error: AppHttpError | null;
  refetch: () => void;
}

function deriveStatus(data: StatusResponseDto): LibraryStatus {
  const hasDownloads = data.downloads.count > 0;
  const hasLibrary = data.library.count > 0;

  if (hasDownloads && !hasLibrary) return "A";
  if (hasDownloads && hasLibrary) return "B";
  if (!hasDownloads && hasLibrary) return "C";
  return "D";
}

export function useLibraryStatus(): UseLibraryStatusReturn {
  const { data, isLoading, isError, error, refetch } = useQuery<
    StatusResponseDto,
    AppHttpError
  >({
    queryKey: ["library", "status"],
    queryFn: fetchLibraryStatus,
  });

  return {
    status: data ? deriveStatus(data) : undefined,
    data,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
