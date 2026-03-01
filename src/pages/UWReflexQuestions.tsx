import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { fireAjax, getHost } from "../assets/Karma";

interface UWQuestion {
  question_sequence_number: number;
  question_text: string;
  answer_format: string;
  range_start?: number | null;
  range_end?: number | null;
  options?: string[];
}

const UWReflexQuestions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const uwData = location.state?.uwData;
  const questions: UWQuestion[] =
    uwData?.refer_to_uwr_details?.suggested_questions || [];
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No additional questions found.</p>
          <button
            onClick={() => navigate("/")}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-sm"
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

    fireAjax({
      url: getHost() + `proposal/postUWQn/`,
      method: "post",
      body: { answers: collectedAnswers },
      callBack: (result: any) => {
        setIsSubmitting(false);
        if (result?.data) {
          toast.success("Answers submitted successfully!");
          navigate("/summary", { state: { uwData: uwData } });
        } else {
          toast.error("Submission failed. Please try again.");
        }
      },
    });
  };

  const renderInput = (q: UWQuestion) => {
    const seq = q.question_sequence_number;
    const value = answers[seq] || "";

    switch (q.answer_format) {
      case "Yes/No":
        return (
          <RadioGroup
            value={value}
            onValueChange={(v) => updateAnswer(seq, v)}
            className="flex gap-4"
          >
            {["Yes", "No"].map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`q${seq}-${opt}`} />
                <Label htmlFor={`q${seq}-${opt}`} className="text-sm cursor-pointer">
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "Number range": {
        const start = q.range_start ?? 0;
        const end = q.range_end ?? 100;
        return (
          <Input
            type="number"
            min={start}
            max={end}
            placeholder={`Enter a number (${start}–${end})`}
            value={value}
            onChange={(e) => updateAnswer(seq, e.target.value)}
            className="max-w-[200px]"
          />
        );
      }

      case "Years-month": {
        const parts = value.split("-");
        const yVal = parts[0] || "";
        const mVal = parts[1] || "";
        const set = (y: string, m: string) =>
          updateAnswer(seq, y || m ? `${y}-${m}` : "");
        return (
          <div className="flex gap-3">
            <Input
              type="number"
              min={0}
              placeholder="Years"
              value={yVal}
              onChange={(e) => set(e.target.value, mVal)}
              className="w-[100px]"
            />
            <Input
              type="number"
              min={0}
              max={11}
              placeholder="Months"
              value={mVal}
              onChange={(e) => set(yVal, e.target.value)}
              className="w-[100px]"
            />
          </div>
        );
      }

      case "Dropdown options":
        return (
          <Select value={value} onValueChange={(v) => updateAnswer(seq, v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {(q.options || []).map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "Free text":
      default:
        return (
          <Textarea
            placeholder="Type your answer here..."
            value={value}
            onChange={(e) => updateAnswer(seq, e.target.value)}
            rows={3}
            className="resize-none border-border bg-muted/50 text-sm placeholder:text-muted-foreground/60"
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
            Underwriter Questions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Please provide detailed answers to the following questions.
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
                    {renderInput(q)}
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-10 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Submitting…" : "Submit Answers"}
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

export default UWReflexQuestions;
