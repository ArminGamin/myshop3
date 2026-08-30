import { store } from "@/lib/config/store.config";

const palettes: Record<string, { from: string; to: string; ink: string }> = {
  zvakide: { from: "#F5F0E6", to: "#E8DFCC", ink: "#5C1A1B" },
  pledas: { from: "#F3EDE0", to: "#E4D8C4", ink: "#5C1A1B" },
  sokoladas: { from: "#F2E8D6", to: "#E0D0B4", ink: "#5C1A1B" },
  adventas: { from: "#F5F0E6", to: "#E6D7B8", ink: "#5C1A1B" },
  silkas: { from: "#F6EFE4", to: "#E8D8C2", ink: "#5C1A1B" },
  viskis: { from: "#F0E6D4", to: "#D6C49A", ink: "#5C1A1B" },
  sodas: { from: "#F3EEE2", to: "#E2D6C0", ink: "#5C1A1B" },
  knyga: { from: "#F4EDE3", to: "#E0D2B8", ink: "#5C1A1B" },
  difuzorius: { from: "#F2EDE4", to: "#DDD0B8", ink: "#5C1A1B" },
  kojines: { from: "#F5EEE4", to: "#E4D4BC", ink: "#5C1A1B" },
  termosas: { from: "#F0EBE1", to: "#D8CCB6", ink: "#5C1A1B" },
  zaidimai: { from: "#F4EAD6", to: "#E0CFA0", ink: "#A98534" },
  krepselis: { from: "#F4E8DC", to: "#E0C8B4", ink: "#5C1A1B" },
  arbata: { from: "#F3EEE4", to: "#DDD2BE", ink: "#5C1A1B" },
};

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

export function ProductArt({
  seed,
  size = "card",
  className = "",
}: {
  seed: string;
  size?: "thumb" | "card" | "hero";
  className?: string;
}) {
  const palette = palettes[seed] ?? palettes.zvakide;
  const h = hashSeed(seed);
  const sparkleX = 18 + (h % 55);
  const sparkleY = 14 + ((h >> 3) % 30);
  const rotate = (h % 14) - 7;
  const uid = `${seed}-${size}`;

  const dims =
    size === "thumb"
      ? { w: 56, h: 56, r: 12, letter: 14, deco: 0.4 }
      : size === "hero"
        ? { w: 600, h: 750, r: 28, letter: 72, deco: 0.85 }
        : { w: 400, h: 500, r: 22, letter: 52, deco: 0.7 };

  return (
    <svg
      viewBox={`0 0 ${dims.w} ${dims.h}`}
      role="img"
      aria-label="Prekės iliustracija (demo)"
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <defs>
        <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.from} />
          <stop offset="62%" stopColor={palette.to} />
          <stop offset="100%" stopColor={palette.ink} stopOpacity="0.18" />
        </linearGradient>
        <radialGradient id={`vig-${uid}`} cx="50%" cy="42%" r="72%">
          <stop offset="40%" stopColor="#1f1914" stopOpacity="0" />
          <stop offset="100%" stopColor="#1f1914" stopOpacity="0.32" />
        </radialGradient>
        <filter id={`grain-${uid}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="2" stitchTiles="stitch" result="n" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.22" />
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width={dims.w} height={dims.h} fill={`url(#g-${uid})`} rx={size === "thumb" ? dims.r : 0} />
      <rect width={dims.w} height={dims.h} fill={`url(#g-${uid})`} filter={`url(#grain-${uid})`} opacity="0.55" />
      <rect width={dims.w} height={dims.h} fill={`url(#vig-${uid})`} />
      <g transform={`rotate(${rotate} ${dims.w * 0.78} ${dims.h * 0.16})`} opacity={0.22 * dims.deco}>
        <line
          x1={dims.w * 0.62}
          y1={dims.h * 0.13}
          x2={dims.w * 0.94}
          y2={dims.h * 0.19}
          stroke={palette.ink}
          strokeWidth={size === "thumb" ? 1.5 : 2.5}
          strokeLinecap="round"
        />
        {[0.68, 0.76, 0.84].map((p, i) => (
          <line
            key={i}
            x1={dims.w * p}
            y1={dims.h * (0.115 + i * 0.012)}
            x2={dims.w * (p + 0.05)}
            y2={dims.h * (0.165 + i * 0.008)}
            stroke={palette.ink}
            strokeWidth={size === "thumb" ? 1 : 1.8}
            strokeLinecap="round"
          />
        ))}
      </g>
      <path
        d={`M${(sparkleX / 100) * dims.w} ${(sparkleY / 100) * dims.h} l3 8 8 3 -8 3 -3 8 -3-8-8-3 8-3z`}
        fill={palette.ink}
        opacity={0.18 * dims.deco}
      />
      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Georgia, serif"
        fontStyle="italic"
        fontSize={dims.letter}
        fill={palette.ink}
        opacity={0.28}
      >
        {store.brand.name.charAt(0)}
      </text>
    </svg>
  );
}

export function ProductImage({
  images,
  seed,
  alt,
  size = "card",
  className = "",
}: {
  images: string[];
  seed: string;
  alt: string;
  size?: "thumb" | "card" | "hero";
  className?: string;
}) {
  if (images.length > 0) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={images[0]} alt={alt} loading="lazy" decoding="async" className={className} />;
  }
  return <ProductArt seed={seed} size={size} className={className} />;
}
