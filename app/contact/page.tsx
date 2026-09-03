import { Container } from "@/components/ui/container";

export default function ContactPage() {
  return (
    <main className="py-12 md:py-16">
      <Container className="max-w-3xl rounded-[32px] border border-[#111111]/10 bg-white p-8 md:p-10">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#666666]">Contact</p>
        <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-[#111111]">Say hello.</h1>
        <div className="mt-8 space-y-4 text-base leading-8 text-[#4b5563]">
          <p>Email: hello@gira.example</p>
          <p>Instagram: @gira</p>
          <p>Support hours: Monday-Friday, 9am-6pm PST</p>
        </div>
      </Container>
    </main>
  );
}
