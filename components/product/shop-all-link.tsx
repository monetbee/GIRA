import Link from "next/link";
import { shopAllHref } from "@/lib/routes";

export function ShopAllLink() {
  return (
    <Link href={shopAllHref} className="gira-shop-all">
      SHOP ALL <span aria-hidden="true">→</span>
    </Link>
  );
}
