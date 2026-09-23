import { ja } from "./messages";
export type Locale = "ja" | "en";
export function resolveLocale(acceptLanguage: string | null): Locale {
  const languages = (acceptLanguage ?? "").split(",").map((entry) => {
    const [language, ...parameters] = entry.trim().split(";");
    const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));
    return { language: language.toLowerCase(), quality: quality ? Number(quality.trim().slice(2)) : 1 };
  }).filter((entry) => entry.language && entry.quality > 0 && entry.quality <= 1)
    .sort((a, b) => b.quality - a.quality);
  return /^ja(?:-|$)/.test(languages[0]?.language ?? "") ? "ja" : "en";
}
export function createTranslator(locale: Locale) {
  return (key: string, values: Record<string, string | number> = {}) => {
    const message = locale === "ja" ? (ja[key] ?? key) : key;
    return message.replace(/\{(\w+)\}/g, (placeholder, name: string) => String(values[name] ?? placeholder));
  };
}
