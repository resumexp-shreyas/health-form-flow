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
      <div className="flex gap-8">

        {/* Age */}
        <div className="w-1/2 space-y-2 pl-12">
          <label className="text-sm font-medium text-card-foreground">
            Age (in years)<span className="text-destructive">*</span>
          </label>
          <div className="flex items-center gap-4">
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
            {age === "0" && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-card-foreground whitespace-nowrap">
                  Age (in months)<span className="text-destructive">*</span>
                </label>
                <Select value={ageInMonths} onValueChange={onAgeInMonthsChange}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Months" />
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
          </div>
        </div>

        {/* Gender */}
        <div className="w-1/2 space-y-2">
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
