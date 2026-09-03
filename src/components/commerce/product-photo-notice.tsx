import { ImageIcon } from "lucide-react";
import { productPhotoDisclaimer } from "@/lib/copy/product-disclaimer";

export function ProductPhotoNotice() {
  return (
    <aside
      className="mt-4 flex gap-2.5 rounded-cozy border border-cream-300 bg-cream-100/70 px-3.5 py-3 text-[13px] leading-relaxed text-ink-600"
      aria-label="Informacija apie produkto nuotraukas"
    >
      <ImageIcon className="mt-0.5 size-4 shrink-0 text-burgundy-600" strokeWidth={1.75} aria-hidden />
      <p>
        <strong className="font-semibold text-ink-900">{productPhotoDisclaimer.shortLabel}:</strong>{" "}
        {productPhotoDisclaimer.productPage}
      </p>
    </aside>
  );
}
