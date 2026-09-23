"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { discoveryReturnLink } from "@/lib/product-discovery";

export function ProductBackLink() {
  const params = useSearchParams();
  const { href, label } = discoveryReturnLink(params);
  return <Link href={href} className="gira-product-back-link">&larr; {label}</Link>;
}
