import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Plus, FileText, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface HospitalizationData {
  reasons: string[];
  reasonOther: string;
  yearsAgo: string;
  monthsAgo: string;
  outcome: string;
  outcomeOther: string;
  hasDischargeRecords: boolean | null;
  uploadedFiles: File[];
}

interface HospitalizationDetailsProps {
  data: HospitalizationData;
  onChange: (data: HospitalizationData) => void;
}

const reasonOptions = [
  "Accident or injury (fracture, trauma)",
  "Appendicitis / appendectomy",
  "Childbirth / delivery",
  "Heart problem (heart attack, chest pain, angina)",
  "Stroke or neurological event",
  "Respiratory infection / pneumonia",
  "Severe infection / sepsis",
  "Gastrointestinal illness (ulcer, bleeding, severe gastritis)",
  "Abdominal surgery (e.g., bowel surgery)",
  "Kidney problem / urinary tract complication",
  "Liver problem / hepatitis",
  "Diabetes complication (e.g., diabetic ketoacidosis)",
  "Cancer treatment or complication",
  "Planned elective surgery (orthopaedic, ENT, etc.)",
  "Emergency surgery (unscheduled)",
  "Mental health admission (depression, psychosis)",
  "Observation for chest pain / short stay",
  "Post‑operative complication / re‑admission",
  "Diagnostic admission for tests / investigations",
  "Other (please specify)",
];

const outcomeOptions = [
  "Fully recovered, no ongoing issues",
  "Recovered but with lasting effects",
  "Improved and stable with ongoing follow‑up",
  "Still under treatment / receiving medication",
  "Ongoing symptoms / not yet recovered",
  "Complication or re‑admission after discharge",
  "Permanent disability or impairment",
  "Transferred to long‑term care / rehabilitation",
  "Deceased (historical record)",
  "Unknown / prefer not to say",
  "Other (please specify)",
];

const yearsOptions = Array.from({ length: 12 }, (_, i) =>
  i === 11 ? "10+" : String(i)
);
const monthsOptions = Array.from({ length: 12 }, (_, i) => String(i));

const HospitalizationDetails = ({ data, onChange }: HospitalizationDetailsProps) => {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const toggleReason = (reason: string) => {
    const next = data.reasons.includes(reason)
      ? data.reasons.filter((r) => r !== reason)
      : [...data.reasons, reason];
    const update: HospitalizationData = { ...data, reasons: next };
    if (!next.includes("Other (please specify)")) {
      update.reasonOther = "";
    }
    onChange(update);
  };

  const handleFileChange = (index: number, file: File | null) => {
    if (!file) return;
    const next = [...data.uploadedFiles];
    next[index] = file;
    onChange({ ...data, uploadedFiles: next });
  };

  const addFileSlot = () => {
    onChange({ ...data, uploadedFiles: [...data.uploadedFiles, undefined as unknown as File] });
  };

  const removeFile = (index: number) => {
    const next = data.uploadedFiles.filter((_, i) => i !== index);
    onChange({ ...data, uploadedFiles: next });
  };

  return (
    <div className="space-y-4">
      {/* Reasons - multi-select checkboxes */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Reason (medical condition) — select all that apply
        </label>
        <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-md border border-border bg-muted/50 p-3">
          {reasonOptions.map((reason) => (
            <div key={reason} className="flex items-center gap-2">
              <Checkbox
                id={`reason-${reason}`}
                checked={data.reasons.includes(reason)}
                onCheckedChange={() => toggleReason(reason)}
              />
              <Label
                htmlFor={`reason-${reason}`}
                className="text-sm font-normal leading-tight text-card-foreground cursor-pointer"
              >
                {reason}
              </Label>
            </div>
          ))}
        </div>
        {data.reasons.includes("Other (please specify)") && (
          <Input
            placeholder="Specify other reason..."
            value={data.reasonOther}
            onChange={(e) => onChange({ ...data, reasonOther: e.target.value })}
            className="mt-1 border-border bg-muted/50 text-sm placeholder:text-muted-foreground/60"
          />
        )}
      </div>

      {/* When */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          When were you hospitalized?
        </label>
        <div className="flex items-center gap-2">
          <Select
            value={data.yearsAgo}
            onValueChange={(v) => onChange({ ...data, yearsAgo: v })}
          >
            <SelectTrigger className="w-24 border-border bg-muted/50 text-sm">
              <SelectValue placeholder="Years" />
            </SelectTrigger>
            <SelectContent>
              {yearsOptions.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">Years and </span>
          <Select
            value={data.monthsAgo}
            onValueChange={(v) => onChange({ ...data, monthsAgo: v })}
          >
            <SelectTrigger className="w-24 border-border bg-muted/50 text-sm">
              <SelectValue placeholder="Months" />
            </SelectTrigger>
            <SelectContent>
              {monthsOptions.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground"> Months ago</span>
        </div>
      </div>

      {/* Outcome */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Outcome
        </label>
        <Select
          value={data.outcome}
          onValueChange={(v) => onChange({ ...data, outcome: v })}
        >
          <SelectTrigger className="border-border bg-muted/50 text-sm">
            <SelectValue placeholder="Select outcome" />
          </SelectTrigger>
          <SelectContent>
            {outcomeOptions.map((o) => (
              <SelectItem key={o} value={o}>{o}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {data.outcome === "Other (please specify)" && (
          <Input
            placeholder="Specify other outcome..."
            value={data.outcomeOther}
            onChange={(e) => onChange({ ...data, outcomeOther: e.target.value })}
            className="mt-1 border-border bg-muted/50 text-sm placeholder:text-muted-foreground/60"
          />
        )}
      </div>
      {/* Discharge Summary */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground">
          Do you have discharge summary or any past medical records related to this hospitalization?
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...data, hasDischargeRecords: true, uploadedFiles: data.uploadedFiles.length === 0 ? [undefined as unknown as File] : data.uploadedFiles })}
            className={`rounded-md px-5 py-2 text-sm font-medium transition-all duration-150 ${
              data.hasDischargeRecords === true
                ? "bg-[hsl(var(--answer-active))] text-[hsl(var(--answer-active-foreground))] shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...data, hasDischargeRecords: false, uploadedFiles: [] })}
            className={`rounded-md px-5 py-2 text-sm font-medium transition-all duration-150 ${
              data.hasDischargeRecords === false
                ? "bg-[hsl(var(--answer-active))] text-[hsl(var(--answer-active-foreground))] shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            No
          </button>
        </div>

        {data.hasDischargeRecords === true && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
            {data.uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2">
                <label
                  className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {file?.name || "Choose a file..."}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    ref={(el) => { fileInputRefs.current[index] = el; }}
                    onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFileSlot}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              <Plus className="h-4 w-4" />
              Upload more document
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalizationDetails;
