import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MedicalHistoryData {
  condition: string;
  yearOfDiagnosis: string;
  currentStatus: string;
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

const MedicalHistoryDetails = ({ data, onChange }: MedicalHistoryDetailsProps) => {
  return (
    <div className="space-y-4">
      {/* Condition */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Specify condition(s)
        </label>
        <Input
          placeholder="E.g., Asthma, Thyroid disorder..."
          value={data.condition}
          onChange={(e) => onChange({ ...data, condition: e.target.value })}
          className="border-border bg-muted/50 text-sm placeholder:text-muted-foreground/60"
        />
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
};

export default MedicalHistoryDetails;
