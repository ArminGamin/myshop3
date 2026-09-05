import { store } from "@/lib/config/store.config";

export function IntroStatic() {
  return (
    <div id="intro-static" className="intro-curtain intro-curtain-static" aria-hidden suppressHydrationWarning>
      <div className="intro-panel intro-panel-top" />
      <div className="intro-panel intro-panel-bottom" />
      <div className="intro-center">
        <span className="intro-motes" aria-hidden>
          <span /><span /><span /><span /><span /><span />
          <span /><span /><span /><span /><span /><span />
          <span /><span /><span /><span /><span /><span />
          <span /><span />
        </span>
        <span className="intro-line intro-line-static" />
        <p className="intro-mark intro-mark-static">{store.brand.name}</p>
        <p className="intro-tagline">{store.brand.tagline}</p>
      </div>
    </div>
  );
}
