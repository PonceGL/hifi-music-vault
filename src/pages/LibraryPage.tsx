import { useAppConfig } from "@/hooks/useAppConfig"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { MusicTable } from "@/components/MusicTable"
import { usePlaylistRefresh } from "@/hooks/usePlaylistRefresh";
import { VIEW_MODES, type ViewMode } from "@/constants/app";
import { useInbox } from "@/hooks/useInbox";
import { useLibrary } from "@/hooks/useLibrary";

import { Button } from "@/components/ui/button"
import {
  Loader2,
  ListPlus,
  FolderSearch,
  MoreVertical,
  HardDriveDownload,
  RefreshCw,
  Music,
  Plus,
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
import { ToolbarAction } from "@/components/layout/ToolbarAction";
import { TitleBar } from "@/components/layout/TitleBar";

export function LibraryPage() {
  const { config } = useAppConfig();
  const navigate = useNavigate();
  const { triggerRefresh } = usePlaylistRefresh();

  // Hooks para gestión de estado
  const {
    scanResults,
    isScanning,
    isOrganizing,
    error: inboxError,
    scanInbox: performScan,
    organize: performOrganize,
  } = useInbox();

  const {
    libraryFiles,
    isLoadingLibrary,
    isRegenerating,
    isSyncingAppleMusic,
    error: libraryError,
    fetchLibrary: performFetchLibrary,
    regenerateDatabase: performRegenerate,
    syncAppleMusic: performSync,
    exportLibrary: performExport,
    revealFile: performReveal,
  } = useLibrary();

  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODES.INBOX);
  const error = inboxError || libraryError;

  // Add to Playlist State
  const [trackToAdd, setTrackToAdd] = useState<ScanResult | null>(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [initialTracksForCreate, setInitialTracksForCreate] = useState<
    string[]
  >([]);

  // Export Library State
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // Wrapper functions to handle library path from config
  const fetchLibrary = async () => {
    if (!config.libraryPath) return;

    try {
      await performFetchLibrary(config.libraryPath);
      setViewMode(VIEW_MODES.LIBRARY);
    } catch (err) {
      console.error("Error fetching library:", err);
    }
  };

  const scanInbox = async () => {
    if (!config.inboxPath || !config.libraryPath) {
      console.error("Missing inbox or library path");
      return;
    }

    try {
      const results = await performScan(config.inboxPath, config.libraryPath);

      if (results.length > 0) {
        setViewMode(VIEW_MODES.INBOX);
      } else {
        // If nothing to organize, show library
        await fetchLibrary();
      }
    } catch (err) {
      console.error("Error scanning inbox:", err);
    }
  };

  const handleOrganize = async () => {
    if (!config.libraryPath) return;

    try {
      await performOrganize(config.libraryPath);
      // Success! Refresh library
      await fetchLibrary();
    } catch (err) {
      console.error("Error organizing:", err);
    }
  };

  const handleRegenerateDatabase = async () => {
    if (!config.libraryPath) return;

    try {
      await performRegenerate(config.libraryPath);
    } catch (err) {
      console.error("Error regenerating database:", err);
    }
  };

  const handleSyncAppleMusic = async () => {
    if (!config.libraryPath) return;

    try {
      await performSync(config.libraryPath);
    } catch (err) {
      console.error("Error syncing with Apple Music:", err);
    }
  };

  const handleExportLibrary = async (
    destination: string,
    mode: "copy" | "move",
    preserveStructure: boolean,
  ) => {
    if (!config.libraryPath) return;

    try {
      await performExport(config.libraryPath, destination, mode, preserveStructure);
    } catch (err) {
      console.error("Error exporting library:", err);
    }
  };

  const handleReveal = async (filePath: string) => {
    try {
      await performReveal(filePath);
    } catch (err) {
      console.error("Failed to reveal file", err);
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

  return (
    <section className="w-full flex flex-col justify-start items-center gap-8">
      <TitleBar title="Biblioteca" />

      {viewMode === "library" && libraryFiles.length > 0 && (
        <>
          <ToolbarAction
            icon={Plus}
            label="Create Playlist"
            onClick={() => setIsCreatePlaylistOpen(true)}
          />
          {/* Acción 2: Agregar Carpeta */}
          <ToolbarAction
            icon={isRegenerating ? Loader2 : RefreshCw}
            label={isRegenerating ? "Regenerating..." : "Regenerate Database"}
            onClick={handleRegenerateDatabase}
            disabled={isRegenerating}
          />

          {/* Acción 3: Solo ícono (sin label, válido en cualquier pantalla) */}
          <ToolbarAction
            icon={HardDriveDownload}
            label="Export Library"
            onClick={() => setIsExportDialogOpen(true)}
          />
        </>
      )}


      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold">Music Library</h1>
        <p className="text-muted-foreground">
          {viewMode === VIEW_MODES.INBOX ? "Inbox Review" : "My Collection"}
        </p>
      </div>

      {/* Actions Bar */}
      <div className="w-full max-w-6xl flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={viewMode === VIEW_MODES.INBOX ? "outline" : "default"}
            onClick={() => {
              setViewMode(VIEW_MODES.INBOX);
              if (scanResults.length === 0) scanInbox();
            }}
          >
            Inbox ({scanResults.length})
          </Button>
          <Button
            variant={viewMode === VIEW_MODES.LIBRARY ? "outline" : "default"}
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
          {viewMode === VIEW_MODES.INBOX && scanResults.length > 0 && (
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

          {/* {viewMode === VIEW_MODES.LIBRARY && libraryFiles.length > 0 && (
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
                onClick={handleSyncAppleMusic}
                disabled={isSyncingAppleMusic}
                variant="outline"
              >
                {isSyncingAppleMusic ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Music className="mr-2 h-4 w-4" />
                    Sync Apple Music
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
          )} */}
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
          />

          {/* Export Library Dialog */}
          <ExportPlaylistDialog
            open={isExportDialogOpen}
            onOpenChange={setIsExportDialogOpen}
            playlistName="Entire Library"
            trackCount={libraryFiles.length}
            onConfirm={handleExportLibrary}
          />

          {viewMode === VIEW_MODES.INBOX ? (
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
    </section>
  );
}