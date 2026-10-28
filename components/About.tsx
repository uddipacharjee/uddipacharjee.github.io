import { focusAreas, profile } from "@/data/resume";
import Section from "./Section";

const exploring = new Intl.ListFormat("en", { type: "conjunction" }).format(
  profile.exploring,
);

export default function About() {
  return (
    <Section id="about" title="About">
      <div className="max-w-[60ch] space-y-5 text-[17px] leading-[1.7] md:text-lg">
        {profile.summary.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <dl className="mt-14 grid gap-x-10 gap-y-8 lg:grid-cols-3">
        {focusAreas.map((area) => (
          <div key={area.title}>
            <dt className="font-semibold text-ink">{area.title}</dt>
            <dd className="mt-2 text-[15px] leading-relaxed text-muted">
              {area.body}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-14 text-[15px] text-muted">
        Lately exploring {exploring}.
      </p>
    </Section>
  );
}
