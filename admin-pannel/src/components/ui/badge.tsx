import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-500/10",
  {
    variants: {
      variant: {
        default:
          "border-slate-300 bg-indigo-600 text-white hover:bg-indigo-700",
        secondary:
          "border-slate-300 bg-slate-100 text-white hover:bg-slate-200 ",
        destructive:
          "border-slate-300 bg-red-100 text-red-600 hover:bg-red-200 ",
        outline: "text-slate-600 border-slate-300 ",
        success:
          "border-slate-300 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 ",
        warning:
          "border-slate-300 bg-amber-100 text-amber-600 hover:bg-amber-200 ",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
