export type ShopifyCartLine = {
  id: string;
  quantity: number;
  merchandise: { id: string; title: string; image?: { url: string; altText?: string } };
  cost: { amountPerQuantity: { amount: string; currencyCode: string } };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: { amount: string; currencyCode: string };
    totalAmount: { amount: string; currencyCode: string };
  };
  lines: {
    nodes: ShopifyCartLine[];
  };
};

// IMPORTANT: browser-readable env vars MUST be accessed via *static* property
// references. Next.js only inlines NEXT_PUBLIC_* values into the client bundle
// for direct `process.env.VARIABLE_NAME` references at build time; dynamic
// lookups (process.env[name], const env = process.env) are NOT inlined and
// evaluate to undefined in the browser. A previous dynamic getEnvValue()
// helper therefore silently disabled every cart mutation in production.
function getCartClientConfig() {
  const storeDomain = (
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
    process.env.SHOPIFY_STORE_DOMAIN ||
    ""
  ).replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const storefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";

  return { storeDomain, storefrontToken };
}

function isCartClientConfigured() {
  const { storeDomain, storefrontToken } = getCartClientConfig();
  const configured = Boolean(storeDomain && storefrontToken);

  if (!configured) {
    // Never log token values — variable names only.
    console.error(
      "CART_NOT_CONFIGURED: NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and/or NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN " +
      "is missing from the browser bundle (NEXT_PUBLIC_* values are inlined at build time).",
    );
  }

  return configured;
}

type CartMutationPayload<T> = T & { userErrors?: Array<{ message: string }> };

function hasUserErrors<T>(value: unknown): value is CartMutationPayload<T> {
  return Boolean(value && typeof value === "object" && "userErrors" in value);
}

async function shopifyCartFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const { storeDomain: runtimeStoreDomain, storefrontToken: runtimeToken } = getCartClientConfig();

  if (!runtimeStoreDomain || !runtimeToken) {
    console.error("CART_NOT_CONFIGURED: NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN / NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is not available in the browser bundle");
    return {} as T;
  }

  const endpoint = `https://${runtimeStoreDomain}/api/2026-07/graphql.json`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": runtimeToken,
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("CART_NETWORK_ERROR", error instanceof Error ? error.message : error);
    }
    throw error;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (process.env.NODE_ENV !== "production") {
      console.error("CART_HTTP_ERROR", { status: response.status, body: body.slice(0, 300) });
    }
    throw new Error(`Cart request failed: ${response.status}`);
  }

  const payload = (await response.json()) as { data?: T; errors?: Array<{ message: string }> };

  if (payload.errors?.length) {
    if (process.env.NODE_ENV !== "production") {
      console.error("CART_GRAPHQL_ERRORS", payload.errors.map((e) => e.message).slice(0, 5));
    }
    throw new Error(payload.errors.map((error) => error.message).join("\n"));
  }

  return (payload.data ?? ({} as T));
}

export async function createCart(): Promise<ShopifyCart | null> {
  if (!isCartClientConfigured()) {
    return null;
  }

  const query = `
    mutation cartCreate {
      cartCreate(input: {}) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            subtotalAmount { amount currencyCode }
            totalAmount { amount currencyCode }
          }
          lines(first: 50) {
            nodes {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  image {
                    url
                    altText
                  }
                }
              }
              cost {
                amountPerQuantity {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
        userErrors { message }
      }
    }
`;

  const result = await shopifyCartFetch<{ cartCreate?: CartMutationPayload<{ cart: ShopifyCart }> }>(query);
  if (result.cartCreate && hasUserErrors<{ cart: ShopifyCart }>(result.cartCreate) && result.cartCreate.userErrors?.length) {
    if (process.env.NODE_ENV !== "production") {
      console.error("CART_CREATE_USER_ERRORS", result.cartCreate.userErrors.map((e) => e.message).slice(0, 5));
    }
    return null;
  }

  return result.cartCreate?.cart ?? null;
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  if (!isCartClientConfigured() || !cartId) {
    return null;
  }

  const query = `
    query cart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount { amount currencyCode }
          totalAmount { amount currencyCode }
        }
        lines(first: 50) {
          nodes {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                image {
                  url
                  altText
                }
              }
            }
            cost {
              amountPerQuantity {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  const result = await shopifyCartFetch<{ cart?: ShopifyCart }>(query, { cartId });
  return result.cart ?? null;
}

export async function addCartLines(
  cartId: string,
  variantId: string,
  quantity = 1,
): Promise<ShopifyCart | null> {
  if (!isCartClientConfigured() || !cartId || !variantId) {
    return null;
  }

  const query = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            subtotalAmount { amount currencyCode }
            totalAmount { amount currencyCode }
          }
          lines(first: 50) {
            nodes {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  image {
                    url
                    altText
                  }
                }
              }
              cost {
                amountPerQuantity {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
        userErrors { message }
      }
    }
`;

  const result = await shopifyCartFetch<{ cartLinesAdd?: CartMutationPayload<{ cart: ShopifyCart }> }>(query, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  });

  if (result.cartLinesAdd && hasUserErrors<{ cart: ShopifyCart }>(result.cartLinesAdd) && result.cartLinesAdd.userErrors?.length) {
    if (process.env.NODE_ENV !== "production") {
      console.error("CART_LINES_ADD_USER_ERRORS", result.cartLinesAdd.userErrors.map((e) => e.message).slice(0, 5));
    }
    return null;
  }

  return result.cartLinesAdd?.cart ?? null;
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<ShopifyCart | null> {
  if (!isCartClientConfigured() || !cartId || !lineId) {
    return null;
  }

  const query = `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            subtotalAmount { amount currencyCode }
            totalAmount { amount currencyCode }
          }
          lines(first: 50) {
            nodes {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  image {
                    url
                    altText
                  }
                }
              }
              cost {
                amountPerQuantity {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
        userErrors { message }
      }
    }
`;

  const result = await shopifyCartFetch<{ cartLinesUpdate?: CartMutationPayload<{ cart: ShopifyCart }> }>(query, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  if (result.cartLinesUpdate && hasUserErrors<{ cart: ShopifyCart }>(result.cartLinesUpdate) && result.cartLinesUpdate.userErrors?.length) {
    if (process.env.NODE_ENV !== "production") {
      console.error("CART_LINES_UPDATE_USER_ERRORS", result.cartLinesUpdate.userErrors.map((e) => e.message).slice(0, 5));
    }
    return null;
  }

  return result.cartLinesUpdate?.cart ?? null;
}

export async function removeCartLine(cartId: string, lineId: string): Promise<ShopifyCart | null> {
  if (!isCartClientConfigured() || !cartId || !lineId) {
    return null;
  }

  const query = `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            subtotalAmount { amount currencyCode }
            totalAmount { amount currencyCode }
          }
          lines(first: 50) {
            nodes {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  image {
                    url
                    altText
                  }
                }
              }
              cost {
                amountPerQuantity {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
        userErrors { message }
      }
    }
`;

  const result = await shopifyCartFetch<{ cartLinesRemove?: CartMutationPayload<{ cart: ShopifyCart }> }>(query, {
    cartId,
    lineIds: [lineId],
  });

  if (result.cartLinesRemove && hasUserErrors<{ cart: ShopifyCart }>(result.cartLinesRemove) && result.cartLinesRemove.userErrors?.length) {
    if (process.env.NODE_ENV !== "production") {
      console.error("CART_LINES_REMOVE_USER_ERRORS", result.cartLinesRemove.userErrors.map((e) => e.message).slice(0, 5));
    }
    return null;
  }

  return result.cartLinesRemove?.cart ?? null;
}
