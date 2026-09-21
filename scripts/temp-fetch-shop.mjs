// TEMP: map product titles to image URLs from live shop page + inspect PNG dims. Delete after use.
const res = await fetch("https://giraeyewear.com/shop");
const html = await res.text();

// Product titles in render order.
const titles = [...html.matchAll(/gira-shop-product-title[^>]*>([^<]+)</g)].map((m) => m[1]);
console.log("titles:", JSON.stringify(titles));

// Image dims: fetch PNG and read IHDR width/height.
const urls = [...new Set([...html.matchAll(/https:\/\/cdn\.shopify\.com[^"\s&\\]+/g)].map((m) => m[0]))];
for (const u of urls) {
  const img = await fetch(u);
  const buf = Buffer.from(await img.arrayBuffer());
  let dims = "unknown";
  if (buf.length > 24 && buf.toString("ascii", 1, 4) === "PNG") {
    dims = `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`;
  }
  console.log(`${dims} | ${buf.length} bytes | ${u}`);
}
