import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, Shield, Sparkles, Truck } from "lucide-react";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ProductGallery } from "@/components/product/product-gallery";
import { formatPrice } from "@/lib/format";
import { getProductByHandle } from "@/lib/shopify";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.title,
    description: product.description || "Shop GIRA sunglasses.",
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const firstVariant = product.variants[0];
  const price = firstVariant?.price ?? product.priceRange.minVariantPrice;

  return (
    <main className="py-10 md:py-14">
      <Container className="space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <ProductGallery product={product} />

          <div className="rounded-[28px] border border-[#111111]/10 bg-white p-5 sm:p-7">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#666666]">{product.vendor || "GIRA"}</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.07em] text-[#111111]">{product.title}</h1>
            <div className="mt-4 flex items-center gap-3">
              <p className="text-2xl font-bold text-[#111111]">{formatPrice(price)}</p>
              {firstVariant?.compareAtPrice ? (
                <p className="text-base text-[#666666] line-through">{formatPrice(firstVariant.compareAtPrice)}</p>
              ) : null}
            </div>

            <div className="mt-6 space-y-3">
              {firstVariant ? (
                <div className="rounded-2xl bg-[#f7f7f7] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#666666]">Variant</p>
                  <p className="mt-2 text-sm font-medium text-[#111111]">{firstVariant.title}</p>
                </div>
              ) : null}
              <div className="flex items-center gap-2 text-sm text-[#333333]">
                <Check className="h-4 w-4 text-[#1f9a54]" />
                {product.availableForSale ? "In stock and ready to ship" : "Currently sold out"}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {firstVariant ? <AddToCartButton variantId={firstVariant.id} /> : null}
              <Button type="button" variant="secondary">Try on virtually</Button>
            </div>

            <div className="mt-8 space-y-4 border-t border-[#111111]/10 pt-6">
              <div className="flex gap-3 text-sm text-[#333333]">
                <Shield className="mt-0.5 h-4 w-4 text-[#ff5f6d]" />
                <div>
                  <p className="font-semibold text-[#111111]">UV protection</p>
                  <p>100% UV400 lens protection with glare reduction.</p>
                </div>
              </div>
              <div className="flex gap-3 text-sm text-[#333333]">
                <Sparkles className="mt-0.5 h-4 w-4 text-[#ff5f6d]" />
                <div>
                  <p className="font-semibold text-[#111111]">Materials</p>
                  <p>Premium acetate frame with precision-engineered hinges.</p>
                </div>
              </div>
              <div className="flex gap-3 text-sm text-[#333333]">
                <Truck className="mt-0.5 h-4 w-4 text-[#ff5f6d]" />
                <div>
                  <p className="font-semibold text-[#111111]">Shipping</p>
                  <p>Free shipping on orders over $80 • 2-4 day delivery.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 rounded-[30px] border border-[#111111]/10 bg-white p-5 md:grid-cols-2 md:p-8">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#666666]">Description</p>
            <div className="mt-4 text-base leading-8 text-[#4b5563]" dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }} />
          </div>
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#666666]">Fit & care</p>
            <ul className="mt-4 space-y-3 text-base leading-7 text-[#4b5563]">
              <li>• Designed for average face shapes with a rounded, contemporary silhouette.</li>
              <li>• Lightweight construction with subtle spring hinges for all-day comfort.</li>
              <li>• Lens care: rinse with lukewarm water and soften with a microfiber cloth.</li>
            </ul>
          </div>
        </div>
      </Container>
    </main>
  );
}
