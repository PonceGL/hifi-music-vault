import { ZodError } from "zod";
import { buildLibraryIndex } from "@/server/library/index";
import { HttpError, InternalServerErrorException } from "@/lib/httpErrors";
import {
  libraryResponseDto,
  type LibraryQueryDto,
  type LibraryResponseDto,
  type SortField,
} from "@/app/api/library/dtos/library.dto";
import type { Track } from "@/types/track";

function getSortValue(track: Track, field: SortField): string | number {
  switch (field) {
    case "title":
      return (track.metadata.title ?? "￿").toLowerCase();
    case "artist":
      return (track.metadata.artist ?? "￿").toLowerCase();
    case "album":
      return (track.metadata.album ?? "￿").toLowerCase();
    case "year":
      return track.metadata.year ?? Infinity;
    case "duration":
      return track.duration;
    case "size":
      return track.size;
  }
}

function compareTracks(
  a: Track,
  b: Track,
  sort: SortField,
  order: "asc" | "desc",
): number {
  const aVal = getSortValue(a, sort);
  const bVal = getSortValue(b, sort);
  let cmp = 0;
  if (aVal < bVal) cmp = -1;
  else if (aVal > bVal) cmp = 1;
  return order === "desc" ? -cmp : cmp;
}

class LibraryServer {
  public async getLibrary(
    libraryPath: string,
    query: LibraryQueryDto,
  ): Promise<LibraryResponseDto> {
    try {
      let tracks = await buildLibraryIndex(libraryPath);

      if (query.format) {
        tracks = tracks.filter((t) => t.format === query.format);
      }

      if (query.health) {
        tracks = tracks.filter((t) => t.healthStatus === query.health);
      }

      const total = tracks.length;

      tracks.sort((a, b) => compareTracks(a, b, query.sort, query.order));

      const start = (query.page - 1) * query.limit;
      const page = tracks.slice(start, start + query.limit);

      return libraryResponseDto.parse({
        tracks: page,
        total,
        page: query.page,
      });
    } catch (error) {
      throw this.handleServiceError(error, {
        internal: "Error al obtener el índice de la biblioteca.",
      });
    }
  }

  private handleServiceError(
    error: unknown,
    customMessages?: { internal?: string },
  ): Error {
    if (error instanceof HttpError || error instanceof ZodError) return error;
    return new InternalServerErrorException(
      (error as Error).message ?? customMessages?.internal ?? "Error interno.",
    );
  }
}

export const libraryServer = new LibraryServer();
