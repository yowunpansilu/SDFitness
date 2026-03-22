import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-secondary text-primary-900 font-bold hover:bg-secondary-400 shadow-md shadow-secondary-500/20 hover:shadow-lg transition-all",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border-2 border-secondary-500/50 text-secondary-500 bg-transparent hover:bg-secondary-500 hover:text-primary-900 font-semibold",
        secondary:
          "bg-primary-800 text-white border border-primary-700 hover:bg-primary-700 shadow-sm",
        ghost: "hover:bg-primary-800 text-muted-foreground hover:text-foreground transition-colors",
        link: "text-secondary-500 underline-offset-4 hover:underline",
        gym: "bg-gradient-to-r from-secondary-500 to-secondary-600 text-primary-900 font-bold hover:opacity-90 shadow-lg shadow-secondary-500/25 border border-secondary-400"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
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
