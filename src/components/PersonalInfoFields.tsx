import { Input } from "@/components/ui/input";

interface PersonalInfoFieldsProps {
  age: string;
  gender: string;
  onAgeChange: (age: string) => void;
  onGenderChange: (gender: string) => void;
}

const genderOptions = ["Male", "Female", "Other"];

const PersonalInfoFields = ({
  age,
  gender,
  onAgeChange,
  onGenderChange,
}: PersonalInfoFieldsProps) => {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex gap-8">

        {/* Age */}
        <div className="w-1/2 space-y-2 pl-12">
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
              }
            }}
            className="w-[72px] text-center"
          />
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
