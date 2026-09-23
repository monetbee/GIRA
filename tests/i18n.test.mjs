import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import React from "react";
import { renderToString } from "react-dom/server";
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const root = path.resolve(__dirname, "..");
const modules = new Map();
function load(relative) {
  let file = path.resolve(root, relative);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = [file + ".ts", file + ".tsx", path.join(file, "index.ts")].find(fs.existsSync);
  }
  if (modules.has(file)) return modules.get(file);
  const exports = {};
  modules.set(file, exports);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, {
    exports, console, process, URLSearchParams,
    require(name) {
      if (name === "next/link") return function TestLink({ children, href, ...props }) { return React.createElement("a", { ...props, href, prefetch: undefined }, children); };
      if (name === "next/image") return function TestImage(props) { const imageProps = { ...props }; delete imageProps.fill; delete imageProps.priority; return React.createElement("img", imageProps); };
      if (name.startsWith("@/")) return load(name.slice(2));
      if (name.startsWith(".")) return load(path.relative(root, path.resolve(path.dirname(file), name)));
      return require(name);
    },
  }, { filename: file });
  return exports;
}
const { resolveLocale, createTranslator } = load("lib/i18n");
const { ja } = load("lib/i18n/messages.ts");

test("request language, regions, quality and English fallback", () => {
  for (const [header, expected] of [["ja", "ja"], ["ja-JP", "ja"], ["ja-Hira-JP", "ja"], ["JA-jp,en;q=0.5", "ja"], ["en-US,ja;q=0.8", "en"], ["en;q=0.5,ja;q=0.9", "ja"], ["fr,ja;q=0.5", "en"], ["ja;q=0,en", "en"], [null, "en"], ["", "en"]]) {
    assert.equal(resolveLocale(header), expected);
  }
});

test("dictionary completeness, interpolation and brand preservation", () => {
  for (const [key, value] of Object.entries(ja)) {
    assert.ok(value && !value.includes("???"), key);
    assert.equal(createTranslator("en")(key), key);
    assert.equal(createTranslator("ja")(key), value);
    assert.deepEqual([...key.matchAll(/\{\w+\}/g)].map(x => x[0]).sort(), [...value.matchAll(/\{\w+\}/g)].map(x => x[0]).sort());
  }
  assert.equal(createTranslator("ja")("WHY GIRA"), "なぜ、GIRAなのか");
  assert.equal(createTranslator("ja")("PAGE {page} OF {total}", { page: 2, total: 4 }), "4ページ中2ページ");
  for (const brand of ["GIRA", "GO INSANE.", "REJECT AVERAGE.", "VOID", "RUSH", "Y2K", "FUTURE", "Choose the signal."]) {
    assert.equal(createTranslator("ja")(brand), brand);
  }
});

test("product UI shares locale, preserves product/variant data and navigation", () => {
  const { LocaleProvider } = load("components/providers/locale-provider.tsx");
  const { CartProvider } = load("components/providers/cart-provider.tsx");
  const { ProductDetailExperience } = load("components/product/product-detail-experience.tsx");
  const { ProductCard } = load("components/product/product-card.tsx");
  const price = { amount: "2980", currencyCode: "JPY" };
  const product = { id: "test", handle: "test-product", title: "RUSH", description: "", tags: ["Y2K"], createdAt: "2026-01-01", availableForSale: true, images: [{ url: "/test.png" }], variants: [
    { id: "v1", title: "BLACK", availableForSale: true, price, selectedOptions: [{ name: "Color", value: "BLACK" }] },
    { id: "v2", title: "WHITE", availableForSale: false, price, selectedOptions: [{ name: "Color", value: "WHITE" }] },
  ], priceRange: { minVariantPrice: price, maxVariantPrice: price } };
  for (const locale of ["ja", "en"]) {
    const html = renderToString(React.createElement(LocaleProvider, { locale }, React.createElement(CartProvider, null,
      React.createElement(ProductDetailExperience, { product }),
      React.createElement(ProductCard, { product, context: { from: "shop", tag: "Y2K", sort: "price-asc", page: 2 } }),
    )));
    for (const text of ["RUSH", "BLACK", "WHITE", "page=2", "tag=Y2K", "sort=price-asc"]) assert.ok(html.includes(text), text);
    for (const key of ["COLOR", "Add to cart", "In stock — available to purchase", "Before you buy", "VIEW PRODUCT"]) assert.ok(html.includes(createTranslator(locale)(key)), key);
  }
});
