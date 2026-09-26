"use client";
import { useTranslations } from "@/components/providers/locale-provider";

import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductCard } from "@/components/product/product-card";
import { ShopAllLink } from "@/components/product/shop-all-link";
import { defaultSignal, discoverProducts, paginateProducts, paginationItems, updateDiscoveryParams, parseSignal, parseSort, SIGNAL_TAGS, SORT_OPTIONS } from "@/lib/product-discovery";
import type { ShopifyProduct } from "@/lib/shopify";

export function ProductDiscovery({ products, mode }: { products: ShopifyProduct[]; mode: "shop" | "signal" }) {
  const t = useTranslations();
  const params = useSearchParams();
  const initialSignal = useMemo(() => mode === "signal" ? defaultSignal(products) : undefined, [products, mode]);
  const tag = parseSignal(params.get(mode === "shop" ? "tag" : "signal")) ?? initialSignal;
  const sort = mode === "shop" ? parseSort(params.get("sort")) : "featured";
  const visibleProducts = useMemo(() => discoverProducts(products, tag, sort), [products, tag, sort]);
  const { products: pageProducts, currentPage, totalPages } = paginateProducts(visibleProducts, params.get("page"));
  const resultsRef = useRef<HTMLDivElement>(null);
  const scrollAfterPageChange = useRef(false);

  useEffect(() => {
    if (mode === "shop" && scrollAfterPageChange.current) {
      scrollAfterPageChange.current = false;
      resultsRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
      resultsRef.current?.focus({ preventScroll: true });
    }
  }, [currentPage, mode]);

  function updateParam(key: string, value?: string) {
    const url = new URL(window.location.href);
    url.search = updateDiscoveryParams(url.searchParams, key, value).toString();
    if (url.href !== window.location.href) window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function changePage(page: number) {
    scrollAfterPageChange.current = true;
    updateParam("page", page === 1 ? undefined : String(page));
  }

  const filters = <div className="gira-signal-filters" role="group" aria-label={t("Filter by signal")}>
    {(mode === "shop" || !initialSignal) && <button type="button" aria-pressed={!tag} onClick={() => updateParam(mode === "shop" ? "tag" : "signal")}>{t("ALL")}</button>}
    {SIGNAL_TAGS.map((signal) => <button key={signal} type="button" aria-pressed={tag === signal}
      aria-controls={mode === "signal" ? "signal-products" : "shop-products"}
      onClick={() => updateParam(mode === "shop" ? "tag" : "signal", signal)}>{signal}</button>)}
  </div>;

  const results = <div ref={resultsRef} tabIndex={-1} className="gira-discovery-results" id={mode === "signal" ? "signal-products" : "shop-products"}>
    <p className="gira-discovery-count" role="status">{visibleProducts.length} {visibleProducts.length === 1 ? t("PRODUCT") : t("PRODUCTS")}{tag ? ` / ${tag}` : ""}{mode === "shop" && totalPages > 1 ? ` / ${t("PAGE {page} OF {total}", { page: currentPage, total: totalPages })}` : ""}</p>
    {visibleProducts.length ? <ProductGrid products={mode === "shop" ? pageProducts : visibleProducts} context={{ from: mode, tag, sort, page: mode === "shop" ? currentPage : undefined }} />
      : <p className="gira-discovery-empty">{tag ? t("No products for {tag} yet. Choose another signal.", { tag }) : t("No products available yet.")}</p>}
  </div>;

  if (mode === "signal") return <section className="gira-minimal-shop gira-signal-section" id="choose-the-signal">
    <Container>
      <div className="gira-minimal-shop-grid">
        <div className="gira-shop-copy"><p className="gira-kicker">{t("Shop")}</p><h2>Choose the signal.</h2></div>
        {filters}
      </div>
      <div id="signal-products" className="gira-discovery-results">
        <p className="gira-discovery-count" role="status">{visibleProducts.length} {visibleProducts.length === 1 ? t("PRODUCT") : t("PRODUCTS")}{tag ? ` / ${tag}` : ` / ${t("ALL")}`}</p>
        {visibleProducts.length ? <ul key={tag ?? "all"} className="gira-signal-products" aria-label={t("Filter by signal")} tabIndex={0}>
          {visibleProducts.slice(0, 4).map((product) => <li key={product.id}>
            <ProductCard product={product} context={{ from: "signal", tag }}
              imageSizes="(max-width: 767px) 78vw, (max-width: 1280px) 23vw, 292px" />
          </li>)}
        </ul> : <p className="gira-discovery-empty">{tag ? t("No products for {tag} yet. Choose another signal.", { tag }) : t("No products available yet.")}</p>}
      </div>
      <div className="gira-best-sellers-action">
        <ShopAllLink />
      </div>
    </Container>
  </section>;

  return <>
    <div className="gira-discovery-toolbar">
      {filters}
      <label className="gira-discovery-sort">{t("SORT BY")}<select value={sort} onChange={(event) => updateParam("sort", event.target.value === "featured" ? undefined : event.target.value)}>
          {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{t(option.label)}</option>)}
        </select>
      </label>
    </div>
    {results}
    {totalPages > 1 && <nav className="gira-pagination" aria-label={t("Product pages")}>
      <button type="button" aria-label={t("Previous page")} disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>&larr;</button>
      {paginationItems(currentPage, totalPages).map((item) => typeof item === "number"
        ? <button key={item} type="button" aria-label={t("Page {page}", { page: item })} aria-current={item === currentPage ? "page" : undefined} onClick={() => { if (item !== currentPage) changePage(item); }}>{item}</button>
        : <span key={item} aria-hidden="true">&hellip;</span>)}
      <button type="button" aria-label={t("Next page")} disabled={currentPage === totalPages} onClick={() => changePage(currentPage + 1)}>&rarr;</button>
    </nav>}
  </>;
}
