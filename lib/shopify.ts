export type ShopifyImage = {
  url: string;
  altText?: string;
  width?: number;
  height?: number;
};

export type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  compareAtPrice?: ShopifyMoney;
  price: ShopifyMoney;
  selectedOptions: Array<{ name: string; value: string }>;
  image?: ShopifyImage;
  sku?: string;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  availableForSale: boolean;
  tags: string[];
  productType?: string;
  vendor?: string;
  featuredImage?: ShopifyImage;
  images: ShopifyImage[];
  variants: ShopifyVariant[];
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  seo?: { title?: string; description?: string };
};

export type ShopifyCollection = {
  id: string;
  handle: string;
  title: string;
  description?: string;
  descriptionHtml?: string;
  image?: ShopifyImage;
  products?: ShopifyProduct[];
};

function getEnvValue(...names: string[]) {
  const env: Record<string, string | undefined> =
    typeof process !== "undefined" && process.env ? process.env : {};

  for (const name of names) {
    const value = env[name];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }

  return "";
}

function getShopifyConfig() {
  // Server-side product/collection reads use the Storefront API *public*
  // access token sent via the X-Shopify-Storefront-Access-Token header.
  // A public token is safe to expose to buyers by design, so keeping it in a
  // server-only variable is defense-in-depth, not a requirement.
  // Tokenless access is NOT used: it requires an active Online Store channel
  // and fails with "Online Store channel is locked" on headless-only stores.
  const storeDomain = getEnvValue(
    "SHOPIFY_STORE_DOMAIN",
    "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN",
  ).replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const storefrontToken = getEnvValue(
    "SHOPIFY_STOREFRONT_TOKEN",
    "NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN",
  );

  return { storeDomain, storefrontToken };
}

export async function isShopifyConfigured() {
  const { storeDomain } = await getShopifyConfig();
  return Boolean(storeDomain);
}

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    tags
    productType
    vendor
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      nodes {
        url
        altText
        width
        height
      }
    }
    variants(first: 10) {
      nodes {
        id
        title
        availableForSale
        sku
        selectedOptions {
          name
          value
        }
        image {
          url
          altText
          width
          height
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    seo {
      title
      description
    }
  }
`;

async function shopifyFetch<T>(query: string, variables?: Record<string, string | number | boolean | undefined>, revalidate = 3600): Promise<T> {
  try {
    const { storeDomain: runtimeStoreDomain, storefrontToken: runtimeToken } = await getShopifyConfig();

    if (!runtimeStoreDomain || !runtimeToken) {
      console.warn("SHOPIFY_MISSING_CONFIG: SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_TOKEN is not set");
      return {} as T;
    }

    const endpoint = `https://${runtimeStoreDomain}/api/2026-07/graphql.json`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": runtimeToken,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate },
      cache: "force-cache",
    });

    if (!response.ok) {
      const message = await response.text();
      console.error("SHOPIFY_HTTP_ERROR", { status: response.status, message: message.slice(0, 500) });
      if (response.status === 401 || response.status === 403) {
        console.error(
          "SHOPIFY_UNAUTHORIZED: the Storefront API rejected the token. " +
          "Use the *public* access token from Shopify admin > Headless channel " +
          "(private tokens must be sent via the Shopify-Storefront-Private-Token header instead).",
        );
      }
      if (message.includes("Verifying your connection")) {
        console.error(
          "SHOPIFY_BOT_CHALLENGE: Shopify returned a bot-check page (HTTP 403 'Verifying your connection...'). " +
          "The request IP is being challenged by Shopify's edge protection.",
        );
      }
      throw new Error(`Shopify request failed: ${response.status} ${message}`);
    }

    const payload = (await response.json()) as { data?: T; errors?: Array<{ message: string }> };

    if (payload.errors?.length) {
      console.error("SHOPIFY_GRAPHQL_ERRORS", payload.errors.map((error) => error.message).slice(0, 5));
      throw new Error(payload.errors.map((error) => error.message).join("\n"));
    }

    const result = (payload.data ?? ({} as T));
    return result;
  } catch (error) {
    console.error("SHOPIFY_FETCH_FAILED", error instanceof Error ? error.message : error);
    return {} as T;
  }
}

