import type { SongMetadata } from "@/server/services/OrganizerService";
import { useState, useMemo } from "react";

export type { SongMetadata };

export interface ScanResult {
  file: string;
  metadata: SongMetadata;
  proposedPath: string;
  playlists: string[];
}

export type SortField = "title" | "artist" | "album" | "genre";
export type SortDirection = "asc" | "desc";

/**
 * Normalize text for fuzzy search:
 * - Convert to lowercase
 * - Remove accents/diacritics
 * - Remove special characters (keep only alphanumeric and spaces)
 */
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s]/g, "") // Remove special chars
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
};

/**
 * Check if a normalized search query matches a normalized text
 */
const fuzzyMatch = (text: string, query: string): boolean => {
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  return normalizedText.includes(normalizedQuery);
};

export function useMusicTable(data: ScanResult[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return data;
    }

    return data.filter((item) => {
      const { title, artist, album, genre } = item.metadata;

      // Check if query matches any field
      return (
        fuzzyMatch(title, searchQuery) ||
        fuzzyMatch(artist, searchQuery) ||
        fuzzyMatch(album, searchQuery) ||
        genre.some((g) => fuzzyMatch(g, searchQuery))
      );
    });
  }, [data, searchQuery]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];

    sorted.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (sortField) {
        case "title":
          aValue = a.metadata.title;
          bValue = b.metadata.title;
          break;
        case "artist":
          aValue = a.metadata.artist;
          bValue = b.metadata.artist;
          break;
        case "album":
          aValue = a.metadata.album;
          bValue = b.metadata.album;
          break;
        case "genre":
          aValue = a.metadata.genre[0] || "";
          bValue = b.metadata.genre[0] || "";
          break;
        default:
          return 0;
      }

      const comparison = aValue.localeCompare(bValue);
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [filteredData, sortField, sortDirection]);

  // Toggle sort direction or change field
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Change field and reset to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return {
    data: sortedData,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    handleSort,
    totalCount: data.length,
    filteredCount: filteredData.length,
    filteredData, // Expose this
  };
}
