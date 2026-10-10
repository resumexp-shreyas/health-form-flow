import { useRef, useState } from "react";
import axios from "axios";
import { FileText, Loader2, Sparkles, UploadCloud, X, AlertTriangle } from "lucide-react";
import { getHost } from "../assets/Karma";

export interface ExtractedPrefill {
  age: string | null;
  gender: string | null;
  tobacco: { answer: boolean | null; forms: string[] };
  alcohol: { answer: boolean | null };
  medicalConditions: { condition: string; yearOfDiagnosis: string | null; currentStatus: string | null }[];
  hospitalization: {
    types: string[];
    reasons: string[];
    reasonOther: string;
    yearsAgo: string;
    monthsAgo: string;
    outcome: string;
    outcomeOther: string;
    hasDischargeRecords: boolean | null;
  } | null;
  q5Text: string | null;
  disability: { answer: boolean | null; percentage: number | null; certificateProvided: boolean };
  pastInsurance: { answer: boolean | null; details: string | null };
  documents: { file_name: string | null; document_type: string | null; summary: string | null }[];
  warnings: string[];
}

interface RecordUploadProps {
  onPrefill: (prefill: ExtractedPrefill, files: File[]) => void;
}

const MAX_FILES = 8;
const MAX_BYTES = 20 * 1024 * 1024;
const ACCEPT = ".pdf,.jpg,.jpeg,.png,.tif,.tiff,.webp";

const RecordUpload = ({ onPrefill }: RecordUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractedPrefill | null>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setError(null);
    const next = [...files];
    for (const f of Array.from(list)) {
      if (f.size > MAX_BYTES) {
        setError(`${f.name} is larger than 20 MB.`);
        continue;
      }
      if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push(f);
    }
    if (next.length > MAX_FILES) {
      setError(`You can upload up to ${MAX_FILES} files at a time.`);
      next.length = MAX_FILES;
    }
    setFiles(next);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const extract = async () => {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      files.forEach((f) => body.append("files", f));
      const res = await axios.post(getHost() + "proposal/extractrecords/", body);
      const prefill: ExtractedPrefill = res.data.prefill;
      setResult(prefill);
      onPrefill(prefill, files);
    } catch (e: any) {
      setError(e?.response?.data?.error || "We could not read your records. Please try again or fill the form manually.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-violet-200 bg-violet-50/40 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-foreground">Save time: upload your medical records</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Discharge summaries, investigation reports, consultation notes or prescriptions (PDF or image). We read them and
            fill in as much of the form as we can. You can review and edit every answer before you submit.
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-violet-300 bg-white px-4 py-4 text-sm text-violet-700 transition-colors hover:bg-violet-50 disabled:opacity-50"
      >
        <UploadCloud className="h-4 w-4" />
        Choose files (up to {MAX_FILES}, 20 MB each)
      </button>

      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-1.5 text-xs">
              <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate">{f.name}</span>
              {!busy && (
                <button
                  type="button"
                  onClick={() => { setFiles(files.filter((_, idx) => idx !== i)); setResult(null); }}
                  aria-label={`Remove ${f.name}`}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <button
          type="button"
          onClick={extract}
          disabled={busy}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-violet-500 px-5 py-2 text-xs font-semibold text-white hover:bg-violet-600 disabled:opacity-50"
        >
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {busy ? "Reading your records…" : result ? "Re-read records" : "Read records & fill the form"}
        </button>
      )}

      {error && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-red-600">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {result && (
        <div className="mt-4 rounded-lg border border-violet-200 bg-white p-3 text-xs">
          <p className="font-medium text-foreground">Form pre-filled from your records. Please review every answer below.</p>
          <p className="mt-1 text-muted-foreground">
            Records only show what happened, so questions they don't cover are left for you to answer.
          </p>
          {result.documents.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-muted-foreground">
              {result.documents.map((d, i) => (
                <li key={i}>
                  <span className="font-medium text-foreground">{d.document_type || "Document"}</span>
                  {d.file_name ? ` (${d.file_name})` : ""}{d.summary ? `: ${d.summary}` : ""}
                </li>
              ))}
            </ul>
          )}
          {result.warnings.length > 0 && (
            <ul className="mt-2 list-disc space-y-0.5 pl-4 text-amber-700">
              {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default RecordUpload;
