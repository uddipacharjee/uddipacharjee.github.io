import BlogPost, { postMetadata } from "@/components/blog/BlogPost";
import Faq, { faqSchema, type FaqItem } from "@/components/blog/Faq";
import Figure from "@/components/blog/Figure";
import ToolReview, { toolId } from "@/components/blog/ToolReview";
import { gitClients } from "@/data/gitClients";

const SLUG = "best-git-gui-clients";
const IMG = `/blogs/${SLUG}`;

export const metadata = postMetadata(SLUG);

const faqs: FaqItem[] = [
  {
    question: "What is the best free Git GUI client?",
    answer:
      "It depends on your platform and how much openness matters. GitHub Desktop is free and open source on macOS and Windows. TortoiseGit is free and open source on Windows. Sourcetree is free on macOS and Windows but needs an Atlassian account. LithiumGit is free on macOS, Windows and Linux, including for business use, but closed source. GitKraken Desktop and SmartGit have free tiers with limits.",
  },
  {
    question: "Which Git GUI clients work on Linux?",
    answer:
      "GitKraken Desktop, LithiumGit, SmartGit and Sublime Merge have official Linux builds. GitHub Desktop runs on Linux only through an unofficial community build, and Fork, Sourcetree, Tower and TortoiseGit have no Linux version.",
  },
  {
    question: "Which Git GUI clients are open source?",
    answer:
      "Of the nine compared here, GitHub Desktop (MIT) and TortoiseGit (GPL v2). The others are proprietary, including the free ones. In VS Code, the core of the GitLens extension is also MIT-licensed.",
  },
  {
    question: "Is there a good Git GUI without a subscription?",
    answer:
      "Yes. Fork costs $59.99 once, and Sublime Merge's personal licence is $99 once with three years of updates. GitHub Desktop, Sourcetree, TortoiseGit and LithiumGit are free.",
  },
  {
    question: "Is GitKraken free?",
    answer:
      "GitKraken Desktop's free Community plan covers local repositories and public remotes. Private repositories and several integrations need a paid plan, listed from $120 per user per year as of October 2026.",
  },
  {
    question: "Do I need a separate Git client if I use IntelliJ IDEA or VS Code?",
    answer:
      "Often not. Since version 2025.3, IntelliJ IDEA ships as a single distribution whose free tier includes its Git tooling: a commit graph, interactive rebase, a three-pane conflict resolver and partial commits. VS Code has a source control graph, line-level staging and a three-way merge editor built in. A separate client is most useful when you want one tool across editors or a more visual history.",
  },
  {
    question: "Can a Git GUI replace the command line?",
    answer:
      "For most daily work, yes. Most developers still use both: a GUI for reviewing changes, staging parts of files and resolving conflicts, and the command line for scripting and the occasional operation their client does not support.",
  },
];

const itemList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Git GUI clients compared",
  numberOfItems: gitClients.length,
  itemListElement: gitClients.map((tool, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: tool.name,
    url: tool.website,
  })),
};

