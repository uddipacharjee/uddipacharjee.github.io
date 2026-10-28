import type { Tool } from "@/components/blog/ToolReview";

/**
 * Git GUI clients reviewed in /blogs/best-git-gui-clients/, in the order the
 * post lists them. Facts (prices, platforms, licenses, release years, features) were
 * checked against each vendor's own site, docs and repositories in October
 * 2026; update `dateModified` on the post when you refresh them.
 */
export const gitClients: Tool[] = [
  {
    name: "GitHub Desktop",
    website: "https://github.com/apps/desktop",
    bestFor: "beginners and teams that live on GitHub",
    price: "Free",
    priceSummary: "Free",
    platforms: "macOS, Windows",
    license: "Open source (MIT)",
    firstReleased: "2017 (the current app)",
    summary:
      "GitHub’s own client, built to make the everyday loop of commit, push, pull and pull request as simple as possible. It replaced the older GitHub for Mac and GitHub for Windows apps.",
    features: [
      "Stage individual lines",
      "Check out pull requests and add co-authors to commits",
      "Drag-and-drop cherry-pick, squash and reorder",
      "Copilot-generated commit messages, including on Copilot Free",
      "Worktree support",
    ],
    strengths: [
      "Free and open source",
      "The gentlest learning curve of any client here",
      "Signing in is optional",
    ],
    limitations: [
      "No official Linux build; a community fork exists but lags behind",
      "No built-in merge editor: conflicts open in your text editor",
      "Pull request and Copilot features only work with GitHub",
    ],
  },
  {
    name: "LithiumGit",
    website: "https://lithiumgit.com",
    bestFor: "a free, graph-centred client on Windows, macOS or Linux",
    price: "Free, including business use",
    priceSummary: "Free",
    platforms: "macOS, Windows, Linux",
    license: "Proprietary freeware (closed source)",
    firstReleased: "In development since 2021",
    summary:
      "A free client built around an interactive commit graph, where you merge, rebase, cherry-pick and branch by acting on the graph itself. It uses the Git you already have installed and works with any remote host.",
    features: [
      "Interactive graph: merge, rebase, cherry-pick, checkout and create branches from it",
      "Built-in file editing: change files right in the app, without switching to an editor",
      "Hunk-by-hunk staging with an editable side-by-side diff",
      "Advanced conflict resolution editor: current and incoming changes side by side, accept either or both per conflict, and track how many are resolved",
      "Stash management: save, apply, pop and delete",
      "Patch import and export for sharing uncommitted changes",
    ],
    strengths: [
      "Free for commercial use, with no account or sign-in",
      "Official builds for all three desktop platforms",
      "Works with GitHub, GitLab, Bitbucket, Gerrit or any other remote",
    ],
    limitations: [
      "Closed source, and pull requests are not accepted",
      "Git must be installed separately",
      "No documented interactive rebase, Git LFS, submodules or hosting integrations",
    ],
  },
  {
    name: "Fork",
    website: "https://git-fork.com",
    bestFor: "a one-time purchase on macOS or Windows",
    price: "$59.99 one-time, for personal and commercial use (free evaluation)",
    priceSummary: "$59.99 once",
    platforms: "macOS, Windows",
    license: "Proprietary",
    firstReleased: "2016 (macOS), 2018 (Windows)",
    summary:
      "A desktop client sold as a single purchase rather than a subscription, with frequent releases on both platforms. Its visual interactive rebase and conflict helper make history editing approachable without hiding what Git is doing.",
    features: [
      "Visual interactive rebase",
      "Merge-conflict helper with a built-in resolver",
      "Image diffs, blame and file history",
      "Git LFS, submodules, Git-flow and worktrees",
      "AI-assisted commit messages",
    ],
    strengths: [
      "One payment covers one user on up to three machines",
      "No account needed",
      "Actively developed, with frequent releases on both platforms",
    ],
    limitations: ["No Linux version", "Paid once the evaluation ends"],
  },
  {
    name: "GitKraken Desktop",
    website: "https://www.gitkraken.com/git-client",
    bestFor: "teams that want integrations and a polished graph on any OS",
    price:
      "Free for local and public repositories; paid plans from $120 per user per year (list price)",
    priceSummary: "Free tier; from $120/user/yr",
    platforms: "macOS, Windows, Linux",
    license: "Proprietary",
    firstReleased: "2016",
    summary:
      "The most feature-rich client in this list, built around a colourful commit graph and a growing set of team and AI features. The free Community plan covers local and public repositories; private remotes need a subscription.",
    features: [
      "Commit graph at the centre of the interface",
      "Interactive rebase, Git LFS, submodules and worktrees",
      "Built-in merge tool and conflict detection across a team",
      "GitHub, GitLab, Bitbucket and Azure DevOps integrations (Jira and Trello on paid plans)",
      "GitKraken AI for commit messages, pull request descriptions and conflict resolution",
    ],
    strengths: [
      "Runs on Linux, with .deb, .rpm and Snap packages",
      "Integrations reach issue trackers as well as hosting",
      "One subscription also covers GitLens Pro in VS Code",
    ],
    limitations: [
      "Private repositories need a paid plan",
      "Subscription only",
      "Self-hosted GitHub and GitLab integrations need the higher tiers",
    ],
  },
  {
    name: "SmartGit",
    website: "https://www.smartgit.dev",
    bestFor: "a mature cross-platform client, free for non-commercial use",
    price: "Free for non-commercial use; commercial from $5 per user per month",
    priceSummary: "Free non-commercial; from $5/user/mo",
    platforms: "macOS, Windows, Linux",
    license: "Proprietary",
    firstReleased: "2009",
    summary:
      "One of the longest-running Git clients, with a dense, capable interface and first-class Linux support. A free Hobby licence unlocks almost everything for personal, non-commercial work.",
    features: [
      "Commit graph and a dedicated Conflict Solver",
      "Git-Flow, GitHub Flow and Feature Flow support",
      "Git LFS and worktrees",
      "GitHub, GitLab, Bitbucket, Azure DevOps and Jira integrations",
      "AI commit messages and custom AI prompts",
    ],
    strengths: [
      "Linux packages as tar, Flatpak and .deb",
      "Free for open source, education and charities as well",
      "30-day anonymous evaluation",
    ],
    limitations: [
      "The free licence needs registration with your real name and is reviewed by hand",
      "Self-hosted integrations are commercial-only",
      "Subscription licences need internet access to renew the licence file",
    ],
  },
  {
    name: "Sourcetree",
    website: "https://www.sourcetreeapp.com",
    bestFor: "a free, full-featured client for Bitbucket teams",
    price: "Free",
    priceSummary: "Free",
    platforms: "macOS, Windows",
    license: "Proprietary",
    firstReleased: "macOS by 2011, Windows in 2013",
    summary:
      "Atlassian’s free client, with a long feature list for a price of zero. It suits teams already using Bitbucket and Jira, and still supports Mercurial alongside Git.",
    features: [
      "Stage or discard by file, hunk or line",
      "Interactive rebase",
      "Git LFS, Git-flow and submodules",
      "Search across commits, file changes and branches",
      "Bitbucket integration, plus Mercurial support",
    ],
    strengths: ["Free, with no paid tiers or feature limits", "Git-flow built in"],
    limitations: ["Requires an Atlassian account", "No Linux version"],
  },
  {
    name: "Sublime Merge",
    website: "https://www.sublimemerge.com",
    bestFor: "keyboard-driven developers and Sublime Text users",
    price: "$99 one-time for personal use (3 years of updates); $75 per user per year for business",
    priceSummary: "$99 once (personal)",
    platforms: "macOS, Windows, Linux",
    license: "Proprietary",
    firstReleased: "2018",
    summary:
      "From the makers of Sublime Text, with the same command palette and keyboard-first design. Its diffs and search are the main draw: syntax-highlighted, character-level, and quick to navigate.",
    features: [
      "Stage files, hunks or individual lines",
      "Built-in merge tool",
      "Side-by-side, syntax-highlighted diffs with character-level changes",
      "Instant search across commit messages, authors, paths and contents",
      "Command palette and custom Git commands",
    ],
    strengths: [
      "One personal licence covers all your machines and operating systems",
      "Official Linux packages and repositories",
      "Keyboard-driven, in the style of Sublime Text",
    ],
    limitations: [
      "A licence is required for continued use after evaluating",
      "No pull request or hosting integrations",
    ],
  },
  {
    name: "TortoiseGit",
    website: "https://tortoisegit.org",
    bestFor: "Windows users who want Git inside File Explorer",
    price: "Free, including commercial use",
    priceSummary: "Free",
    platforms: "Windows",
    license: "Open source (GPL v2)",
    firstReleased: "2008",
    summary:
      "Not a separate app but a Windows Explorer extension: right-click a folder for Git commands, and see each file’s status in its icon. It will feel familiar to anyone who used TortoiseSVN.",
    features: [
      "Explorer context menu and status overlay icons",
      "TortoiseGitMerge, TortoiseGitBlame and image diff tools",
      "Rebase, reflog, bisect and stash dialogs",
      "Submodules, worktrees and Git LFS locking",
      "Issue tracker integration and a spell-checking commit dialog",
    ],
    strengths: [
      "Free and open source, for any use",
      "Works wherever you browse files, with no extra window",
      "Very mature, with active releases",
    ],
    limitations: [
      "Windows only",
      "Needs Git for Windows installed separately",
      "No single window with the whole repository’s history and graph",
    ],
  },
  {
    name: "Tower",
    website: "https://www.git-tower.com",
    bestFor: "professionals who want undo and polish on macOS or Windows",
    price: "$69 to $149 per user per year (30-day free trial)",
    priceSummary: "From $69/user/yr",
    platforms: "macOS, Windows",
    license: "Proprietary",
    firstReleased: "2011 (macOS), 2016 (Windows)",
    summary:
      "A polished commercial client whose signature feature is undo: press Cmd/Ctrl+Z after many Git operations and they are reversed. Strong documentation and support make it popular with companies.",
    features: [
      "Undo for many Git actions",
      "Drag-and-drop interactive rebase, merge and cherry-pick",
      "Conflict Wizard for guided conflict resolution",
      "Stacked branches (Pro plan)",
      "Worktrees, Git LFS, submodules and Git-flow",
    ],
    strengths: [
      "Undo makes experimenting with history much less risky",
      "One licence covers both macOS and Windows",
      "Free for students, teachers and non-profits",
    ],
    limitations: [
      "No Linux version",
      "Subscription only, with no free tier after the trial",
      "Some features need the Pro plan",
    ],
  },
];
