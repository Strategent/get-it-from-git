import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * PillButton — sleek, sharp, monotone CTAs.
 */
const pillVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-sm font-medium tracking-tight whitespace-nowrap transition-all hover:scale-[1.02] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-background text-foreground border border-foreground/10 dark:border-transparent hover:bg-foreground/[0.04]",
        secondary:
          "border border-foreground/10 bg-foreground/[0.06] text-foreground/90 backdrop-blur-sm hover:bg-foreground/[0.10]",
        brand: "bg-foreground text-background hover:bg-foreground/90",
      },
      size: {
        sm: "h-8 px-4 text-[12.5px]",
        md: "h-9 px-5 text-[13px]",
        xs: "h-7 px-3 text-[11.5px]",
      },
    },
    defaultVariants: { variant: "primary", size: "sm" },
  },
);

export interface PillButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof pillVariants> {}

export function PillButton({ className, variant, size, ...props }: PillButtonProps) {
  return (
    <button
      className={cn(pillVariants({ variant, size }), className)}
      {...props}
    />
  );
}
