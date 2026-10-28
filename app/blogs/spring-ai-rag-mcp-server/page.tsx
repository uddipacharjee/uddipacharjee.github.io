import BlogPost, { postMetadata } from "@/components/blog/BlogPost";
import Callout from "@/components/blog/Callout";
import CodeBlock from "@/components/blog/CodeBlock";
import Figure from "@/components/blog/Figure";

const SLUG = "spring-ai-rag-mcp-server";
const IMG = `/blogs/${SLUG}`;

export const metadata = postMetadata(SLUG);

export default function Post() {
  return (
    <BlogPost slug={SLUG}>
      <p>
        A language model knows a lot about the world and nothing about your
        runbooks, architecture decisions or API docs. Two techniques close that
        gap. <strong>Retrieval-augmented generation</strong> (RAG) finds the
        relevant parts of your documents and hands them to the model with the
        question. The <strong>Model Context Protocol</strong> (MCP) lets AI
        assistants, such as coding agents in your IDE, call tools you provide,
        like a search over those same documents.
      </p>
      <p>
        Spring AI makes both feel like ordinary Spring code: auto-configured
        clients, properties and annotations. This post builds a small document
        search service with RAG on PostgreSQL, then exposes it as an MCP
        server.
      </p>
      <Callout title="Versions in this post">
        <p>
          Spring AI 2.0.2, the current stable release, which requires Spring
          Boot 4.0 or 4.1. If you are on Spring Boot 3, you are on Spring AI
          1.x. The last section lists the renames that matter.
        </p>
      </Callout>

      <h2>How RAG works</h2>
      <p>
        RAG has two halves. <strong>Ingestion</strong> runs whenever your
        documents change: split them into chunks, turn each chunk into a
        vector with an embedding model, and store the vectors. The{" "}
        <strong>question</strong> path runs on every request: embed the
        question, find the most similar chunks, put them in the prompt, and
        let the chat model answer from them.
      </p>
      <Figure
        src={`${IMG}/rag-pipeline.svg`}
        alt="RAG pipeline: documents are split, embedded and stored in PGVector; each question retrieves the most similar chunks, which are added to the prompt before the chat model generates the answer"
        width={640}
        height={352}
        caption="Ingestion fills the vector store; every question retrieves from it before the model answers."
      />

      <h2>Dependencies</h2>
      <CodeBlock label="build.gradle">{`
        dependencies {
            implementation platform("org.springframework.ai:spring-ai-bom:2.0.2")

            implementation 'org.springframework.ai:spring-ai-starter-model-openai'
            implementation 'org.springframework.ai:spring-ai-starter-vector-store-pgvector'
            implementation 'org.springframework.ai:spring-ai-vector-store-advisor'
            implementation 'org.springframework.ai:spring-ai-tika-document-reader'
            runtimeOnly 'org.postgresql:postgresql'
        }
      `}</CodeBlock>
      <p>
        The OpenAI starter provides both the chat model and the embedding
        model. Swap in <code>spring-ai-starter-model-ollama</code> to run
        locally. Note <code>spring-ai-vector-store-advisor</code>: it provides{" "}
        <code>QuestionAnswerAdvisor</code>, and no starter pulls it in for you.
      </p>

      <h2>PostgreSQL as the vector store</h2>
      <p>
        PGVector adds a vector column type and similarity search to
        PostgreSQL, so your embeddings can live next to the rest of your data.
        The <code>pgvector/pgvector</code> image has the extension built in:
      </p>
      <CodeBlock label="Terminal">{`
        docker run -d --name pgvector -p 5432:5432 \\
          -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \\
          pgvector/pgvector
      `}</CodeBlock>
      <CodeBlock label="application.properties">{`
        spring.ai.openai.api-key=\${OPENAI_API_KEY}

        spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
        spring.datasource.username=postgres
        spring.datasource.password=postgres

        spring.ai.vectorstore.pgvector.initialize-schema=true
        spring.ai.vectorstore.pgvector.index-type=HNSW
        spring.ai.vectorstore.pgvector.distance-type=COSINE_DISTANCE
      `}</CodeBlock>
      <p>
        <code>initialize-schema</code> is off by default; with it on, Spring AI
        creates the <code>vector_store</code> table at startup. The vector
        dimensions come from the embedding model. If you later switch
        embedding models, the dimensions change too, so drop and re-create the
        table and ingest everything again.
      </p>

      <h2>Ingesting documents</h2>
      <p>
        A <code>DocumentReader</code> turns files into <code>Document</code>s,
        a splitter cuts them into chunks, and the vector store embeds and saves
        them in one call:
      </p>
      <CodeBlock label="DocumentIngestor.java">{`
        @Component
        class DocumentIngestor {

            private final VectorStore vectorStore;

            DocumentIngestor(VectorStore vectorStore) {
                this.vectorStore = vectorStore;
            }

            void ingest(Resource resource) {
                List<Document> documents = new TikaDocumentReader(resource).read();

                TokenTextSplitter splitter = TokenTextSplitter.builder()
                        .withChunkSize(800)          // tokens per chunk
                        .withMinChunkSizeChars(350)
                        .build();

                vectorStore.add(splitter.split(documents));
            }
        }
      `}</CodeBlock>
      <p>
        Tika reads PDF, Word, HTML and many other formats; for plain text,{" "}
        <code>TextReader</code> is enough. Chunk size is a trade-off: small
        chunks match precisely but lose context, while large ones carry
        context but dilute the match. Around 800 tokens, the default, is a
        reasonable start. Re-ingesting a file adds new chunks next to the old
        ones, so delete a document’s previous chunks before loading a new
        version.
      </p>

      <h2>Answering questions</h2>
      <p>
        <code>ChatClient</code> is Spring AI’s fluent API for calling a model,
        and <strong>advisors</strong> wrap a call with extra behaviour.{" "}
        <code>QuestionAnswerAdvisor</code> is the RAG advisor: it searches the
        vector store with the user’s question and adds the matching chunks to
        the prompt.
      </p>
      <CodeBlock label="AskController.java">{`
        @RestController
        class AskController {

            private final ChatClient chatClient;
            private final QuestionAnswerAdvisor rag;

            AskController(ChatClient.Builder builder, VectorStore vectorStore) {
                this.chatClient = builder.build();
                this.rag = QuestionAnswerAdvisor.builder(vectorStore)
                        .searchRequest(SearchRequest.builder()
                                .similarityThreshold(0.7)
                                .topK(5)
                                .build())
                        .build();
            }

            @GetMapping("/ask")
            String ask(@RequestParam String question) {
                return chatClient.prompt()
                        .user(question)
                        .advisors(rag)
                        .call()
                        .content();
            }
        }
      `}</CodeBlock>
      <p>
        <code>topK</code> caps how many chunks go into the prompt, and{" "}
        <code>similarityThreshold</code> drops chunks that are only loosely
        related, so the model is not distracted by noise. Both are worth
        tuning against a set of real questions. To narrow the search per
        request, pass a metadata filter:
      </p>
      <CodeBlock>{`
        chatClient.prompt()
                .user(question)
                .advisors(rag)
                .advisors(a -> a.param(QuestionAnswerAdvisor.FILTER_EXPRESSION, "team == 'payments'"))
                .call()
                .content();
      `}</CodeBlock>
      <p>
        For more control, such as rewriting the question before searching or
        deciding what happens when nothing relevant is found, the{" "}
        <code>spring-ai-rag</code> module offers{" "}
        <code>RetrievalAugmentationAdvisor</code>, built from separate
        retriever and augmenter components.
      </p>

      <h2>Exposing search as an MCP tool</h2>
      <p>
        RAG answers questions inside your application. MCP turns it around:
        an assistant your developers already use can call your search
        directly, and decide for itself when to.
      </p>
      <Figure
        src={`${IMG}/mcp-server.svg`}
        alt="An AI assistant acting as an MCP client calls tools/list and tools/call on a Spring Boot MCP server at /mcp over Streamable HTTP; the search_docs tool queries PGVector"
        width={640}
        height={196}
        caption="The assistant discovers the tool, then calls it. The server only answers."
      />
      <p>Add the MCP server starter for Spring MVC:</p>
      <CodeBlock label="build.gradle">{`
        implementation 'org.springframework.ai:spring-ai-starter-mcp-server-webmvc'
      `}</CodeBlock>
      <CodeBlock label="application.properties">{`
        spring.ai.mcp.server.name=docs-search
        spring.ai.mcp.server.version=1.0.0
        spring.ai.mcp.server.protocol=STREAMABLE
        spring.ai.mcp.server.instructions=Search the team's internal documentation
      `}</CodeBlock>
      <p>
        Streamable HTTP is the default transport in Spring AI 2, and the
        endpoint is <code>/mcp</code>. Then write the tool as an annotated
        method on any bean:
      </p>
      <CodeBlock label="DocsTools.java">{`
        @Component
        class DocsTools {

            private final VectorStore vectorStore;

            DocsTools(VectorStore vectorStore) {
                this.vectorStore = vectorStore;
            }

            @McpTool(name = "search_docs",
                     description = "Semantic search over the team's internal documentation. "
                             + "Returns the most relevant passages for a question or topic.")
            public List<String> searchDocs(
                    @McpToolParam(description = "The question or topic to search for", required = true)
                    String query) {
                return vectorStore.similaritySearch(SearchRequest.builder().query(query).topK(5).build())
                        .stream()
                        .map(Document::getText)
                        .toList();
            }
        }
      `}</CodeBlock>
      <p>
        <code>@McpTool</code> and <code>@McpToolParam</code> live in{" "}
        <code>org.springframework.ai.mcp.annotation</code>, and Spring AI finds
        them on startup. Write the descriptions for the model, not for a
        colleague: they are all it has to decide when the tool is useful and
        what to pass in. If you also want the method available to your own{" "}
        <code>ChatClient</code>, annotate it with Spring AI’s{" "}
        <code>@Tool</code> instead and register it with a{" "}
        <code>MethodToolCallbackProvider</code> bean, which the MCP server
        exposes as well.
      </p>
      <p>
        To try it, point any MCP client that supports Streamable HTTP at{" "}
        <code>http://localhost:8080/mcp</code>. The MCP Inspector (
        <code>npx @modelcontextprotocol/inspector</code>) lists the tools and
        lets you call them by hand.
      </p>
      <Callout title="Secure it before it leaves your machine">
        <p>
          The HTTP transport has no authentication by default, and this tool
          returns internal documents to whoever asks. Put the endpoint behind
          Spring Security before deploying it anywhere shared.
        </p>
      </Callout>

      <h2>Coming from Spring AI 1.x</h2>
      <ul>
        <li>
          Spring AI 2 requires Spring Boot 4. Spring AI 1.x stays on Boot 3.
        </li>
        <li>
          The advisor artifact was renamed from{" "}
          <code>spring-ai-advisors-vector-store</code> to{" "}
          <code>spring-ai-vector-store-advisor</code>; the package is the same.
        </li>
        <li>
          Model property keys lost their <code>.options</code> segment:{" "}
          <code>spring.ai.openai.chat.options.model</code> is now{" "}
          <code>spring.ai.openai.chat.model</code>.
        </li>
        <li>
          The MCP annotations moved from <code>org.springaicommunity.mcp</code>{" "}
          into <code>org.springframework.ai.mcp.annotation</code>, and the MCP
          server now defaults to Streamable HTTP; SSE is deprecated.
        </li>
        <li>
          Builders replace constructors: <code>new TokenTextSplitter()</code>{" "}
          is deprecated, and <code>QuestionAnswerAdvisor</code> is created
          only through its builder.
        </li>
        <li>
          Pre-1.0 starter names such as{" "}
          <code>spring-ai-openai-spring-boot-starter</code> are long gone;
          starters are now named <code>spring-ai-starter-model-*</code> and{" "}
          <code>spring-ai-starter-vector-store-*</code>.
        </li>
      </ul>

      <h2>Checklist</h2>
      <ul>
        <li>BOM, model starter, PGVector starter, and the vector-store advisor artifact.</li>
        <li>
          <code>initialize-schema=true</code> for the first run, and a re-ingest
          whenever the embedding model changes.
        </li>
        <li>Chunks around 800 tokens to start, old chunks deleted on re-ingest.</li>
        <li>
          <code>QuestionAnswerAdvisor</code> with <code>topK</code> and a
          similarity threshold tuned on real questions.
        </li>
        <li>An MCP tool with descriptions written for the model.</li>
        <li>Authentication in front of <code>/mcp</code> before it is shared.</li>
      </ul>
    </BlogPost>
  );
}
