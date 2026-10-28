export type Tool = {
  name: string;
  website: string;
  /** Completes "Best for …". */
  bestFor: string;
  price: string;
  /** A few words for comparison tables, e.g. "Free tier; from $120/user/yr". */
  priceSummary: string;
  platforms: string;
  license: string;
  firstReleased: string;
  summary: string;
  features: string[];
  strengths: string[];
  limitations: string[];
};

/** Anchor id for a tool's review, so tables and lists can link to it. */
export const toolId = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/**
 * One tool in a comparison post: the facts at a glance, a summary, its key
 * features, and what it does well and badly.
 */
export default function ToolReview({ tool }: { tool: Tool }) {
  const id = toolId(tool.name);
  const host = new URL(tool.website).hostname.replace(/^www\./, "");

  return (
    <section className="tool-review" aria-labelledby={id}>
      <h3 id={id} className="scroll-mt-6 text-[1.35rem] font-semibold leading-snug tracking-tight">
        {tool.name}
      </h3>
      <p className="mt-1 text-[15px] text-accent-ink">Best for {tool.bestFor}</p>

      <dl className="mt-5 grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[15px] leading-relaxed">
        <dt className="text-muted">Price</dt>
        <dd>{tool.price}</dd>
        <dt className="text-muted">Platforms</dt>
        <dd>{tool.platforms}</dd>
        <dt className="text-muted">License</dt>
        <dd>{tool.license}</dd>
        <dt className="text-muted">First released</dt>
        <dd>{tool.firstReleased}</dd>
        <dt className="text-muted">Website</dt>
        <dd>
          <a href={tool.website} target="_blank" rel="noopener noreferrer">
            {host}
          </a>
        </dd>
      </dl>

      <p className="mt-5">{tool.summary}</p>

      <h4 className="mt-6 text-[15px] font-semibold">Key features</h4>
      <ul className="mt-2">
        {tool.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <div>
          <h4 className="text-[15px] font-semibold">Strengths</h4>
          <ul className="mt-2">
            {tool.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[15px] font-semibold">Limitations</h4>
          <ul className="mt-2">
            {tool.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
