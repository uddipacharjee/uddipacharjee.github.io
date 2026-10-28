import BlogPost, { postMetadata } from "@/components/blog/BlogPost";
import Callout from "@/components/blog/Callout";
import CodeBlock from "@/components/blog/CodeBlock";
import Figure from "@/components/blog/Figure";

const SLUG = "spring-boot-jpa-n-plus-one-open-in-view";
const IMG = `/blogs/${SLUG}`;

export const metadata = postMetadata(SLUG);

export default function Post() {
  return (
    <BlogPost slug={SLUG}>
      <p>
        Two JPA defaults cause most of the database trouble in Spring Boot
        apps. Lazy associations turn one innocent-looking loop into hundreds of
        queries: the <strong>N+1 problem</strong>. And{" "}
        <strong>open-in-view</strong>, which Spring Boot switches on by
        default, hides those queries by letting them run anywhere in a
        request, even while Jackson is writing the JSON response. With ten rows
        on a laptop neither shows up. With real data, both do.
      </p>
      <p>
        This guide shows how to see N+1 queries, the four ways to fix them,
        and why <code>spring.jpa.open-in-view=false</code> belongs in every
        new project. The examples use Spring Boot 3 and Hibernate 6.
      </p>

      <h2>The N+1 problem in one loop</h2>
      <p>Take an order with its lines, mapped the usual way:</p>
      <CodeBlock label="PurchaseOrder.java">{`
        @Entity
        public class PurchaseOrder {

            @Id @GeneratedValue
            private Long id;
            private String orderNumber;

            @Enumerated(EnumType.STRING)
            private OrderStatus status;

            @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
            private List<OrderLine> lines = new ArrayList<>();
            // getters ...
        }

        @Entity
        public class OrderLine {

            @Id @GeneratedValue
            private Long id;

            @ManyToOne(fetch = FetchType.LAZY)   // @ManyToOne is EAGER unless you say otherwise
            private PurchaseOrder order;

            private String productCode;
            private int quantity;
            // getters ...
        }
      `}</CodeBlock>
      <p>Now list the placed orders with their line counts:</p>
      <CodeBlock label="OrderService.java">{`
        @Transactional(readOnly = true)
        public List<OrderView> placedOrders() {
            return orderRepository.findByStatus(OrderStatus.PLACED).stream()
                    .map(o -> new OrderView(o.getOrderNumber(), o.getLines().size()))
                    .toList();
        }
      `}</CodeBlock>
      <p>
        <code>findByStatus</code> runs one query. Each{" "}
        <code>getLines()</code> then initializes a lazy collection with a
        query of its own. One hundred orders means 101 queries, and the
        method looks completely harmless.
      </p>
      <Figure
        src={`${IMG}/n-plus-one-queries.svg`}
        alt="Query counts for loading 100 orders with their lines: 101 with lazy loading in a loop, 3 with default_batch_fetch_size=50, and 1 with a join fetch or entity graph"
        width={640}
        height={372}
        caption="Loading 100 orders and their lines. Each square is one SQL statement."
      />

      <h2>Make the queries visible</h2>
      <p>
        You cannot fix what you cannot see. In a test profile, turn on
        Hibernate’s statistics and SQL log:
      </p>
      <CodeBlock label="application-test.properties">{`
        spring.jpa.properties.hibernate.generate_statistics=true
        logging.level.org.hibernate.SQL=debug
      `}</CodeBlock>
      <p>
        Better still, turn the query count into an assertion. A test that
        expects one statement fails the day somebody adds a lazy access to the
        loop:
      </p>
      <CodeBlock label="OrderQueryCountTest.java">{`
        @SpringBootTest
        @ActiveProfiles("test")
        class OrderQueryCountTest {

            @Autowired EntityManagerFactory entityManagerFactory;
            @Autowired OrderService orderService;

            @Test
            void loadsPlacedOrdersWithOneStatement() {
                // given: a few orders with lines saved in @BeforeEach
                Statistics stats = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
                stats.clear();

                orderService.placedOrders();

                assertThat(stats.getPrepareStatementCount()).isEqualTo(1);
            }
        }
      `}</CodeBlock>

      <h2>Four ways to fix it</h2>

      <h3>1. Join fetch in the query</h3>
      <p>
        Tell Hibernate to load the lines in the same SQL statement as the
        orders:
      </p>
      <CodeBlock label="OrderRepository.java">{`
        @Query("select o from PurchaseOrder o join fetch o.lines where o.status = :status")
        List<PurchaseOrder> findWithLinesByStatus(@Param("status") OrderStatus status);
      `}</CodeBlock>
      <p>
        Hibernate 6 removes the duplicate parent rows a join produces by
        itself, so the <code>distinct</code> you see in older examples is no
        longer needed.
      </p>

      <h3>2. An entity graph on a derived query</h3>
      <p>
        If you would rather keep Spring Data’s derived queries,{" "}
        <code>@EntityGraph</code> adds the fetch without writing JPQL:
      </p>
      <CodeBlock label="OrderRepository.java">{`
        @EntityGraph(attributePaths = "lines")
        List<PurchaseOrder> findByStatus(OrderStatus status);
      `}</CodeBlock>

      <h3>3. Batch fetching as a safety net</h3>
      <p>
        Some lazy access is legitimate and hard to predict. Batch fetching
        makes Hibernate initialize up to N collections at once with an{" "}
        <code>IN (…)</code> query, which turns 1 + 100 queries into 1 + 2:
      </p>
      <CodeBlock label="application.properties">{`
        spring.jpa.properties.hibernate.default_batch_fetch_size=50
      `}</CodeBlock>
      <p>
        It does not remove the extra queries, but it caps them. That makes it
        a good default for the whole application, alongside explicit fetches
        on the queries you know about.
      </p>

      <h3>4. Don’t load entities you are only going to read</h3>
      <p>
        A list screen that shows an order number and a count does not need
        managed entities at all. A constructor expression returns exactly the
        columns it needs, in one query, with nothing for Hibernate to track:
      </p>
      <CodeBlock label="OrderRepository.java">{`
        public record OrderSummary(String orderNumber, Long lineCount) {}

        @Query("""
               select new com.example.orders.OrderSummary(o.orderNumber, count(l))
               from PurchaseOrder o left join o.lines l
               where o.status = :status
               group by o.orderNumber
               """)
        List<OrderSummary> summarize(@Param("status") OrderStatus status);
      `}</CodeBlock>
      <p>
        Spring Data’s interface and class-based projections do the same for
        derived queries. Use entities when you are going to change them, and
        projections when you are only going to show them.
      </p>

      <Callout title="Join fetch and pagination don’t mix">
        <p>
          <code>join fetch</code> on a collection combined with a{" "}
          <code>Pageable</code> cannot be paged in SQL, because the database
          sees one row per line, not per order. Hibernate fetches everything
          and pages in memory, with only a warning in the log. Make that an
          error:
        </p>
        <CodeBlock>{`
          spring.jpa.properties.hibernate.query.fail_on_pagination_over_collection_fetch=true
        `}</CodeBlock>
        <p>
          Then page in two steps: query a page of order ids, and load those
          orders with an entity graph using <code>findByIdIn(ids)</code>.
        </p>
      </Callout>
      <p>
        One more limit: Hibernate refuses to join fetch two{" "}
        <code>List</code> collections of the same entity in one query (
        <code>MultipleBagFetchException</code>), because the result would be a
        cartesian product. Fetch the second collection in a separate query, or
        rely on batch fetching for it.
      </p>

      <h2>What open-in-view actually does</h2>
      <p>On startup, a default Spring Boot app with JPA logs this warning:</p>
      <CodeBlock label="Startup log">{`
        spring.jpa.open-in-view is enabled by default. Therefore, database queries
        may be performed during view rendering. Explicitly configure
        spring.jpa.open-in-view to disable this warning
      `}</CodeBlock>
      <p>
        With open-in-view on, Spring registers an interceptor that opens a
        persistence context when a web request starts and closes it only when
        the response is finished. Lazy associations therefore keep working
        after your <code>@Transactional</code> service method has returned,
        including while Jackson serializes an entity in the controller.
      </p>
      <Figure
        src={`${IMG}/open-in-view.svg`}
        alt="Timeline of one request: with open-in-view on, the persistence context and database connection stay open through JSON serialization, where lazy loads run extra queries; with it off, they only live inside the transactional service"
        width={640}
        height={412}
        caption="With open-in-view on, queries can run and the connection stays busy until the response is written."
      />
      <p>That convenience has two costs:</p>
      <ul>
        <li>
          <strong>Hidden queries.</strong> Every lazy association that Jackson
          touches while writing the response is another SELECT, often an N+1,
          running outside any transaction and invisible in the service code.
        </li>
        <li>
          <strong>Connections held longer.</strong> Once the request has used
          the database, its connection stays checked out until the response is
          written. Under load, slow clients and large responses hold
          connections that other requests are waiting for, and the pool runs
          dry long before the database is busy.
        </li>
      </ul>

      <h2>Turn it off</h2>
      <CodeBlock label="application.properties">{`
        spring.jpa.open-in-view=false
      `}</CodeBlock>
      <p>
        Now the persistence context lives exactly as long as the transaction.
        Code that relied on open-in-view fails with a{" "}
        <code>LazyInitializationException</code>, and that failure is useful:
        it points at exactly the data the service forgot to fetch. Fix each
        one with a join fetch, an entity graph or a projection in the service,
        and return DTOs rather than entities from your controllers, so
        serialization never touches the persistence context at all.
      </p>
      <p>
        On an existing application, switch it off in a branch and run the
        tests. Every exception that appears is a query that was previously
        running unnoticed during serialization.
      </p>

      <h2>Checklist</h2>
      <ul>
        <li>
          <code>@ManyToOne</code> and <code>@OneToOne</code> marked{" "}
          <code>LAZY</code> explicitly.
        </li>
        <li>Statement-count assertions on the queries that matter.</li>
        <li>
          Join fetch or <code>@EntityGraph</code> where you know what you need;
          projections for read-only lists.
        </li>
        <li>
          <code>hibernate.default_batch_fetch_size</code> as a safety net.
        </li>
        <li>
          <code>fail_on_pagination_over_collection_fetch=true</code>, and
          two-step paging for collections.
        </li>
        <li>
          <code>spring.jpa.open-in-view=false</code>, with DTOs returned from
          controllers.
        </li>
      </ul>
    </BlogPost>
  );
}
