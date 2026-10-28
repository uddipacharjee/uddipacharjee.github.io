export type FaqItem = { question: string; answer: string };

/** FAQPage JSON-LD for the same questions the page shows. */
export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Questions and answers at the end of a post; pair with `faqSchema`. */
export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-7">
      {items.map((item) => (
        <div key={item.question}>
          <h3 className="text-[1.1rem] font-semibold leading-snug">{item.question}</h3>
          <p className="mt-2">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}
