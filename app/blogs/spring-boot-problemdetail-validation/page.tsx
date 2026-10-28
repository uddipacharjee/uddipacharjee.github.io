import BlogPost, { postMetadata } from "@/components/blog/BlogPost";
import Callout from "@/components/blog/Callout";
import CodeBlock from "@/components/blog/CodeBlock";
import Figure from "@/components/blog/Figure";

const SLUG = "spring-boot-problemdetail-validation";
const IMG = `/blogs/${SLUG}`;

export const metadata = postMetadata(SLUG);

export default function Post() {
  return (
    <BlogPost slug={SLUG}>
      <p>
        Ask three Spring Boot APIs for something invalid and you often get
        three error formats: a Whitelabel page, a JSON blob with a stack trace,
        and a hand-rolled <code>{"{ \"error\": \"...\" }"}</code>. Every
        client then needs its own parsing code, and nobody can tell which
        field was wrong.
      </p>
      <p>
        <strong>RFC 9457</strong> (Problem Details for HTTP APIs, which
        replaced RFC 7807) defines one JSON shape for errors, and Spring
        Framework 6 supports it out of the box with the{" "}
        <code>ProblemDetail</code> class. This guide wires Bean Validation and
        your own exceptions into that format, tests it, and documents it in
        OpenAPI. It targets Spring Boot 3.
      </p>

      <h2>What a problem detail looks like</h2>
      <Figure
        src={`${IMG}/problem-detail-flow.svg`}
        alt="A request fails @Valid validation, a @RestControllerAdvice builds a ProblemDetail, and the client receives 400 application/problem+json with type, title, status, detail, instance and an errors list"
        width={640}
        height={412}
        caption="A failed validation becomes a 400 response in the RFC 9457 format, with an errors list added as an extension member."
      />
      <p>
        The response uses the content type{" "}
        <code>application/problem+json</code> and five standard members:
      </p>
      <ul>
        <li>
          <code>type</code>: a URI that identifies the kind of problem.
          Ideally it points to documentation; the default,{" "}
          <code>about:blank</code>, means “nothing more specific than the
          status code”.
        </li>
        <li>
          <code>title</code>: a short, human-readable summary of that type.
        </li>
        <li>
          <code>status</code>: the HTTP status code, repeated in the body.
        </li>
        <li>
          <code>detail</code>: an explanation of this particular occurrence.
        </li>
        <li>
          <code>instance</code>: a URI for this occurrence, usually the request
          path.
        </li>
      </ul>
      <p>
        Anything else is an <strong>extension member</strong>. Clients that
        don’t know an extension ignore it, so adding an <code>errors</code>{" "}
        list for field-level messages is safe.
      </p>

      <h2>Validate the request</h2>
      <p>
        Put Bean Validation constraints on the request records. Nested
        records need <code>@Valid</code> so their constraints run too:
      </p>
      <CodeBlock label="CreateOrderRequest.java">{`
        public record CreateOrderRequest(
                @Valid @NotNull OrderItem item,
                @Valid @NotNull Customer customer) {}

        public record OrderItem(
                @NotBlank String code,
                @NotNull @Positive BigDecimal price,
                @NotNull @Min(value = 1, message = "must be at least 1") Integer quantity) {}

        public record Customer(
                @NotBlank String name,
                @NotBlank @Email(message = "must be a valid email") String email) {}
      `}</CodeBlock>
      <p>
        Then ask Spring to validate the body. When validation fails, Spring
        throws <code>MethodArgumentNotValidException</code> before your method
        runs:
      </p>
      <CodeBlock label="OrderController.java">{`
        @PostMapping("/api/orders")
        @ResponseStatus(HttpStatus.CREATED)
        CreateOrderResponse create(@Valid @RequestBody CreateOrderRequest request) {
            return orderService.createOrder(request);
        }
      `}</CodeBlock>

      <h2>Turn on problem details</h2>
      <p>The quickest start is one property:</p>
      <CodeBlock label="application.properties">{`
        spring.mvc.problemdetails.enabled=true
      `}</CodeBlock>
      <p>
        Spring Boot then registers a handler that renders all of Spring MVC’s
        own exceptions, such as unreadable JSON, a missing parameter, an
        unsupported media type or failed validation, as problem details. For
        validation the result is correct but not very useful:{" "}
        <code>&quot;detail&quot;: &quot;Invalid request content.&quot;</code>,
        with no word on which fields failed.
      </p>

      <h2>Add the field errors</h2>
      <p>
        To shape the responses yourself, extend{" "}
        <code>ResponseEntityExceptionHandler</code> in a{" "}
        <code>@RestControllerAdvice</code>. Spring Boot’s built-in handler backs
        off when it finds yours, so the property above is no longer needed.
        Override the validation hook and add an <code>errors</code> extension:
      </p>
      <CodeBlock label="ApiExceptionHandler.java">{`
        @RestControllerAdvice
        class ApiExceptionHandler extends ResponseEntityExceptionHandler {

            record InvalidField(String field, String message) {}

            @Override
            protected ResponseEntity<Object> handleMethodArgumentNotValid(
                    MethodArgumentNotValidException ex, HttpHeaders headers,
                    HttpStatusCode status, WebRequest request) {

                List<InvalidField> errors = ex.getBindingResult().getFieldErrors().stream()
                        .map(e -> new InvalidField(e.getField(), e.getDefaultMessage()))
                        .toList();

                ProblemDetail problem = ex.getBody();
                problem.setType(URI.create("https://shop.dev/problems/invalid"));
                problem.setTitle("Invalid request");
                problem.setDetail(errors.size() + " fields are invalid");
                problem.setProperty("errors", errors);

                return handleExceptionInternal(ex, problem, headers, status, request);
            }
        }
      `}</CodeBlock>
      <p>
        Field names follow the record structure, so a bad quantity is
        reported as <code>item.quantity</code>. A client can map that straight
        onto its form.
      </p>

      <h2>Your own exceptions</h2>
      <p>
        Domain errors belong in the same format. An{" "}
        <code>@ExceptionHandler</code> can simply return a{" "}
        <code>ProblemDetail</code>; Spring takes the status from it and sets
        the problem content type:
      </p>
      <CodeBlock label="ApiExceptionHandler.java">{`
        @ExceptionHandler(OrderNotFoundException.class)
        ProblemDetail orderNotFound(OrderNotFoundException ex) {
            ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                    HttpStatus.NOT_FOUND, "No order with number " + ex.orderNumber());
            problem.setType(URI.create("https://shop.dev/problems/order-not-found"));
            problem.setTitle("Order not found");
            problem.setProperty("orderNumber", ex.orderNumber());
            return problem;
        }
      `}</CodeBlock>
      <p>
        Alternatively, have the exception extend{" "}
        <code>ErrorResponseException</code> and carry its own{" "}
        <code>ProblemDetail</code>; the base handler renders it with no extra
        code.
      </p>

      <h2>Query parameters and path variables</h2>
      <p>
        Since Spring Framework 6.1, constraints directly on controller method
        parameters are validated without <code>@Validated</code> on the class:
      </p>
      <CodeBlock label="OrderController.java">{`
        @GetMapping("/api/orders")
        List<OrderSummary> list(@RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
            return orderService.recent(size);
        }
      `}</CodeBlock>
      <p>
        A violation raises <code>HandlerMethodValidationException</code>, which{" "}
        <code>ResponseEntityExceptionHandler</code> also turns into a 400
        problem detail. Override <code>handleHandlerMethodValidationException</code>{" "}
        to add the same <code>errors</code> list there.
      </p>

      <h2>Never leak a stack trace</h2>
      <p>
        Anything you don’t handle should still come back as a problem detail,
        with the details in the log rather than the response:
      </p>
      <CodeBlock label="ApiExceptionHandler.java">{`
        private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

        @ExceptionHandler(Exception.class)
        ProblemDetail unexpected(Exception ex) {
            log.error("Unhandled exception", ex);
            return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Something went wrong on our side. Please try again later.");
        }
      `}</CodeBlock>
      <Callout title="Mind Spring Security">
        <p>
          A catch-all handler also catches Spring Security’s{" "}
          <code>AccessDeniedException</code> from method security and turns a
          403 into a 500. Handle that exception explicitly, or rethrow it from
          the catch-all, so security keeps its own status codes.
        </p>
      </Callout>

      <h2>Test the contract</h2>
      <p>
        Error responses are part of your API, so test them like any other
        response:
      </p>
      <CodeBlock label="OrderControllerTest.java">{`
        @WebMvcTest(OrderController.class)
        class OrderControllerTest {

            @Autowired MockMvc mockMvc;
            @MockitoBean OrderService orderService;

            @Test
            void rejectsInvalidOrderWithFieldErrors() throws Exception {
                mockMvc.perform(post("/api/orders")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                    {"item": {"code": "P100", "price": 34.00, "quantity": 0},
                                     "customer": {"name": "Ayesha", "email": "not-an-email"}}
                                    """))
                        .andExpect(status().isBadRequest())
                        .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                        .andExpect(jsonPath("$.title").value("Invalid request"))
                        .andExpect(jsonPath("$.errors[*].field",
                                containsInAnyOrder("item.quantity", "customer.email")));
            }
        }
      `}</CodeBlock>

      <h2>Document it in OpenAPI</h2>
      <p>
        With springdoc-openapi, declare the error responses on the operation
        so clients see the problem format in Swagger UI and in generated
        clients:
      </p>
      <CodeBlock label="OrderController.java">{`
        @Operation(summary = "Place an order")
        @ApiResponse(responseCode = "201", description = "Order created")
        @ApiResponse(responseCode = "400", description = "Invalid request",
                content = @Content(mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class)))
        @PostMapping("/api/orders")
        @ResponseStatus(HttpStatus.CREATED)
        CreateOrderResponse create(@Valid @RequestBody CreateOrderRequest request) { ... }
      `}</CodeBlock>

      <h2>Checklist</h2>
      <ul>
        <li>Constraints on request records, with <code>@Valid</code> on nested ones.</li>
        <li>
          One <code>@RestControllerAdvice</code> extending{" "}
          <code>ResponseEntityExceptionHandler</code>.
        </li>
        <li>
          An <code>errors</code> extension with field paths for validation
          failures, in both body and parameter validation.
        </li>
        <li>Stable <code>type</code> URIs and titles for your own exceptions.</li>
        <li>A catch-all that logs and returns a generic 500, never a stack trace.</li>
        <li>MockMvc tests and OpenAPI annotations for the error responses.</li>
      </ul>
    </BlogPost>
  );
}
