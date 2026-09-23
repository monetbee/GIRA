"use client";
import { useTranslations } from "@/components/providers/locale-provider";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { discoveryReturnLink, parseSignal } from "@/lib/product-discovery";

export function ProductBackLink() {
  const t = useTranslations();
  const params = useSearchParams();
  const { href, label } = discoveryReturnLink(params);
  const tag = parseSignal(params.get("tag"));
  const text = params.get("from") === "signal" && tag ? t("BACK TO {tag} SIGNAL", { tag }) : t(label);
  return <Link href={href} className="gira-product-back-link">&larr; {text}</Link>;
}
