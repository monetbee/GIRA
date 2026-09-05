import { ProductCard } from "@/components/product/product-card";
import type { ShopifyProduct } from "@/lib/shopify";

export function ProductGrid({ products }: { products: ShopifyProduct[] }) {
  return (
    <div className="gira-shop-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
