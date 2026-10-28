import BlogPost, { postMetadata } from "@/components/blog/BlogPost";
import Callout from "@/components/blog/Callout";
import CodeBlock from "@/components/blog/CodeBlock";
import Figure from "@/components/blog/Figure";

const SLUG = "java-records-vs-lombok";
const IMG = `/blogs/${SLUG}`;

export const metadata = postMetadata(SLUG);

export default function Post() {
  return (
    <BlogPost slug={SLUG}>
      <p>
        For years, Lombok was how Java developers avoided writing getters,
        constructors and <code>equals</code> by hand, and all of my recent
        Spring repositories use it. Since Java 16, the language has its own answer
        for one big part of that job: <strong>records</strong>. On Java 21,
        with record patterns and pattern matching for <code>switch</code> on
        top, the question is fair: what is Lombok still for?
      </p>
      <p>
        Short answer: records should replace Lombok for immutable data, Lombok
        still earns its place in a few spots, and JPA entities can’t be
        records at all.
      </p>

      <h2>The same value type, three ways</h2>
      <p>A product as seen by other modules, first with Lombok’s <code>@Value</code>:</p>
      <CodeBlock label="Product.java (Lombok)">{`
        @Value
        public class Product {
            String code;
            String name;
            BigDecimal price;
        }
      `}</CodeBlock>
      <p>The same thing as a record, with no library involved:</p>
      <CodeBlock label="Product.java (record)">{`
        public record Product(String code, String name, BigDecimal price) {}
      `}</CodeBlock>
      <p>
        Both give you private final fields, a constructor for all of them,
        accessors, <code>equals</code>, <code>hashCode</code> and{" "}
        <code>toString</code>. The visible difference is accessor naming: a
        record has <code>product.price()</code>, while Lombok generates{" "}
        <code>product.getPrice()</code>. The bigger difference is that the
        record is plain Java. There is no annotation processor, no IDE plugin,
        and no waiting for a Lombok release that supports the next JDK.
      </p>

      <h2>What records do well</h2>
      <h3>Validation in a compact constructor</h3>
      <p>
        A compact constructor runs before the fields are assigned, so it can
        reject or normalize values. Lombok’s <code>@Value</code> has no
        equivalent short of writing the constructor yourself:
      </p>
      <CodeBlock label="Money.java">{`
        public record Money(BigDecimal amount, Currency currency) {

            public Money {
                Objects.requireNonNull(currency, "currency");
                if (amount.signum() < 0) {
                    throw new IllegalArgumentException("amount must not be negative");
                }
                amount = amount.setScale(currency.getDefaultFractionDigits(), RoundingMode.HALF_EVEN);
            }

            public Money plus(Money other) {
                return new Money(amount.add(other.amount), currency);
            }
        }
      `}</CodeBlock>

      <h3>The Spring stack already speaks records</h3>
      <ul>
        <li>
          <strong>Request and response bodies.</strong> Jackson has supported
          records since 2.12, and Bean Validation annotations work on record
          components.
        </li>
        <li>
          <strong>Configuration properties.</strong> Spring Boot binds{" "}
          <code>@ConfigurationProperties</code> records through their
          constructor.
        </li>
        <li>
          <strong>Query results.</strong> Spring Data projections and JPQL
          constructor expressions can return records.
        </li>
        <li>
          <strong>Events.</strong> An event is a fact that already happened,
          which makes it a natural record.
        </li>
      </ul>
      <CodeBlock label="PaymentProperties.java">{`
        @ConfigurationProperties("payment")
        public record PaymentProperties(URI baseUrl, Duration timeout, int maxRetries) {}
      `}</CodeBlock>

      <h3>Records and pattern matching</h3>
      <p>
        Java 21 can take records apart in a <code>switch</code>. Together with
        a sealed interface, the compiler checks that every case is handled,
        with no <code>default</code> branch needed:
      </p>
      <CodeBlock label="PaymentResult.java">{`
        public sealed interface PaymentResult
                permits Approved, Declined, NeedsReview {}

        public record Approved(String transactionId) implements PaymentResult {}
        public record Declined(String reason) implements PaymentResult {}
        public record NeedsReview(String caseId, Duration sla) implements PaymentResult {}

        String describe(PaymentResult result) {
            return switch (result) {
                case Approved(var id)          -> "Paid, transaction " + id;
                case Declined(var reason)      -> "Declined: " + reason;
                case NeedsReview(var id, var sla) -> "In review (" + id + "), answer within " + sla.toHours() + "h";
            };
        }
      `}</CodeBlock>
      <p>
        Add a fourth result type and every <code>switch</code> that doesn’t
        handle it stops compiling. Lombok can’t offer that, because it is a
        feature of the language, not of generated code.
      </p>

      <h2>Where records can’t go: JPA entities</h2>
      <p>
        An entity must have a no-argument constructor, must not be final so
        Hibernate can proxy it, and changes state over its lifetime. A record
        is final, immutable and has only its canonical constructor, so it
        breaks all three rules. Entities stay classes:
      </p>
      <CodeBlock label="OrderEntity.java">{`
        @Entity
        @Table(name = "orders")
        @Getter
        @Setter
        @NoArgsConstructor(access = AccessLevel.PROTECTED)   // for JPA only
        public class OrderEntity {

            @Id @GeneratedValue
            private Long id;
            private String orderNumber;

            @Enumerated(EnumType.STRING)
            private OrderStatus status;
        }
      `}</CodeBlock>
      <Callout title="Don’t put @Data on an entity">
        <p>
          <code>@Data</code> generates <code>equals</code> and{" "}
          <code>hashCode</code> from every field. On an entity that can load
          lazy collections inside <code>equals</code>, change the hash code
          when the id is assigned on save, and recurse forever across a
          bidirectional relationship in <code>toString</code>. Use{" "}
          <code>@Getter</code> and <code>@Setter</code>, and write{" "}
          <code>equals</code> based on the id, if you need it at all.
        </p>
      </Callout>
      <p>
        Since Hibernate 6.2, a record can be an <code>@Embeddable</code>, which
        suits value objects inside an entity, such as an address or a{" "}
        <code>Money</code> amount.
      </p>

      <h2>Where Lombok still earns its keep</h2>
      <ul>
        <li>
          <strong>Builders.</strong> A record with many optional fields is
          awkward to construct positionally. Lombok’s <code>@Builder</code>{" "}
          works on records, and so does <code>@With</code> for copies with one
          field changed.
        </li>
        <li>
          <strong>Entities and other mutable classes.</strong>{" "}
          <code>@Getter</code>, <code>@Setter</code> and{" "}
          <code>@NoArgsConstructor</code> remove real boilerplate where records
          can’t be used.
        </li>
        <li>
          <strong>Services.</strong> <code>@RequiredArgsConstructor</code> for
          constructor injection and <code>@Slf4j</code> for a logger are
          unrelated to records and remain convenient.
        </li>
      </ul>
      <CodeBlock label="SearchRequest.java">{`
        @Builder
        public record SearchRequest(String keyword, Category category,
                                    BigDecimal minPrice, BigDecimal maxPrice,
                                    int page, int size) {}

        var request = SearchRequest.builder()
                .keyword("java")
                .size(20)
                .build();
      `}</CodeBlock>

      <Figure
        src={`${IMG}/records-or-lombok.svg`}
        alt="Decision chart: JPA entities stay classes with Lombok getters and setters; immutable data such as DTOs, events, commands and configuration become records, optionally with Lombok @Builder; other mutable types use Lombok or plain Java"
        width={640}
        height={432}
        caption="Choosing between a record and Lombok, one type at a time."
      />

      <h2>Migrating from @Value to records</h2>
      <p>
        You don’t have to convert a codebase in one go. A type at a time
        works, in this order:
      </p>
      <ol>
        <li>
          Start with request and response DTOs and events: they are already
          immutable and rarely have custom behaviour.
        </li>
        <li>
          Replace getter calls. <code>getPrice()</code> becomes{" "}
          <code>price()</code>, and your IDE’s “convert to record” refactoring
          updates the call sites for you.
        </li>
        <li>
          Watch for code that needs JavaBean getters: some reflection-based
          tools, mappers and templates look for <code>getX()</code> methods.
          Spring Batch’s <code>beanMapped()</code> writer is one example.
        </li>
        <li>
          Keep <code>@Builder</code> where call sites use it, by adding it to
          the record.
        </li>
        <li>Leave entities alone.</li>
      </ol>

      <h2>Checklist</h2>
      <ul>
        <li>Records for DTOs, events, commands, configuration and value objects.</li>
        <li>Compact constructors for validation and normalization.</li>
        <li>Sealed interfaces with records where a type has a fixed set of shapes.</li>
        <li>
          Entities as classes with <code>@Getter</code>/<code>@Setter</code>,
          never <code>@Data</code>; records for embeddables on Hibernate 6.2+.
        </li>
        <li>
          Lombok kept for builders, mutable classes,{" "}
          <code>@RequiredArgsConstructor</code> and <code>@Slf4j</code>.
        </li>
      </ul>
    </BlogPost>
  );
}