export default function Post() {
  return (
    <BlogPost slug={SLUG} schema={[itemList, faqSchema(faqs)]}>
      <p>
        Most developers use Git from the command line for the quick things,
        then reach for a graphical client when history gets complicated:
        untangling a branch, staging half a file, or resolving a conflict with
        both sides in view. There are plenty of clients to choose from, and
        they differ more in price, platform and licensing than in what they
        can do.
      </p>
      <p>
        This guide compares nine actively maintained desktop Git clients, plus
        the Git tools already built into IntelliJ IDEA and VS Code. Prices,
        platforms and features come from each vendor’s own site and
        documentation, checked in October 2026.
      </p>
      <h2>What to look for in a Git client</h2>
      <ul>
        <li>
          <strong>Platforms.</strong> Linux support narrows the field
          quickly, and a team on mixed operating systems benefits from one
          tool everywhere.
        </li>
        <li>
          <strong>Licence terms.</strong> “Free” can mean free for public
          repositories only, or free for non-commercial use only. Check before
          using a client at work.
        </li>
        <li>
          <strong>Accounts.</strong> Some clients need a vendor account just
          to start; others need nothing at all.
        </li>
        <li>
          <strong>Conflict resolution.</strong> A built-in merge editor saves
          switching tools at the most stressful moment.
        </li>
        <li>
          <strong>Partial staging.</strong> Staging individual hunks or lines
          is what makes small, focused commits practical.
        </li>
        <li>
          <strong>History editing.</strong> Interactive rebase, cherry-pick,
          and in some clients an undo button.
        </li>
        <li>
          <strong>Integrations and big repositories.</strong> Pull requests
          and issue trackers, plus Git LFS, submodules and worktrees if your
          projects use them.
        </li>
      </ul>

      <h2>Quick comparison</h2>
      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Platforms</th>
            <th>Price</th>
            <th>Best for</th>
          </tr>
        </thead>
        <tbody>
          {gitClients.map((tool) => (
            <tr key={tool.name}>
              <td>
                <a href={`#${toolId(tool.name)}`}>{tool.name}</a>
              </td>
              <td>{tool.platforms}</td>
              <td>{tool.priceSummary}</td>
              <td>{tool.bestFor}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Figure
        src={`${IMG}/git-clients-at-a-glance.svg`}
        alt="Matrix of nine Git GUI clients showing Windows, macOS and Linux support, whether each is free to use, and whether it is open source"
        width={640}
        height={446}
        caption="Platforms, price and licence at a glance, as of October 2026."
      />

      <h2>Which one should you choose?</h2>
      <ul>
        <li>
          <strong>Free and open source:</strong> GitHub Desktop on macOS and
          Windows, or TortoiseGit on Windows.
        </li>
        <li>
          <strong>Free on Linux:</strong> LithiumGit, for any use. SmartGit is
          free for non-commercial use, and GitKraken Desktop for local and
          public repositories.
        </li>
        <li>
          <strong>No subscription:</strong> Fork ($59.99 once) or Sublime
          Merge ($99 once for personal use).
        </li>
        <li>
          <strong>Learning Git on GitHub:</strong> GitHub Desktop.
        </li>
        <li>
          <strong>A Bitbucket and Jira team:</strong> Sourcetree.
        </li>
        <li>
          <strong>Git inside Windows File Explorer:</strong> TortoiseGit.
        </li>
        <li>
          <strong>Undo for Git operations:</strong> Tower.
        </li>
        <li>
          <strong>Team integrations and AI features:</strong> GitKraken
          Desktop.
        </li>
        <li>
          <strong>Keyboard-first, with fast search and diffs:</strong> Sublime
          Merge.
        </li>
        <li>
          <strong>Already in IntelliJ IDEA or VS Code all day:</strong> try the
          built-in tools first (see below).
        </li>
      </ul>

      <h2>The clients</h2>
      {gitClients.map((tool) => (
        <ToolReview key={tool.name} tool={tool} />
      ))}

      <h2>You may already have one: Git in your IDE</h2>
      <h3>IntelliJ IDEA</h3>
      <p>
        Since IntelliJ IDEA 2025.3, the Community and Ultimate editions ship as
        a single download. Without a subscription it is free for commercial
        and non-commercial projects, and the Git tooling is part of that free
        tier:
      </p>
      <ul>
        <li>A Log tab with the commit graph, branch filters and search.</li>
        <li>
          Interactive rebase: reword, squash, drop or edit earlier commits.
        </li>
        <li>
          A three-pane conflict resolver that applies non-conflicting changes
          for you.
        </li>
        <li>Shelve and stash, changelists, and committing part of a file.</li>
        <li>Reviewing GitHub pull requests and GitLab merge requests.</li>
      </ul>
      <p>
        For Java developers this is the strongest argument against a separate
        client: history, conflicts and code navigation all in one window.
      </p>
      <h3>VS Code and GitLens</h3>
      <p>
        VS Code’s built-in Source Control view has a commit graph, staging of
        selected lines, branches, stashes and worktrees, and a three-way merge
        editor. The GitLens extension adds inline blame, file history and an
        interactive rebase editor for free. Its Commit Graph, Worktrees and
        Visual History views are free on public repositories; private ones
        need GitLens Pro, which is the same subscription as GitKraken Pro
        (listed at $120 per user per year as of October 2026).
      </p>

      <h2>Frequently asked questions</h2>
      <Faq items={faqs} />

      <h2>How this comparison was put together</h2>
      <p>
        Prices, platforms, licences, release years and features come from each
        vendor’s website, documentation, release notes and repositories,
        checked in October 2026. Prices are list prices in US dollars, before
        promotions and taxes, and change often, so check the vendor’s site
        before you buy. If something here is out of date, tell me on{" "}
        <a href="https://github.com/uddipacharjee">GitHub</a>.
      </p>
    </BlogPost>
  );
}
