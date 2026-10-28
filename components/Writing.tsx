import { postsNewestFirst } from "@/data/blogs";
import { formatDate } from "@/lib/dates";
import Section from "./Section";

const LATEST = 3;

/** The newest posts on the home page; renders nothing until there are any. */
export default function Writing() {
  if (postsNewestFirst.length === 0) return null;

  return (
    <Section id="writing" title="Writing">
      <ul className="space-y-8">
        {postsNewestFirst.slice(0, LATEST).map((post) => (
          <li key={post.slug}>
            <a
              href={`/blogs/${post.slug}/`}
              className="text-xl font-semibold leading-snug tracking-tight transition-colors hover:text-accent-ink"
            >
              {post.title}
            </a>
            <p className="mt-1.5 max-w-[62ch] text-[15px] leading-relaxed text-muted">
              {post.description}
            </p>
            <time
              dateTime={post.datePublished}
              className="mt-2 block text-sm text-faint"
            >
              {formatDate(post.datePublished)}
            </time>
          </li>
        ))}
      </ul>
      <a href="/blogs/" className="link mt-10 inline-block text-[15px]">
        {postsNewestFirst.length > LATEST
          ? `All ${postsNewestFirst.length} posts`
          : "All posts"}
      </a>
    </Section>
  );
}
