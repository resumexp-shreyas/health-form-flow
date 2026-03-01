import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface AmbiguousCondition {
  disclosed_term: string;
  probable_options: string[];
}

interface AmbiguousClarificationProps {
  items: AmbiguousCondition[];
  onConfirm: (selections: Record<string, string>) => void;
}

const AmbiguousClarification = ({ items, onConfirm }: AmbiguousClarificationProps) => {
  const [selections, setSelections] = useState<Record<string, string>>({});

  const allSelected = items.every((item) => selections[item.disclosed_term] !== undefined);

  const handleSelect = (disclosedTerm: string, value: string) => {
    setSelections((prev) => ({ ...prev, [disclosedTerm]: value }));
  };

  return (
    <div className="space-y-4 my-6">
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm font-medium text-foreground mb-4">
          We need a bit more clarity on some conditions you mentioned. Please select the closest match for each:
        </p>

        <div className="space-y-4">
          {items.map((item) => {
            const keepAsIsValue = `__keep__${item.disclosed_term}`;
            return (
              <Card key={item.disclosed_term} className="border-border bg-card">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-medium text-foreground">
                    You mentioned "<span className="font-semibold text-primary">{item.disclosed_term}</span>" — please select the closest match:
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <RadioGroup
                    value={selections[item.disclosed_term] || ""}
                    onValueChange={(v) => handleSelect(item.disclosed_term, v)}
                    className="space-y-2"
                  >
                    {item.probable_options.map((option) => (
                      <div key={option} className="flex items-center gap-2">
                        <RadioGroupItem value={option} id={`${item.disclosed_term}-${option}`} />
                        <Label
                          htmlFor={`${item.disclosed_term}-${option}`}
                          className="text-sm text-foreground cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                    {/* Keep as-is option */}
                    <div className="flex items-center gap-2 pt-1 border-t border-border mt-1">
                      <RadioGroupItem value={keepAsIsValue} id={`${item.disclosed_term}-keep`} />
                      <Label
                        htmlFor={`${item.disclosed_term}-keep`}
                        className="text-sm text-muted-foreground italic cursor-pointer"
                      >
                        Keep my entry as-is — "{item.disclosed_term}"
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              // Resolve selections: keep-as-is maps back to the original term
              const resolved: Record<string, string> = {};
              for (const item of items) {
                const sel = selections[item.disclosed_term];
                const keepAsIsValue = `__keep__${item.disclosed_term}`;
                resolved[item.disclosed_term] = sel === keepAsIsValue ? item.disclosed_term : sel;
              }
              onConfirm(resolved);
            }}
            disabled={!allSelected}
            className="rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmbiguousClarification;
