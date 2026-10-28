import BlogPost, { postMetadata } from "@/components/blog/BlogPost";
import Callout from "@/components/blog/Callout";
import CodeBlock from "@/components/blog/CodeBlock";
import Faq, { faqSchema, type FaqItem } from "@/components/blog/Faq";
import Figure from "@/components/blog/Figure";
import ToolReview, { toolId } from "@/components/blog/ToolReview";
import { jdkDistributions } from "@/data/jdkDistributions";

const SLUG = "which-jdk-distribution";
const IMG = `/blogs/${SLUG}`;

export const metadata = postMetadata(SLUG);

const faqs: FaqItem[] = [
  {
    question: "Is OpenJDK free for commercial use?",
    answer:
      "Yes. Builds released under the GPLv2 with the Classpath Exception, such as Eclipse Temurin, Amazon Corretto, Azul Zulu, Microsoft Build of OpenJDK, SapMachine and IBM Semeru's Open Edition, are free to use in production. BellSoft Liberica is also free for production. Oracle JDK is the exception: it is free under its NFTC licence only for a limited period per release.",
  },
  {
    question: "Is Oracle JDK free?",
    answer:
      "Partly. As of October 2026, Oracle JDK 25 and 27 are free for production under the No-Fee Terms and Conditions licence; for Java 25 that lasts until September 2028. Oracle JDK 21 updates from 21.0.13 (October 2026), 17 updates from 17.0.13, and all 8 and 11 updates are under the OTN licence, which needs a paid Java SE subscription for production use.",
  },
  {
    question: "What is the difference between OpenJDK and Oracle JDK?",
    answer:
      "Both are built from the OpenJDK source code. The differences are the licence, how long free updates last, packaging such as installers, and commercial support. For running applications, a TCK-certified OpenJDK build behaves the same as Oracle JDK.",
  },
  {
    question: "Which JDK should I use with Spring Boot?",
    answer:
      "Any TCK-certified build works; Spring Boot does not recommend a vendor. Spring Boot 3.x and 4.x need Java 17 or later; Boot 3.5 supports up to Java 25 and Boot 4.x up to Java 27. If you build images with bootBuildImage, the default Paketo buildpacks install BellSoft Liberica, and you can switch to another vendor's buildpack.",
  },
  {
    question: "Which Java version should a new project use?",
    answer:
      "Java 25, the newest LTS release, released in September 2025. Java 27 is a feature release that only gets about six months of updates, and the next LTS, Java 29, is planned for September 2027.",
  },
  {
    question: "Which JDK image should I use in Docker?",
    answer:
      "Use an actively maintained image and pin the Java version in the tag, for example eclipse-temurin:25-jre, amazoncorretto:25 or mcr.microsoft.com/openjdk/jdk:25-ubuntu. Avoid the deprecated openjdk image on Docker Hub, and don't rely on amazoncorretto:latest, which is Java 8.",
  },
  {
    question: "Is GraalVM a drop-in replacement for my JDK?",
    answer:
      "Not anymore in the way it once was. Oracle detached GraalVM from its Java SE products after GraalVM for JDK 24, and GraalVM now ships monthly feature releases focused on Native Image and other languages. Use it, or a downstream build such as Liberica Native Image Kit or Mandrel, when you want native executables; use a regular JDK otherwise.",
  },
];

const itemList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "JDK distributions compared",
  numberOfItems: jdkDistributions.length,
  itemListElement: jdkDistributions.map((jdk, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: jdk.name,
    url: jdk.website,
  })),
};

