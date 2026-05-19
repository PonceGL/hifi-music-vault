import type { LucideIcon } from "lucide-react";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps): ReactElement {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <Icon aria-hidden="true" className="h-12 w-12 text-text-tertiary" />

      <div className="flex flex-col items-center gap-1.5">
        <h2 className="text-base font-medium text-text-primary">{title}</h2>
        <p className="max-w-xs text-sm text-text-secondary">{description}</p>
      </div>

      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
