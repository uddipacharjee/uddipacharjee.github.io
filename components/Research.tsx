import { profile, publications, researchInterests, socials } from "@/data/resume";
import Section from "./Section";

const interests = new Intl.ListFormat("en", { type: "conjunction" }).format(
  researchInterests,
);

/** Author list with the site owner set in the ink colour, the rest muted. */
function Authors({ names }: { names: string[] }) {
  return (
    <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
      {names.map((name, i) => (
        <span key={name}>
          {i > 0 && ", "}
          {name === profile.name ? (
            <strong className="font-semibold text-ink">{name}</strong>
          ) : (
            name
          )}
        </span>
      ))}
    </p>
  );
}

export default function Research() {
  return (
    <Section id="research" title="Research">
      <p className="max-w-[60ch] text-[17px] leading-[1.7] md:text-lg">
        Applied machine learning, mostly for biology and health: {interests}.
      </p>

      <ol className="mt-12 space-y-10">
        {publications.map((paper) => (
          <li
            key={paper.url}
            className="grid gap-x-8 gap-y-2 md:grid-cols-[9rem_minmax(0,1fr)]"
          >
            <p className="text-sm text-faint md:pt-1">
              <span className="tabular-nums">{paper.year}</span>
              <span className="ml-2 rounded-full border border-rule px-2 py-0.5 text-xs text-muted">
                {paper.kind}
              </span>
            </p>
            <div className="max-w-[68ch]">
              <a
                href={paper.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-lg font-semibold leading-snug tracking-tight transition-colors hover:text-accent-ink"
              >
                {paper.title}
              </a>
              <Authors names={paper.authors} />
              <p className="mt-1 text-[15px] italic text-muted">{paper.venue}</p>
              {paper.links && (
                <ul className="mt-2 flex gap-4 text-sm">
                  {paper.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="link text-muted"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>

      {socials.scholar && (
        <a
          href={socials.scholar}
          target="_blank"
          rel="noreferrer noopener"
          className="link mt-12 inline-block text-[15px]"
        >
          All publications and citations on Google Scholar
        </a>
      )}
    </Section>
  );
}
