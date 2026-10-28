/**
 * Single source of truth for every piece of content on the site.
 *
 * First draft, assembled from the public GitHub profile
 * (github.com/uddipacharjee): name, location and avatar come from the
 * profile; the skills come from the build files and source of the Java
 * repositories on it (EdcOnboardingApplication, modulith, spring-batch-demo,
 * Todo-Keeper); the "exploring" line comes from recent forks
 * (spring-ai-playground, rag-from-scratch). The summary copy is written from
 * that evidence and should be rewritten in Uddip's own words.
 */

export const profile = {
  name: "Uddip Acharjee Shuvo",
  role: "Java Backend Engineer",
  location: "Dhaka, Bangladesh",
  /** Shown in the hero and footer when set. Not public on GitHub. */
  email: null as string | null,
  /** Square portrait; currently the GitHub avatar. Set to null to hide. */
  photo: "/assets/profile.jpg" as string | null,
  /** Drop a PDF in public/assets/ and point this at it to add a résumé link. */
  resumeFile: null as string | null,
  intro:
    "Java backend engineer in Dhaka. I build Spring Boot services, batch pipelines and the integrations between them.",
  summary: [
    "Most of what I build lives on the server: REST APIs on Spring Boot, batch jobs that load large flat files into PostgreSQL, and onboarding services that talk to other platforms through their management APIs.",
    "I like code that stays easy to change: modules with clear boundaries, tests that run on every build, and services anyone on the team can start with a single docker compose up.",
  ],
  exploring: ["Spring AI", "retrieval-augmented generation", "MCP servers"],
};

/** Only the links that are set are rendered. */
export const socials = {
  github: "https://github.com/uddipacharjee",
  linkedin: null as string | null,
};

export type FocusArea = { title: string; body: string };

export const focusAreas: FocusArea[] = [
  {
    title: "Modular services",
    body: "Spring Boot applications split into modules with Spring Modulith, which talk to each other through domain events rather than direct calls.",
  },
  {
    title: "Batch processing",
    body: "Spring Batch jobs that load CSV and fixed-width files of up to a million rows into PostgreSQL, started on demand from a REST endpoint.",
  },
  {
    title: "Integration APIs",
    body: "Validated, OpenAPI-documented REST endpoints, including connector onboarding against Eclipse Dataspace Components.",
  },
];

export type SkillLayer = {
  name: string;
  /** What this layer does in a service, in plain words. */
  role: string;
  items: string[];
};

/**
 * Ordered the way a request travels through a service: from the API at the
 * edge down to the runtime underneath. The Skills section tints each layer a
 * little deeper than the one above it.
 */
export const skillLayers: SkillLayer[] = [
  {
    name: "API",
    role: "What other systems call",
    items: ["Spring Web MVC", "REST", "OpenAPI / Swagger", "Bean Validation"],
  },
  {
    name: "Application",
    role: "Where the business rules live",
    items: ["Spring Boot 3", "Spring Modulith", "Domain events", "Lombok", "Actuator"],
  },
  {
    name: "Batch & integration",
    role: "Moving data in and out",
    items: ["Spring Batch", "Flat-file ingest", "Eclipse Dataspace Components"],
  },
  {
    name: "Persistence",
    role: "Where the data is kept",
    items: ["Spring Data JPA", "Hibernate", "PostgreSQL", "MySQL"],
  },
  {
    name: "Runtime",
    role: "What it all runs on",
    items: ["Java 21", "Java 17", "Docker"],
  },
];

/** Tooling that surrounds the code rather than sitting in a layer of it. */
export const tooling: string[] = [
  "Gradle",
  "Maven",
  "JUnit 5",
  "Spring Boot Test",
  "JaCoCo",
  "Docker Compose",
  "Git",
];

export const navLinks = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
];
