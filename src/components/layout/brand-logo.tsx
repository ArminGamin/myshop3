import Link from "next/link";
import { store } from "@/lib/config/store.config";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${store.brand.name} — pradžia`}
      className={`brand-logo flex shrink-0 items-center ${className}`}
    >
      <span className="brand-logo-word font-display">{store.brand.name}</span>
    </Link>
  );
}
