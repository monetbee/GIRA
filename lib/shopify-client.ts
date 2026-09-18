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

const storefrontToken = getEnvValue("NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN");
const storeDomain = getEnvValue("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN", "SHOPIFY_STORE_DOMAIN").replace(/^https?:\/\//i, "").replace(/\/+$/, "");

export const isShopifyClientConfigured = Boolean(storeDomain && storefrontToken);

type CartMutationPayload<T> = T & { userErrors?: Array<{ message: string }> };

function hasUserErrors<T>(value: unknown): value is CartMutationPayload<T> {
  return Boolean(value && typeof value === "object" && "userErrors" in value);
}

async function shopifyCartFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const runtimeToken = getEnvValue("NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  const runtimeStoreDomain = getEnvValue("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN", "SHOPIFY_STORE_DOMAIN").replace(/^https?:\/\//i, "").replace(/\/+$/, "");

  if (!runtimeStoreDomain || !runtimeToken) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("CART_NOT_CONFIGURED: NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN / NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is not set");
    }
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
  if (!isShopifyClientConfigured) {
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
  if (!isShopifyClientConfigured || !cartId) {
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
  if (!isShopifyClientConfigured || !cartId || !variantId) {
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
  if (!isShopifyClientConfigured || !cartId || !lineId) {
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
  if (!isShopifyClientConfigured || !cartId || !lineId) {
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
