# Storefront translations

`server.ts` resolves the preferred `Accept-Language` entry once per request using React cache. `ja` and `ja-*` select Japanese; other languages and missing headers select English. Quality values are respected. No locale URL prefix, cookie or browser-side language override is used.

Server Components call `await getTranslations()`. The root layout sets `html lang` and passes the same locale to `LocaleProvider`; Client Components call `useTranslations()`. Do not read `navigator.language` during rendering: it could disagree with the server HTML.

`messages.ts` uses the original English copy as dictionary keys. Add Japanese UI translations there, then call `t("English copy")` or `t("Page {page}", { page })`. Keep product names, variant names, Shopify descriptions, SIGNAL tags and intentional brand slogans outside translation calls. Locale-dependent routes render dynamically; this is required to avoid serving one visitor's language to another.

Run `node --test --test-isolation=none tests/i18n.test.mjs` and `npm run build`. Tests include language negotiation, placeholders, brand preservation and rendering product UI in both languages. Checkout is Shopify-hosted; its language is outside this dictionary. Returns currently links to the FAQ; there is no separate returns route.
