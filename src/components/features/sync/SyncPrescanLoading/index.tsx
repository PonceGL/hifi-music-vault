import type { ReactElement } from "react";
import { Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog/dialog";
import { DialogContent } from "@/components/ui/dialog/dialog-content";
import { DialogHeader } from "@/components/ui/dialog/dialog-header";
import { DialogTitle } from "@/components/ui/dialog/dialog-title";

interface SyncPrescanLoadingProps {
  isOpen: boolean;
  downloadsPath: string;
}

export function SyncPrescanLoading({
  isOpen,
  downloadsPath,
}: SyncPrescanLoadingProps): ReactElement {
  return (
    <Dialog open={isOpen}>
      <DialogContent variant="in-progress" hideCloseButton>
        <DialogHeader>
          <DialogTitle>Analizando archivos...</DialogTitle>
        </DialogHeader>

        <div
          role="status"
          aria-label="Analizando archivos"
          className="flex flex-col items-center gap-4 py-4"
        >
          <Loader2
            className="h-8 w-8 animate-spin text-accent"
            aria-hidden="true"
          />
          <p className="max-w-full truncate font-mono text-xs text-text-tertiary">
            {downloadsPath}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
