import type { Meta, StoryObj } from "@storybook/nextjs";
import { Toast } from "./toast";

const meta = {
  title: "UI/Toast",
  component: Toast,
  tags: ["autodocs"],
  args: {
    id: "story-toast",
    variant: "success",
    title: "Archivo sincronizado",
    onClose: () => {},
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["success", "info", "warning", "error"],
      description: "Determines the icon, color and aria role",
    },
    title: { control: "text" },
    description: { control: "text" },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: { variant: "success", title: "Sincronización completada" },
};

export const Info: Story = {
  args: {
    variant: "info",
    title: "Nueva versión disponible",
    description: "Reinicia la app para aplicar los cambios",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    title: "Metadatos incompletos",
    description: "3 archivos no tienen artista definido",
  },
};

export const Error: Story = {
  args: {
    variant: "error",
    title: "Error al mover archivo",
    description: "No hay permisos de escritura en la carpeta de destino",
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "380px",
      }}
    >
      <Toast {...args} variant="success" title="Guardado correctamente" />
      <Toast
        {...args}
        variant="info"
        title="Información del sistema"
        description="Actualización disponible"
      />
      <Toast
        {...args}
        variant="warning"
        title="Advertencia"
        description="Espacio en disco bajo"
      />
      <Toast
        {...args}
        variant="error"
        title="Error crítico"
        description="La operación no se pudo completar"
      />
    </div>
  ),
};

export const WithoutDescription: Story = {
  args: { variant: "success", title: "Operación exitosa" },
};
