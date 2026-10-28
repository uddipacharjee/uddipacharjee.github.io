import type { Tool } from "@/components/blog/ToolReview";

export type JdkDistribution = Tool & {
  /** End of free updates for Java 25, as the vendor publishes it. */
  java25FreeUntil: string;
};

/**
 * JDK distributions reviewed in /blogs/which-jdk-distribution/, in
 * alphabetical order. Support dates, licences, platforms and images were
 * checked against each vendor's own pages in October 2026; update
 * `dateModified` on the post when you refresh them.
 */
export const jdkDistributions: JdkDistribution[] = [
  {
    name: "Amazon Corretto",
    website: "https://aws.amazon.com/corretto/",
    bestFor: "long, published free updates, and workloads on AWS",
    price: "Free, including production; support through existing AWS Support plans",
    priceSummary: "Free",
    platforms: "Linux (including Alpine), Windows x64, macOS",
    facts: [
      { label: "Java versions", value: "8, 11, 17, 21, 25, 27" },
      { label: "Free updates", value: "21 until Oct 2030; 25 until Oct 2032" },
      { label: "Container image", value: "amazoncorretto (Docker Hub, also on Amazon ECR Public)" },
    ],
    java25FreeUntil: "Oct 2032",
    license: "GPLv2 with Classpath Exception, TCK-certified",
    firstReleased: "2019",
    summary:
      "Amazon’s OpenJDK build, which it runs on thousands of its own production services. It publishes some of the longest free update commitments of any vendor, and sometimes ships fixes before they reach the matching OpenJDK update release.",
    features: [
      "Patches not yet merged into the corresponding OpenJDK update release",
      "Planned out-of-cycle releases for urgent fixes",
      "Linux packages as .deb, .rpm and tar archives, plus Alpine builds",
      "Official Docker Hub images on Amazon Linux 2, Amazon Linux 2023 and Alpine",
    ],
    strengths: [
      "Free updates for Java 25 until October 2032, with a published date",
      "No paid features or usage restrictions",
      "A natural fit on AWS",
    ],
    limitations: [
      "No Windows on ARM build",
      "The amazoncorretto:latest image is Java 8, so always pin a version",
      "JavaFX was removed from Corretto 8 in 2026",
    ],
  },
  {
    name: "Azul Zulu",
    website: "https://www.azul.com/downloads/",
    bestFor: "unusual platforms, CRaC, and paid support that includes legacy Java",
    price: "Free builds; paid Azul Platform Core support, priced per vCore or desktop",
    priceSummary: "Free; paid support available",
    platforms: "Linux (including musl), Windows x64 and ARM64, macOS, plus legacy platforms",
    facts: [
      { label: "Java versions", value: "8, 11, 17, 21, 25, 27 (6 and 7 for customers)" },
      {
        label: "Free updates",
        value: "No end date published for the free builds; paid support for 25 until Sep 2033",
      },
      { label: "Container image", value: "azul/zulu-openjdk (Ubuntu, Alpine, Debian variants)" },
    ],
    java25FreeUntil: "Not published",
    license: "GPLv2 with Classpath Exception, TCK-tested",
    firstReleased: "2013",
    summary:
      "Azul builds OpenJDK for the widest range of platforms of any vendor, from Windows on ARM to Solaris and 32-bit systems. The free builds come with no support obligation; Azul Platform Core adds out-of-cycle fixes, security-only updates and support.",
    features: [
      "Free CRaC builds (Java 17 and later) for starting from a saved checkpoint, fully supported on Linux",
      "JavaFX bundles",
      "musl builds for Alpine on x64 and ARM64",
      "Windows on ARM builds from Java 17",
      "Paid support also covers Java 6 and 7, and Temurin builds",
    ],
    strengths: [
      "Broadest platform coverage",
      "CRaC without building your own JDK",
      "One vendor for modern and legacy Java",
    ],
    limitations: [
      "No published end date for free updates",
      "Free builds come with no support obligation",
      "Support prices only through sales",
    ],
  },
  {
    name: "BellSoft Liberica JDK",
    website: "https://bell-sw.com/libericajdk/",
    bestFor: "Spring Boot container images, and desktop apps with JavaFX",
    price: "Free, including production; Liberica JDK Enterprise support from $15,000 a year for up to 50 servers",
    priceSummary: "Free; published support prices",
    platforms: "Linux (including musl), Windows x64 and ARM64, macOS; also RISC-V and PowerPC",
    facts: [
      { label: "Java versions", value: "8, 11, 17, 21, 25, 27" },
      {
        label: "Free updates",
        value: "No separate end date published; updates and support for 25 announced until Sep 2033",
      },
      {
        label: "Container image",
        value: "bellsoft/liberica-runtime-container, bellsoft/liberica-openjre-debian",
      },
    ],
    java25FreeUntil: "Not published",
    license: "Free for production; TCK-verified",
    firstReleased: "2017",
    summary:
      "The JDK that Spring Boot’s default buildpacks install, and the one in Spring Boot’s own Dockerfile examples. It comes in Lite, Standard and Full flavours, the last including JavaFX.",
    features: [
      "Default JVM in the Paketo buildpacks behind Spring Boot’s bootBuildImage",
      "Full flavour with JavaFX (LibericaFX)",
      "CRaC builds for Java 17 and 21",
      "Runtime containers on Alpaquita Linux, with glibc or musl",
      "Liberica Native Image Kit, a GraalVM-based native image builder",
    ],
    strengths: [
      "Already in your images if you build them with Spring Boot’s buildpacks",
      "Publishes its support prices",
      "Wide platform list, including RISC-V",
    ],
    limitations: [
      "No separate published end date for free updates",
      "No CRaC builds for Java 25 or 27 yet",
    ],
  },
  {
    name: "Eclipse Temurin",
    website: "https://adoptium.net/",
    bestFor: "a vendor-neutral default for most teams",
    price: "Free, including production; commercial support from third parties",
    priceSummary: "Free",
    platforms: "Linux (including Alpine, s390x and RISC-V), Windows x64, macOS; AIX",
    facts: [
      { label: "Java versions", value: "8, 11, 17, 21, 25, 27" },
      { label: "Free updates", value: "21 until at least Dec 2029; 25 until at least Sep 2031" },
      { label: "Container image", value: "eclipse-temurin (official Docker Hub image)" },
    ],
    java25FreeUntil: "At least Sep 2031",
    license: "GPLv2 with Classpath Exception, JCK-tested",
    firstReleased: "2021 (as AdoptOpenJDK from 2017)",
    summary:
      "Built by the Eclipse Adoptium working group, which several large vendors back together. It is SDKMAN!’s default Java, and every release must pass both the Java compatibility kit and Adoptium’s own AQAvit quality suite.",
    features: [
      "Passes the JCK and the AQAvit quality suite",
      "Official Docker Hub image on Ubuntu, Alpine, UBI and Windows Server",
      "Linux builds for x64, ARM64, ppc64le, s390x and RISC-V",
      "The default JDK in SDKMAN!",
    ],
    strengths: [
      "Vendor-neutral, under the Eclipse Foundation",
      "A safe default for most projects",
      "Commercial support available from IBM, Red Hat, Azul and others",
    ],
    limitations: [
      "Only community support from Adoptium itself",
      "No Windows on ARM build for Java 25",
    ],
  },
  {
    name: "IBM Semeru Runtimes",
    website: "https://developer.ibm.com/languages/java/semeru-runtimes/downloads/",
    bestFor: "a small memory footprint with the OpenJ9 JVM",
    price: "Free, including production; paid support through IBM Runtimes for Business",
    priceSummary: "Free",
    platforms: "Linux (x64, ARM64, ppc64le, s390x), Windows x64, macOS; AIX and z/OS",
    facts: [
      { label: "Java versions", value: "8, 11, 17, 21, 25, 27" },
      { label: "Free updates", value: "21 until Dec 2029; 25 until Sep 2031" },
      { label: "Container image", value: "ibm-semeru-runtimes (Docker Hub, Open Edition)" },
    ],
    java25FreeUntil: "Sep 2031",
    license: "Open Edition: GPLv2 with Classpath Exception, not TCK-tested; Certified Edition: IBM licence, certified",
    firstReleased: "2021",
    summary:
      "IBM’s distribution pairs the OpenJDK class libraries with the Eclipse OpenJ9 JVM instead of HotSpot. OpenJ9 is designed for fast startup and a small memory footprint, which can matter when you pack many containers onto a host.",
    features: [
      "Eclipse OpenJ9 JVM instead of HotSpot",
      "Shared class cache and ahead-of-time compilation for faster startup",
      "Open Edition, and a TCK-certified Certified Edition",
      "Images on Docker Hub and in IBM’s registry, including UBI-based ones",
    ],
    strengths: [
      "Designed for lower memory use and faster startup",
      "Covers IBM hardware: s390x, AIX and z/OS",
      "Free for commercial use",
    ],
    limitations: [
      "A different JVM: some HotSpot flags, diagnostics and GC tuning don’t carry over",
      "The Open Edition is not TCK-tested",
      "No Alpine builds",
    ],
  },
  {
    name: "Microsoft Build of OpenJDK",
    website: "https://learn.microsoft.com/en-us/java/openjdk/overview",
    bestFor: "Azure workloads and Windows on ARM",
    price: "Free; support for Azure customers with an Azure support plan",
    priceSummary: "Free",
    platforms: "Linux, Windows and macOS, on both x64 and ARM64",
    facts: [
      { label: "Java versions", value: "11, 17, 21, 25 (Java 8 images use Temurin)" },
      { label: "Free updates", value: "21 until at least Sep 2028; 25 until at least Sep 2030" },
      { label: "Container image", value: "mcr.microsoft.com/openjdk/jdk (Ubuntu, Azure Linux, distroless)" },
    ],
    java25FreeUntil: "At least Sep 2030",
    license: "GPLv2 with Classpath Exception, TCK-tested",
    firstReleased: "2021",
    summary:
      "Microsoft’s LTS-only build, made with Adoptium’s build scripts and quality suite and used across Azure. It is one of the few distributions with Windows on ARM builds for every version it supports.",
    features: [
      "Windows, Linux and macOS on both x64 and ARM64",
      "Distroless container images based on Azure Linux",
      "Built and tested with Adoptium’s tooling",
      "Backported fixes, called out in the release notes",
    ],
    strengths: [
      "Windows on ARM for every supported version",
      "Distroless images out of the box",
      "A good default on Azure",
    ],
    limitations: [
      "No Java 8 build of its own and no non-LTS releases",
      "No Alpine images",
      "Commercial support only for Azure customers",
    ],
  },
  {
    name: "Oracle JDK",
    website: "https://www.oracle.com/java/technologies/downloads/",
    bestFor: "teams with a Java SE subscription, or trying the latest release",
    price:
      "Free under NFTC for a limited time per release; Java SE Universal Subscription priced per employee",
    priceSummary: "Free for a limited time",
    platforms: "Linux x64 and ARM64, Windows x64, macOS ARM64 (macOS x64 up to Java 25)",
    facts: [
      { label: "Java versions", value: "8, 11, 17, 21, 25, 27" },
      {
        label: "Free updates",
        value: "25 under NFTC until Sep 2028; 21’s free updates ended in Sep 2026",
      },
      { label: "Container image", value: "container-registry.oracle.com/java/jdk" },
    ],
    java25FreeUntil: "Sep 2028",
    license: "NFTC (free) for 25 and 27; OTN (not free in production) for 8, 11, 17, and 21 from 21.0.13",
    firstReleased: "1996, as Sun’s JDK",
    summary:
      "The JDK from Java’s steward. Recent releases are free under the No-Fee Terms and Conditions licence, but only until a year after the next LTS. Later updates move to the OTN licence, which needs a paid subscription for production use.",
    features: [
      "Installers (MSI, RPM, DEB) as well as archives",
      "Premier and Extended Support timelines with a subscription",
      "The subscription includes Java Management Service and the Enterprise Performance Pack",
      "Usage Logging to see where Java runs",
    ],
    strengths: [
      "Direct from Oracle, with the longest paid support timelines",
      "Free for the newest releases",
      "Installers on every platform it supports",
    ],
    limitations: [
      "Free production use ends a year after the next LTS; for Java 21 that was September 2026",
      "The subscription is priced per employee, not per server",
      "No Alpine or Windows on ARM builds",
    ],
  },
  {
    name: "Oracle OpenJDK builds",
    website: "https://jdk.java.net/",
    bestFor: "trying the newest Java release, not long-lived production",
    price: "Free",
    priceSummary: "Free",
    platforms: "Linux x64 and ARM64, Windows x64, macOS ARM64",
    facts: [
      { label: "Java versions", value: "The current release only (27)" },
      { label: "Free updates", value: "About six months per release: 25 was updated until Jan 2026" },
      {
        label: "Container image",
        value: "container-registry.oracle.com/java/openjdk (Docker Hub’s openjdk is deprecated)",
      },
    ],
    java25FreeUntil: "Jan 2026",
    license: "GPLv2 with Classpath Exception",
    firstReleased: "2017",
    summary:
      "Oracle’s reference builds of OpenJDK under the open-source licence. Each release only gets updates until the next one ships, about six months later, so they suit trying new features rather than running long-lived production systems.",
    features: [
      "Reference OpenJDK builds from Oracle",
      "Early-access builds of the next release, and of projects such as Loom, Valhalla and Leyden",
      "Plain archives, no installers",
    ],
    strengths: ["New features first", "Open-source licence"],
    limitations: [
      "No long-term updates, even for LTS versions",
      "Archives only",
      "The openjdk image on Docker Hub is deprecated and only gets early-access builds",
    ],
  },
  {
    name: "Red Hat build of OpenJDK",
    website: "https://developers.redhat.com/products/openjdk/overview",
    bestFor: "RHEL and OpenShift environments with a Red Hat subscription",
    price:
      "No-cost download with a free Red Hat Developer account; production support with RHEL, OpenShift or Middleware subscriptions",
    priceSummary: "With a Red Hat subscription",
    platforms: "RHEL (x86_64, aarch64, ppc64le, s390x), Windows, portable Linux builds",
    facts: [
      { label: "Java versions", value: "8, 11 (extended support), 17, 21, 25" },
      {
        label: "Support",
        value: "21 until Dec 2029; 25 until Dec 2030, with paid extended support beyond",
      },
      {
        label: "Container image",
        value: "registry.access.redhat.com/ubi9/openjdk-21, ubi9/openjdk-25 and -runtime variants",
      },
    ],
    java25FreeUntil: "With subscription",
    license: "GPLv2 with Classpath Exception",
    firstReleased: "Packaged in RHEL since OpenJDK 6",
    summary:
      "Red Hat packages OpenJDK into RHEL and its UBI container images and supports it under Red Hat subscriptions. It follows the operating system’s crypto policies and FIPS mode, which matters in regulated environments.",
    features: [
      "RHEL packages and UBI base images",
      "Follows system-wide crypto policies and FIPS mode",
      "Shenandoah garbage collector",
      "Fixes backported from newer OpenJDK versions",
    ],
    strengths: [
      "Supported together with the rest of the RHEL stack",
      "UBI images for OpenShift and Kubernetes",
      "Red Hat supports Temurin as well",
    ],
    limitations: [
      "Downloads need a free Red Hat Developer account",
      "Production support needs a subscription",
      "LTS only, no Alpine builds, and no SDKMAN! listing",
    ],
  },
  {
    name: "SapMachine",
    website: "https://sapmachine.io/",
    bestFor: "SAP environments",
    price: "Free, including production; support for SAP customers inside SAP products",
    priceSummary: "Free",
    platforms: "Linux (x64, ARM64, ppc64le), Alpine x64, Windows x64, macOS ARM64; AIX",
    facts: [
      { label: "Java versions", value: "21, 25, 27 (17 reached end of life in Sep 2026)" },
      { label: "Free updates", value: "21 until Sep 2028; 25 until Sep 2030" },
      { label: "Container image", value: "ghcr.io/sap/sapmachine (Garden Linux) for production" },
    ],
    java25FreeUntil: "Sep 2030",
    license: "GPLv2 with Classpath Exception; LTS releases pass the JCK",
    firstReleased: "2018",
    summary:
      "SAP’s OpenJDK build and the default Java runtime across SAP’s own applications and services. SAP contributed features such as helpful NullPointerExceptions and elastic Metaspace to OpenJDK itself.",
    features: [
      "Default runtime across SAP products",
      "Production container images on Garden Linux",
      "AIX and Linux ppc64le support",
      "LTS releases pass the JCK",
    ],
    strengths: [
      "Free for the whole maintenance period",
      "Backed by SAP’s own OpenJDK engineering",
    ],
    limitations: [
      "Shorter LTS windows: Java 17 already reached end of life",
      "No Java 8",
      "Its Docker Hub images are not meant for production",
    ],
  },
];
