import { z } from "zod";

const SORT_FIELDS = [
  "title",
  "artist",
  "album",
  "year",
  "duration",
  "size",
] as const;
const ORDER_VALUES = ["asc", "desc"] as const;
const FORMAT_VALUES = ["flac", "alac", "mp3", "wav", "aac", "ogg"] as const;
const HEALTH_VALUES = ["complete", "warning", "alert", "critical"] as const;

export const libraryQueryDto = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.enum(SORT_FIELDS).default("title"),
    order: z.enum(ORDER_VALUES).default("asc"),
    format: z.enum(FORMAT_VALUES).optional(),
    health: z.enum(HEALTH_VALUES).optional(),
  })
  .strict();

export type LibraryQueryDto = z.infer<typeof libraryQueryDto>;
export type SortField = (typeof SORT_FIELDS)[number];

const trackDto = z.object({
  id: z.string(),
  filePath: z.string(),
  fileName: z.string(),
  metadata: z.object({
    title: z.string().nullable(),
    artist: z.string().nullable(),
    albumArtist: z.string().nullable(),
    album: z.string().nullable(),
    year: z.number().nullable(),
    genre: z.string().nullable(),
    trackNumber: z.number().nullable(),
    totalTracks: z.number().nullable(),
    discNumber: z.number().nullable(),
    totalDiscs: z.number().nullable(),
    composer: z.string().nullable(),
    comment: z.string().nullable(),
    artwork: z.string().nullable(),
    bitrate: z.number().nullable(),
    sampleRate: z.number().nullable(),
    musicBrainzId: z.string().nullable(),
  }),
  healthStatus: z.enum(HEALTH_VALUES),
  format: z.enum(FORMAT_VALUES),
  size: z.number(),
  duration: z.number(),
});

export const libraryResponseDto = z.object({
  tracks: z.array(trackDto),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
});

export type LibraryResponseDto = z.infer<typeof libraryResponseDto>;
