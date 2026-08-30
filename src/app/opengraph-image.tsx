import { ImageResponse } from "next/og";
import { store } from "@/lib/config/store.config";

export const runtime = "nodejs";
export const contentType = "image/png";

// Socialinių tinklų (OG) paveikslėlis — Next file convention: default export.
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #571925 0%, #6B1F2E 55%, #43121d 100%)",
          color: "#FAF5EC",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ fontSize: 72, fontWeight: 700 }}>{store.brand.name}</span>
          <div
            style={{
              width: 36,
              height: 36,
              background: "#C9A24B",
              borderRadius: 999,
              transform: "rotate(45deg)",
            }}
          />
        </div>
        <div style={{ marginTop: 18, fontSize: 34, opacity: 0.85 }}>
          {`${store.brand.tagline} — pristatome visoje Lietuvoje`}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
