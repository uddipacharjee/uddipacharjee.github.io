import BlogPost, { postMetadata } from "@/components/blog/BlogPost";
import Callout from "@/components/blog/Callout";
import CodeBlock from "@/components/blog/CodeBlock";
import Figure from "@/components/blog/Figure";

const SLUG = "spring-batch-process-million-row-file";
const IMG = `/blogs/${SLUG}`;

export const metadata = postMetadata(SLUG);

export default function Post() {
  return (
    <BlogPost slug={SLUG}>
      <p>
        Loading a flat file into a database looks like a ten-line job until the
        file has a million rows. Read it into a <code>List</code> first and the
        JVM runs out of heap. Wrap the whole load in one transaction and a bad
        row near the end throws away everything before it. Spring Batch’s
        chunk-oriented steps solve both problems: memory stays flat no matter
        how big the file is, and a failed run picks up where it stopped.
      </p>
      <p>
        This guide builds a job that imports a fixed-width or CSV file into
        PostgreSQL, using Spring Boot 3 and Spring Batch 5. It is based on my{" "}
        <a href="https://github.com/uddipacharjee/spring-batch-demo">
          spring-batch-demo
        </a>{" "}
        repository, which includes a 51 MB test file of one million
        fixed-width lines.
      </p>

      <h2>How a chunk-oriented step works</h2>
      <p>
        A step reads items one at a time until it has a full chunk, runs each
        item through an optional processor, then hands the whole chunk to the
        writer. Reading, processing and writing one chunk happen inside a
        single transaction. If the writer succeeds, the transaction commits and
        the step starts on the next chunk. If it fails, only that chunk rolls
        back.
      </p>
      <Figure
        src={`${IMG}/chunk-oriented-step.svg`}
        alt="Spring Batch chunk-oriented step: an ItemReader, ItemProcessor and ItemWriter repeat once per chunk of 500 items, each chunk committed to PostgreSQL in its own transaction"
        width={640}
        height={552}
        caption="Each chunk is read, processed and written in one transaction. Memory use depends on the chunk size, not the file size."
      />
      <p>
        Two consequences matter for large files. Memory use is bounded by the
        chunk size, not the file size. And because Spring Batch records progress
        after every commit, a job that dies at row 600,000 can restart at row
        600,001 instead of at row 1.
      </p>

      <h2>Reading a fixed-width file</h2>
      <p>
        In a fixed-width file every field occupies the same columns on every
        line, padded with spaces. Banks and older systems still export data
        this way. A few lines look like this:
      </p>
      <CodeBlock label="students.txt">{`
        0000001Ayesha              Rahman              29
        0000002Tanvir              Hossain             31
        0000003Nusrat              Jahan               27
      `}</CodeBlock>
      <p>
        <code>FlatFileItemReaderBuilder</code> turns each line into a{" "}
        <code>Student</code>, a plain class with <code>uid</code>,{" "}
        <code>firstName</code>, <code>lastName</code> and <code>age</code>{" "}
        properties. Each{" "}
        <code>Range</code> is 1-based and inclusive, so{" "}
        <code>new Range(1, 7)</code> means the first seven characters:
      </p>
      <CodeBlock label="StudentReaderConfig.java">{`
        @Bean
        @StepScope
        public FlatFileItemReader<Student> studentReader(
                @Value("#{jobParameters['input.file']}") String inputFile) {
            return new FlatFileItemReaderBuilder<Student>()
                    .name("studentReader")
                    .resource(new FileSystemResource(inputFile))
                    .fixedLength()
                    .columns(new Range(1, 7),     // uid
                             new Range(8, 27),    // firstName
                             new Range(28, 47),   // lastName
                             new Range(48, 50))   // age
                    .strict(false)                // allow short last field
                    .names("uid", "firstName", "lastName", "age")
                    .targetType(Student.class)
                    .build();
        }
      `}</CodeBlock>
      <p>A few details that are easy to get wrong:</p>
      <ul>
        <li>
          <strong>Order matters in the builder.</strong> <code>strict(false)</code>{" "}
          has to come before <code>names(…)</code>. <code>names</code> returns
          you to the outer builder, whose own <code>strict</code> method controls
          something else: whether a missing input file is an error.
        </li>
        <li>
          <strong>Strict lines.</strong> By default the tokenizer rejects any
          line shorter than the last range. Files with trimmed trailing spaces
          need <code>strict(false)</code> on the fixed-length builder.
        </li>
        <li>
          <strong>
            <code>@StepScope</code> and a job parameter for the path.
          </strong>{" "}
          The reader is created when the step starts, so each run can point at a
          different file, and the file path becomes part of the job’s identity.
          That is what makes restarts work, as shown below.
        </li>
        <li>
          <strong>
            <code>targetType</code>
          </strong>{" "}
          maps fields onto a JavaBean by property name. A Java record works
          too: Spring Batch detects records and calls the canonical
          constructor.
        </li>
      </ul>

      <h2>Reading a CSV file</h2>
      <p>
        CSV is the same reader with a delimited tokenizer. Skip the header
        line, and the default delimiter (a comma) and quote character (
        <code>&quot;</code>) cover most files:
      </p>
      <CodeBlock label="StudentReaderConfig.java">{`
        return new FlatFileItemReaderBuilder<Student>()
                .name("studentCsvReader")
                .resource(new FileSystemResource(inputFile))
                .linesToSkip(1)                       // header row
                .delimited()
                .names("uid", "firstName", "lastName", "age")
                .targetType(Student.class)
                .build();
      `}</CodeBlock>

      <h2>Writing: batched JDBC beats saving entities one by one</h2>
      <p>
        The writer is where most of the time goes. A{" "}
        <code>RepositoryItemWriter</code> calls your Spring Data repository’s{" "}
        <code>saveAll</code>, which hands each entity to JPA. Hibernate only
        groups those INSERTs into JDBC batches if you configure it to, and
        never for entities with <code>IDENTITY</code> ids. For a straight load,{" "}
        <code>JdbcBatchItemWriter</code> skips the persistence context and sends
        the whole chunk as one JDBC batch:
      </p>
      <CodeBlock label="StudentWriterConfig.java">{`
        @Bean
        public JdbcBatchItemWriter<Student> studentWriter(DataSource dataSource) {
            return new JdbcBatchItemWriterBuilder<Student>()
                    .dataSource(dataSource)
                    .sql("""
                         INSERT INTO student (uid, first_name, last_name, age)
                         VALUES (:uid, :firstName, :lastName, :age)
                         ON CONFLICT (uid) DO NOTHING
                         """)
                    .beanMapped()        // :uid -> student.getUid(), ...
                    .assertUpdates(false) // ON CONFLICT may update 0 rows
                    .build();
        }
      `}</CodeBlock>
      <p>
        <code>ON CONFLICT (uid) DO NOTHING</code> makes the insert idempotent,
        which is a cheap safety net when a file is loaded twice. It relies on a
        unique constraint on <code>uid</code>, and it needs{" "}
        <code>assertUpdates(false)</code>: by default the writer fails if any
        statement in the batch affected zero rows.{" "}
        <code>beanMapped()</code> reads values through getters. For a record,
        pass an <code>itemSqlParameterSourceProvider</code> instead.
      </p>
      <p>
        On PostgreSQL, add one more setting to the JDBC URL. With{" "}
        <code>reWriteBatchedInserts=true</code>, the driver rewrites a batch of
        single-row INSERTs into multi-row INSERT statements, which means far
        fewer round trips:
      </p>
      <CodeBlock label="application.properties">{`
        spring.datasource.url=jdbc:postgresql://localhost:5432/batch?reWriteBatchedInserts=true
      `}</CodeBlock>
      <p>
        If you need JPA in the writer (entity listeners, cascades), turn on
        Hibernate’s batching and give the entity a sequence-based id:
      </p>
      <CodeBlock label="application.properties">{`
        spring.jpa.properties.hibernate.jdbc.batch_size=500
        spring.jpa.properties.hibernate.order_inserts=true
      `}</CodeBlock>

      <h2>Wiring the step and the job</h2>
      <p>
        The processor is optional. Here it filters out rows that fail a basic
        check: returning <code>null</code> from <code>process</code> drops the
        item, and the step counts it as filtered rather than failed.
      </p>
      <CodeBlock label="StudentValidator.java">{`
        @Component
        class StudentValidator implements ItemProcessor<Student, Student> {

            @Override
            public Student process(Student student) {
                return student.getAge() > 0 ? student : null; // null = filter out
            }
        }
      `}</CodeBlock>
      <p>
        The step ties the reader, processor and writer together with a chunk
        size and a transaction manager, and the job runs that one step:
      </p>
      <CodeBlock label="ImportStudentsJobConfig.java">{`
        @Bean
        public Step importStudentsStep(JobRepository jobRepository,
                                       PlatformTransactionManager transactionManager,
                                       FlatFileItemReader<Student> studentReader,
                                       StudentValidator studentValidator,
                                       JdbcBatchItemWriter<Student> studentWriter,
                                       ThroughputListener throughputListener) {
            return new StepBuilder("importStudentsStep", jobRepository)
                    .<Student, Student>chunk(500, transactionManager)
                    .reader(studentReader)
                    .processor(studentValidator)
                    .writer(studentWriter)
                    .listener(throughputListener)
                    .build();
        }

        @Bean
        public Job importStudents(JobRepository jobRepository, Step importStudentsStep) {
            return new JobBuilder("importStudents", jobRepository)
                    .start(importStudentsStep)
                    .build();
        }
      `}</CodeBlock>

      <h2>Choosing a chunk size</h2>
      <p>
        The chunk size is the commit interval. Small chunks spend their time
        on commits. Large chunks hold more items in memory, keep transactions
        open longer, and lose more work when one fails. Somewhere between 100
        and 1,000 is a good starting range for simple rows. Then measure
        instead of guessing. A step listener can log what each run did:
      </p>
      <CodeBlock label="ThroughputListener.java">{`
        @Component
        public class ThroughputListener implements StepExecutionListener {

            private static final Logger log = LoggerFactory.getLogger(ThroughputListener.class);

            @Override
            public ExitStatus afterStep(StepExecution step) {
                Duration took = Duration.between(step.getStartTime(), LocalDateTime.now());
                log.info("{}: read={} written={} skipped={} commits={} in {}s",
                        step.getStepName(), step.getReadCount(), step.getWriteCount(),
                        step.getSkipCount(), step.getCommitCount(), took.toSeconds());
                return step.getExitStatus();
            }
        }
      `}</CodeBlock>
      <p>
        Run the same file with chunk sizes of 100, 500 and 1,000 and compare.
        The same numbers are stored in the <code>BATCH_STEP_EXECUTION</code>{" "}
        table, so you can also compare runs with a query.
      </p>

      <Callout title="Three things that quietly slow a batch job down">
        <ul>
          <li>
            <code>spring.jpa.show-sql=true</code> prints every statement: a
            million INSERTs means a million log lines.
          </li>
          <li>
            Logging every item at INFO in the processor has the same cost. Log
            per chunk or per step from a listener instead.
          </li>
          <li>
            A database lookup per item, such as checking for duplicates with{" "}
            <code>findByUid</code>, is a million round trips. Load reference
            data once into a map, or let the database enforce uniqueness as the
            writer above does.
          </li>
        </ul>
      </Callout>

      <h2>Starting the job from a REST endpoint without blocking</h2>
      <p>
        By default, Spring Boot launches your job when the application starts.
        For a job triggered on demand, switch that off. On PostgreSQL, also
        ask Boot to create Spring Batch’s metadata tables, which it only does
        automatically for embedded databases:
      </p>
      <CodeBlock label="application.properties">{`
        spring.batch.job.enabled=false
        spring.batch.jdbc.initialize-schema=always
      `}</CodeBlock>
      <p>
        The default <code>JobLauncher</code> runs the job on the calling thread,
        so an HTTP request would hang until the last chunk is written. A{" "}
        <code>TaskExecutorJobLauncher</code> with its own executor hands the job
        to a background thread and returns the <code>JobExecution</code>{" "}
        straight away:
      </p>
      <CodeBlock label="BatchLaunchConfig.java">{`
        @Bean("asyncJobLauncher")
        public JobLauncher asyncJobLauncher(JobRepository jobRepository) throws Exception {
            ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
            executor.setCorePoolSize(2);      // at most two imports at a time
            executor.setMaxPoolSize(2);
            executor.setQueueCapacity(10);
            executor.setThreadNamePrefix("batch-");
            executor.initialize();

            TaskExecutorJobLauncher launcher = new TaskExecutorJobLauncher();
            launcher.setJobRepository(jobRepository);
            launcher.setTaskExecutor(executor);
            launcher.afterPropertiesSet();
            return launcher;
        }
      `}</CodeBlock>
      <p>
        A small, fixed pool is deliberate: it caps how many imports can run at
        once, so a burst of requests queues up instead of opening dozens of
        database connections. The controller starts the job and answers{" "}
        <code>202 Accepted</code> with the execution id, and a second endpoint
        reports progress:
      </p>
      <CodeBlock label="ImportController.java">{`
        @RestController
        @RequestMapping("/jobs")
        class ImportController {

            private final JobLauncher jobLauncher;
            private final Job importStudents;
            private final JobExplorer jobExplorer;

            ImportController(@Qualifier("asyncJobLauncher") JobLauncher jobLauncher,
                             Job importStudents, JobExplorer jobExplorer) {
                this.jobLauncher = jobLauncher;
                this.importStudents = importStudents;
                this.jobExplorer = jobExplorer;
            }

            @PostMapping("/import-students")
            ResponseEntity<?> start(@RequestParam String file) throws Exception {
                JobParameters params = new JobParametersBuilder()
                        .addString("input.file", file)
                        .toJobParameters();
                JobExecution execution = jobLauncher.run(importStudents, params);
                return ResponseEntity.accepted()
                        .body(Map.of("executionId", execution.getId()));
            }

            @GetMapping("/executions/{id}")
            ResponseEntity<?> status(@PathVariable long id) {
                JobExecution execution = jobExplorer.getJobExecution(id);
                if (execution == null) {
                    return ResponseEntity.notFound().build();
                }
                return ResponseEntity.ok(Map.of(
                        "status", execution.getStatus(),
                        "exitCode", execution.getExitStatus().getExitCode()));
            }
        }
      `}</CodeBlock>
      <Figure
        src={`${IMG}/async-job-launch.svg`}
        alt="Sequence diagram: the client posts to the import endpoint, the controller hands the job to a batch thread and replies 202 Accepted with the execution id, then the client polls the execution status"
        width={640}
        height={380}
        caption="The HTTP request returns as soon as the job is handed to the batch thread; the client polls for the status."
      />

      <h2>Multi-threaded steps need a thread-safe reader</h2>
      <p>
        Adding <code>.taskExecutor(executor)</code> to a step processes several
        chunks in parallel, and it is tempting for a CSV import. The catch is
        that <code>FlatFileItemReader</code> is not thread-safe. Two threads
        can read the same line or skip one, and the saved position means
        nothing once several threads share the reader. If you do want
        threads, build the reader without saved state and wrap it:
      </p>
      <CodeBlock label="StudentReaderConfig.java">{`
        @Bean
        @StepScope
        public SynchronizedItemStreamReader<Student> synchronizedStudentReader(
                @Value("#{jobParameters['input.file']}") String inputFile) {
            FlatFileItemReader<Student> delegate = new FlatFileItemReaderBuilder<Student>()
                    .name("studentCsvReader")
                    .resource(new FileSystemResource(inputFile))
                    .saveState(false)   // positions mean nothing across threads
                    .linesToSkip(1)
                    .delimited()
                    .names("uid", "firstName", "lastName", "age")
                    .targetType(Student.class)
                    .build();
            return new SynchronizedItemStreamReaderBuilder<Student>()
                    .delegate(delegate)
                    .build();
        }
      `}</CodeBlock>
      <p>
        That trades restartability for speed. If you need both, split the input
        into ranges and use a partitioned step instead, where each partition
        has its own reader and its own saved position.
      </p>

      <h2>Restarting a failed import</h2>
      <p>
        Spring Batch identifies a job instance by the job name plus its
        identifying parameters. When a run fails, launching the same job again
        with the same parameters is a restart, not a new run. The reader reads
        the <code>read.count</code> it saved at the last commit and skips
        straight to that line.
      </p>
      <p>
        This is why adding a timestamp parameter to every launch is worth a
        second thought. It makes each run a new instance, which is right for a
        job that should always start fresh, but it also means a crashed import
        starts again from line 1. Using the file path as the parameter, as
        above, gives you a restart for free when the same file is submitted
        again.
      </p>

      <h2>On Spring Boot 4 and Spring Batch 6</h2>
      <p>
        Everything above targets Spring Boot 3 and Spring Batch 5. Spring
        Batch 6, which ships with Spring Boot 4, keeps the same concepts but
        renames several of the APIs used here:
      </p>
      <ul>
        <li>
          <code>chunk(500, transactionManager)</code> is deprecated. Write{" "}
          <code>.chunk(500).transactionManager(transactionManager)</code>.
        </li>
        <li>
          <code>JobLauncher</code> and <code>TaskExecutorJobLauncher</code> are
          deprecated in favour of <code>JobOperator</code> (
          <code>TaskExecutorJobOperator</code>), which can also start jobs on a
          task executor. <code>JobExplorer</code> is deprecated because{" "}
          <code>JobRepository</code> now covers it.
        </li>
        <li>
          Boot 4’s <code>spring-boot-starter-batch</code> keeps job metadata in
          memory. Restarts need it in the database, so use{" "}
          <code>spring-boot-starter-batch-jdbc</code>.
        </li>
        <li>
          Readers and writers moved to{" "}
          <code>org.springframework.batch.infrastructure.*</code>.
        </li>
        <li>
          In a multi-threaded step, only the processor now runs concurrently;
          reading and writing happen on one thread.
        </li>
        <li>
          Failed Batch 5 job instances cannot be restarted after the upgrade,
          so finish or abandon them first.
        </li>
      </ul>

      <h2>Checklist</h2>
      <ul>
        <li>Chunk-oriented step, with the chunk size measured rather than guessed.</li>
        <li>
          <code>@StepScope</code> reader, with the file path as a job parameter.
        </li>
        <li>
          <code>JdbcBatchItemWriter</code> (or Hibernate batching with
          sequence ids), plus <code>reWriteBatchedInserts=true</code> on
          PostgreSQL.
        </li>
        <li>No per-item SQL logging, per-item INFO logs or per-item lookups.</li>
        <li>
          <code>spring.batch.job.enabled=false</code> and an async launcher with
          a small pool for jobs started over HTTP.
        </li>
        <li>
          Multi-threaded steps only with a synchronized reader, or partitioning
          when restarts matter.
        </li>
      </ul>
    </BlogPost>
  );
}
