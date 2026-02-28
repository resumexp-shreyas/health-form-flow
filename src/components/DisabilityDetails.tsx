import { useRef } from "react";
import { FileText, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DisabilityData {
  percentage: string;
  hasCertificate: boolean | null;
  certificateFile: File | null;
}

interface DisabilityDetailsProps {
  data: DisabilityData;
  onChange: (data: DisabilityData) => void;
}

const percentageOptions = [...Array.from({ length: 101 }, (_, i) => String(i)), "I do not know/ do not remember"];

const DisabilityDetails = ({ data, onChange }: DisabilityDetailsProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-4">
      {/* Percentage of disability */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Percentage of disability
        </label>
        <Select
          value={data.percentage}
          onValueChange={(v) => onChange({ ...data, percentage: v })}
        >
          <SelectTrigger className="w-32 border-border bg-muted/50 text-sm">
            <SelectValue placeholder="Select %" />
          </SelectTrigger>
          <SelectContent>
            {percentageOptions.map((p) => (
              <SelectItem key={p} value={p}>
                {p}%
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Disability certificate */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground">
          Is disability certificate available?
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...data, hasCertificate: true })}
            className={`rounded-md px-5 py-2 text-sm font-medium transition-all duration-150 ${
              data.hasCertificate === true
                ? "bg-[hsl(var(--answer-active))] text-[hsl(var(--answer-active-foreground))] shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...data, hasCertificate: false, certificateFile: null })}
            className={`rounded-md px-5 py-2 text-sm font-medium transition-all duration-150 ${
              data.hasCertificate === false
                ? "bg-[hsl(var(--answer-active))] text-[hsl(var(--answer-active-foreground))] shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            No
          </button>
        </div>

        {data.hasCertificate === true && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors">
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {data.certificateFile?.name || "Choose a file..."}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  ref={fileInputRef}
                  onChange={(e) =>
                    onChange({ ...data, certificateFile: e.target.files?.[0] || null })
                  }
                />
              </label>
              {data.certificateFile && (
                <button
                  type="button"
                  onClick={() => onChange({ ...data, certificateFile: null })}
                  className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisabilityDetails;
