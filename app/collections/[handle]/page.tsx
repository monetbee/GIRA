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
    <main className="py-12 md:py-16">
      <Container>
        <div className="overflow-hidden rounded-[32px] border border-[#111111]/10 bg-white">
          <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[280px] md:min-h-[360px]">
              {collection.image ? (
                <Image src={collection.image.url} alt={collection.image.altText || collection.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 55vw" />
              ) : null}
            </div>
            <div className="flex flex-col justify-center p-6 md:p-10">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#666666]">Collection</p>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.07em] text-[#111111] md:text-5xl">{collection.title}</h1>
              {collection.description ? <p className="mt-4 text-base leading-8 text-[#4b5563]">{collection.description}</p> : null}
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
