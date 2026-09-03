import { Container } from "@/components/ui/container";

export default function ShippingPage() {
  return (
    <main className="py-12 md:py-16">
      <Container className="max-w-3xl space-y-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#666666]">Shipping</p>
        <h1 className="text-5xl font-black tracking-[-0.08em] text-[#111111]">Fast shipping, carefully packed.</h1>
        <div className="rounded-[28px] border border-[#111111]/10 bg-white p-8 text-base leading-8 text-[#4b5563]">
          <p>We ship in 2-4 business days from our fulfillment partners, with orders over $80 qualifying for complimentary delivery in select regions.</p>
          <p className="mt-4">Most framed orders are packed in protective packaging with recyclable materials and tracking included in every shipment.</p>
        </div>
      </Container>
    </main>
  );
}
