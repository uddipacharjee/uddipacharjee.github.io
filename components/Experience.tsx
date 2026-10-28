import { awards, education, experience } from "@/data/resume";
import Section from "./Section";

/** Industry roles newest first, then education and awards underneath. */
export default function Experience() {
  return (
    <Section id="experience" title="Experience">
      <ol className="space-y-14">
        {experience.map((role) => (
          <li
            key={`${role.company}-${role.start}`}
            className="grid gap-x-8 gap-y-2 md:grid-cols-[9rem_minmax(0,1fr)]"
          >
            <p className="text-sm tabular-nums text-faint md:pt-1">
              {role.start} – {role.end}
            </p>
            <div>
              <h3 className="text-xl font-semibold leading-snug tracking-tight text-ink">
                {role.title}
                <span className="font-normal text-muted"> · {role.company}</span>
              </h3>
              <p className="mt-0.5 text-sm text-faint">{role.location}</p>

              <ul className="mt-4 max-w-[68ch] list-disc space-y-2 pl-5 text-[15px] leading-relaxed marker:text-faint md:text-base">
                {role.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <ul
                aria-label="Stack"
                className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted"
              >
                {role.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-20 grid gap-x-10 gap-y-12 lg:grid-cols-2">
        <div>
          <h3 className="font-semibold text-ink">Education</h3>
          <ul className="mt-4 space-y-4">
            {education.map((item) => (
              <li key={item.school}>
                <p className="text-ink">
                  {item.degree}
                  <span className="text-muted">, {item.school}</span>
                </p>
                <p className="mt-0.5 text-sm text-faint">
                  {item.start} – {item.end} · {item.location}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-ink">Awards &amp; activities</h3>
          <ul className="mt-4 space-y-4">
            {awards.map((award) => (
              <li key={award.title}>
                <p className="text-ink">{award.title}</p>
                <p className="mt-0.5 text-sm text-faint">
                  {award.when} · {award.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
