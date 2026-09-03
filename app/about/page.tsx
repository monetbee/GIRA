import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="py-12 md:py-16">
      <Container className="max-w-4xl space-y-10">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#666666]">About GIRA</p>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-[#111111]">Fashion-first eyewear for people who move differently.</h1>
        </div>

        <div className="grid gap-6 text-lg leading-8 text-[#4b5563] md:grid-cols-2">
          <p>
            GIRA began with one simple idea: eyewear should feel like a point of view, not a utility item. We build frames that carry attitude into everyday routines—through the morning commute, the city pace, the after-hours edit, and everything in between.
          </p>
          <p>
            Our silhouettes are deliberately expressive: sculptural, light, and intentionally not generic. We lean into color, confidence, and textural detail without sacrificing comfort, clarity, or all-day wearability.
          </p>
        </div>

        <div className="rounded-[32px] border border-[#111111]/10 bg-white p-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#666666]">Our approach</p>
          <p className="mt-4 text-xl leading-9 text-[#111111]">
            We design for people who treat accessories like identity markers—pieces that elevate a look, sharpen a mood, and frame the world in their own style.
          </p>
        </div>

        <div className="flex justify-start">
          <Link href="/shop">
            <Button>Shop the collection</Button>
          </Link>
        </div>
      </Container>
    </main>
  );
}
