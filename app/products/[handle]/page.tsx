import { Suspense } from "react";
import { ProductBackLink } from "@/components/product/product-back-link";
import { notFound } from "next/navigation";
import { ProductDetailExperience } from "@/components/product/product-detail-experience";
import { Container } from "@/components/ui/container";
import { getProductByHandle } from "@/lib/shopify";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return { title: "Product not found" };
  return { title: product.title, description: product.description || "Shop GIRA sunglasses.", alternates: { canonical: `/products/${encodeURIComponent(product.handle)}` } };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();

  return <main className="gira-product-detail-page">
    <Container className="gira-product-detail-container">
      <Suspense fallback={null}><ProductBackLink /></Suspense>
      <div className="gira-product-detail-shell"><ProductDetailExperience product={product} /></div>
      <div className="gira-product-detail-copy-grid">
        <div>
          <p className="gira-product-detail-section-label">商品説明</p>
          <div className="gira-product-detail-copy" dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }} />
        </div>
        <div>
          <p className="gira-product-detail-section-label">お手入れについて</p>
          <ul className="gira-product-detail-list">
            <li>レンズは柔らかいメガネ拭き等で優しくお手入れしてください。</li>
            <li>汚れが気になる場合は、レンズやフレームを傷つけないよう丁寧にお取り扱いください。</li>
          </ul>
        </div>
      </div>
    </Container>
  </main>;
}
