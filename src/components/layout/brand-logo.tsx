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
      className={`group flex shrink-0 items-center ${className}`}
    >
      <span className="font-display max-w-[9.5rem] truncate text-[16px] font-extrabold leading-none text-burgundy-600 sm:max-w-none sm:text-[20px] lg:text-[22px]">
        {store.brand.name}
      </span>
    </Link>
  );
}
