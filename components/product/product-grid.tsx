import { ProductCard } from "@/components/product/product-card";
import type { ShopifyProduct } from "@/lib/shopify";

import type { DiscoveryContext } from "@/lib/product-discovery";

export function ProductGrid({ products, context }: { products: ShopifyProduct[]; context?: DiscoveryContext }) {
  return (
    <div className="gira-shop-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} context={context} />
      ))}
    </div>
  );
}
