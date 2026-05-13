import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "@/components/ui/button/button";
import { Dialog } from "./dialog";
import { DialogContent } from "./dialog-content";
import { DialogDescription } from "./dialog-description";
import { DialogFooter } from "./dialog-footer";
import { DialogHeader } from "./dialog-header";
import { DialogTitle } from "./dialog-title";
import type { DialogContentProps } from "./dialog-content";

const meta = {
  title: "UI/Dialog",
  component: DialogContent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    variant: "confirmation",
    hideCloseButton: undefined,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["informative", "confirmation", "critical", "in-progress"],
      description: "Controls overlay opacity and close behavior",
    },
    hideCloseButton: {
      control: "boolean",
      description: "Override the default close button visibility",
    },
  },
} satisfies Meta<typeof DialogContent>;

export default meta;
type Story = StoryObj<typeof meta>;

function DialogDemo({
  args,
  triggerLabel,
  title,
  description,
  actionLabel,
  showCloseAction,
}: {
  args: DialogContentProps;
  triggerLabel: string;
  title: string;
  description: string;
  actionLabel?: string;
  showCloseAction?: boolean;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent {...args}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {showCloseAction ? (
              <Button variant="secondary" onClick={() => setOpen(false)} autoFocus>
                Cerrar
              </Button>
            ) : (
              <>
                <Button variant="secondary" autoFocus onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                {actionLabel && (
                  <Button variant="primary" onClick={() => setOpen(false)}>
                    {actionLabel}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <DialogDemo
      args={args}
      triggerLabel="Abrir diálogo"
      title="¿Confirmar acción?"
      description="Esta acción no se puede deshacer. Los cambios serán permanentes."
      actionLabel="Confirmar"
    />
  ),
};

export const Informative: Story = {
  args: {
    variant: "informative",
  },
  render: (args) => (
    <DialogDemo
      args={args}
      triggerLabel="Abrir informativo"
      title="Información"
      description="Overlay 50% — cierra con Escape o haciendo clic fuera del diálogo."
      actionLabel="Entendido"
    />
  ),
};

export const Confirmation: Story = {
  args: {
    variant: "confirmation",
  },
  render: (args) => (
    <DialogDemo
      args={args}
      triggerLabel="Abrir confirmación"
      title="¿Eliminar pista?"
      description="Overlay 60% — cierra solo con Escape. El clic fuera está bloqueado."
      actionLabel="Eliminar"
    />
  ),
};

export const Critical: Story = {
  args: {
    variant: "critical",
  },
  render: (args) => (
    <DialogDemo
      args={args}
      triggerLabel="Abrir crítico"
      title="Acción crítica bloqueante"
      description="Overlay 80% — ni Escape ni clic fuera lo cierran. El botón ✕ está oculto. Solo se cierra de forma programática."
      showCloseAction
    />
  ),
};

export const InProgress: Story = {
  args: {
    variant: "in-progress",
  },
  render: (args) => (
    <DialogDemo
      args={args}
      triggerLabel="Abrir proceso"
      title="Sincronizando archivos…"
      description="Overlay 90% — nada lo cierra mientras el proceso está activo."
      showCloseAction
    />
  ),
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(["informative", "confirmation", "critical", "in-progress"] as const).map((variant) => (
        <DialogDemo
          key={variant}
          args={{ ...args, variant }}
          triggerLabel={variant}
          title={`Variante: ${variant}`}
          description={`Este diálogo usa la variante "${variant}".`}
          actionLabel="Aceptar"
          showCloseAction={variant === "critical" || variant === "in-progress"}
        />
      ))}
    </div>
  ),
};
