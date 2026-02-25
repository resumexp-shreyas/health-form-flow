import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface ProposalQuestionProps {
  number: number;
  category: string;
  question: string;
  detailPrompt: string;
  value: boolean | null;
  details: string;
  onAnswer: (answer: boolean) => void;
  onDetailsChange: (details: string) => void;
}

const ProposalQuestion = ({
  number,
  category,
  question,
  detailPrompt,
  value,
  details,
  onAnswer,
  onDetailsChange,
}: ProposalQuestionProps) => {
  return (
    <div className="rounded-lg border border-border bg-card p-5 transition-all duration-200">
      <div className="flex items-start gap-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
          {number}
        </span>
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {category}
            </p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-card-foreground">
              {question}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAnswer(true)}
              className={`rounded-md px-5 py-2 text-sm font-medium transition-all duration-150 ${
                value === true
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => onAnswer(false)}
              className={`rounded-md px-5 py-2 text-sm font-medium transition-all duration-150 ${
                value === false
                  ? "bg-success text-success-foreground shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              No
            </button>
          </div>

          {value === true && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <Textarea
                placeholder={detailPrompt}
                value={details}
                onChange={(e) => onDetailsChange(e.target.value)}
                className="mt-1 min-h-[90px] resize-none border-border bg-muted/50 text-sm placeholder:text-muted-foreground/60"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalQuestion;
