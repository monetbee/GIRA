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

const storefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "";

export const isShopifyClientConfigured = Boolean(storeDomain && storefrontToken);

async function shopifyCartFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!isShopifyClientConfigured) {
    return {} as T;
  }

  const endpoint = `https://${storeDomain}/api/2025-01/graphql.json`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Cart request failed: ${response.status}`);
  }

  const payload = (await response.json()) as { data?: T; errors?: Array<{ message: string }> };

  if (payload.errors?.length) {
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
    }
  `;

  const result = await shopifyCartFetch<{ cartCreate?: { cart: ShopifyCart } }>(query);
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
    }
  `;

  const result = await shopifyCartFetch<{ cartLinesAdd?: { cart: ShopifyCart } }>(query, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  });

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
    }
  `;

  const result = await shopifyCartFetch<{ cartLinesUpdate?: { cart: ShopifyCart } }>(query, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

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
    }
  `;

  const result = await shopifyCartFetch<{ cartLinesRemove?: { cart: ShopifyCart } }>(query, {
    cartId,
    lineIds: [lineId],
  });

  return result.cartLinesRemove?.cart ?? null;
}
