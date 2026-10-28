import BlogPost, { postMetadata } from "@/components/blog/BlogPost";
import Callout from "@/components/blog/Callout";
import CodeBlock from "@/components/blog/CodeBlock";
import Figure from "@/components/blog/Figure";

const SLUG = "virtual-threads-spring-boot-java-21";
const IMG = `/blogs/${SLUG}`;

export const metadata = postMetadata(SLUG);

export default function Post() {
  return (
    <BlogPost slug={SLUG}>
      <p>
        Java 21 made virtual threads a standard feature, and Spring Boot 3.2
        turned them into a one-line switch. That makes it tempting to flip
        the switch and expect everything to get faster. It won’t. Virtual
        threads help one specific shape of workload a lot, do nothing for
        others, and come with two traps that can make things worse.
      </p>
      <p>
        This guide covers what changes when you enable them in Spring Boot,
        where they pay off, where they don’t, and how to tell which case you
        are in.
      </p>

      <h2>What a virtual thread is</h2>
      <p>
        A normal Java thread, a <strong>platform thread</strong>, is a thin
        wrapper around an operating-system thread. OS threads are expensive:
        each reserves a stack, and a server can only run a few thousand. So
        Tomcat keeps a pool (200 by default) and each request holds one thread
        for its whole life, including all the time it spends waiting for the
        database.
      </p>
      <p>
        A <strong>virtual thread</strong> is managed by the JVM instead. When
        it blocks on I/O, such as a JDBC query, an HTTP call or a socket read,
        the JVM <em>unmounts</em> it and parks it on the heap. The platform
        thread underneath, called a <strong>carrier</strong>, is free to run
        another virtual thread straight away. There are only as many carriers
        as CPU cores, but you can have hundreds of thousands of virtual
        threads.
      </p>
      <Figure
        src={`${IMG}/platform-vs-virtual-threads.svg`}
        alt="Platform threads each hold an OS thread while blocked on I/O; virtual threads park while waiting and mount onto a few busy carrier threads; a 10-connection pool still limits concurrent database queries"
        width={640}
        height={508}
        caption="Virtual threads remove the thread limit. They do not remove the limits behind it, such as the connection pool."
      />

      <h2>Turning them on in Spring Boot</h2>
      <p>On Java 21 or later with Spring Boot 3.2 or later:</p>
      <CodeBlock label="application.properties">{`
        spring.threads.virtual.enabled=true
      `}</CodeBlock>
      <p>That one property changes several things at once:</p>
      <ul>
        <li>Tomcat and Jetty handle each request on a new virtual thread.</li>
        <li>
          The <code>applicationTaskExecutor</code> behind{" "}
          <code>@Async</code> and async Spring MVC requests becomes a{" "}
          <code>SimpleAsyncTaskExecutor</code> that starts a virtual thread per
          task.
        </li>
        <li>
          <code>@Scheduled</code> tasks and several messaging listener
          containers run on virtual threads too.
        </li>
      </ul>
      <p>
        Virtual threads are daemon threads, so an application with no web
        server that only runs scheduled tasks can exit right after startup.
        Add <code>spring.main.keep-alive=true</code> for that case. To check
        the switch worked, log the current thread in a controller. It prints
        something like{" "}
        <code>VirtualThread[#52]/runnable@ForkJoinPool-1-worker-3</code>.
      </p>

      <h2>When they help</h2>
      <p>
        Virtual threads raise <em>throughput</em> for code that spends most of
        its time waiting. They do not make any single request faster. The
        workloads that benefit are:
      </p>
      <ul>
        <li>
          Request handlers dominated by blocking I/O: JDBC, calls to other
          services with <code>RestClient</code>, file access.
        </li>
        <li>
          High concurrency, where requests queue for Tomcat’s 200 threads
          while those threads sit idle waiting on I/O.
        </li>
        <li>
          Fan-out inside a request. Starting a virtual thread per call is
          cheap, so parallel calls no longer need a carefully sized pool:
        </li>
      </ul>
      <CodeBlock label="DashboardService.java">{`
        public Dashboard load(String customerId) throws Exception {
            try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
                Future<Customer> customer = executor.submit(() -> customerClient.get(customerId));
                Future<List<Order>> orders = executor.submit(() -> orderClient.forCustomer(customerId));
                return new Dashboard(customer.get(), orders.get());
            } // close() waits for both tasks
        }
      `}</CodeBlock>
      <p>
        This is the main appeal: the scalability people used to adopt
        reactive programming for, while keeping plain blocking code that is
        easy to read, debug and profile.
      </p>

      <h2>When they don’t help</h2>
      <h3>CPU-bound work</h3>
      <p>
        There is still one carrier per core. Code that is busy computing,
        whether JSON mapping of huge payloads, image processing or hashing,
        gets no extra throughput from more threads.
      </p>

      <h3>When a shared resource is the real limit</h3>
      <p>
        With platform threads, Tomcat’s pool quietly capped how many requests
        could hit the database at once. Remove that cap and thousands of
        virtual threads arrive at the connection pool together. HikariCP’s
        default is 10 connections, so request number 11 waits for a
        connection, and after 30 seconds (the default{" "}
        <code>connectionTimeout</code>) it fails. The bottleneck has moved, not
        disappeared.
      </p>
      <p>
        The same applies to rate-limited APIs. Since threads no longer ration
        concurrency, ration it explicitly where it matters, with a{" "}
        <code>Semaphore</code> rather than a smaller thread pool:
      </p>
      <CodeBlock label="InventoryGateway.java">{`
        private final Semaphore permits = new Semaphore(20); // the downstream API allows 20 concurrent calls

        public Stock stock(String sku) throws InterruptedException {
            permits.acquire();
            try {
                return inventoryClient.stock(sku);
            } finally {
                permits.release();
            }
        }
      `}</CodeBlock>

      <h3>Pooling virtual threads</h3>
      <p>
        Thread pools exist to ration expensive threads. Virtual threads are
        cheap, so create one per task and let it end. A fixed pool of virtual
        threads just reintroduces the limit you were trying to remove.
      </p>

      <h2>Pinning: the trap on Java 21</h2>
      <p>
        On Java 21, a virtual thread that blocks while inside a{" "}
        <code>synchronized</code> block or method cannot unmount. It stays{" "}
        <strong>pinned</strong> to its carrier and holds a whole CPU core
        while it waits. With only a handful of carriers, a few pinned threads
        can stall the entire application.
      </p>
      <p>
        On Java 21, replace <code>synchronized</code> around blocking calls
        with a <code>ReentrantLock</code>, which virtual threads can wait on
        without pinning:
      </p>
      <CodeBlock label="TokenCache.java">{`
        private final ReentrantLock lock = new ReentrantLock();
        private volatile Token token;

        Token current() {
            lock.lock();
            try {
                if (token == null || token.isExpired()) {
                    token = authClient.fetchToken();   // blocking HTTP call
                }
                return token;
            } finally {
                lock.unlock();
            }
        }
      `}</CodeBlock>
      <p>
        To find pinning, run with <code>-Djdk.tracePinnedThreads=full</code>{" "}
        on Java 21, which prints a stack trace whenever a pinned thread blocks,
        or record the <code>jdk.VirtualThreadPinned</code> JDK Flight Recorder
        event. Library code can pin too, so keep JDBC drivers and HTTP clients
        up to date: many have replaced <code>synchronized</code> with locks for
        exactly this reason.
      </p>
      <Callout title="Java 24 and later fix most of this">
        <p>
          JEP 491, delivered in Java 24, lets virtual threads unmount while
          inside <code>synchronized</code>, which removes the most common cause
          of pinning. Java 25 is a long-term support release that includes it.
          If you are adopting virtual threads seriously, running on Java 25 is
          the simplest way to avoid pinning.
        </p>
      </Callout>

      <h2>ThreadLocal habits to drop</h2>
      <p>
        Every virtual thread has its own <code>ThreadLocal</code> values, just
        like a platform thread. Code that caches something expensive in a{" "}
        <code>ThreadLocal</code>, assuming a pool of 200 long-lived threads,
        will now create one per request. Cache it in a shared, thread-safe
        object instead.
      </p>

      <h2>Measure before you decide</h2>
      <p>
        Whether virtual threads help is a property of your workload, so test
        it on yours. Run the same load test against the same endpoints with
        the property on and off, and compare throughput, p99 latency and error
        rate. While it runs, watch the connection pool through Actuator’s
        metrics:
      </p>
      <CodeBlock label="application.properties">{`
        management.endpoints.web.exposure.include=health,metrics
      `}</CodeBlock>
      <p>
        <code>hikaricp.connections.pending</code> shows threads waiting for a
        connection, and <code>hikaricp.connections.active</code> shows how
        many are in use. If pending climbs as soon as you enable virtual
        threads, the database pool is your real limit, and that is where the
        next improvement has to come from.
      </p>

      <h2>Checklist</h2>
      <ul>
        <li>Java 21+ and Spring Boot 3.2+, then <code>spring.threads.virtual.enabled=true</code>.</li>
        <li>Use them for I/O-bound, high-concurrency workloads, not CPU-bound ones.</li>
        <li>Bound shared resources explicitly: pool sizes, and semaphores for downstream APIs.</li>
        <li>Never pool virtual threads.</li>
        <li>
          On Java 21, no blocking inside <code>synchronized</code>; better
          still, run on Java 25.
        </li>
        <li>Load test with the property on and off, and watch the pool metrics.</li>
      </ul>
    </BlogPost>
  );
}
