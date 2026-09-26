"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { shopAllHref } from "@/lib/routes";

export function ShopAllLink() {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    router.push(shopAllHref);
  }

  return (
    <Link href={shopAllHref} onClick={handleClick} className="gira-shop-all">
      SHOP ALL <span aria-hidden="true">→</span>
    </Link>
  );
}
