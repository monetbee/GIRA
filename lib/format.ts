export type ShopifyMoney = {
  amount: string;
  currencyCode?: string;
};

export function formatPrice(value?: ShopifyMoney) {
  if (!value) return "From $0";

  const amount = Number(value.amount || 0);
  const currency = value.currencyCode || "USD";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
