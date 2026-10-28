import type { ReactNode } from "react";

/** A side note set off from the body text: a tip, a warning, a rule of thumb. */
export default function Callout({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className="callout">
      {title && <p className="font-semibold">{title}</p>}
      {children}
    </aside>
  );
}
