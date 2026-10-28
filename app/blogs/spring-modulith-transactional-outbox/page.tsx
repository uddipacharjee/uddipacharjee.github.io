import BlogPost, { postMetadata } from "@/components/blog/BlogPost";
import Callout from "@/components/blog/Callout";
import CodeBlock from "@/components/blog/CodeBlock";
import Figure from "@/components/blog/Figure";

const SLUG = "spring-modulith-transactional-outbox";
const IMG = `/blogs/${SLUG}`;

export const metadata = postMetadata(SLUG);

export default function Post() {
  return (
    <BlogPost slug={SLUG}>
      <p>
        When an order is placed, other parts of the system need to react:
        reserve stock, send a confirmation, publish a message to Kafka. Doing
        that reliably is harder than it looks. React inside the order’s
        transaction, and a failure in the stock code cancels the order. React
        after the commit, and a crash at the wrong moment loses the reaction
        for good.
      </p>
      <p>
        The <strong>transactional outbox</strong> pattern solves this. The
        event is stored in the same database transaction as the order, then
        delivered afterwards and retried until it succeeds. Spring Modulith’s{" "}
        <strong>event publication registry</strong> implements that pattern
        for ordinary Spring application events. This post continues the shop
        example from{" "}
        <a href="/blogs/spring-modulith-modular-monolith/">
          Spring Modulith: Build a Modular Monolith in Spring Boot
        </a>
        , on Spring Boot 3.4 and Spring Modulith 1.3.
      </p>

      <h2>Why a plain event listener is not enough</h2>
      <p>
        The orders module publishes an <code>OrderCreatedEvent</code> after
        saving, and inventory listens for it:
      </p>
      <CodeBlock label="inventory/InventoryService.java">{`
        @EventListener
        void on(OrderCreatedEvent event) {
            inventory.reserve(event.productCode(), event.quantity());
        }
      `}</CodeBlock>
      <p>
        <code>@EventListener</code> runs synchronously on the publishing
        thread, inside the order’s transaction. If <code>reserve</code>{" "}
        throws, the order rolls back. If it is slow, placing an order is slow.
        The modules are separate in the code but still tied together at
        runtime.
      </p>
      <p>
        <code>@TransactionalEventListener</code> moves the listener to after
        the commit. That fixes the coupling, but the event now exists only in
        memory. If the listener fails, or the application stops between the
        commit and the listener running, the stock is never reserved and
        nothing records that it should have been. This is the classic{" "}
        <em>dual write</em> problem: two things that must both happen, and no
        transaction covering both.
      </p>

      <h2>How the event publication registry works</h2>
      <p>
        With the registry on the classpath, publishing an event inside a
        transaction also writes one row per transactional listener into an{" "}
        <code>event_publication</code> table. Because that write happens in
        the business transaction, the order and its pending events commit
        together, or not at all.
      </p>
      <Figure
        src={`${IMG}/event-publication-registry.svg`}
        alt="Spring Modulith event publication registry: the order and an incomplete event publication are inserted in one transaction; after commit the listener runs in its own transaction and marks the publication complete, or leaves it incomplete to be resubmitted"
        width={640}
        height={520}
        caption="The publication is stored with the order and only marked complete once the listener has succeeded."
      />
      <p>
        After the commit, each listener runs. When it returns normally, its
        publication is marked complete. When it throws, the publication stays
        incomplete, and the event is still in the database, serialized as
        JSON, ready to be delivered again.
      </p>

      <h2>Setting it up</h2>
      <p>
        Pick one registry starter. The JDBC variant works in JPA applications
        too and can create its own table:
      </p>
      <CodeBlock label="build.gradle">{`
        implementation 'org.springframework.modulith:spring-modulith-starter-jdbc'
      `}</CodeBlock>
      <CodeBlock label="application.properties">{`
        # create the event_publication table on startup (off by default before Modulith 2.1)
        spring.modulith.events.jdbc.schema-initialization.enabled=true
        # optional: keep it in its own schema
        spring.modulith.events.jdbc.schema=events
      `}</CodeBlock>
      <p>
        <code>spring-modulith-starter-jpa</code> is the alternative. It stores
        publications through a JPA entity, so create the table with your
        migrations (Flyway or Liquibase) like any other.
      </p>
      <Callout title="The jdbc.* settings only apply to the JDBC starter">
        <p>
          With the JPA starter on the classpath, every{" "}
          <code>spring.modulith.events.jdbc.*</code> property is silently
          ignored: no schema, no automatic table. It is an easy mix-up, since
          both starters write to the same <code>event_publication</code>{" "}
          table. Choose one starter and configure that one.
        </p>
      </Callout>

      <h2>Listening with @ApplicationModuleListener</h2>
      <CodeBlock label="inventory/InventoryService.java">{`
        @Service
        class InventoryService {

            @ApplicationModuleListener
            void on(OrderCreatedEvent event) {
                inventory.reserve(event.productCode(), event.quantity());
            }
        }
      `}</CodeBlock>
      <p>
        <code>@ApplicationModuleListener</code> is shorthand for three
        annotations:
      </p>
      <ul>
        <li>
          <code>@TransactionalEventListener</code>: runs after the order’s
          transaction commits, never for a rolled-back order.
        </li>
        <li>
          <code>@Async</code>: runs on another thread, so placing the order does
          not wait for inventory.
        </li>
        <li>
          <code>@Transactional(propagation = REQUIRES_NEW)</code>: the listener
          gets a transaction of its own.
        </li>
      </ul>
      <p>
        It relies on Spring’s <code>@Async</code> support, so add{" "}
        <code>@EnableAsync</code> to a configuration class if nothing in your
        application enables it yet. The registry covers any{" "}
        <code>@TransactionalEventListener</code>, but this one annotation
        captures the combination you almost always want between modules.
      </p>
      <Callout title="Delivery is at least once">
        <p>
          A retried publication runs the listener again. Make listeners
          idempotent: check whether the reservation for this order number
          already exists, or rely on a unique constraint, so running twice has
          the same effect as running once.
        </p>
      </Callout>

      <h2>Retrying incomplete publications</h2>
      <p>
        Incomplete publications stay in the table until something resubmits
        them. There are two ways to do that.
      </p>
      <h3>On restart</h3>
      <CodeBlock label="application.properties">{`
        spring.modulith.events.republish-outstanding-events-on-restart=true
      `}</CodeBlock>
      <p>
        This is simple and fits a single instance. With several instances,
        each one republishes everything on startup, which the Spring Modulith
        documentation advises against.
      </p>
      <h3>On a schedule</h3>
      <p>
        <code>IncompleteEventPublications</code> resubmits on demand. Only
        retry publications older than a few minutes, so you don’t resubmit
        events whose listeners are still running:
      </p>
      <CodeBlock label="RetryIncompletePublications.java">{`
        @Component
        class RetryIncompletePublications {

            private final IncompleteEventPublications incomplete;

            RetryIncompletePublications(IncompleteEventPublications incomplete) {
                this.incomplete = incomplete;
            }

            @Scheduled(fixedDelay = 60_000)   // needs @EnableScheduling
            void retry() {
                incomplete.resubmitIncompletePublicationsOlderThan(Duration.ofMinutes(5));
            }
        }
      `}</CodeBlock>
      <p>
        With several instances, make sure only one runs the job at a time,
        for example with ShedLock.
      </p>

      <h2>Cleaning up completed publications</h2>
      <p>
        By default a completed publication stays in the table with its
        completion date set, which is handy for auditing and grows forever.
        Since Spring Modulith 1.3 you can choose what happens on completion:
      </p>
      <CodeBlock label="application.properties">{`
        # update (default): keep the row, set the completion date
        # delete: remove the row as soon as the listener succeeds
        # archive: move the row to event_publication_archive
        spring.modulith.events.completion-mode=delete
      `}</CodeBlock>
      <p>
        If you keep the default, purge old rows on a schedule with{" "}
        <code>CompletedEventPublications.deletePublicationsOlderThan(…)</code>.
      </p>

      <h2>Testing a listener</h2>
      <p>
        Spring Modulith’s <code>Scenario</code> can publish an event and wait
        for the asynchronous listener to finish its work:
      </p>
      <CodeBlock label="inventory/InventoryModuleTests.java">{`
        @ApplicationModuleTest
        class InventoryModuleTests {

            @Autowired
            InventoryService inventory;

            @Test
            void reservesStockWhenAnOrderIsCreated(Scenario scenario) {
                scenario.publish(new OrderCreatedEvent("ORD-1", "P100", 2))
                        .andWaitForStateChange(() -> inventory.reservedQuantity("P100"), qty -> qty == 2)
                        .andVerify(qty -> assertThat(qty).isEqualTo(2));
            }
        }
      `}</CodeBlock>

      <h2>Sending events to Kafka through the same outbox</h2>
      <p>
        When other services need the event too, mark it for
        externalization and add the Kafka module (
        <code>spring-modulith-events-kafka</code>; there are AMQP, JMS and
        Spring Messaging variants as well):
      </p>
      <CodeBlock label="orders/domain/events/OrderCreatedEvent.java">{`
        @Externalized("orders.created::#{#this.orderNumber()}")
        public record OrderCreatedEvent(String orderNumber, String productCode, int quantity) {}
      `}</CodeBlock>
      <p>
        The part before <code>::</code> is the Kafka topic. The expression
        after it becomes the message key, so all events for one order land in
        the same partition, in order. Externalization is itself a transactional
        event listener, so it goes through the registry like any other: if
        Kafka is down, the publication stays incomplete and is retried, which
        is exactly what a transactional outbox to a broker should do.
      </p>

      <h2>On Spring Modulith 2</h2>
      <p>
        Spring Modulith 2.x, for Spring Boot 4, extends the registry. Each
        publication now has an explicit status (published, processing,
        completed, failed, resubmitted). A staleness monitor flags
        publications stuck in processing, and{" "}
        <code>FailedEventPublications</code> resubmits failures with
        options. From 2.1, JDBC schema initialization is on by default. The
        concepts and annotations in this post stay the same.
      </p>

      <h2>Checklist</h2>
      <ul>
        <li>
          One registry starter (<code>-jdbc</code> or <code>-jpa</code>), and
          the table created by Modulith or by your migrations.
        </li>
        <li>
          <code>@ApplicationModuleListener</code> between modules, with async
          execution enabled.
        </li>
        <li>Idempotent listeners: delivery is at least once.</li>
        <li>
          A retry strategy: republish on restart for one instance, or a
          scheduled <code>IncompleteEventPublications</code> job.
        </li>
        <li>A completion mode or a purge job, so the table doesn’t grow forever.</li>
        <li>
          <code>@Externalized</code> for events other services need, so the
          broker gets the same guarantees.
        </li>
      </ul>
    </BlogPost>
  );
}
