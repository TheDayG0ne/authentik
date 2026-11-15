/// <reference types="node" />

/**
 * Reports untranslated entries in the source Russian XLIFF catalog.
 * This intentionally reads the source catalog, never generated locale files.
 * Use --strict in CI once the catalog is complete.
 */

import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";

const catalogPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "xliff/ru-RU.xlf");
const xml = await fs.readFile(catalogPath, "utf8");
const units = [...xml.matchAll(/<trans-unit\b[^>]*?id="([^"]+)"[\s\S]*?<\/trans-unit>/g)];
const untranslated = units.filter(([, id]) => {
    const unit = units.find(([, candidateId]) => candidateId === id)?.[0] ?? "";
    const source = unit.match(/<source>([\s\S]*?)<\/source>/)?.[1]?.trim();
    const target = unit.match(/<target(?:\s[^>]*)?>([\s\S]*?)<\/target>/)?.[1]?.trim();
    return Boolean(source) && !target;
});

console.log(`Russian catalog: ${units.length} units, ${units.length - untranslated.length} translated`);

if (untranslated.length) {
    console.warn(`Missing translations: ${untranslated.length}`);
    for (const [, id] of untranslated.slice(0, 20)) {
        const unit = units.find(([, candidateId]) => candidateId === id)?.[0] ?? "";
        const source = unit.match(/<source>([\s\S]*?)<\/source>/)?.[1]?.replace(/<[^>]+>/g, "");
        console.warn(`- ${id}: ${source}`);
    }
    if (process.argv.includes("--strict")) process.exit(1);
}
