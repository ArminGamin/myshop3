import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "gold";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-bold tracking-[0.02em] select-none disabled:opacity-50 disabled:pointer-events-none transition-[color,background-color,border-color,box-shadow,transform] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

const variants: Record<Variant, string> = {
  primary: "cta-fill text-white border-0",
  secondary:
    "bg-white text-ink-900 border border-cream-400 hover:border-burgundy-300 hover:text-burgundy-700",
  ghost: "bg-cream-200 text-ink-900 hover:bg-cream-300 border-0",
  gold: "cta-fill text-white border-0",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-4 py-2 min-h-10 rounded-[10px]",
  md: "text-[15px] px-6 py-3 min-h-[52px] rounded-[12px]",
  lg: "text-[15px] px-6 py-3 min-h-12 rounded-[10px] sm:text-[17px] sm:px-8 sm:py-3.5 sm:min-h-[52px]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
  );
}

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  prefetch?: boolean;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
  prefetch,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
