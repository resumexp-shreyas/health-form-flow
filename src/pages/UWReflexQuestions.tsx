import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const UWReflexQuestions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const questions: string[] = location.state?.questions || [];
  const [answers, setAnswers] = useState<Record<number, string>>({});

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

  const updateAnswer = (index: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const allAnswered = questions.every((_, i) => answers[i]?.trim());

  const handleSubmit = () => {
    if (!allAnswered) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    toast.success("Answers submitted successfully!");
    console.log("UW Reflex answers:", answers);
  };

  return (
    <div className="min-h-screen bg-background">
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
          {questions.map((q, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-5 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                  {i + 1}
                </span>
                <div className="flex-1 space-y-3">
                  <p className="text-sm font-medium leading-relaxed text-card-foreground">
                    {q}
                  </p>
                  <Textarea
                    placeholder="Type your answer here..."
                    value={answers[i] || ""}
                    onChange={(e) => updateAnswer(i, e.target.value)}
                    rows={3}
                    className="resize-none border-border bg-muted/50 text-sm placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="rounded-lg bg-primary px-10 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Answers
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
