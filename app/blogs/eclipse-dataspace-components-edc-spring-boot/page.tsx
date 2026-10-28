import BlogPost, { postMetadata } from "@/components/blog/BlogPost";
import Callout from "@/components/blog/Callout";
import CodeBlock from "@/components/blog/CodeBlock";
import Figure from "@/components/blog/Figure";

const SLUG = "eclipse-dataspace-components-edc-spring-boot";
const IMG = `/blogs/${SLUG}`;
const SAMPLES =
  "https://github.com/eclipse-edc/Samples/tree/12b04bbab3d30a8cb67f5378d2c2d2a6a0447ea3/transfer";

export const metadata = postMetadata(SLUG);

export default function Post() {
  return (
    <BlogPost slug={SLUG}>
      <p>
        A <strong>data space</strong> lets organizations share data without
        handing it over unconditionally. Each participant keeps its data,
        publishes offers with usage policies attached, and only shares under a
        contract both sides agreed to. Industry networks such as Catena-X in
        the automotive sector are built this way.
      </p>
      <p>
        <strong>Eclipse Dataspace Components (EDC)</strong>, originally the
        Eclipse Dataspace Connector, is a widely used open-source framework for
        building those connectors, hosted by the Eclipse Foundation. It
        implements the{" "}
        <strong>Dataspace Protocol</strong> (DSP), the standard that connectors
        use to talk to each other. This post explains how a connector works
        and how to publish data offers into one from a Spring Boot service,
        based on my{" "}
        <a href="https://github.com/uddipacharjee/EdcOnboardingApplication">
          EdcOnboardingApplication
        </a>{" "}
        (Spring Boot 3.3, Java 21).
      </p>
      <Callout title="Versions in this post">
        <p>
          The examples use EDC 0.14.1 and its Management API v3, as in the{" "}
          <a href={SAMPLES}>EDC Samples of December 2025</a>. EDC 1.0, in
          release candidates since September 2026, removed v3 in favour of v4.
          The concepts are unchanged; the last section lists what is different.
        </p>
      </Callout>

      <h2>Control plane, data plane and the Dataspace Protocol</h2>
      <p>An EDC connector has two halves:</p>
      <ul>
        <li>
          The <strong>control plane</strong> holds the offers, answers catalog
          requests, negotiates contracts and manages transfers. Your own
          applications drive it through the <strong>Management API</strong>,
          which must never be exposed to the internet.
        </li>
        <li>
          The <strong>data plane</strong> moves the actual data once a
          transfer has been agreed. The control plane tells it what to send
          where.
        </li>
      </ul>
      <p>
        Control planes of different organizations only ever talk to each other
        over DSP. The protocol builds on DCAT for catalogs and ODRL for
        policies.
      </p>
      <Figure
        src={`${IMG}/edc-connector-flow.svg`}
        alt="Provider and consumer EDC connectors: a Spring Boot onboarding service publishes an offer through the provider's Management API; the consumer requests the catalog, negotiates a contract and starts a transfer over the Dataspace Protocol; the data moves between the data planes"
        width={640}
        height={428}
        caption="The provider publishes an offer; the consumer finds it, negotiates and transfers, all between control planes over DSP."
      />

      <h2>Running a provider connector locally</h2>
      <p>
        The EDC Samples build a minimal connector you can run as a provider.
        From a checkout of the Samples at that version:
      </p>
      <CodeBlock label="Terminal">{`
        ./gradlew transfer:transfer-00-prerequisites:connector:build

        java -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/provider-configuration.properties \\
             -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar
      `}</CodeBlock>
      <p>The sample configuration uses these ports:</p>
      <table>
        <thead>
          <tr>
            <th>API</th>
            <th>Provider</th>
            <th>Consumer</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Management</td>
            <td><code>19193/management</code></td>
            <td><code>29193/management</code></td>
          </tr>
          <tr>
            <td>Protocol (DSP)</td>
            <td><code>19194/protocol</code></td>
            <td><code>29194/protocol</code></td>
          </tr>
          <tr>
            <td>Public data plane</td>
            <td><code>19291/public</code></td>
            <td><code>29291/public</code></td>
          </tr>
        </tbody>
      </table>
      <p>
        If a README and the configuration disagree, trust the{" "}
        <code>.properties</code> files.
      </p>

      <h2>Publishing an offer: three resources</h2>
      <p>
        A provider makes data available by creating three things through its
        Management API, in this order.
      </p>

      <h3>1. The asset</h3>
      <p>
        An asset describes a piece of data and where it really lives. Its{" "}
        <code>properties</code> are public: they appear in the catalog other
        participants see. The <code>dataAddress</code> tells the data plane how
        to fetch the data, and is never shared.
      </p>
      <CodeBlock label="POST /management/v3/assets">{`
        {
          "@context": { "@vocab": "https://w3id.org/edc/v0.0.1/ns/" },
          "@id": "asset-1",
          "properties": {
            "name": "Supplier master data",
            "contenttype": "application/json"
          },
          "dataAddress": {
            "type": "HttpData",
            "baseUrl": "https://internal.example.com/api/suppliers",
            "proxyPath": "true"
          }
        }
      `}</CodeBlock>
      <p>
        The <code>@vocab</code> entry maps unprefixed keys to EDC’s
        namespace, which keeps the JSON-LD readable. Anything internal, such as
        a list of partners allowed to see the asset, belongs in{" "}
        <code>privateProperties</code>, not <code>properties</code>, and
        credentials belong in a vault, never in the data address.
      </p>

      <h3>2. The policy definition</h3>
      <p>
        Policies are ODRL. This one permits use only to participants that
        satisfy a <code>location</code> constraint:
      </p>
      <CodeBlock label="POST /management/v3/policydefinitions">{`
        {
          "@context": {
            "@vocab": "https://w3id.org/edc/v0.0.1/ns/",
            "odrl": "http://www.w3.org/ns/odrl/2/"
          },
          "@id": "eu-only",
          "policy": {
            "@context": "http://www.w3.org/ns/odrl.jsonld",
            "@type": "Set",
            "permission": [{
              "action": "use",
              "constraint": {
                "@type": "AtomicConstraint",
                "leftOperand": "location",
                "operator": { "@id": "odrl:eq" },
                "rightOperand": "eu"
              }
            }],
            "prohibition": [],
            "obligation": []
          }
        }
      `}</CodeBlock>
      <Callout title="The ODRL context is not optional">
        <p>
          Without the ODRL <code>@context</code> inside <code>policy</code>,
          keys like <code>permission</code> resolve to EDC’s namespace instead
          of ODRL’s. The request still succeeds, but the connector may not
          store your rules as rules, leaving an empty policy that permits
          everything. After creating a policy, read it back with{" "}
          <code>GET /management/v3/policydefinitions/{"{id}"}</code> and check
          that the permission is there. Also remember that a constraint is only
          enforced if the connector has a policy function registered for its
          left operand.
        </p>
      </Callout>

      <h3>3. The contract definition</h3>
      <p>
        A contract definition puts assets and policies together into an offer.
        The <strong>access policy</strong> decides who can see the offer in
        the catalog; the <strong>contract policy</strong> is what a negotiated
        agreement is based on:
      </p>
      <CodeBlock label="POST /management/v3/contractdefinitions">{`
        {
          "@context": { "@vocab": "https://w3id.org/edc/v0.0.1/ns/" },
          "@id": "contract-asset-1",
          "accessPolicyId": "eu-only",
          "contractPolicyId": "eu-only",
          "assetsSelector": [{
            "@type": "CriterionDto",
            "operandLeft": "https://w3id.org/edc/v0.0.1/ns/id",
            "operator": "=",
            "operandRight": "asset-1"
          }]
        }
      `}</CodeBlock>
      <p>
        An empty <code>assetsSelector</code> selects every asset. To select
        one, compare the full, expanded id key as above. Older tutorials use{" "}
        <code>asset:prop:id</code>, which may match nothing on a JSON-LD
        connector, so the asset never shows up in anyone’s catalog.
      </p>

      <h2>Calling the Management API from Spring Boot</h2>
      <p>
        The onboarding service hides all of this behind one endpoint: a
        provider registers a data source, and the service creates the asset,
        policy and contract definition. Start with a <code>RestClient</code>{" "}
        pointed at the connector:
      </p>
      <CodeBlock label="application.yml">{`
        edc:
          provider:
            management-url: \${EDC_PROVIDER_MGMT_URL:http://localhost:19193/management/v3}
      `}</CodeBlock>
      <CodeBlock label="EdcClientConfig.java">{`
        @Bean
        RestClient edcManagementClient(RestClient.Builder builder,
                                       @Value("\${edc.provider.management-url}") String baseUrl) {
            return builder.baseUrl(baseUrl).build();
        }
      `}</CodeBlock>
      <p>
        The JSON-LD bodies are easiest to build as maps. Keeping every
        Management API call in one class means an API upgrade touches one
        file:
      </p>
      <CodeBlock label="OfferPublisher.java">{`
        @Service
        class OfferPublisher {

            private static final String EDC = "https://w3id.org/edc/v0.0.1/ns/";
            private static final String ODRL = "http://www.w3.org/ns/odrl/2/";

            private final RestClient edc;

            OfferPublisher(RestClient edcManagementClient) {
                this.edc = edcManagementClient;
            }

            String publish(String name, String sourceUrl, String region) {
                String assetId = "asset-" + UUID.randomUUID();
                String policyId = "policy-" + assetId;

                post("/assets", Map.of(
                        "@context", Map.of("@vocab", EDC),
                        "@id", assetId,
                        "properties", Map.of("name", name, "contenttype", "application/json"),
                        "dataAddress", Map.of("type", "HttpData", "baseUrl", sourceUrl, "proxyPath", "true")));

                post("/policydefinitions", Map.of(
                        "@context", Map.of("@vocab", EDC, "odrl", ODRL),
                        "@id", policyId,
                        "policy", Map.of(
                                "@context", "http://www.w3.org/ns/odrl.jsonld",
                                "@type", "Set",
                                "permission", List.of(Map.of(
                                        "action", "use",
                                        "constraint", Map.of(
                                                "@type", "AtomicConstraint",
                                                "leftOperand", "location",
                                                "operator", Map.of("@id", "odrl:eq"),
                                                "rightOperand", region))))));

                post("/contractdefinitions", Map.of(
                        "@context", Map.of("@vocab", EDC),
                        "@id", "contract-" + assetId,
                        "accessPolicyId", policyId,
                        "contractPolicyId", policyId,
                        "assetsSelector", List.of(Map.of(
                                "@type", "CriterionDto",
                                "operandLeft", EDC + "id",
                                "operator", "=",
                                "operandRight", assetId))));

                return assetId;
            }

            private String post(String path, Map<String, Object> body) {
                return edc.post()
                        .uri(path)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(body)
                        .retrieve()
                        .body(IdResponse.class)
                        .id();
            }

            record IdResponse(@JsonProperty("@id") String id, long createdAt) {}
        }
      `}</CodeBlock>
      <p>
        The order matters: the contract definition refers to the policy by id,
        so the policy has to exist first. When the connector rejects a request,{" "}
        <code>RestClient</code> throws an <code>HttpClientErrorException</code>{" "}
        carrying EDC’s status and body. Translate it into your own API’s error
        format, as described in{" "}
        <a href="/blogs/spring-boot-problemdetail-validation/">
          Spring Boot REST Errors with ProblemDetail and Validation
        </a>
        .
      </p>

      <h3>Securing the Management API</h3>
      <p>
        The samples run the Management API without authentication. Anywhere
        else, turn on the token-based check in the connector configuration:
      </p>
      <CodeBlock label="provider-configuration.properties">{`
        web.http.management.auth.type=tokenbased
        web.http.management.auth.key=change-me
      `}</CodeBlock>
      <p>
        Then send the key from Spring Boot with{" "}
        <code>builder.defaultHeader(&quot;X-Api-Key&quot;, apiKey)</code>, and
        keep the Management API on a private network all the same.
      </p>

      <h2>The consumer side</h2>
      <p>
        The consumer drives its <em>own</em> connector’s Management API, and
        that connector does the DSP work with the provider:
      </p>
      <ol>
        <li>
          <strong>Catalog.</strong>{" "}
          <code>POST /management/v3/catalog/request</code> with the provider’s
          DSP address (<code>http://localhost:19194/protocol</code>) returns a
          DCAT catalog. Each dataset carries an offer under{" "}
          <code>odrl:hasPolicy</code>, whose <code>@id</code> is needed next.
        </li>
        <li>
          <strong>Negotiation.</strong>{" "}
          <code>POST /management/v3/contractnegotiations</code> with that offer
          starts a negotiation. Poll{" "}
          <code>GET /management/v3/contractnegotiations/{"{id}"}</code> until the
          state is <code>FINALIZED</code> (or <code>TERMINATED</code>), and
          read the <code>contractAgreementId</code>.
        </li>
        <li>
          <strong>Transfer.</strong>{" "}
          <code>POST /management/v3/transferprocesses</code> with the agreement
          id. A push transfer (<code>HttpData-PUSH</code>) sends the data to a
          destination and ends <code>COMPLETED</code>. A pull transfer (
          <code>HttpData-PULL</code>) stays <code>STARTED</code>, and the
          consumer fetches an endpoint data reference from{" "}
          <code>/management/v3/edrs/{"{id}"}/dataaddress</code> to call the
          provider’s public data plane.
        </li>
      </ol>
      <CodeBlock label="POST /management/v3/contractnegotiations">{`
        {
          "@context": { "@vocab": "https://w3id.org/edc/v0.0.1/ns/" },
          "@type": "ContractRequest",
          "counterPartyAddress": "http://localhost:19194/protocol",
          "protocol": "dataspace-protocol-http",
          "policy": {
            "@context": "http://www.w3.org/ns/odrl.jsonld",
            "@id": "<offer id from the catalog>",
            "@type": "Offer",
            "assigner": "provider",
            "target": "asset-1"
          }
        }
      `}</CodeBlock>

      <h2>What changed in EDC 1.0</h2>
      <p>The concepts above carry over unchanged. The wire format did not:</p>
      <ul>
        <li>
          <strong>Management API v4.</strong> v3 was deprecated in EDC 0.17
          and removed in 1.0. v4 keeps the same resources under{" "}
          <code>/management/v4</code>, but every body needs an explicit{" "}
          <code>@type</code> (<code>Asset</code>, <code>PolicyDefinition</code>,{" "}
          <code>ContractDefinition</code>, <code>Criterion</code>,{" "}
          <code>TransferRequest</code>, <code>CatalogRequest</code>) and uses a
          new JSON-LD context. See the EDC team’s{" "}
          <a href="https://eclipse-edc.github.io/blog/2026/02/19/management-api-upcoming-versions/">
            notes on the Management API versions
          </a>
          .
        </li>
        <li>
          <strong>Dataspace Protocol 2025-1.</strong> The current DSP version
          is 2025-1. Requests name it as{" "}
          <code>dataspace-protocol-http:2025-1</code>, address{" "}
          <code>…/protocol/2025-1</code> and include a{" "}
          <code>counterPartyId</code>. The original 0.8 protocol used above was
          dropped in EDC 0.16.
        </li>
        <li>
          <strong>Data planes.</strong> The old data-plane framework was
          replaced by Data Plane Signaling, and the transfer samples were
          removed from the Samples repository in October 2026. The{" "}
          <a href={SAMPLES}>pinned December 2025 version</a> still works for
          learning the flow.
        </li>
      </ul>
      <p>
        For the Spring Boot side, the upgrade means a new base URL and new JSON
        bodies, which is one more reason to keep every Management API call in
        a single class.
      </p>

      <h2>Checklist</h2>
      <ul>
        <li>Asset, then policy, then contract definition, in that order.</li>
        <li>Public data in <code>properties</code>; internal data in <code>privateProperties</code>; secrets in a vault.</li>
        <li>The ODRL context inside every policy, and a read-back to confirm the rules.</li>
        <li>Asset selectors on the expanded <code>…/ns/id</code> key.</li>
        <li>All Management API calls in one client class, behind a token, on a private network.</li>
        <li>Version numbers written down: v3 and DSP 0.8 here, v4 and DSP 2025-1 on EDC 1.0.</li>
      </ul>
    </BlogPost>
  );
}
