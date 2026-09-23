"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/components/product/product-grid";
import { discoverProducts, parseSignal, parseSort, SIGNAL_TAGS, SORT_OPTIONS } from "@/lib/product-discovery";
import type { ShopifyProduct } from "@/lib/shopify";

export function ProductDiscovery({ products, mode }: { products: ShopifyProduct[]; mode: "shop" | "signal" }) {
  const params = useSearchParams();
  const tag = parseSignal(params.get(mode === "shop" ? "tag" : "signal"));
  const sort = mode === "shop" ? parseSort(params.get("sort")) : "featured";
  const visibleProducts = useMemo(() => discoverProducts(products, tag, sort), [products, tag, sort]);

  function updateParam(key: string, value?: string) {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    if (url.href !== window.location.href) window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  const filters = <div className="gira-signal-filters" role="group" aria-label="Filter by signal">
    {mode === "shop" && <button type="button" aria-pressed={!tag} onClick={() => updateParam("tag")}>ALL</button>}
    {SIGNAL_TAGS.map((signal) => <button key={signal} type="button" aria-pressed={tag === signal}
      aria-controls={mode === "signal" ? "signal-products" : "shop-products"}
      onClick={() => updateParam(mode === "shop" ? "tag" : "signal", signal)}>{signal}</button>)}
  </div>;

  const results = <div id={mode === "signal" ? "signal-products" : "shop-products"}>
    <p className="gira-discovery-count" role="status">{visibleProducts.length} {visibleProducts.length === 1 ? "PRODUCT" : "PRODUCTS"}{tag ? ` / ${tag}` : ""}</p>
    {visibleProducts.length ? <ProductGrid products={visibleProducts} context={{ from: mode, tag, sort }} />
      : <p className="gira-discovery-empty">{tag ? `No products for ${tag} yet. Choose another signal.` : "No products available yet."}</p>}
  </div>;

  if (mode === "signal") return <section className="gira-minimal-shop gira-signal-section" id="choose-the-signal">
    <Container>
      <div className="gira-minimal-shop-grid">
        <div className="gira-shop-copy"><p className="gira-kicker">Shop</p><h2>Choose the signal.</h2></div>
        {filters}
      </div>
      {tag ? results : <div id="signal-products" />}
    </Container>
  </section>;

  return <>
    <div className="gira-discovery-toolbar">
      {filters}
      <label className="gira-discovery-sort">SORT BY
        <select value={sort} onChange={(event) => updateParam("sort", event.target.value === "featured" ? undefined : event.target.value)}>
          {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
    </div>
    {results}
  </>;
}
