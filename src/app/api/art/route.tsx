import { ImageResponse } from "next/og";

export const runtime = "nodejs";

// Prekės atvaizdas katalogų feed'ams (Google Merchant, Meta, TikTok).
// DEMO: generuojamas elegantiškas gradientas su monograma — prieš paleisdami
// pakeiskite tikrais produkto nuotraukomis (product.images).
const palettes: Record<string, [string, string]> = {
  zvakide: ["#F6EBDD", "#E9D3B4"],
  pledas: ["#F3E7E0", "#DFC5B4"],
  silkas: ["#F6E8EA", "#E3C2C8"],
  viskis: ["#EFE6D6", "#CFA96F"],
  sodas: ["#EDF2E4", "#CBDCB4"],
  knyga: ["#F4EDE3", "#DCCDB1"],
  difuzorius: ["#EFF0EA", "#CBD2C4"],
  kojines: ["#F6EEE6", "#E5CDB9"],
  termosas: ["#ECEEF0", "#BFC8CD"],
  zaidimai: ["#F6ECDD", "#EBCB9E"],
  krepselis: ["#F5E6E0", "#DDB9AC"],
  arbata: ["#F1EFE6", "#D6D2BE"],
  "sildymo-lempa": ["#F5F0E6", "#E4D4B4"],
  roze: ["#F6E8EA", "#E3C2C8"],
  menulis: ["#F0EBE1", "#D8CCB6"],
  saulelydis: ["#F6EDE0", "#E8C8A0"],
  lietus: ["#F0EEE8", "#D4D0C4"],
  sildykle: ["#F5EEE4", "#E4D4BC"],
  galaktika: ["#EEEAF0", "#D0C8D8"],
  plakiklis: ["#F3EEE4", "#DDD2BE"],
  masazas: ["#EFE8DC", "#D6C8B0"],
  uzvalkalas: ["#F6EFE4", "#E8D8C2"],
  guasha: ["#F6E8EA", "#E8C8D0"],
};

export async function GET(req: Request) {
  const seed = new URL(req.url).searchParams.get("seed") ?? "zvakide";
  const [from, to] = palettes[seed] ?? palettes.zvakide;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${from}, ${to})`,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 70,
            width: 90,
            height: 14,
            background: "rgba(107,31,46,0.28)",
            borderRadius: 999,
          }}
        />
        <div style={{ fontSize: 220, color: "rgba(87,25,37,0.75)", fontStyle: "italic" }}>
          J
        </div>
      </div>
    ),
    { width: 600, height: 750 }
  );
}
