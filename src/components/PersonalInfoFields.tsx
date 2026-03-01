import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PersonalInfoFieldsProps {
  age: string;
  gender: string;
  ageInMonths: string;
  onAgeChange: (age: string) => void;
  onGenderChange: (gender: string) => void;
  onAgeInMonthsChange: (months: string) => void;
}

const genderOptions = ["Male", "Female", "Other"];

const PersonalInfoFields = ({
  age,
  gender,
  ageInMonths,
  onAgeChange,
  onGenderChange,
  onAgeInMonthsChange,
}: PersonalInfoFieldsProps) => {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex gap-8 items-start">

        {/* Age */}
        <div className="space-y-2 pl-12">
          <label className="text-sm font-medium text-card-foreground">
            Age (in years)<span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            value={age}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || (Number(v) >= 0 && Number(v) <= 120)) {
                onAgeChange(v);
                if (v !== "0") onAgeInMonthsChange("");
              }
            }}
            className="w-[72px] text-center"
          />
        </div>

        {/* Age in months — only when age is 0 */}
        {age === "0" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Age (in months)<span className="text-destructive">*</span>
            </label>
            <Select value={ageInMonths} onValueChange={onAgeInMonthsChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {i} month{i !== 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Gender */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-card-foreground">
            Gender <span className="text-destructive">*</span>
          </label>
          <div className="flex gap-2">
            {genderOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onGenderChange(option)}
                className={`rounded-md px-5 py-2 text-sm font-medium transition-all duration-150 ${gender === option
                  ? "bg-[hsl(var(--answer-active))] text-[hsl(var(--answer-active-foreground))] shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PersonalInfoFields;
