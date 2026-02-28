import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import medicalConditions from "@/data/medicalConditions";

interface MedicalHistoryData {
  condition: string;
  yearOfDiagnosis: string;
  currentStatus: string;
}

export interface MedicalHistoryDetailsRef {
  flushPendingInput: () => void;
}

interface MedicalHistoryDetailsProps {
  data: MedicalHistoryData;
  onChange: (data: MedicalHistoryData) => void;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

const statusOptions = [
  "I'm completely fine now",
  "I'm taking treatment or medicine",
  "Doctor is keeping a watch",
  "It's under control but not cured",
  "It comes and goes",
  "I have a surgery planned",
  "I'm recovering from surgery",
  "Waiting for test results",
  "It's serious and ongoing",
  "I'd rather not say",
];

function fuzzyMatch(text: string, query: string): boolean {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  // Simple substring + word-start matching
  if (lower.includes(q)) return true;
  // Check if query chars appear in order (fuzzy)
  let qi = 0;
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

const MedicalHistoryDetails = forwardRef<MedicalHistoryDetailsRef, MedicalHistoryDetailsProps>(({ data, onChange }, ref) => {
  const [inputValue, setInputValue] = useState("");
  const [chips, setChips] = useState<string[]>(() =>
    data.condition ? data.condition.split("||").filter(Boolean) : []
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestions =
    inputValue.trim().length >= 3
      ? medicalConditions
          .filter(
            (c) =>
              fuzzyMatch(c, inputValue.trim()) &&
              !chips.includes(c)
          )
          .slice(0, 5)
      : [];

  // Sync chips back to data.condition as "||" delimited string
  const syncChips = useCallback(
    (next: string[]) => {
      setChips(next);
      onChange({ ...data, condition: next.join("||") });
    },
    [data, onChange]
  );

  const addChip = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || chips.includes(trimmed)) return;
      syncChips([...chips, trimmed]);
      setInputValue("");
      setShowSuggestions(false);
      setHighlightIndex(-1);
    },
    [chips, syncChips]
  );

  const addChipsFromText = useCallback(
    (text: string) => {
      const segments = text.split(",").map(s => s.trim()).filter(Boolean);
      const unique = segments.filter(s => !chips.includes(s));
      if (unique.length === 0) return;
      // Deduplicate within segments themselves
      const deduped = [...new Set(unique)];
      syncChips([...chips, ...deduped]);
      setInputValue("");
      setShowSuggestions(false);
      setHighlightIndex(-1);
    },
    [chips, syncChips]
  );

  useImperativeHandle(ref, () => ({
    flushPendingInput: () => {
      if (inputValue.trim()) {
        addChipsFromText(inputValue);
      }
    },
  }), [inputValue, addChipsFromText]);

  const removeChip = useCallback(
    (index: number) => {
      syncChips(chips.filter((_, i) => i !== index));
    },
    [chips, syncChips]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (highlightIndex >= 0 && suggestions[highlightIndex]) {
        addChip(suggestions[highlightIndex]);
      } else if (inputValue.trim()) {
        addChipsFromText(inputValue);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="space-y-4">
      {/* Condition chips input */}
      <div className="space-y-1.5" ref={containerRef}>
        <label className="text-xs font-medium text-muted-foreground">
          Specify condition(s)
        </label>

        {/* Chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {chips.map((chip, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="gap-1 pr-1 text-xs font-normal"
              >
                {chip}
                <button
                  type="button"
                  onClick={() => removeChip(i)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                  aria-label={`Remove ${chip}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Input + Add button */}
        <div className="relative flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Type a condition and press Enter or Add…"
            value={inputValue}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              const val = e.target.value;
              // If user types a comma, immediately convert preceding text to chip(s)
              if (val.endsWith(",")) {
                addChipsFromText(val);
                return;
              }
              setInputValue(val);
              setShowSuggestions(true);
              setHighlightIndex(-1);
            }}
            className="border-border bg-muted/50 text-sm placeholder:text-muted-foreground/60 flex-1"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addChip(inputValue)}
            disabled={!inputValue.trim()}
            className="shrink-0 h-10 px-3 gap-1"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-14 top-full z-50 mt-1 rounded-md border border-border bg-popover shadow-md">
              {suggestions.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    i === highlightIndex
                      ? "bg-accent text-accent-foreground"
                      : "text-popover-foreground hover:bg-accent/50"
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addChip(s);
                  }}
                  onMouseEnter={() => setHighlightIndex(i)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Year of diagnosis */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Year of diagnosis
        </label>
        <Select
          value={data.yearOfDiagnosis}
          onValueChange={(v) => onChange({ ...data, yearOfDiagnosis: v })}
        >
          <SelectTrigger className="border-border bg-muted/50 text-sm">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Current status */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Current status
        </label>
        <Select
          value={data.currentStatus}
          onValueChange={(v) => onChange({ ...data, currentStatus: v })}
        >
          <SelectTrigger className="border-border bg-muted/50 text-sm">
            <SelectValue placeholder="Select current status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

MedicalHistoryDetails.displayName = "MedicalHistoryDetails";

export default MedicalHistoryDetails;
