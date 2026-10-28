import BlogPost, { postMetadata } from "@/components/blog/BlogPost";
import Callout from "@/components/blog/Callout";
import CodeBlock from "@/components/blog/CodeBlock";
import Figure from "@/components/blog/Figure";

const SLUG = "spring-boot-testing-testcontainers-jacoco";
const IMG = `/blogs/${SLUG}`;

export const metadata = postMetadata(SLUG);

export default function Post() {
  return (
    <BlogPost slug={SLUG}>
      <p>
        A test suite that takes ten minutes gets skipped. One that mocks
        everything passes while production breaks. The useful middle is a
        mix: many fast unit and slice tests, a real database wherever SQL
        matters, a handful of full-application tests, and a coverage gate so
        none of it quietly erodes.
      </p>
      <p>
        This guide builds that mix for a Spring Boot 3 service with Gradle,
        JUnit 5, Testcontainers and JaCoCo. The coverage setup comes from my{" "}
        <a href="https://github.com/uddipacharjee/EdcOnboardingApplication">
          EdcOnboardingApplication
        </a>{" "}
        repository.
      </p>

      <h2>Pick the smallest test that proves the point</h2>
      <p>
        Spring Boot’s <strong>test slices</strong> start only part of the
        application, which makes them much faster than a full{" "}
        <code>@SpringBootTest</code>. Choosing the right one is most of the
        work:
      </p>
      <Figure
        src={`${IMG}/test-slices.svg`}
        alt="Matrix of Spring Boot test types: a unit test runs a real service with a mocked repository, @WebMvcTest loads controllers with mocked services, @DataJpaTest loads repositories with a real PostgreSQL, @SpringBootTest loads everything"
        width={640}
        height={384}
        caption="What each kind of test loads. The higher the row, the faster the test."
      />

      <h2>Unit tests: no Spring at all</h2>
      <p>
        Business rules in a service need no application context. With
        constructor injection, Mockito can build the service directly:
      </p>
      <CodeBlock label="OrderServiceTest.java">{`
        @ExtendWith(MockitoExtension.class)
        class OrderServiceTest {

            @Mock OrderRepository orderRepository;
            @Mock ProductService productService;
            @Mock ApplicationEventPublisher events;
            @InjectMocks OrderService orderService;

            @Test
            void rejectsOrderWhenThePriceHasChanged() {
                when(productService.getByCode("P100")).thenReturn(Optional.of(
                        new Product("P100", "The Hunger Games", "", "", new BigDecimal("40.00"))));

                var request = anOrderFor("P100", new BigDecimal("34.00"));

                assertThatThrownBy(() -> orderService.createOrder(request))
                        .isInstanceOf(InvalidOrderException.class)
                        .hasMessage("Product price mismatch");
                verifyNoInteractions(orderRepository, events);
            }
        }
      `}</CodeBlock>
      <p>
        These run in milliseconds, so this is where most of your test cases
        should live.
      </p>

      <h2>Web slice: @WebMvcTest</h2>
      <p>
        <code>@WebMvcTest</code> loads controllers, controller advice, Jackson
        and the MVC infrastructure, but no services or repositories. That
        makes it the right place to test request mapping, validation, JSON
        shape and error responses:
      </p>
      <CodeBlock label="OrderControllerTest.java">{`
        @WebMvcTest(OrderController.class)
        class OrderControllerTest {

            @Autowired MockMvc mockMvc;
            @MockitoBean OrderService orderService;

            @Test
            void listsOrders() throws Exception {
                when(orderService.findOrders())
                        .thenReturn(List.of(new OrderSummary("ORD-1", OrderStatus.NEW)));

                mockMvc.perform(get("/api/orders"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$[0].orderNumber").value("ORD-1"));
            }
        }
      `}</CodeBlock>
      <p>
        <code>@MockitoBean</code> replaces Boot’s <code>@MockBean</code>, which
        is deprecated since Spring Boot 3.4. For a full example of testing
        error responses, see{" "}
        <a href="/blogs/spring-boot-problemdetail-validation/">
          Spring Boot REST Errors with ProblemDetail and Validation
        </a>
        .
      </p>

      <h2>A real PostgreSQL with Testcontainers</h2>
      <p>
        Testing repositories against H2 tests H2. PostgreSQL-specific SQL such
        as <code>ON CONFLICT</code>, <code>jsonb</code> columns or array types
        either fails or behaves differently, and Flyway migrations written for
        PostgreSQL may not run at all. Testcontainers starts the real database
        in Docker for the duration of the tests:
      </p>
      <CodeBlock label="build.gradle">{`
        testImplementation 'org.springframework.boot:spring-boot-testcontainers'
        testImplementation 'org.testcontainers:junit-jupiter'
        testImplementation 'org.testcontainers:postgresql'
      `}</CodeBlock>
      <p>
        Spring Boot manages the versions. Since Boot 3.1,{" "}
        <code>@ServiceConnection</code> reads the container’s host, port and
        credentials and configures the <code>DataSource</code> from them, so
        there is no <code>@DynamicPropertySource</code> boilerplate:
      </p>
      <CodeBlock label="OrderRepositoryTest.java">{`
        @DataJpaTest
        @AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
        @Testcontainers
        class OrderRepositoryTest {

            @Container
            @ServiceConnection
            static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

            @Autowired OrderRepository orderRepository;

            @Test
            void findsAnOrderByItsNumber() {
                orderRepository.save(anOrder("ORD-1"));

                assertThat(orderRepository.findByOrderNumber("ORD-1")).isPresent();
            }
        }
      `}</CodeBlock>
      <p>
        <code>@DataJpaTest</code> runs your Flyway or Liquibase migrations,
        wraps each test in a transaction and rolls it back afterwards.{" "}
        <code>Replace.NONE</code> stops it from swapping the container for an
        embedded database.
      </p>

      <h2>Share one container across the suite</h2>
      <p>
        Declaring the container as a bean lets Spring manage it, and every
        test that imports the same configuration reuses it:
      </p>
      <CodeBlock label="TestcontainersConfig.java">{`
        @TestConfiguration(proxyBeanMethods = false)
        public class TestcontainersConfig {

            @Bean
            @ServiceConnection
            PostgreSQLContainer<?> postgres() {
                return new PostgreSQLContainer<>("postgres:16-alpine");
            }
        }
      `}</CodeBlock>
      <p>
        The same class gives you a local development database with no
        installation. Start the application from a small class in{" "}
        <code>src/test</code>:
      </p>
      <CodeBlock label="TestShopApplication.java">{`
        public class TestShopApplication {

            public static void main(String[] args) {
                SpringApplication.from(ShopApplication::main)
                        .with(TestcontainersConfig.class)
                        .run(args);
            }
        }
      `}</CodeBlock>

      <h2>A few full-application tests</h2>
      <p>
        Keep <code>@SpringBootTest</code> for the paths that cross every layer:
        an order placed over HTTP, saved in PostgreSQL, with its event
        published. A handful of these catch wiring mistakes that no slice can:
      </p>
      <CodeBlock label="PlaceOrderIT.java">{`
        @SpringBootTest
        @AutoConfigureMockMvc
        @Import(TestcontainersConfig.class)
        class PlaceOrderIT {

            @Autowired MockMvc mockMvc;
            @Autowired OrderRepository orderRepository;

            @Test
            void placesAnOrderEndToEnd() throws Exception {
                mockMvc.perform(post("/api/orders")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(validOrderJson()))
                        .andExpect(status().isCreated());

                assertThat(orderRepository.count()).isEqualTo(1);
            }
        }
      `}</CodeBlock>

      <Callout title="Keep the context cache warm">
        <p>
          Spring caches application contexts between test classes, but only
          when their configuration is identical. Every different combination
          of <code>@MockitoBean</code> fields, profiles or properties starts a
          new context, and each one can take seconds. Keep integration tests
          on a shared base class or meta-annotation so they reuse one context.
        </p>
      </Callout>

      <h2>A coverage gate with JaCoCo</h2>
      <p>
        JaCoCo measures which lines and branches the tests executed. The
        Gradle plugin produces a report after every test run:
      </p>
      <CodeBlock label="build.gradle">{`
        plugins {
            id 'jacoco'
        }

        jacoco {
            toolVersion = "0.8.12"
        }

        test {
            useJUnitPlatform()
            finalizedBy jacocoTestReport
        }

        jacocoTestReport {
            dependsOn test
            reports {
                html.required = true
                xml.required = true    // for CI tools and code-review bots
            }
        }
      `}</CodeBlock>
      <p>
        The HTML report lands in{" "}
        <code>build/reports/jacoco/test/html/index.html</code>. A report on its
        own changes nothing, though. A verification rule makes the build fail
        when coverage drops:
      </p>
      <CodeBlock label="build.gradle">{`
        jacocoTestCoverageVerification {
            dependsOn test
            violationRules {
                rule {
                    limit {
                        counter = 'LINE'
                        value = 'COVEREDRATIO'
                        minimum = 0.80
                    }
                }
            }
        }

        check.dependsOn jacocoTestCoverageVerification
      `}</CodeBlock>
      <p>
        Now <code>./gradlew check</code>, and therefore CI, fails below 80%
        line coverage. Pick the threshold from where the project is today and
        raise it over time. Exclude generated code and plain configuration
        classes, so the number reflects code that has behaviour.
      </p>
      <p>
        Treat the gate as a ratchet, not a goal. It stops coverage from
        sliding; it says nothing about whether the assertions are any good.
        A service tested only for its happy path can still score 90%.
      </p>

      <h2>On Spring Boot 4 and Testcontainers 2</h2>
      <p>
        Spring Boot 4 moves to Testcontainers 2, which prefixes every module
        with <code>testcontainers-</code> (for example{" "}
        <code>org.testcontainers:testcontainers-postgresql</code>) and moves
        container classes into per-module packages, such as{" "}
        <code>org.testcontainers.postgresql.PostgreSQLContainer</code>. The
        approach above, with slices, <code>@ServiceConnection</code> and a
        shared container configuration, stays the same.
      </p>

      <h2>Checklist</h2>
      <ul>
        <li>Plain JUnit and Mockito for business rules: most of your tests.</li>
        <li>
          <code>@WebMvcTest</code> for mapping, validation and error responses.
        </li>
        <li>
          <code>@DataJpaTest</code> against a real PostgreSQL with
          Testcontainers and <code>@ServiceConnection</code>.
        </li>
        <li>A few <code>@SpringBootTest</code> end-to-end paths, sharing one context.</li>
        <li>One container configuration, reused by tests and local development.</li>
        <li>
          A JaCoCo report plus a verification rule wired into{" "}
          <code>check</code>.
        </li>
      </ul>
    </BlogPost>
  );
}
