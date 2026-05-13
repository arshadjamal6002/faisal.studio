import type { ContentType, ContentItem } from "@/types";
import { hadithItems } from "./hadith";
import { quranItems } from "./quran";
import { quoteItems } from "./quotes";
import { duaItems } from "./duas";

export function getDatasetForType(type: ContentType): ContentItem[] {
  switch (type) {
    case "hadith":
      return hadithItems;
    case "quran":
      return quranItems;
    case "quote":
      return quoteItems;
    case "dua":
      return duaItems;
    default:
      return [];
  }
}

export { hadithItems, quranItems, quoteItems, duaItems };
