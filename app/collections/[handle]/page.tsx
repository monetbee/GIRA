import { notFound } from "next/navigation";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/components/product/product-grid";
import { getCollectionByHandle } from "@/lib/shopify";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    return { title: "Collection not found" };
  }

  return {
    title: collection.title,
    description: collection.description || "Shop the GIRA collection.",
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    notFound();
  }

  return (
    <main className="py-10 md:py-14">
      <Container>
        <div className="overflow-hidden rounded-[2.25rem] border border-[#111111]/10 bg-white">
          <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[300px] md:min-h-[420px]">
              {collection.image ? (
                <Image src={collection.image.url} alt={collection.image.altText || collection.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 55vw" />
              ) : null}
            </div>
            <div className="flex flex-col justify-center bg-[linear-gradient(135deg,#fdfcfb,#f0e7e0)] p-6 md:p-10">
              <p className="gira-kicker">Collection</p>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.08em] text-[#111111] md:text-6xl">{collection.title}</h1>
              {collection.description ? <p className="mt-4 max-w-lg text-base leading-8 text-[#4b5563]">{collection.description}</p> : null}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <ProductGrid products={collection.products || []} />
        </div>
      </Container>
    </main>
  );
}
