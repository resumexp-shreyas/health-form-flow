import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TobaccoDetailsProps {
  selectedForms: string[];
  onChange: (forms: string[]) => void;
}

const tobaccoOptions = ["Smoke", "Chew"];

const TobaccoDetails = ({ selectedForms, onChange }: TobaccoDetailsProps) => {
  const toggleOption = (option: string) => {
    if (selectedForms.includes(option)) {
      onChange(selectedForms.filter((f) => f !== option));
    } else {
      onChange([...selectedForms, option]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-card-foreground">
        In what form(s) do you consume tobacco?
      </p>
      <div className="flex gap-4">
        {tobaccoOptions.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox
              checked={selectedForms.includes(option)}
              onCheckedChange={() => toggleOption(option)}
            />
            <Label className="cursor-pointer text-sm text-card-foreground">
              {option}
            </Label>
          </label>
        ))}
      </div>
    </div>
  );
};

export default TobaccoDetails;
