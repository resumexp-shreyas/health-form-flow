import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fireAjax, getHost } from "../assets/Karma";

interface ReflexQuestion {
  question_sequence_number: number;
  question_text: string;
  answer_format: string;
  range_start: number | null;
  range_end: number | null;
  options: string[];
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ReflexQuestions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const questions: ReflexQuestion[] = location.state?.questions || [];
  const proposalObject: Record<string, any> = location.state?.proposalObject || {};
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No additional questions found.</p>
          <button
            onClick={() => navigate("/")}
            className="rounded-lg bg-[hsl(var(--answer-active))] px-6 py-2 text-sm font-semibold text-[hsl(var(--answer-active-foreground))] shadow-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const updateAnswer = (seq: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [seq]: value }));
  };

  const allAnswered = questions.every(
    (q) => answers[q.question_sequence_number]?.trim()
  );

  const handleSubmit = () => {
    if (!allAnswered) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    const collectedAnswers = questions.map((q) => ({
      question_sequence_number: q.question_sequence_number,
      question_text: q.question_text,
      answer: answers[q.question_sequence_number],
    }));

    setIsSubmitting(true);
    setApiError(null);

    fireAjax({
      url: getHost() + `proposal/SubmitAdditionalAnswers/`,
      method: "post",
      body: {
        ...proposalObject,
        additional_answers: collectedAnswers,
        proposal_id: localStorage.getItem("proposal_id") || proposalObject.proposal_id,
      },
      callBack: (result: any) => {
        setIsSubmitting(false);
        if (result?.data?.response) {
          const uwobject = result.data.response;
          const summaryDecisions = ["Decline", "Accept standard", "Accept with waiting period"];

          if (summaryDecisions.includes(uwobject.underwriting_decision)) {
            navigate("/summary", { state: { uwData: uwobject, proposal_id: localStorage.getItem("proposal_id") } });
          } else if (
            uwobject.underwriting_decision === "Refer to UWR" &&
            uwobject.refer_to_uwr_details?.suggested_questions?.length > 0
          ) {
            navigate("/uw-reflex-questions", { state: { uwData: uwobject } });
          } else if (
            uwobject.underwriting_decision === "Refer to UWR" &&
            uwobject.refer_to_uwr_details?.suggested_questions?.length < 1
          ) {
            navigate("/summary", { state: { uwData: uwobject, proposal_id: localStorage.getItem("proposal_id") } });           
          } else {
            setApiError(
              `Unexpected decision: "${uwobject.underwriting_decision}". Please contact support.`
            );
          }
        } else {
          setApiError("Submission failed. Please try again.");
        }
      },
    });
  };

  const renderAnswerInput = (q: ReflexQuestion) => {
    const seq = q.question_sequence_number;
    const value = answers[seq] || "";

    switch (q.answer_format) {
      case "Dropdown options":
        return (
          <Select value={value} onValueChange={(v) => updateAnswer(seq, v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {q.options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "Free text":
        return (
          <Textarea
            placeholder="Type your answer here..."
            value={value}
            maxLength={200}
            onChange={(e) => updateAnswer(seq, e.target.value)}
            className="min-h-[90px] resize-none border-border bg-muted/50 text-sm placeholder:text-muted-foreground/60"
          />
        );

      case "Yes/No":
        return (
          <div className="flex gap-2">
            {["Yes", "No"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateAnswer(seq, opt)}
                className={`rounded-md px-5 py-2 text-sm font-medium transition-all duration-150 ${value === opt
                    ? "bg-[hsl(var(--answer-active))] text-[hsl(var(--answer-active-foreground))] shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case "Years-month": {
        const parts = value.split("-");
        const selectedYear = parts[0] || "";
        const selectedMonth = parts[1] || "";
        const setYearMonth = (y: string, m: string) =>
          updateAnswer(seq, y && m ? `${y}-${m}` : y || m ? `${y}-${m}` : "");
        return (
          <div className="flex gap-3">
            <Select
              value={selectedYear}
              onValueChange={(v) => setYearMonth(v, selectedMonth)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedMonth}
              onValueChange={(v) => setYearMonth(selectedYear, v)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={m} value={String(i + 1).padStart(2, "0")}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }

      case "Number range": {
        const start = q.range_start ?? 0;
        const end = q.range_end ?? 100;
        const nums = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        return (
          <Select value={value} onValueChange={(v) => updateAnswer(seq, v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {nums.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      default:
        return (
          <Input
            placeholder="Type your answer..."
            value={value}
            onChange={(e) => updateAnswer(seq, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Additional Questions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Please answer the following questions to complete your assessment.
          </p>
        </div>

        <div className="space-y-4">
          {questions
            .sort((a, b) => a.question_sequence_number - b.question_sequence_number)
            .map((q, i) => (
              <div
                key={q.question_sequence_number}
                className="rounded-xl border border-border bg-card p-5 shadow-sm animate-fade-in"
                style={{
                  animationDelay: `${i * 0.08}s`,
                  animationFillMode: "both",
                }}
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {q.question_sequence_number}
                  </span>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-relaxed text-card-foreground">
                        {q.question_text}
                      </p>
                      {questions.length > 1 && (
                        <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                          {i + 1} of {questions.length}
                        </span>
                      )}
                    </div>
                    {renderAnswerInput(q)}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {apiError && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--answer-active))] px-10 py-3 text-sm font-semibold text-[hsl(var(--answer-active-foreground))] shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Submitting…" : "Submit & Continue"}
          </button>
          <button
            onClick={() => {
              toast.success("We'll call you back for details.");
              navigate("/");
            }}
            className="rounded-lg border border-border bg-card px-10 py-3 text-sm font-semibold text-muted-foreground shadow-sm transition-all hover:bg-muted active:scale-[0.98]"
          >
            Skip and call me back for details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReflexQuestions;
