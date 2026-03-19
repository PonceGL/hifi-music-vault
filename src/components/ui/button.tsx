import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * buttonVariants - Definición de estilos basada en M3 Expressive.
 * Prioriza esquinas redondeadas generosas y estados de interacción táctiles.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // M3 Filled Button
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
        // M3 Error Container Button
        destructive:
          "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 active:bg-red-200",
        // M3 Outlined Button
        outline:
          "border-2 border-primary/20 bg-transparent text-primary hover:bg-primary/5 hover:border-primary/40",
        // M3 Tonal Button (Expressive)
        secondary:
          "bg-secondary/15 text-secondary hover:bg-secondary/25 active:bg-secondary/35",
        // M3 Text Button
        ghost:
          "hover:bg-primary/10 text-primary",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Altura mínima de 48px para cumplimiento de accesibilidad M3
        default: "h-12 px-6 rounded-2xl",
        sm: "h-9 px-4 rounded-xl text-xs",
        lg: "h-14 px-8 rounded-[2rem] text-base",
        icon: "h-12 w-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

/**
 * Button - Componente de acción principal.
 * Implementado usando la palabra reservada 'function' según las reglas de estilo.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, asChild = false, ...props }, ref) {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }