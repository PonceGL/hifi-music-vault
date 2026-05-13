import type { Meta, StoryObj } from "@storybook/nextjs";
import { Input } from "./input";
import { SearchInput } from "./search-input";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "Escribe aquí...",
  },
  argTypes: {
    error: { control: "text", description: "Error message shown below the input" },
    warning: { control: "text", description: "Warning message shown below the input" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPlaceholder: Story = {
  args: { placeholder: "Buscar artista o álbum..." },
};

export const ErrorState: Story = {
  args: {
    placeholder: "Ruta de la biblioteca",
    error: "La ruta no existe o no tiene permisos",
  },
};

export const WarningState: Story = {
  args: {
    placeholder: "Nombre del archivo",
    warning: "Este nombre ya existe en la biblioteca",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Campo deshabilitado",
    disabled: true,
  },
};

export const AllStates: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "320px" }}>
      <Input {...args} placeholder="Default" />
      <Input {...args} placeholder="Con error" error="Campo requerido" />
      <Input {...args} placeholder="Con advertencia" warning="Valor inusual" />
      <Input {...args} placeholder="Deshabilitado" disabled />
    </div>
  ),
};

export const Search: Story = {
  render: () => (
    <div style={{ width: "320px" }}>
      <SearchInput />
    </div>
  ),
};
