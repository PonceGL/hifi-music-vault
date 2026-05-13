import type { Meta, StoryObj } from "@storybook/nextjs";
import { AlertCircle, CheckCircle, Music, Search } from "lucide-react";
import { EmptyState } from "./empty-state";

const meta = {
  title: "Shared/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  args: {
    icon: Music,
    title: "Biblioteca vacía",
    description: "Agrega archivos de audio para comenzar a organizar tu colección",
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    icon: Music,
    title: "Sin archivos en biblioteca",
    description: "Sincroniza tu carpeta de Downloads para importar archivos de audio",
    action: { label: "Sincronizar ahora", onClick: () => {} },
  },
};

export const NoResults: Story = {
  args: {
    icon: Search,
    title: "Sin resultados",
    description: "No encontramos ningún archivo que coincida con tu búsqueda",
    action: { label: "Limpiar búsqueda", onClick: () => {} },
  },
};

export const NoPlaylists: Story = {
  args: {
    icon: Music,
    title: "Sin playlists",
    description: "Crea tu primera playlist para organizar tus pistas favoritas",
    action: { label: "Nueva playlist", onClick: () => {} },
  },
};

export const AllHealthy: Story = {
  args: {
    icon: CheckCircle,
    title: "Todo en orden",
    description: "Todos tus archivos tienen metadatos completos y están en buen estado",
  },
};

export const WithError: Story = {
  args: {
    icon: AlertCircle,
    title: "No se pudo cargar la biblioteca",
    description: "Verifica que la ruta de la biblioteca sea correcta en Configuración",
    action: { label: "Abrir configuración", onClick: () => {} },
  },
};
