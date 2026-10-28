/**
 * Every blog post's details. The index at /blogs/ lists these newest first,
 * whatever their order here, and each post page reads its own entry for its
 * header, metadata and JSON-LD. Posts published on the same day keep the
 * order they have here.
 *
 * Each entry needs a matching page at app/blogs/<slug>/page.tsx that wraps
 * its content in <BlogPost slug="...">. See "Adding a blog post" in the README.
 */

export type Post = {
  /** URL segment, and the name of the post's folder under app/blogs/. */
  slug: string;
  /** Also the <title>: keep it under ~60 characters, main keyword first. */
  title: string;
  /** 140–160 characters: shown on the index and used as the meta description. */
  description: string;
  category: string;
  /** Calendar dates as YYYY-MM-DD. */
  datePublished: string;
  dateModified?: string;
  readingMinutes: number;
  /** Search keywords; also how related posts are picked. */
  tags: string[];
  /** The post's main diagram, under public/; used as its image in JSON-LD. */
  image?: string;
};

export const blogIntro =
  "Notes from building Java and Spring services: what worked, what broke, and why.";

export const posts: Post[] = [
  {
    slug: "spring-batch-process-million-row-file",
    title: "Process a Million-Row File with Spring Batch",
    description:
      "Load a million-row CSV or fixed-width file into PostgreSQL with Spring Batch 5: chunk-oriented steps, fast batched writes, async launch and safe restarts.",
    category: "Spring Batch",
    datePublished: "2026-10-28",
    readingMinutes: 10,
    tags: ["Spring Batch", "Spring Boot", "PostgreSQL", "Batch processing", "Java"],
    image: "/blogs/spring-batch-process-million-row-file/chunk-oriented-step.svg",
  },
  {
    slug: "spring-modulith-modular-monolith",
    title: "Spring Modulith: Build a Modular Monolith in Spring Boot",
    description:
      "Give a Spring Boot monolith real module boundaries with Spring Modulith: package conventions, verify() tests, named interfaces, events and generated docs.",
    category: "Architecture",
    datePublished: "2026-10-28",
    readingMinutes: 9,
    tags: ["Spring Modulith", "Spring Boot", "Modular monolith", "Architecture", "Java"],
    image: "/blogs/spring-modulith-modular-monolith/module-boundaries.svg",
  },
  {
    slug: "spring-modulith-transactional-outbox",
    title: "Transactional Outbox with Spring Modulith Events",
    description:
      "Use Spring Modulith’s event publication registry as a transactional outbox: @ApplicationModuleListener, JDBC or JPA setup, retries, cleanup and Kafka.",
    category: "Architecture",
    datePublished: "2026-10-28",
    readingMinutes: 9,
    tags: ["Spring Modulith", "Transactional outbox", "Event-driven", "Spring Boot", "Kafka", "Java"],
    image: "/blogs/spring-modulith-transactional-outbox/event-publication-registry.svg",
  },
  {
    slug: "spring-boot-jpa-n-plus-one-open-in-view",
    title: "Fix JPA N+1 Queries and Open-in-View in Spring Boot",
    description:
      "Find and fix Hibernate N+1 queries in Spring Boot with join fetch, entity graphs, batch fetching and DTOs, and why spring.jpa.open-in-view=false matters.",
    category: "Persistence",
    datePublished: "2026-10-28",
    readingMinutes: 9,
    tags: ["JPA", "Hibernate", "Spring Data JPA", "Spring Boot", "Performance", "Java"],
    image: "/blogs/spring-boot-jpa-n-plus-one-open-in-view/n-plus-one-queries.svg",
  },
  {
    slug: "virtual-threads-spring-boot-java-21",
    title: "Virtual Threads in Spring Boot: When They Actually Help",
    description:
      "Enable virtual threads in Spring Boot on Java 21, understand pinning and connection-pool limits, and measure whether they help your blocking I/O workload.",
    category: "Concurrency",
    datePublished: "2026-10-28",
    readingMinutes: 9,
    tags: ["Virtual threads", "Java 21", "Spring Boot", "Concurrency", "Performance", "Java"],
    image: "/blogs/virtual-threads-spring-boot-java-21/platform-vs-virtual-threads.svg",
  },
  {
    slug: "spring-boot-problemdetail-validation",
    title: "Spring Boot REST Errors with ProblemDetail and Validation",
    description:
      "Return consistent RFC 9457 error responses from Spring Boot: Bean Validation, ProblemDetail, @RestControllerAdvice, field errors, tests and OpenAPI docs.",
    category: "APIs",
    datePublished: "2026-10-28",
    readingMinutes: 8,
    tags: ["Spring Boot", "REST API", "Bean Validation", "ProblemDetail", "OpenAPI", "Java"],
    image: "/blogs/spring-boot-problemdetail-validation/problem-detail-flow.svg",
  },
  {
    slug: "spring-boot-testing-testcontainers-jacoco",
    title: "Testing Spring Boot: Slices, Testcontainers and JaCoCo",
    description:
      "A practical Spring Boot testing setup: fast slice tests, real PostgreSQL with Testcontainers and @ServiceConnection, and a JaCoCo coverage gate in Gradle.",
    category: "Testing",
    datePublished: "2026-10-28",
    readingMinutes: 9,
    tags: ["Testing", "Spring Boot", "Testcontainers", "JUnit 5", "JaCoCo", "Java"],
    image: "/blogs/spring-boot-testing-testcontainers-jacoco/test-slices.svg",
  },
  {
    slug: "java-records-vs-lombok",
    title: "Java Records vs Lombok: Do You Still Need Lombok?",
    description:
      "Java records vs Lombok’s @Value, @Data and @Builder on Java 21: where records replace Lombok, where they can’t (JPA entities) and how to migrate safely.",
    category: "Java",
    datePublished: "2026-10-28",
    readingMinutes: 8,
    tags: ["Java", "Java records", "Lombok", "Java 21", "Spring Boot", "JPA"],
    image: "/blogs/java-records-vs-lombok/records-or-lombok.svg",
  },
  {
    slug: "eclipse-dataspace-components-edc-spring-boot",
    title: "Eclipse Dataspace Components (EDC) with Spring Boot",
    description:
      "How EDC connectors share data: assets, ODRL policies and contract definitions via the Management API, called from a Spring Boot onboarding service.",
    category: "Data spaces",
    datePublished: "2026-10-28",
    readingMinutes: 11,
    tags: ["Eclipse Dataspace Components", "EDC", "Data spaces", "ODRL", "Spring Boot", "Java"],
    image: "/blogs/eclipse-dataspace-components-edc-spring-boot/edc-connector-flow.svg",
  },
  {
    slug: "spring-ai-rag-mcp-server",
    title: "Spring AI: RAG and an MCP Server in Spring Boot",
    description:
      "Build retrieval-augmented generation with Spring AI 2, PGVector and a ChatClient advisor, then expose the same search to AI assistants as an MCP tool.",
    category: "AI",
    datePublished: "2026-10-28",
    readingMinutes: 10,
    tags: ["Spring AI", "RAG", "MCP", "PGVector", "Spring Boot", "Java"],
    image: "/blogs/spring-ai-rag-mcp-server/rag-pipeline.svg",
  },
  {
    slug: "best-git-gui-clients",
    title: "Best Git GUI Clients in 2026: Price, Platforms and Licences",
    description:
      "The best and most popular Git GUI clients for Windows, macOS and Linux, compared on price, platforms, licences and features, with advice on choosing.",
    category: "Developer tools",
    datePublished: "2026-10-28",
    readingMinutes: 14,
    tags: ["Git", "Git GUI", "Developer tools", "Version control", "IntelliJ IDEA", "VS Code"],
    image: "/blogs/best-git-gui-clients/git-clients-at-a-glance.svg",
  },
  {
    slug: "which-jdk-distribution",
    title: "Which JDK Distribution Should You Use in 2026?",
    description:
      "Temurin, Corretto, Zulu, Liberica, Oracle JDK and more compared for 2026: free update dates, licences, platforms, Docker images and Spring Boot tips.",
    category: "Developer tools",
    datePublished: "2026-10-28",
    readingMinutes: 15,
    tags: ["Java", "JDK", "OpenJDK", "Developer tools", "Spring Boot", "Docker"],
    image: "/blogs/which-jdk-distribution/java-25-free-updates.svg",
  },
];

export const postsNewestFirst = [...posts].sort((a, b) =>
  b.datePublished.localeCompare(a.datePublished),
);

/** Fails the build if a post page names a slug with no entry above. */
export function getPost(slug: string): Post {
  const post = posts.find((p) => p.slug === slug);
  if (!post) throw new Error(`No entry for "${slug}" in data/blogs.ts`);
  return post;
}

/**
 * Other posts ranked by how many tags they share with this one, newest
 * first among equals. Feeds the "Related posts" links under each post.
 */
export function relatedPosts(slug: string, limit = 3): Post[] {
  const tags = new Set(getPost(slug).tags);
  return postsNewestFirst
    .filter((p) => p.slug !== slug)
    .map((p) => ({ post: p, shared: p.tags.filter((t) => tags.has(t)).length }))
    .sort((a, b) => b.shared - a.shared)
    .slice(0, limit)
    .map(({ post }) => post);
}
