import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

/** Shared section shell: heading in a narrow left column, content on the right. */
export default function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="border-t border-rule py-20 md:py-28">
      <div className="shell grid gap-y-8 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-x-12 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <h2 className="text-[15px] font-semibold text-ink md:pt-1">{title}</h2>
        <div>{children}</div>
      </div>
    </section>
  );
}
