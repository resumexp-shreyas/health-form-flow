import { useState } from "react";
import { toast } from "sonner";
import ProposalQuestion from "@/components/ProposalQuestion";
import ProgressBar from "@/components/ProgressBar";
import { ShieldCheck } from "lucide-react";

const questions = [
  {
    category: "Medical History",
    question:
      "Have you been diagnosed with or suffered from any medical condition in the last 4 years?",
    detailPrompt:
      "Please specify condition(s), year of diagnosis, and current status.",
  },
  {
    category: "Hospitalization & Surgery",
    question:
      "Have you ever been hospitalized, undergone surgery, or do you have any planned surgical procedures?",
    detailPrompt: "Provide details (reason, date, outcome).",
  },
  {
    category: "Investigations & Tests",
    question:
      "Have you undergone any major medical investigations (MRI, CT scan, biopsy) in the last 2 years?",
    detailPrompt: "Mention type of test and findings.",
  },
  {
    category: "Chronic or Severe Conditions",
    question:
      "Have you ever suffered from any severe or chronic medical condition (e.g., cancer, heart disease, diabetes) that is now cured or under treatment?",
    detailPrompt:
      "Provide condition, treatment received, and current status.",
  },
];

interface Answer {
  value: boolean | null;
  details: string;
}

const Index = () => {
  const [answers, setAnswers] = useState<Answer[]>(
    questions.map(() => ({ value: null, details: "" }))
  );

  const answered = answers.filter((a) => a.value !== null).length;

  const updateAnswer = (index: number, value: boolean) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], value, details: value ? next[index].details : "" };
      return next;
    });
  };

  const updateDetails = (index: number, details: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], details };
      return next;
    });
  };

  const handleSubmit = () => {
    const unanswered = answers.some((a) => a.value === null);
    if (unanswered) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    const yesWithoutDetails = answers.some(
      (a) => a.value === true && a.details.trim() === ""
    );
    if (yesWithoutDetails) {
      toast.error("Please provide details for all 'Yes' answers.");
      return;
    }
    toast.success("Proposal submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Health Insurance Proposal Form
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Please answer the following questions accurately to proceed with your application.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <ProgressBar answered={answered} total={questions.length} />
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((q, i) => (
            <ProposalQuestion
              key={i}
              number={i + 1}
              category={q.category}
              question={q.question}
              detailPrompt={q.detailPrompt}
              value={answers[i].value}
              details={answers[i].details}
              onAnswer={(v) => updateAnswer(i, v)}
              onDetailsChange={(d) => updateDetails(i, d)}
            />
          ))}
        </div>

        {/* Submit */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-primary px-10 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
