/**
 * Single source of truth for every piece of content on the site.
 *
 * Experience, education and awards come from Uddip's résumé (2026). The
 * publications come from his Google Scholar / Semantic Scholar profile,
 * cross-checked against Crossref and arXiv for venues, author lists and DOIs.
 * Skills combine the résumé with the build files of his GitHub repositories.
 */

export const siteUrl = "https://uddipacharjee.com";

export const profile = {
  name: "Uddip Acharjee Shuvo",
  role: "Software Engineer & Researcher",
  location: "Dhaka, Bangladesh",
  /** Shown in the hero and footer when set. */
  email: "uddip.acharjee.shuvo@gmail.com" as string | null,
  /** Square portrait; currently the GitHub avatar. Set to null to hide. */
  photo: "/assets/profile.jpg" as string | null,
  /**
   * Drop a PDF in public/assets/ and point this at it to add a résumé link.
   * Strip the phone number and home address from it first: the file is public.
   */
  resumeFile: null as string | null,
  intro:
    "Backend engineer in Dhaka building Java services for airlines and high-traffic platforms, and co-author of research on machine learning for biology and health.",
  summary: [
    "I have spent six years building software in Dhaka, most of it on the server: Spring Boot microservices that connect airlines to a travel platform over NDC and GDS XML, wallet and settlement services for a high-traffic gaming platform, and backend work at Daraz (Alibaba Group).",
    "Alongside industry work I do research with a group of collaborators on large language models and agents for single-cell and genomic biology, multi-omic cancer classification, machine learning for public health, and how well LLMs write code. That work has appeared at ACL, in Briefings in Bioinformatics and PLOS ONE, and at AAAI and ACM venues.",
  ],
  exploring: ["Spring AI", "retrieval-augmented generation", "MCP servers"],
};

/** Only the links that are set are rendered. */
export const socials = {
  github: "https://github.com/uddipacharjee",
  linkedin:
    "https://www.linkedin.com/in/uddip-acharjee-shuvo-a097a3108/" as string | null,
  scholar:
    "https://scholar.google.com/citations?user=F1c4SVgAAAAJ&hl=en" as string | null,
};

export type FocusArea = { title: string; body: string };

export const focusAreas: FocusArea[] = [
  {
    title: "Airline integrations",
    body: "Spring Boot microservices that speak NDC and GDS XML to airlines such as IndiGo and Alliance Air, behind one shared library for search, pricing, seats, ancillaries and booking.",
  },
  {
    title: "High-traffic APIs",
    body: "Wallet, bet-callback and settlement services tuned with Redis caching, virtual threads and connection pooling to stay fast at peak load.",
  },
  {
    title: "Applied ML research",
    body: "LLM agents and genome foundation models for biology, multi-omic cancer classification, and machine learning for public-health data.",
  },
];

export type Role = {
  title: string;
  company: string;
  location: string;
  /** Display strings, as they should read on the page. */
  start: string;
  end: string;
  highlights: string[];
  stack: string[];
};

