import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-100 text-slate-900 shadow hover:bg-slate-100/80",
        secondary:
          "border-transparent bg-slate-800 text-slate-100 hover:bg-slate-800/80",
        destructive:
          "border-transparent bg-rose-500/20 text-rose-300 border-rose-500/30",
        outline: "text-slate-100 border-slate-700",
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "emerald" | "amber" | "cyan";
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
