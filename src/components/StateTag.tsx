import type { ReactNode } from "react";

type StateTagProps = {
  tone?: "quiet" | "alert" | "accent";
  children: ReactNode;
};

export function StateTag({ tone = "quiet", children }: StateTagProps) {
  const toneClass =
    tone === "alert"
      ? "border-ball/50 text-ball"
      : tone === "accent"
        ? "border-test/50 text-test"
        : "border-rule text-paper-mute";

  return (
    <span
      className={`inline-flex items-center border px-1.5 py-1 font-mono text-[9px] font-medium uppercase leading-none tracking-[0.14em] ${toneClass}`}
    >
      {children}
    </span>
  );
}