/** Newest first. */
export const experience: Role[] = [
  {
    title: "Software Engineer",
    company: "Adventure Dhaka Ltd.",
    location: "Dhaka, Bangladesh",
    start: "Apr 2025",
    end: "Present",
    highlights: [
      "Designed and built Spring Boot microservices that integrate airlines (Alliance Air, IndiGo, and Air Astra in progress) into the company's existing PHP platform.",
      "Implemented NDC and GDS XML messaging, with the request and response transformations that map each airline's data onto the internal model.",
      "Cut response times by moving NDC XML parsing (JAXB / Jackson XML) to streaming parsers and removing unnecessary transformations.",
      "Built a shared library on the NDC schemas that every airline integration reuses for search, pricing, seat availability, ancillaries, booking and payment.",
      "Worked with the PHP backend team, product, QA and airline vendors to agree data models, API contracts and integration flows, and kept production healthy with ELK logging and monitoring.",
    ],
    stack: ["Java", "Spring Boot", "MySQL", "Redis", "SOAP / XML", "PHP / Laravel", "Docker", "Kibana"],
  },
  {
    title: "Software Engineer",
    company: "Incognito Solutions Ltd.",
    location: "Dhaka, Bangladesh",
    start: "Jul 2024",
    end: "Mar 2025",
    highlights: [
      "Built high-throughput APIs for game launches, player authentication, wallet operations, bet and result callbacks, and transaction sync with external providers.",
      "Designed and developed the settlement and clearing service that processes users' transactions in batches.",
      "Reduced database load and API latency with Redis caching of sessions, balances and game metadata, Java virtual threads, connection pooling and async processing.",
      "Set up Grafana dashboards to monitor server performance and health.",
    ],
    stack: ["Java", "Spring Boot", "Microservices", "Redis", "PostgreSQL", "Grafana"],
  },
  {
    title: "Backend Engineer",
    company: "Daraz (Alibaba Group)",
    location: "Dhaka, Bangladesh",
    start: "Nov 2023",
    end: "Jul 2024",
    highlights: [
      "Cut data retrieval time by 25% by optimising queries and database operations.",
      "Deployed applications on Alibaba Cloud, managed their server configuration and monitored performance.",
    ],
    stack: ["Java", "Spring Boot", "Alibaba Cloud", "React", "JavaScript"],
  },
  {
    title: "Software Engineer",
    company: "Reve Systems Ltd.",
    location: "Dhaka, Bangladesh",
    start: "Nov 2021",
    end: "Apr 2023",
    highlights: [
      "Designed relational data models from requirements and implemented the backend APIs on top of them.",
      "Built the matching web pages, and worked with QA on bug fixing and issue resolution.",
    ],
    stack: ["Java", "Spring Boot", "MySQL", "Oracle", "Thymeleaf", "JavaScript", "Docker"],
  },
  {
    title: "Software Engineer",
    company: "Tiger IT Bangladesh Ltd.",
    location: "Dhaka, Bangladesh",
    start: "Feb 2020",
    end: "Nov 2021",
    highlights: [
      "Developed a cross-platform Android and iOS app with Ionic, React, Redux and Capacitor.",
      "Made the Android app 40% more responsive, and kept both platforms compatible with new OS versions.",
      "Refactored and upgraded the legacy codebase, and took part in code review.",
    ],
    stack: ["Ionic", "React", "Redux", "Capacitor", "TypeScript"],
  },
  {
    title: "Software Engineering Intern",
    company: "SouthTech Group",
    location: "Dhaka, Bangladesh",
    start: "Feb 2019",
    end: "Jun 2019",
    highlights: [
      "Designed and built a database cloning application from scratch to client requirements, including database script generation.",
    ],
    stack: ["C#", "SQL Server", "MS Access"],
  },
];

export type Education = {
  degree: string;
  school: string;
  location: string;
  start: string;
  end: string;
};

export const education: Education[] = [
  {
    degree: "B.Sc. in Software Engineering",
    school: "University of Dhaka",
    location: "Dhaka, Bangladesh",
    start: "2015",
    end: "2019",
  },
];

export type Award = { title: string; when: string; body: string };

export const awards: Award[] = [
  {
    title: "Board Merit Scholarship, Government of Bangladesh",
    when: "2011, 2013",
    body: "Talent-pool scholarship in the SSC and HSC examinations.",
  },
  {
    title: "Yoga instructor, Quantum Meditation Club",
    when: "2018–2022",
    body: "Executive member, guiding students in yoga and meditation.",
  },
];

export const researchInterests: string[] = [
  "LLMs and agents for biology",
  "Genome foundation models",
  "Multi-omic data integration",
  "Machine learning for health",
  "Evaluating LLM code generation",
];

export type Publication = {
  title: string;
  /** In the order printed on the paper. The site owner is highlighted. */
  authors: string[];
  venue: string;
  year: number;
  kind: "Conference" | "Journal" | "Preprint";
  /** Primary link: the DOI or publisher page. */
  url: string;
  /** Extra links shown after the primary one, e.g. arXiv. */
  links?: { label: string; href: string }[];
};