export default function Post() {
  return (
    <BlogPost slug={SLUG} schema={[itemList, faqSchema(faqs)]}>
      <p>
        Every JDK in this guide is built from the same OpenJDK source code, and
        the certified ones run your application the same way. So why are there
        so many, and does the choice matter? It does, but not for the reasons
        people expect. What differs is how long each vendor keeps shipping free
        security updates, the licence you run under in production, the
        platforms and container images on offer, and who you can call when
        something breaks.
      </p>
      <p>
        This guide compares ten JDK distributions on exactly those points, then
        covers GraalVM and what the choice means for a Spring Boot project.
        Support dates, licences and images come from each vendor’s own pages,
        checked in October 2026.
      </p>

      <h2>What actually differs between JDKs</h2>
      <ul>
        <li>
          <strong>How long updates stay free.</strong> Each vendor decides how
          long it patches each long-term support (LTS) release. For Java 25 the
          published dates range from early 2026 to late 2032.
        </li>
        <li>
          <strong>The production licence.</strong> Most builds use the GPLv2
          with the Classpath Exception and are free forever. Oracle JDK is free
          only for a limited time per release.
        </li>
        <li>
          <strong>Certification.</strong> Builds that pass the Java Technology
          Compatibility Kit (TCK, or JCK) are certified as compatible with the
          Java SE specification.
        </li>
        <li>
          <strong>Platforms.</strong> Alpine (musl), Windows on ARM, RISC-V,
          s390x and AIX are where distributions differ most.
        </li>
        <li>
          <strong>Container images.</strong> Official, maintained images and
          their base operating systems.
        </li>
        <li>
          <strong>Paid support.</strong> Whether you can buy it, and whether
          the price is published.
        </li>
        <li>
          <strong>Extras.</strong> JavaFX, CRaC for fast startup, the OpenJ9
          JVM, or native images.
        </li>
      </ul>

      <h2>Which Java version?</h2>
      <p>
        The LTS releases are Java 8, 11, 17, 21 and 25. Java 27, released in
        September 2026, is a feature release that only gets about six months of
        updates, and the next LTS is planned to be Java 29 in September 2027.
        For a new project, choose Java 25. Spring Boot 3.x and 4.x both need
        Java 17 or later.
      </p>

      <h2>Quick comparison</h2>
      <table>
        <thead>
          <tr>
            <th>Distribution</th>
            <th>Cost</th>
            <th>Java 25 free updates until</th>
            <th>Best for</th>
          </tr>
        </thead>
        <tbody>
          {jdkDistributions.map((jdk) => (
            <tr key={jdk.name}>
              <td>
                <a href={`#${toolId(jdk.name)}`}>{jdk.name}</a>
              </td>
              <td>{jdk.priceSummary}</td>
              <td>{jdk.java25FreeUntil}</td>
              <td>{jdk.bestFor}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Figure
        src={`${IMG}/java-25-free-updates.svg`}
        alt="Timeline of free updates for Java 25 by distribution: Corretto until October 2032, Temurin and Semeru until September 2031, Microsoft and SapMachine until September 2030, Oracle JDK under NFTC until September 2028, and Oracle OpenJDK builds until January 2026"
        width={640}
        height={398}
        caption="Free updates for Java 25, as each vendor publishes them in October 2026."
      />

      <h2>Which one should you choose?</h2>
      <ul>
        <li>
          <strong>No special requirements:</strong> Eclipse Temurin. It is
          vendor-neutral, free, and the default almost everywhere.
        </li>
        <li>
          <strong>Long free updates with a published date:</strong> Amazon
          Corretto, with Java 25 patched until October 2032.
        </li>
        <li>
          <strong>Running on AWS:</strong> Amazon Corretto. <strong>On Azure:</strong>{" "}
          Microsoft Build of OpenJDK.
        </li>
        <li>
          <strong>RHEL or OpenShift with a Red Hat subscription:</strong> Red
          Hat build of OpenJDK.
        </li>
        <li>
          <strong>Spring Boot images built with buildpacks:</strong> BellSoft
          Liberica, which they already use.
        </li>
        <li>
          <strong>Windows on ARM:</strong> Microsoft Build of OpenJDK, Azul
          Zulu or Liberica.
        </li>
        <li>
          <strong>Low memory use in dense container deployments:</strong> IBM
          Semeru, with OpenJ9.
        </li>
        <li>
          <strong>Paid support including Java 6 or 7:</strong> Azul.
        </li>
        <li>
          <strong>Inside SAP:</strong> SapMachine.
        </li>
        <li>
          <strong>Oracle JDK:</strong> only if you have a Java SE subscription,
          or you are on the newest releases and will move on before the free
          period ends.
        </li>
      </ul>

      <h2>The distributions, A to Z</h2>
      {jdkDistributions.map((jdk) => (
        <ToolReview key={jdk.name} tool={jdk} />
      ))}

      <h2>What about GraalVM?</h2>
      <p>
        GraalVM used to be pitched as a faster, drop-in JDK. That changed in
        2025. GraalVM for JDK 24 was the last version licensed and supported as
        part of Oracle’s Java SE products, and the optional Graal JIT compiler
        was removed from Oracle JDK 25.
      </p>
      <p>
        GraalVM itself continues in two editions, both including Native Image.
        Oracle GraalVM is free under the GraalVM Free Terms and Conditions,
        except its 17.0.13 and 21.0.13 updates and later, which moved to an OTN
        licence. GraalVM Community Edition is GPLv2 with the Classpath
        Exception. Since 25.1, both ship a new feature release every month
        rather than every six months.
      </p>
      <p>
        Reach for GraalVM when you want a native executable with fast startup
        and low memory, for example for a CLI tool or a scale-to-zero service.
        BellSoft’s Liberica Native Image Kit and Red Hat’s Mandrel are
        downstream builds of GraalVM CE aimed at exactly that. For everything
        else, use one of the regular JDKs above.
      </p>

      <h2>Choosing a JDK for Spring Boot</h2>
      <p>
        Spring Boot does not recommend a vendor; its only requirement is Java
        17 or later. Spring Boot 3.5 supports up to Java 25, and Spring Boot
        4.x up to Java 27. Any certified build runs your application the same
        way, so the decision mostly comes down to how you build and deploy.
      </p>

      <h3>Container images from bootBuildImage</h3>
      <p>
        <code>./gradlew bootBuildImage</code> and{" "}
        <code>mvn spring-boot:build-image</code> use Paketo buildpacks, which
        install <strong>BellSoft Liberica</strong> by default. Spring Boot
        passes your project’s Java version to the buildpacks, so a project
        compiled for Java 25 gets a Java 25 runtime. To use another vendor,
        list its buildpack before the Java buildpack:
      </p>
      <CodeBlock label="build.gradle">{`
        tasks.named("bootBuildImage") {
            buildpacks = ["paketo-buildpacks/adoptium", "urn:cnb:builder:paketo-buildpacks/java"]
        }
      `}</CodeBlock>
      <CodeBlock label="pom.xml">{`
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <image>
                    <buildpacks>
                        <buildpack>paketo-buildpacks/adoptium</buildpack>
                        <buildpack>urn:cnb:builder:paketo-buildpacks/java</buildpack>
                    </buildpacks>
                </image>
            </configuration>
        </plugin>
      `}</CodeBlock>
      <p>
        Paketo also has buildpacks for Amazon Corretto, Azul Zulu, Eclipse
        OpenJ9, GraalVM, Microsoft OpenJDK, Oracle JDK and SapMachine. Setting{" "}
        <code>buildpacks</code> replaces the builder’s default list, which is
        why the Java buildpack has to be listed too.
      </p>

      <h3>Writing your own Dockerfile</h3>
      <p>Use a runtime image and pin the major version in the tag:</p>
      <CodeBlock label="Dockerfile">{`
        FROM eclipse-temurin:25-jre
        COPY build/libs/app.jar /app/app.jar
        ENTRYPOINT ["java", "-jar", "/app/app.jar"]
      `}</CodeBlock>
      <Callout title="Two image tags to avoid">
        <p>
          The <code>openjdk</code> image on Docker Hub is deprecated and only
          receives early-access builds. And <code>amazoncorretto:latest</code>{" "}
          is Java 8, not the newest release: always pin a version.
        </p>
      </Callout>

      <h3>Switching JDKs locally with SDKMAN!</h3>
      <p>
        SDKMAN! installs and switches between distributions per shell or per
        project. Each identifier ends with a vendor suffix; run{" "}
        <code>sdk list java</code> for the current versions, then install one:
      </p>
      <CodeBlock label="Terminal">{`
        sdk list java
        sdk install java 25.0.5.0+8-tem   # Temurin, SDKMAN!'s default
        sdk env init                      # pin the JDK for this project in .sdkmanrc
      `}</CodeBlock>
      <table>
        <thead>
          <tr>
            <th>Suffix</th>
            <th>Distribution</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>-tem</code></td><td>Eclipse Temurin</td></tr>
          <tr><td><code>-amzn</code></td><td>Amazon Corretto</td></tr>
          <tr><td><code>-zulu</code></td><td>Azul Zulu</td></tr>
          <tr><td><code>-librca</code></td><td>BellSoft Liberica</td></tr>
          <tr><td><code>-ms</code></td><td>Microsoft Build of OpenJDK</td></tr>
          <tr><td><code>-sem</code></td><td>IBM Semeru</td></tr>
          <tr><td><code>-sapmchn</code></td><td>SapMachine</td></tr>
          <tr><td><code>-oracle</code></td><td>Oracle JDK</td></tr>
          <tr><td><code>-open</code></td><td>Oracle OpenJDK builds</td></tr>
          <tr><td><code>-graalce</code>, <code>-graal</code></td><td>GraalVM CE, Oracle GraalVM</td></tr>
        </tbody>
      </table>
      <p>
        Red Hat’s build is not listed in SDKMAN!; Red Hat’s GraalVM build,
        Mandrel, is (<code>-mandrel</code>).
      </p>

      <h2>Frequently asked questions</h2>
      <Faq items={faqs} />

      <h2>How this comparison was put together</h2>
      <p>
        Support dates, licences, platforms, container images and prices come
        from each vendor’s own website, lifecycle pages, licence pages and
        container registries, checked in October 2026. Vendors revise these
        dates, so check the vendor’s page before committing to one for years.
        If something here is out of date, tell me on{" "}
        <a href="https://github.com/uddipacharjee">GitHub</a>.
      </p>
    </BlogPost>
  );
}
