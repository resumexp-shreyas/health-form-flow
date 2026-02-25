import { useState } from "react";
import { toast } from "sonner";
import ProposalQuestion from "@/components/ProposalQuestion";
import MedicalHistoryDetails from "@/components/MedicalHistoryDetails";
import HospitalizationDetails, { type HospitalizationData } from "@/components/HospitalizationDetails";
import PersonalInfoFields from "@/components/PersonalInfoFields";
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

interface MedicalHistoryData {
  condition: string;
  yearOfDiagnosis: string;
  currentStatus: string;
}

const Index = () => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [answers, setAnswers] = useState<Answer[]>(
    questions.map(() => ({ value: null, details: "" }))
  );
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryData>({
    condition: "",
    yearOfDiagnosis: "",
    currentStatus: "",
  });
  const [hospitalization, setHospitalization] = useState<HospitalizationData>({
    reasons: [],
    reasonOther: "",
    yearsAgo: "",
    monthsAgo: "",
    outcome: "",
    outcomeOther: "",
    hasDischargeRecords: null,
    uploadedFiles: [],
  });

  // Auto-answer Q2 based on medical history current status
  const surgeryStatuses = [
    "I have a surgery planned",
    "I'm recovering from surgery",
  ];
  const isSurgeryRelated = surgeryStatuses.includes(medicalHistory.currentStatus);

  const autoAnswerNote = isSurgeryRelated
    ? medicalHistory.currentStatus === "I have a surgery planned"
      ? "Answered Yes as we noted you have a planned surgery."
      : "Answered Yes as we noted you are recovering from surgery."
    : null;

  // Effective value for Q2: force Yes if surgery-related
  const getEffectiveValue = (index: number) => {
    if (index === 1 && isSurgeryRelated) return true;
    return answers[index].value;
  };

  // answered count uses effective values
  const answered = questions.filter((_, i) => getEffectiveValue(i) !== null).length;

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
    if (!age.trim() || !gender) {
      toast.error("Please provide your age and gender.");
      return;
    }
    const unanswered = questions.some((_, i) => getEffectiveValue(i) === null);
    if (unanswered) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    // Check Q1 medical history structured fields
    if (getEffectiveValue(0) === true) {
      if (!medicalHistory.condition.trim() || !medicalHistory.yearOfDiagnosis || !medicalHistory.currentStatus) {
        toast.error("Please complete all Medical History sub-questions.");
        return;
      }
    }
    // Check Q2 hospitalization structured fields
    if (getEffectiveValue(1) === true) {
      if (
        hospitalization.reasons.length === 0 ||
        !hospitalization.yearsAgo ||
        !hospitalization.monthsAgo ||
        !hospitalization.outcome
      ) {
        toast.error("Please complete all Hospitalization & Surgery sub-questions.");
        return;
      }
      if (hospitalization.reasons.includes("Other (please specify)") && !hospitalization.reasonOther.trim()) {
        toast.error("Please specify the other reason for hospitalization.");
        return;
      }
      if (hospitalization.outcome === "Other (please specify)" && !hospitalization.outcomeOther.trim()) {
        toast.error("Please specify the other outcome.");
        return;
      }
    }
    // Check Q3-Q4 details
    const yesWithoutDetails = answers.some(
      (a, i) => i > 1 && getEffectiveValue(i) === true && a.details.trim() === ""
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

        {/* Personal Info */}
        <PersonalInfoFields
          age={age}
          gender={gender}
          onAgeChange={setAge}
          onGenderChange={setGender}
        />

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((q, i) => (
            <ProposalQuestion
              key={i}
              number={i + 1}
              category={q.category}
              question={q.question}
              detailPrompt={q.detailPrompt}
              value={getEffectiveValue(i)}
              details={answers[i].details}
              onAnswer={(v) => updateAnswer(i, v)}
              onDetailsChange={(d) => updateDetails(i, d)}
              disabled={i === 1 && isSurgeryRelated}
              note={i === 1 ? autoAnswerNote : undefined}
              {...(i === 0 && {
                customDetails: (
                  <MedicalHistoryDetails
                    data={medicalHistory}
                    onChange={setMedicalHistory}
                  />
                ),
              })}
              {...(i === 1 && {
                customDetails: (
                  <HospitalizationDetails
                    data={hospitalization}
                    onChange={setHospitalization}
                  />
                ),
              })}
            />
          ))}
        </div>

        {/* Submit */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-[hsl(var(--answer-active))] px-10 py-3 text-sm font-semibold text-[hsl(var(--answer-active-foreground))] shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
