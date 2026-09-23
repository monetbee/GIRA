import { getTranslations } from "@/lib/i18n/server";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export async function Footer() {
  const t = await getTranslations();
  return (
    <footer className="border-t border-[#111111]/10 bg-[#f8f4ef]">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_1.2fr]">
        <div>
          <p className="gira-brand-wordmark text-[#111111] text-lg">GIRA</p>
          <p className="mt-4 max-w-xs text-sm leading-7 text-[#555555]">{t("Sunglasses for your mood, your city, and your next statement.")}</p>
        </div>
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#666666]">{t("Navigate")}</p>
          <ul className="mt-4 space-y-3 text-sm text-[#333333]">
            <li><Link href="/shop">{t("Shop")}</Link></li>
            <li><Link href="/collections/sun-essentials">{t("Collections")}</Link></li>
            <li><Link href="/about">{t("About")}</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#666666]">{t("Support")}</p>
          <ul className="mt-4 space-y-3 text-sm text-[#333333]">
            <li><Link href="/shipping">{t("Shipping")}</Link></li>
            <li><Link href="/contact">{t("Contact")}</Link></li>
            <li><Link href="/faq">{t("Returns")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#666666]">{t("Join")}</p>
          <p className="mt-4 text-sm text-[#333333]">{t("Early access + insider drops.")}</p>
          <div className="mt-4 flex gap-2">
            <input aria-label={t("Email for newsletter")} placeholder={t("Email address")} className="gira-newsletter-input h-11 min-w-0 flex-1 rounded-full border border-[#111111]/10 bg-white px-4 text-sm outline-none ring-0" />
            <button type="button" className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#111111] px-4 text-sm font-medium text-white">{t("Join")}</button>
          </div>
        </div>
      </Container>
      <div className="border-t border-[#111111]/10 py-4">
        <Container className="flex flex-col gap-2 text-sm text-[#666666] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 GIRA</p>
          <p>{t("Made for your next moment.")}</p>
        </Container>
      </div>
    </footer>
  );
}
