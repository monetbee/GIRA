"use client";

import { useTranslations } from "@/components/providers/locale-provider";

// A review provider can supply this summary by Shopify product ID.
// null means not connected; count: 0 means connected, with no reviews yet.
export type ProductReviewSummary = { average: number; count: number };

export function ProductRating({ summary }: { summary: ProductReviewSummary | null }) {
  const t = useTranslations();
  const valid = summary && Number.isFinite(summary.average) && summary.average >= 0 && summary.average <= 5
    && Number.isInteger(summary.count) && summary.count >= 0;
  if (!valid || summary.count === 0) return null;
  const rating = summary.average;
  const label = t("Rated {rating} out of 5, {count} reviews", { rating: rating.toFixed(1), count: summary.count });

  return (
    <div className="gira-product-rating" role="img" aria-label={label}>
      <span className="gira-rating-stars" aria-hidden="true">
        <span>☆☆☆☆☆</span>
        <span className="gira-rating-fill" style={{ width: `${(rating / 5) * 100}%` }}>★★★★★</span>
      </span>
      <span aria-hidden="true">
        {`${rating.toFixed(1)} (${summary.count})`}
      </span>
    </div>
  );
}
