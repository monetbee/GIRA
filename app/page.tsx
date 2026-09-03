import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, SunMedium, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { getCollections, getFeaturedProducts } from "@/lib/shopify";

export default async function HomePage() {
  const [featuredProducts, collections] = await Promise.all([
    getFeaturedProducts(4),
    getCollections(3),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-[#f3efe9]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,95,109,0.18),_transparent_35%)]" />
        <Container className="relative grid items-center gap-10 py-10 md:grid-cols-[1.1fr_0.9fr] md:py-16">
          <div className="max-w-xl">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#6b7280]">New drop / Summer edit</p>
            <h1 className="mt-5 text-5xl font-black leading-[0.9] tracking-[-0.08em] text-[#111111] sm:text-6xl md:text-7xl">Own the light.</h1>
            <p className="mt-5 max-w-md text-lg leading-8 text-[#4b5563]">
              GIRA frames the city’s most iconic moments with bold silhouettes, luxe details, and UV-ready clarity.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop">
                <Button size="lg" className="gap-2">
                  Shop sunglasses <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/collections/sun-essentials">
                <Button variant="secondary" size="lg">View edit</Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-[#3a3a3a]">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#ff5f6d]" /> UV400 protection</div>
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#ff5f6d]" /> Free shipping over $80</div>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[34px] border border-[#111111]/10 bg-[#e9e0d8] shadow-[0_30px_80px_rgba(17,17,17,0.12)]">
              <div className="relative aspect-[4/5]">
                <Image
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80"
                  alt="Model wearing oversized fashion sunglasses"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute -bottom-4 left-4 rounded-full border border-[#111111]/10 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm">
              <p className="text-[0.7rem] uppercase tracking-[0.2em] text-[#6b7280]">Fresh drop</p>
              <p className="text-lg font-bold text-[#111111]">Noir Wave</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Featured picks"
            title="Made to be spotted."
            description="Our most-loved silhouettes blend editorial proportions with all-day comfort."
          />
          <div className="mt-8">
            <ProductGrid products={featuredProducts} />
          </div>
        </Container>
      </section>

      <section className="bg-[#111111] py-16 text-white md:py-20">
        <Container className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-white/70">Editorial</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.06em]">The mood is effortless. The finish is sharp.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: SunMedium, title: "Polarized", text: "Glare-free clarity" },
              { icon: Sparkles, title: "Premium", text: "Italian acetate" },
              { icon: ShieldCheck, title: "UV400", text: "Full-spectrum protection" },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[24px] border border-white/15 bg-white/5 p-5">
                <Icon className="h-5 w-5 text-[#ffb4bb]" />
                <p className="mt-6 text-lg font-semibold">{title}</p>
                <p className="mt-2 text-sm text-white/70">{text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <SectionHeading eyebrow="Shop by mood" title="Style your next frame." align="center" />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {collections.map((collection) => (
              <Link key={collection.id} href={`/collections/${collection.handle}`} className="group relative overflow-hidden rounded-[30px] border border-[#111111]/10 bg-white">
                <div className="relative aspect-[4/5] overflow-hidden">
                  {collection.image ? (
                    <Image src={collection.image.url} alt={collection.image.altText || collection.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  ) : null}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/80">Collection</p>
                  <h3 className="mt-2 text-2xl font-black tracking-[-0.05em] text-white">{collection.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#faf7f4] py-16 md:py-20">
        <Container className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div className="relative overflow-hidden rounded-[30px] bg-[#f0dfd8]">
            <div className="relative aspect-[4/5]">
              <Image src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80" alt="Editorial lifestyle portrait" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#666666]">Brand statement</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.06em] text-[#111111]">Born for movement, built for impact.</h2>
            <p className="mt-5 max-w-lg text-lg leading-8 text-[#4b5563]">
              GIRA is shaped by late-night city energy, polished silhouettes, and the confidence to make every look feel like a statement.
            </p>
            <Link href="/about" className="mt-7 inline-block">
              <Button variant="secondary">Read our story</Button>
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              "https://images.unsplash.com/photo-1577803947579-9f8f8f6d5f7b?auto=format&fit=crop&w=900&q=80",
              "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
              "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
            ].map((src, index) => (
              <div key={src} className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-[#f3f3f3]">
                <Image src={src} alt="Lifestyle content" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
                {index === 3 ? <div className="absolute inset-0 bg-black/20" /> : null}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#f3efe9] py-16 md:py-20">
        <Container className="rounded-[36px] border border-[#111111]/10 bg-white p-6 sm:p-8 md:p-10">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#666666]">Early access</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-[#111111] md:text-4xl">The next drop is already in motion.</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input aria-label="Email address" placeholder="Email address" className="h-12 min-w-[220px] rounded-full border border-[#111111]/10 bg-[#f7f7f7] px-4 text-sm outline-none" />
              <Button type="button">Get notified</Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