function mapProduct(node: any): ShopifyProduct {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    descriptionHtml: node.descriptionHtml,
    availableForSale: node.availableForSale,
    tags: node.tags || [],
    productType: node.productType,
    vendor: node.vendor,
    featuredImage: node.featuredImage || node.images?.nodes?.[0],
    images: (node.images?.nodes || []).map((image: any) => ({
      url: image.url,
      altText: image.altText,
      width: image.width,
      height: image.height,
    })),
    variants: (node.variants?.nodes || []).map((variant: any) => ({
      id: variant.id,
      title: variant.title,
      availableForSale: variant.availableForSale,
      compareAtPrice: variant.compareAtPrice || undefined,
      price: variant.price,
      selectedOptions: variant.selectedOptions || [],
      image: variant.image || undefined,
      sku: variant.sku,
    })),
    priceRange: {
      minVariantPrice: node.priceRange?.minVariantPrice,
      maxVariantPrice: node.priceRange?.maxVariantPrice,
    },
    seo: node.seo || undefined,
  };
}

function mapCollection(node: any): ShopifyCollection {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    descriptionHtml: node.descriptionHtml,
    image: node.image,
    products: (node.products?.nodes || []).map(mapProduct),
  };
}

export async function getFeaturedProducts(limit = 4): Promise<ShopifyProduct[]> {
  try {
    const { storeDomain, storefrontToken } = await getShopifyConfig();
    if (!storeDomain || !storefrontToken) {
      console.warn("FEATURED_PRODUCTS_MISSING_CONFIG: SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_TOKEN is not set");
      return [];
    }

    const query = `
      ${PRODUCT_FRAGMENT}
      query GetFeaturedProducts($first: Int!) {
        products(first: $first, sortKey: BEST_SELLING) {
          nodes {
            ...ProductFields
          }
        }
      }
    `;

    const result = await shopifyFetch<{ products?: { nodes: any[] } }>(
      query,
      { first: limit },
      3600,
    );

    const mapped = (result.products?.nodes || []).map(mapProduct);
    console.log("FEATURED_PRODUCTS_COUNT", mapped.length);
    return mapped;
  } catch (error) {
    console.error("getFeaturedProducts failed:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getProducts(limit = 12): Promise<ShopifyProduct[]> {
  try {
    const { storeDomain, storefrontToken } = await getShopifyConfig();
    if (!storeDomain || !storefrontToken) {
      console.warn("SHOP_PRODUCTS_MISSING_CONFIG: SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_TOKEN is not set");
      return [];
    }

    const query = `
      ${PRODUCT_FRAGMENT}
      query GetProducts($first: Int!) {
        products(first: $first, sortKey: PRODUCT_TYPE) {
          nodes {
            ...ProductFields
          }
        }
      }
    `;

    const result = await shopifyFetch<{ products?: { nodes: any[] } }>(query, { first: limit }, 3600);
    const mapped = (result.products?.nodes || []).map(mapProduct);
    console.log("SHOP_PRODUCTS_COUNT", mapped.length);
    return mapped;
  } catch (error) {
    console.error("getProducts failed:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getCollections(limit = 6): Promise<ShopifyCollection[]> {
  try {
    const { storeDomain, storefrontToken } = await getShopifyConfig();
    if (!storeDomain || !storefrontToken) {
      return [];
    }

    const query = `
      query GetCollections($first: Int!) {
        collections(first: $first, sortKey: UPDATED_AT, reverse: true) {
          nodes {
            id
            handle
            title
            description
            descriptionHtml
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    `;

    const result = await shopifyFetch<{ collections?: { nodes: any[] } }>(query, { first: limit }, 3600);
    return (result.collections?.nodes || []).map(mapCollection);
  } catch (error) {
    console.error("getCollections failed:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getCollectionByHandle(handle: string): Promise<ShopifyCollection | null> {
  try {
    const { storeDomain, storefrontToken } = await getShopifyConfig();
    if (!storeDomain || !storefrontToken || !handle) {
      return null;
    }

    const query = `
      ${PRODUCT_FRAGMENT}
      query GetCollectionByHandle($handle: String!) {
        collection(handle: $handle) {
          id
          handle
          title
          description
          descriptionHtml
          image {
            url
            altText
            width
            height
          }
          products(first: 24) {
            nodes {
              ...ProductFields
            }
          }
        }
      }
    `;

    const result = await shopifyFetch<{ collection?: any }>(query, { handle }, 3600);
    return result.collection ? mapCollection(result.collection) : null;
  } catch (error) {
    console.error("getCollectionByHandle failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  try {
    const { storeDomain, storefrontToken } = await getShopifyConfig();
    if (!storeDomain || !storefrontToken || !handle) {
      return null;
    }

    const query = `
      ${PRODUCT_FRAGMENT}
      query GetProductByHandle($handle: String!) {
        product(handle: $handle) {
          ...ProductFields
        }
      }
    `;

    const result = await shopifyFetch<{ product?: any }>(query, { handle }, 3600);
    return result.product ? mapProduct(result.product) : null;
  } catch (error) {
    console.error("getProductByHandle failed:", error instanceof Error ? error.message : error);
    return null;
  }
}
