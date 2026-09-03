import { Container } from "@/components/ui/container";

const faqs = [
  {
    question: "How do I choose the right lens tint?",
    answer: "Start with how you wear your frames most often: darker tints are ideal for bright days, while more neutral lenses feel versatile for everyday city wear.",
  },
  {
    question: "Do you offer polarized lenses?",
    answer: "Yes. Our premium collection includes polarized and UV400-protected options designed for glare reduction and all-day comfort.",
  },
  {
    question: "How long does shipping take?",
    answer: "Most orders ship within 2-4 business days, with delivery timelines depending on your location and final shipping method.",
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns on unworn items within 30 days of delivery. Please review our shipping and support details for the latest policy.",
  },
];

export default function FAQPage() {
  return (
    <main className="py-12 md:py-16">
      <Container className="max-w-3xl">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#666666]">FAQ</p>
        <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-[#111111]">Questions, answered.</h1>

        <div className="mt-8 space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-[24px] border border-[#111111]/10 bg-white p-6">
              <h2 className="text-xl font-semibold text-[#111111]">{faq.question}</h2>
              <p className="mt-3 text-base leading-7 text-[#4b5563]">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
