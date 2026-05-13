"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { ContentTypePicker } from "@/components/content/ContentTypePicker";
import { ContentItemCard } from "@/components/content/ContentItemCard";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { useWizardStore } from "@/lib/store";
import { getDatasetForType } from "@/data";
import { captionSourceFromItem } from "@/lib/content-assembly";

export function StepContent() {
  const content = useWizardStore((s) => s.content);
  const setContentType = useWizardStore((s) => s.setContentType);
  const selectDatasetItem = useWizardStore((s) => s.selectDatasetItem);
  const setCustomText = useWizardStore((s) => s.setCustomText);
  const setCustomReference = useWizardStore((s) => s.setCustomReference);

  const items = getDatasetForType(content.type);

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>Aaj kya share kar rahe ho?</CardTitle>
        <CardDescription>
          Category chuno ya apna reminder likho — yahi text baad mein screen par
          captions banega.
        </CardDescription>
        <div className="mt-5">
          <ContentTypePicker
            value={content.type}
            onChange={setContentType}
          />
        </div>
      </Card>

      {content.type === "custom" ? (
        <Card>
          <CardTitle>Apna text</CardTitle>
          <CardDescription>
            Apna hadith, ayat, quote ya soch likho ya paste karo. Chaaho to
            source bhi likh dena.
          </CardDescription>
          <div className="mt-4 space-y-4">
            <Textarea
              label="Tumhara reminder"
              placeholder="Yahan likho: hadith, ayat, quote, ya apni baat…"
              value={content.text}
              onChange={(e) => setCustomText(e.target.value)}
              className="min-h-[200px]"
            />
            <Input
              label="Source / hawala (optional)"
              placeholder="misal: Sahih Muslim, alim ka naam, apni notes"
              value={content.reference ?? ""}
              onChange={(e) => setCustomReference(e.target.value)}
            />
          </div>
        </Card>
      ) : (
        <Card>
          <CardTitle>Ek entry chuno</CardTitle>
          <CardDescription>
            MVP sample library — Roman Urdu mein zyada add karne ke liye{" "}
            <code className="rounded bg-slate-100 px-1 text-xs">data/</code>{" "}
            folder dekho.
          </CardDescription>
          <div className="mt-4 max-h-[min(70vh,560px)] space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <ContentItemCard
                key={item.id}
                item={item}
                selected={content.selectedId === item.id}
                onSelect={() =>
                  selectDatasetItem(
                    item.id,
                    captionSourceFromItem(item),
                    item.reference,
                  )
                }
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