/** Newest first. Errata are left out; the corrected paper is listed once. */
export const publications: Publication[] = [
  {
    title:
      "LLM4Cell: Taxonomy and Evaluation of LLM and Agentic Models for Single-Cell Biology",
    authors: ["Sajib Acharjee Dip", "Adrika Zafor", "Bikash Kumar Paul", "Uddip Acharjee Shuvo", "Muhit Islam Emon", "Xuan Wang", "Liqing Zhang"],
    venue: "Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (ACL), Long Papers",
    year: 2026,
    kind: "Conference",
    url: "https://doi.org/10.18653/v1/2026.acl-long.1942",
    links: [{ label: "arXiv", href: "https://arxiv.org/abs/2510.07793" }],
  },
  {
    title:
      "Large language model agents for biological intelligence across genomics, proteomics, spatial biology, and biomedicine",
    authors: ["Sajib Acharjee Dip", "Dipanwita Mallick", "Uddip Acharjee Shuvo", "Shovito Barua Soumma", "Fazle Rafsani", "Bikash Kumar Paul", "Nazifa Ahmed Moumi", "Shafayat Ahmed", "Liqing Zhang"],
    venue: "Briefings in Bioinformatics",
    year: 2026,
    kind: "Journal",
    url: "https://doi.org/10.1093/bib/bbag110",
  },
  {
    title:
      "Predicting hypertension and identifying most important factors among married women in Bangladesh using machine learning approach",
    authors: ["Novel Chandra Das", "Probir Kumar Ghosh", "Md. Alamgir Hossain", "Uddip Acharjee Shuvo", "Nipa Rani Talukder", "Fatema Khatun", "Mohammad Ziaul Islam Chowdhury"],
    venue: "PLOS ONE",
    year: 2025,
    kind: "Journal",
    url: "https://doi.org/10.1371/journal.pone.0335442",
  },
  {
    title:
      "MoXGATE: Modality-aware cross-attention for multi-omic gastrointestinal cancer sub-type classification",
    authors: ["Sajib Acharjee Dip", "Uddip Acharjee Shuvo", "Dipanwita Mallick", "Abrar Rahman Abir", "Liqing Zhang"],
    venue: "arXiv preprint",
    year: 2025,
    kind: "Preprint",
    url: "https://arxiv.org/abs/2506.06980",
  },
  {
    title:
      "Assessing ChatGPT's Code Generation Capabilities with Short vs Long Context Programming Problems",
    authors: ["Uddip Acharjee Shuvo", "Sajib Acharjee Dip", "Nirvar Roy Vaskar", "A. B. M. Alim Al Islam"],
    venue: "11th International Conference on Networking, Systems, and Security (NSysS), ACM",
    year: 2024,
    kind: "Conference",
    url: "https://doi.org/10.1145/3704522.3704535",
  },
  {
    title: "Equitable Skin Disease Prediction Using Transfer Learning and Domain Adaptation",
    authors: ["Sajib Acharjee Dip", "Kazi Hasan Ibn Arif", "Uddip Acharjee Shuvo", "Ishtiaque Ahmed Khan", "Na Meng"],
    venue: "AAAI Fall Symposium Series",
    year: 2024,
    kind: "Conference",
    url: "https://doi.org/10.1609/aaaiss.v4i1.31800",
    links: [{ label: "arXiv", href: "https://arxiv.org/abs/2409.00873" }],
  },
  {
    title:
      "PathoLM: Identifying pathogenicity from the DNA sequence through the Genome Foundation Model",
    authors: ["Sajib Acharjee Dip", "Uddip Acharjee Shuvo", "Tran Chau", "Haoqiu Song", "Petra Choi", "Xuan Wang", "Liqing Zhang"],
    venue: "bioRxiv preprint",
    year: 2024,
    kind: "Preprint",
    url: "https://doi.org/10.1101/2024.06.18.599629",
    links: [{ label: "arXiv", href: "https://arxiv.org/abs/2406.13133" }],
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
    items: ["Spring Web MVC", "REST", "SOAP / XML", "OpenAPI / Swagger", "Bean Validation"],
  },
  {
    name: "Application",
    role: "Where the business rules live",
    items: ["Spring Boot 3", "Microservices", "Spring Modulith", "Domain events", "Virtual threads"],
  },
  {
    name: "Batch & integration",
    role: "Moving data in and out",
    items: ["NDC / GDS XML", "JAXB / Jackson XML", "Spring Batch", "Apache Kafka", "Eclipse Dataspace Components"],
  },
  {
    name: "Persistence",
    role: "Where the data is kept",
    items: ["PostgreSQL", "MySQL", "Oracle", "Redis", "MongoDB", "Spring Data JPA"],
  },
  {
    name: "Runtime",
    role: "What it all runs on",
    items: ["Java 21", "Docker", "Alibaba Cloud", "Linux"],
  },
];

/** Tooling that surrounds the code rather than sitting in a layer of it. */
export const tooling: string[] = [
  "Gradle",
  "Maven",
  "JUnit 5",
  "ELK Stack",
  "Grafana",
  "Git",
  "Jira",
  "Python",
  "PyTorch",
];

/** Absolute paths, so the same links work from the home page and from posts. */
export const navLinks = [
  { href: "/#experience", label: "Experience" },
  { href: "/#research", label: "Research" },
  { href: "/#skills", label: "Skills" },
  { href: "/blogs/", label: "Blog" },
];
