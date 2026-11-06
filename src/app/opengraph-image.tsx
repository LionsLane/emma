import { ImageResponse } from "next/og";

// The share image for emma.lionslane.co.ke (1200x630), drawn from text so it never goes stale.
export const alt = "EMMA by Lions Lane: the AI marketing assistant for small businesses in Kenya";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 80px", background: "#050914", color: "#e8eeff", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: "radial-gradient(circle at 35% 35%, #22e6d3, #3d7bff 55%, #7c3aed)" }} />
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: 6 }}>EMMA</div>
          <div style={{ fontSize: 22, color: "#8191b8", marginLeft: 8 }}>by Lions Lane</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.08, maxWidth: 980 }}>The marketing team that already knows your business.</div>
          <div style={{ fontSize: 30, color: "#b4c0de", maxWidth: 980 }}>Brief her in one sentence. She plans your posts, writes them in your voice and follows up your leads. You approve everything.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#8191b8" }}>
          <span>Free to start · Pro KES 500 · Max KES 1,500 a month</span>
          <span>emma.lionslane.co.ke</span>
        </div>
      </div>
    ),
    size,
  );
}
