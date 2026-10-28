import BlogPost, { postMetadata } from "@/components/blog/BlogPost";
import Callout from "@/components/blog/Callout";
import CodeBlock from "@/components/blog/CodeBlock";
import Figure from "@/components/blog/Figure";

const SLUG = "spring-modulith-modular-monolith";
const IMG = `/blogs/${SLUG}`;

export const metadata = postMetadata(SLUG);

export default function Post() {
  return (
    <BlogPost slug={SLUG}>
      <p>
        Most Spring Boot monoliths start tidy. A year later the order code
        reads the product tables directly, the product code imports an order
        DTO, and nobody can change one area without breaking another.
        Splitting into microservices fixes the coupling, but you pay for it
        with network calls, separate deployments and data that is only
        eventually consistent.
      </p>
      <p>
        A <strong>modular monolith</strong> is the middle path: one deployable
        application, with boundaries inside it that are enforced rather than
        hoped for. Spring Modulith gives a Spring Boot app those boundaries,
        a test that fails when one is crossed, and documentation generated
        from the code. The examples come from my{" "}
        <a href="https://github.com/uddipacharjee/modulith">modulith</a>{" "}
        repository, a small shop with <code>catalog</code>,{" "}
        <code>orders</code> and <code>inventory</code> modules on Spring Boot
        3.4 and Spring Modulith 1.3. Spring Modulith 2.x, for Spring Boot 4,
        keeps every API shown here.
      </p>

      <h2>Modules are packages</h2>
      <p>
        Spring Modulith needs no new build structure. Every direct
        sub-package of your application’s main package is a module:
      </p>
      <CodeBlock label="src/main/java">{`
        com.incognito.modulith
        ├── ModulithApplication.java
        ├── catalog
        │   ├── Product.java            API
        │   ├── ProductService.java     API
        │   ├── domain/                 internal
        │   └── web/                    internal
        ├── orders
        │   ├── domain/                 internal
        │   │   └── events/             named interface "order-events"
        │   └── web/                    internal
        ├── inventory
        │   └── InventoryService.java
        └── common                      open module
      `}</CodeBlock>
      <p>
        Types in a module’s top-level package are its <strong>API</strong>.
        Everything in a sub-package is <strong>internal</strong>, even when it
        is declared <code>public</code>. That last part is the point: Java’s{" "}
        <code>public</code> means “visible to everyone”, and there is no
        keyword for “visible to my module only”. Spring Modulith adds that
        rule and checks it.
      </p>
      <Figure
        src={`${IMG}/module-boundaries.svg`}
        alt="Spring Modulith module map: orders uses catalog's ProductService API, which is allowed; orders reaching into catalog's internal ProductRepository is rejected; inventory listens to the OrderCreatedEvent named interface"
        width={640}
        height={476}
        caption="Solid arrows are allowed dependencies. The dashed one reaches into another module’s internals, and the verification test fails on it."
      />

      <h2>Add Spring Modulith to the build</h2>
      <CodeBlock label="build.gradle">{`
        dependencyManagement {
            imports {
                mavenBom "org.springframework.modulith:spring-modulith-bom:1.3.3"
            }
        }

        dependencies {
            implementation 'org.springframework.modulith:spring-modulith-starter-core'
            testImplementation 'org.springframework.modulith:spring-modulith-starter-test'
        }
      `}</CodeBlock>

      <h2>Verify the boundaries in a test</h2>
      <p>
        One test turns the package conventions into rules the build enforces:
      </p>
      <CodeBlock label="ModularityTests.java">{`
        class ModularityTests {

            static ApplicationModules modules = ApplicationModules.of(ModulithApplication.class);

            @Test
            void verifiesModularStructure() {
                modules.verify();
            }
        }
      `}</CodeBlock>
      <p>
        <code>verify()</code> fails the test with a list of violations if:
      </p>
      <ul>
        <li>two modules depend on each other in a cycle,</li>
        <li>
          a module uses a type from another module’s internal packages, such
          as <code>orders</code> injecting catalog’s{" "}
          <code>ProductRepository</code>, or
        </li>
        <li>
          a module depends on one it has not declared as allowed (see below).
        </li>
      </ul>
      <p>
        Because it is a plain unit test, it runs on every build. A boundary
        violation shows up in a pull request instead of in an architecture
        review six months later.
      </p>

      <h2>Expose only what other modules need</h2>
      <p>
        The catalog module publishes an interface and a record at its top
        level. The implementation, the JPA entity and the repository all live
        in <code>catalog.domain</code>, where no other module can reach them:
      </p>
      <CodeBlock label="catalog/ProductService.java">{`
        package com.incognito.modulith.catalog;

        public interface ProductService {
            PagedResult<Product> getProducts(int pageNo);
            Optional<Product> getByCode(String code);
        }
      `}</CodeBlock>
      <CodeBlock label="catalog/Product.java">{`
        package com.incognito.modulith.catalog;

        public record Product(String code, String name, String description,
                              String imageUrl, BigDecimal price) {}
      `}</CodeBlock>
      <p>
        The orders module validates a new order against that API and nothing
        else. It never sees the <code>ProductEntity</code> or its table:
      </p>
      <CodeBlock label="orders/domain/OrderService.java">{`
        private void validate(CreateOrderRequest request) {
            String code = request.item().code();
            Product product = productService.getByCode(code)
                    .orElseThrow(() -> new InvalidOrderException("Product not found with code: " + code));
            if (product.price().compareTo(request.item().price()) != 0) {
                throw new InvalidOrderException("Product price mismatch");
            }
        }
      `}</CodeBlock>
      <p>
        Returning a record instead of the entity matters. If catalog later
        splits its table or moves to another database, the{" "}
        <code>Product</code> record stays the same and orders never notices.
      </p>

      <h2>Named interfaces for types that live deeper</h2>
      <p>
        Sometimes a module needs to share a type that does not belong in its
        top-level package, such as events. A <code>package-info.java</code>{" "}
        with <code>@NamedInterface</code> exposes one sub-package under a name:
      </p>
      <CodeBlock label="orders/domain/events/package-info.java">{`
        @org.springframework.modulith.NamedInterface("order-events")
        package com.incognito.modulith.orders.domain.events;
      `}</CodeBlock>
      <p>
        Other modules may now use <code>OrderCreatedEvent</code>, but the rest
        of <code>orders.domain</code> stays internal.
      </p>

      <h2>Declare which modules a module may depend on</h2>
      <p>
        By default a module may use any other module’s API. To make the
        dependency graph explicit, list the allowed ones on the module’s base
        package. Anything not listed fails <code>verify()</code>:
      </p>
      <CodeBlock label="orders/package-info.java">{`
        @org.springframework.modulith.ApplicationModule(
            allowedDependencies = { "catalog" }
        )
        package com.incognito.modulith.orders;
      `}</CodeBlock>
      <p>
        To allow only a named interface, use the{" "}
        <code>module :: interface</code> form, for example{" "}
        <code>&quot;orders :: order-events&quot;</code>. A small shared kernel,
        such as a <code>PagedResult</code> type every module returns, can be
        declared an <strong>open module</strong>, which exposes all of its
        packages:
      </p>
      <CodeBlock label="common/package-info.java">{`
        @ApplicationModule(type = ApplicationModule.Type.OPEN)
        package com.incognito.modulith.common;

        import org.springframework.modulith.ApplicationModule;
      `}</CodeBlock>
      <Callout title="Keep open modules small">
        <p>
          An open module switches the boundary checks off for its contents.
          That is fine for a handful of shared value types. It is how a
          “common” package grows into the tangle you were trying to avoid.
        </p>
      </Callout>

      <h2>Talk through events instead of calls</h2>
      <p>
        Orders validates against catalog with a direct call, because it needs
        the answer before it can continue. Inventory is different: orders does
        not need to wait for it, and should not even know it exists. So orders
        publishes an event after saving:
      </p>
      <CodeBlock label="orders/domain/OrderService.java">{`
        OrderEntity savedOrder = orderRepository.save(newOrder);
        eventPublisher.publishEvent(new OrderCreatedEvent(
                savedOrder.getOrderNumber(),
                savedOrder.getOrderItem().code(),
                savedOrder.getOrderItem().quantity()));
      `}</CodeBlock>
      <p>and inventory listens:</p>
      <CodeBlock label="inventory/InventoryService.java">{`
        @Service
        class InventoryService {

            @EventListener
            void on(OrderCreatedEvent event) {
                log.info("Update inventory for product code: {}", event.productCode());
            }
        }
      `}</CodeBlock>
      <p>
        The dependency now points from inventory to orders, not the other way
        round. Adding shipping or notifications later means adding a listener,
        not editing <code>OrderService</code>.
      </p>
      <p>
        A plain <code>@EventListener</code> runs synchronously, inside the
        publisher’s transaction. If the inventory update throws, the order
        rolls back with it. Spring Modulith’s{" "}
        <code>@ApplicationModuleListener</code> and its event publication
        registry fix that. They are covered in{" "}
        <a href="/blogs/spring-modulith-transactional-outbox/">
          Transactional Outbox with Spring Modulith Events
        </a>
        .
      </p>

      <h2>Test one module at a time</h2>
      <p>
        <code>@ApplicationModuleTest</code> starts only the module the test
        class lives in, rather than the whole application. Beans from other
        modules are not created, so dependencies on them are mocked. The{" "}
        <code>Scenario</code> parameter lets a test trigger something and wait
        for the event it should publish:
      </p>
      <CodeBlock label="orders/OrdersModuleTests.java">{`
        @ApplicationModuleTest
        class OrdersModuleTests {

            @MockitoBean
            ProductService productService;       // catalog is not started

            @Autowired
            OrderService orderService;

            @Test
            void publishesOrderCreatedEvent(Scenario scenario) {
                when(productService.getByCode("P100")).thenReturn(Optional.of(
                        new Product("P100", "The Hunger Games", "", "", new BigDecimal("34.00"))));

                var request = new CreateOrderRequest(
                        new OrderItem("P100", "The Hunger Games", new BigDecimal("34.00"), 1),
                        new Customer("Ayesha", "ayesha@example.com", "+8801700000000"));

                scenario.stimulate(() -> orderService.createOrder(request))
                        .andWaitForEventOfType(OrderCreatedEvent.class)
                        .matchingMappedValue(OrderCreatedEvent::productCode, "P100")
                        .toArrive();
            }
        }
      `}</CodeBlock>
      <p>
        <code>@MockitoBean</code> is the Spring Framework 6.2 replacement for
        Boot’s deprecated <code>@MockBean</code>. The stimulus runs in its own
        transaction, which commits, so clean up what it created (
        <code>Scenario</code> has an <code>andCleanup(…)</code> hook for this).
        The orders module still needs its database, so run this against a
        real PostgreSQL. The{" "}
        <a href="/blogs/spring-boot-testing-testcontainers-jacoco/">
          testing guide
        </a>{" "}
        shows how with Testcontainers.
      </p>

      <h2>Generate documentation from the code</h2>
      <p>
        The same <code>ApplicationModules</code> model can write diagrams of
        the modules and their dependencies, so the architecture documentation
        is regenerated on every build instead of drifting out of date:
      </p>
      <CodeBlock label="ModularityTests.java">{`
        @Test
        void writeDocumentation() {
            new Documenter(modules).writeDocumentation();
        }
      `}</CodeBlock>
      <p>
        This writes PlantUML component diagrams for the whole application and
        for each module, plus a “module canvas” per module listing its API,
        Spring beans, events published and events listened to. They go into a{" "}
        <code>spring-modulith-docs</code> folder under the build output
        directory.
      </p>

      <h2>Modular monolith or microservices?</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Modular monolith</th>
            <th>Microservices</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Deployables</td>
            <td>One</td>
            <td>One per service</td>
          </tr>
          <tr>
            <td>Calls between parts</td>
            <td>In-process method calls and events</td>
            <td>Network calls and messaging</td>
          </tr>
          <tr>
            <td>Consistency</td>
            <td>Local transactions</td>
            <td>Eventual, with sagas or outboxes</td>
          </tr>
          <tr>
            <td>Boundaries enforced by</td>
            <td>Tests like <code>verify()</code></td>
            <td>Separate codebases and the network</td>
          </tr>
          <tr>
            <td>Scaling</td>
            <td>The whole application</td>
            <td>Each service on its own</td>
          </tr>
          <tr>
            <td>Operational cost</td>
            <td>Low</td>
            <td>High</td>
          </tr>
        </tbody>
      </table>
      <p>
        For most teams, a modular monolith is the better place to start. If a
        module later needs to scale or deploy on its own, clean boundaries
        and event-based communication make extracting it a refactoring, not a
        rewrite.
      </p>

      <h2>Checklist</h2>
      <ul>
        <li>One top-level package per business capability.</li>
        <li>Interfaces and records in the module’s base package; everything else below it.</li>
        <li>
          <code>ApplicationModules.of(App.class).verify()</code> in the test
          suite.
        </li>
        <li>
          <code>allowedDependencies</code> to make the dependency graph
          explicit, and named interfaces for shared events.
        </li>
        <li>Events for anything the caller does not need to wait for.</li>
        <li>
          <code>@ApplicationModuleTest</code> for module-level integration tests.
        </li>
        <li>Generated documentation, regenerated on every build.</li>
      </ul>
    </BlogPost>
  );
}
