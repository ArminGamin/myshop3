// Prekės pavadinimo kabutėse esanti dalis („Debesų minkštumas“) išryškinama
// kursyvu, kaip ir pagrindinio puslapio antraštėse.
export function ProductTitle({ name }: { name: string }) {
  const match = name.match(/^(.*?)(„[^“]+“)(.*)$/);
  if (!match) return <>{name}</>;
  const [, before, quoted, after] = match;
  return (
    <>
      {before}
      <em className="font-semibold text-burgundy-600">{quoted}</em>
      {after}
    </>
  );
}
