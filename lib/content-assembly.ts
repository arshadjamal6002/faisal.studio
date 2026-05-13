import type { ContentItem } from "@/types";

/** Join story + main text + explanation for captions / wizard `content.text`. */
export function captionSourceFromItem(item: ContentItem): string {
  const parts: string[] = [];
  if (item.story?.trim()) parts.push(item.story.trim());
  if (item.text?.trim()) parts.push(item.text.trim());
  if (item.explanation?.trim()) parts.push(item.explanation.trim());
  return parts.join("\n\n");
}
