import * as React from "react"

import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 focus-visible:border-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
