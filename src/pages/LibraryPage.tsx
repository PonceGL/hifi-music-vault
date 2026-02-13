import { useAppConfig } from "@/hooks/useAppConfig"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { MusicTable } from "@/components/MusicTable"
import { usePlaylistRefresh } from "@/hooks/usePlaylistRefresh";

import { Button } from "@/components/ui/button"
import {
  Loader2,
  ListPlus,
  FolderSearch,
  MoreVertical,
  HardDriveDownload,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreatePlaylistDialog } from "@/components/CreatePlaylistDialog"
import { AddToPlaylistDialog } from "@/components/AddToPlaylistDialog"
import { ExportPlaylistDialog } from "@/components/ExportPlaylistDialog";
import type { ScanResult, SongMetadata } from "@/hooks/useMusicTable"

export function LibraryPage() {
  const { config } = useAppConfig();
  const navigate = useNavigate();
  const { triggerRefresh } = usePlaylistRefresh();

  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [libraryFiles, setLibraryFiles] = useState<ScanResult[]>([]);
  const [viewMode, setViewMode] = useState<"scan" | "library">("scan");

  // Loading states
  const [isScanning, setIsScanning] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Add to Playlist State
  const [trackToAdd, setTrackToAdd] = useState<ScanResult | null>(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [initialTracksForCreate, setInitialTracksForCreate] = useState<
    string[]
  >([]);

  // Export Library State
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const fetchLibrary = async () => {
    if (!config.libraryPath) return;

    setIsLoadingLibrary(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(
        `${apiUrl}/api/library?libraryPath=${encodeURIComponent(config.libraryPath)}`,
      );

      if (!response.ok) throw new Error("Failed to fetch library");

      const data = await response.json();

      // Adapt SongMetadata to ScanResult for the table
      const adapted: ScanResult[] = data.inventory.map(
        (song: SongMetadata) => ({
          file: song.absPath,
          metadata: song,
          proposedPath: song.absPath, // Already present
          playlists: [],
        }),
      );

      setLibraryFiles(adapted);
      setViewMode("library");
    } catch (err) {
      console.error("Error fetching library:", err);
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const scanInbox = async () => {
    if (!config.inboxPath || !config.libraryPath) {
      console.error("Missing inbox or library path");
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inboxPath: config.inboxPath,
          libraryPath: config.libraryPath,
        }),
      });

      if (!response.ok) throw new Error("Failed to scan inbox");

      const data = await response.json();

      console.log("============================");
      console.log("SCAN RESULTS:");
      console.log("============================");
      console.log(`Found ${data.results.length} files to organize`);
      console.log(data.results);
      console.log("============================");

      if (data.results.length > 0) {
        setScanResults(data.results);
        setViewMode("scan");
      } else {
        // If nothing to organize, show library
        await fetchLibrary();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Error scanning inbox:", err);
      setError(errorMessage);
    } finally {
      setIsScanning(false);
    }
  };

  const handleOrganize = async () => {
    if (scanResults.length === 0 || !config.libraryPath) return;

    setIsOrganizing(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/organize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          results: scanResults,
          libraryPath: config.libraryPath,
        }),
      });

      if (!response.ok) throw new Error("Organization failed");

      // Success! Refresh library
      setScanResults([]);
      await fetchLibrary();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setIsOrganizing(false);
    }
  };

  useEffect(() => {
    // Auto-scan on mount
    scanInbox();
  }, [config.inboxPath, config.libraryPath]);

  const handleTrackAction = (track: ScanResult) => {
    setTrackToAdd(track);
    setIsAddToPlaylistOpen(true);
  };

  const openCreatePlaylistWithTrack = () => {
    if (trackToAdd) {
      setInitialTracksForCreate([trackToAdd.file]);
      setIsAddToPlaylistOpen(false);
      setIsCreatePlaylistOpen(true);
    }
  };

  const handleReveal = async (filePath: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      await fetch(`${apiUrl}/api/reveal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: filePath }),
      });
    } catch (err) {
      console.error("Failed to reveal file", err);
    }
  };

  const handleExportLibrary = async (
    destination: string,
    mode: "copy" | "move",
    preserveStructure: boolean,
  ) => {
    if (!config.libraryPath) return;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const response = await fetch(`${apiUrl}/api/library/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        libraryPath: config.libraryPath,
        destination,
        mode,
        preserveStructure,
      }),
    });

    if (!response.ok) throw new Error("Failed to export library");

    const result = await response.json();
    console.log("Export Result:", result);

    if (mode === "move") {
      await fetchLibrary();
    }
  };

  const handleRegenerateDatabase = async () => {
    if (!config.libraryPath) return;

    setIsRegenerating(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/library/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          libraryPath: config.libraryPath,
        }),
      });

      if (!response.ok) throw new Error("Failed to regenerate database");

      const result = await response.json();
      console.log("Regenerate Result:", result);

      // Refresh library view after regeneration
      await fetchLibrary();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Error regenerating database:", err);
      setError(errorMessage);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <main className="w-full flex flex-col justify-start items-center p-8 gap-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold">Music Library</h1>
        <p className="text-muted-foreground">
          {viewMode === "scan" ? "Inbox Review" : "My Collection"}
        </p>
      </div>

      {/* Actions Bar */}
      <div className="w-full max-w-6xl flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "scan" ? "outline" : "default"}
            onClick={() => {
              setViewMode("scan");
              if (scanResults.length === 0) scanInbox();
            }}
          >
            Inbox ({scanResults.length})
          </Button>
          <Button
            variant={viewMode === "library" ? "outline" : "default"}
            onClick={() => {
              fetchLibrary();
            }}
          >
            Library ({libraryFiles.length})
          </Button>
          <Button variant="outline" onClick={() => navigate("/playlists")}>
            View Playlists
          </Button>

          <CreatePlaylistDialog
            libraryData={libraryFiles}
            onSuccess={() => {
              console.log("Playlist created");
              navigate("/playlists");
            }}
          />
        </div>

        <div className="flex gap-2">
          {viewMode === "scan" && scanResults.length > 0 && (
            <Button
              onClick={handleOrganize}
              disabled={isOrganizing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isOrganizing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Organizing...
                </>
              ) : (
                "Organize Files"
              )}
            </Button>
          )}

          {viewMode === "library" && libraryFiles.length > 0 && (
            <>
              <Button
                onClick={handleRegenerateDatabase}
                disabled={isRegenerating}
                variant="outline"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Database
                  </>
                )}
              </Button>
              <Button
                onClick={() => setIsExportDialogOpen(true)}
                variant="outline"
              >
                <HardDriveDownload className="mr-2 h-4 w-4" />
                Export Library
              </Button>
            </>
          )}
        </div>
      </div>

      {(isScanning || isLoadingLibrary) && (
        <div className="flex flex-col items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground mt-2">
            {isScanning ? "Scanning inbox..." : "Loading library..."}
          </p>
        </div>
      )}

      {error && (
        <div className="w-full max-w-6xl p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm font-medium text-red-900 dark:text-red-100">
            Error: {error}
          </p>
        </div>
      )}

      {!isScanning && !isLoadingLibrary && !error && (
        <div className="w-full max-w-6xl">
          {/* Add to Playlist Dialogs */}
          <AddToPlaylistDialog
            track={trackToAdd}
            open={isAddToPlaylistOpen}
            onOpenChange={setIsAddToPlaylistOpen}
            onCreateNew={openCreatePlaylistWithTrack}
            onSuccess={() => {
              setTrackToAdd(null);
              triggerRefresh();
            }}
          />

          {/* Standard Create Button Trigger */}
          {/* Controlled Create Playlist Dialog for "Add to New" flow */}
          <CreatePlaylistDialog
            libraryData={libraryFiles}
            open={isCreatePlaylistOpen}
            onOpenChange={setIsCreatePlaylistOpen}
            initialSelectedTracks={initialTracksForCreate}
            onSuccess={() => {
              console.log("Playlist created");
              navigate("/playlists");
            }}
            trigger={null}
          />

          {/* Export Library Dialog */}
          <ExportPlaylistDialog
            open={isExportDialogOpen}
            onOpenChange={setIsExportDialogOpen}
            playlistName="Entire Library"
            trackCount={libraryFiles.length}
            onConfirm={handleExportLibrary}
          />

          {viewMode === "scan" ? (
            scanResults.length > 0 ? (
              <MusicTable data={scanResults} />
            ) : (
              <div className="text-center py-10 border rounded-md bg-slate-50 dark:bg-slate-900 border-dashed">
                <p className="text-muted-foreground">Inbox is empty.</p>
                <Button variant="link" onClick={scanInbox}>
                  Refresh
                </Button>
              </div>
            )
          ) : libraryFiles.length > 0 ? (
            <MusicTable
              data={libraryFiles}
              showPlaylistsColumn={true}
              renderRowAction={(track) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleTrackAction(track)}>
                      <ListPlus className="mr-2 h-4 w-4" />
                      Add to Playlist
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleReveal(track.file)}>
                      <FolderSearch className="mr-2 h-4 w-4" />
                      Show in Finder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
          ) : (
            <div className="text-center py-10 border rounded-md bg-slate-50 dark:bg-slate-900 border-dashed">
              <p className="text-muted-foreground">Library is empty.</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}