import { store } from "@/lib/config/store.config";

export function IntroStatic() {
  return (
    <div id="intro-static" className="intro-curtain intro-curtain-static" aria-hidden suppressHydrationWarning>
      <div className="intro-panel intro-panel-top" />
      <div className="intro-panel intro-panel-bottom" />
      <div className="intro-center">
        <span className="intro-line intro-line-static" />
        <p className="intro-mark intro-mark-static">{store.brand.name}</p>
      </div>
    </div>
  );
}
