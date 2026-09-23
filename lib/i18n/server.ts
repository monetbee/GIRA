import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { createTranslator, resolveLocale } from "./index";
export const getLocale = cache(async () => resolveLocale((await headers()).get("accept-language")));
export async function getTranslations() {
  return createTranslator(await getLocale());
}
