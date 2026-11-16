import { sourceLocale as SourceLanguageTag } from "../../../locale-codes.js";

import { TargetLanguageTag, TargetLanguageTags } from "#common/ui/locale/definitions";

//#region Cache

const localeCache = new Map<string, Intl.Locale | null>();

//#endregion

//#region Locale Matching

/**
 * Parse a locale string with caching and fallback for invalid/unsupported locales.
 */
export function safeParseLocale(candidate: string): Intl.Locale | null {
    if (localeCache.has(candidate)) {
        return localeCache.get(candidate)!;
    }

    let locale: Intl.Locale | null = null;
    try {
        locale = new Intl.Locale(candidate);
    } catch {
        // Invalid locale string
    }

    localeCache.set(candidate, locale);
    return locale;
}

/**
 * Find the best matching supported locale for a given locale string.
 */
export function getBestMatchLocale(candidate: string): TargetLanguageTag | null {
    const normalized = candidate.trim();
    if (!normalized) return null;
    const locale = safeParseLocale(normalized);
    const language = locale?.language ?? normalized.split(/[-_]/)[0].toLowerCase();
    if (language === "ru") return "ru-RU";
    if (language === "en") return SourceLanguageTag;
    return null;
}

/**
 * Find the first supported locale from a list of candidates.
 *
 * @param candidates An array of locale strings to check.
 * @returns The first supported locale code, or null if none found.
 *
 * @remarks
 * This looks weird, but it's sensible: we have several candidates, and we want to find the first
 * one that has a supported locale. Then, from *that*, we have to extract that first supported
 * locale.
 */
export function findSupportedLocale(candidates: string[]): TargetLanguageTag | null {
    for (const candidate of candidates) {
        const match = getBestMatchLocale(candidate);
        if (match) return match;
    }
    return null;
}

//#endregion

//#region Persistence

const sessionLocaleKey = "authentik:locale";

/**
 * Persist the given locale code to sessionStorage.
 */
export function setSessionLocale(languageTag: TargetLanguageTag | null): void {
    try {
        if (!languageTag) {
            sessionStorage?.removeItem?.(sessionLocaleKey);
            return;
        }

        sessionStorage?.setItem?.(sessionLocaleKey, languageTag);
    } catch (error) {
        console.debug("authentik/locale: Unable to persist locale to sessionStorage", error);
    }
}

/**
 * Retrieve the persisted locale code from sessionStorage.
 */
export function getSessionLocale(): string | null {
    try {
        return sessionStorage?.getItem?.(sessionLocaleKey) || null;
    } catch (error) {
        console.debug("authentik/locale: Unable to read locale from sessionStorage", error);
    }

    return null;
}

//#region Type Guards

/**
 * Predicate to determine if a given language tag is a supported locale target.
 *
 * @param languageTagHint The language tag to check.
 */
export function isTargetLanguageTag(
    languageTagHint: Intl.UnicodeBCP47LocaleIdentifier,
): languageTagHint is TargetLanguageTag {
    return TargetLanguageTags.has(languageTagHint as TargetLanguageTag);
}

//#endregion

//#region Auto-Detection

/**
 * Auto-detect the best locale to use from several sources.
 *
 * @param languageTagHint An optional locale code hint.
 * @param fallbackLanguageTag An optional fallback locale code.
 * @returns The best-matching supported locale code.
 *
 * @remarks
 * The order of precedence is:
 *
 * 1. A `locale` URL parameter
 * 2. A previously persisted session locale
 * 3. A provided locale hint
 * 4. The browser's navigator language
 * 5. A provided fallback locale code
 * 6. The source locale (English)
 */
export function autoDetectLanguage(
    languageTagHint?: Intl.UnicodeBCP47LocaleIdentifier,
    fallbackLanguageTag?: Intl.UnicodeBCP47LocaleIdentifier,
): TargetLanguageTag {
    let localeParam: string | null = null;

    if (self.location) {
        const searchParam = new URLSearchParams(self.location.search);

        localeParam = searchParam.get("locale");
    }

    const sessionLocale = getSessionLocale();

    const candidates = [
        localeParam,
        sessionLocale,
        languageTagHint,
        fallbackLanguageTag,
    ].filter((item): item is string => !!item);

    const firstSupportedLocale = findSupportedLocale(candidates);

    if (!firstSupportedLocale) {
        console.debug(`authentik/locale: Falling back to source locale`, {
            SourceLanguageTag,
            languageTagHint,
            fallbackLanguageTag,
            candidates,
        });

        return "ru-RU";
    }

    return firstSupportedLocale;
}

/**
 * Given a locale code, format it for use in an `Accept-Language` header.
 */
export function formatAcceptLanguageHeader(languageTag: Intl.UnicodeBCP47LocaleIdentifier): string {
    const [preferredLanguageTag, ...languageTags] = new Set([
        languageTag,
        ...(self.navigator?.languages || []),
        SourceLanguageTag,
        "*",
    ]);

    const fallbackCount = languageTags.length;

    return [
        preferredLanguageTag,
        ...languageTags.map((tag, idx) => {
            const weight = ((fallbackCount - idx) / (fallbackCount + 1)).toFixed(
                fallbackCount > 9 ? 2 : 1,
            );

            return `${tag};q=${weight}`;
        }),
    ].join(", ");
}
