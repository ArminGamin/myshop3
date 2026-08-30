import {
  Briefcase,
  Coins,
  Flame,
  Gift,
  Handshake,
  Heart,
  HeartHandshake,
  Home,
  PartyPopper,
  Search,
  Sparkles,
  Square,
  TreePine,
  User,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const collectionIcons: Record<string, LucideIcon> = {
  "visos-dovanos": Gift,
  bestselleriai: Sparkles,
  "dovanos-jai": Heart,
  "dovanos-jam": User,
  "dovanos-seimai": Users,
  "dovanos-poroms": HeartHandshake,
  "dovanos-iki-20-euru": Coins,
  "dovanos-iki-30-euru": Coins,
  "dovanos-iki-50-euru": Coins,
  "premium-dovanos": Sparkles,
};

const collectionEmojis: Record<string, string> = {
  "dovanos-jai": "💐",
  "dovanos-jam": "⌚",
  "dovanos-seimai": "🏡",
  "dovanos-poroms": "💑",
};

const quizEmojis: Record<string, string> = {
  jai: "💐",
  jam: "⌚",
  porai: "💑",
  seimai: "🏡",
  draugui: "🎁",
  kolegai: "💼",
  tevams: "☕",
};

const quizIcons: Record<string, LucideIcon> = {
  jai: Heart,
  jam: User,
  porai: HeartHandshake,
  seimai: Users,
  draugui: Handshake,
  kolegai: Briefcase,
  tevams: Home,
  "iki-20": Coins,
  "20-30": Coins,
  "30-50": Coins,
  "50-plus": Sparkles,
  praktiskas: Wrench,
  romantiskas: Heart,
  linksmas: PartyPopper,
  minimalistas: Square,
  jaukus: Flame,
  technologiskas: Sparkles,
  kaledos: TreePine,
  "slaptas-senelis": Gift,
  "seimos-svente": Home,
  draugams: Handshake,
  partneriui: Heart,
};

export function CollectionGlyph({
  slug,
  className = "size-6",
}: {
  slug: string;
  className?: string;
}) {
  const emoji = collectionEmojis[slug];
  if (emoji) {
    return (
      <span className="text-[1.35rem] leading-none" aria-hidden>
        {emoji}
      </span>
    );
  }
  const Icon = collectionIcons[slug] ?? Gift;
  return <Icon className={className} strokeWidth={1.5} aria-hidden />;
}

export function QuizGlyph({
  value,
  className = "size-6",
}: {
  value: string;
  className?: string;
}) {
  const emoji = quizEmojis[value];
  if (emoji) {
    return (
      <span className="text-[1.45rem] leading-none" aria-hidden>
        {emoji}
      </span>
    );
  }
  const Icon = quizIcons[value] ?? Gift;
  return <Icon className={className} strokeWidth={1.5} aria-hidden />;
}

export function SectionGlyph({
  name,
  className = "size-7",
}: {
  name: "gift" | "tree" | "search";
  className?: string;
}) {
  const Icon = name === "tree" ? TreePine : name === "search" ? Search : Gift;
  return <Icon className={className} strokeWidth={1.5} aria-hidden />;
}
