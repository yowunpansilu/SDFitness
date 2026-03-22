import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-500/10",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-indigo-600 text-white hover:bg-indigo-700",
                secondary:
                    "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100",
                destructive:
                    "border-transparent bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400",
                outline: "text-slate-600 border-slate-200 dark:text-slate-400 dark:border-slate-800",
                success:
                    "border-transparent bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400",
                warning:
                    "border-transparent bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-500/10 dark:text-amber-400",
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
