import type { ComponentProps } from "react";

type SafeDivProps = ComponentProps<"div">;

export function SafeDiv({ suppressHydrationWarning = true, ...props }: SafeDivProps) {
  return <div suppressHydrationWarning={suppressHydrationWarning} {...props} />;
}
