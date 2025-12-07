//components/cookie-banner/translation.ts
import { appConfig } from "@/config/app-config"
import { DEFAULT_LANGUAGE, type SupportedLanguage } from "@/config/translations.config"
import translations from "./translations.json"

type TranslationEntry = {
  [K in SupportedLanguage]?: string
}

type Translations = {
  [key: string]: TranslationEntry
}

const typedTranslations: Translations = translations

export function getOfflineTranslation() {
  const language = (appConfig.lang as SupportedLanguage) || "en"

  function t(key: string): string {
    const entry = typedTranslations[key]
    if (!entry) return key
    return entry[language] || entry[DEFAULT_LANGUAGE] || key
  }

  return { t }
}
