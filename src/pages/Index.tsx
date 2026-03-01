import { useState, useRef } from "react";
import { toast } from "sonner";
import ProposalQuestion from "@/components/ProposalQuestion";
import MedicalHistoryDetails, { type MedicalHistoryDetailsRef } from "@/components/MedicalHistoryDetails";
import HospitalizationDetails, { type HospitalizationData } from "@/components/HospitalizationDetails";
import DisabilityDetails, { type DisabilityData } from "@/components/DisabilityDetails";
import TobaccoDetails from "@/components/TobaccoDetails";
import PersonalInfoFields from "@/components/PersonalInfoFields";
import ProgressBar from "@/components/ProgressBar";
import { ShieldCheck, X, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import AmbiguousClarification, { type AmbiguousCondition } from "@/components/AmbiguousClarification";
import { fireAjax, getHost } from "../assets/Karma";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const lifestyleQuestions = [
  {
    category: "Tobacco Consumption",
    question: "Do you consume tobacco products?",
    detailPrompt: "",
  },
  {
    category: "Alcohol Consumption",
    question: "Do you consume alcohol?",
    detailPrompt: "",
  },
];

const questions = [
  {
    category: "Medical History",
    question:
      "Do you have any past or ongoing disease/ health conditions?",
    detailPrompt:
      "Please specify condition(s), year of diagnosis, and current status.",
  },
  {
    category: "Hospitalization & Surgery",
    question:
      "Have you ever been hospitalized, and/or undergone any surgical procedure in last 4 years and/or suggested to undergo in future?",
    detailPrompt: "Provide details (reason, date, outcome).",
  },
  {
    category: "Medication/ Investigations/ Symptoms/ Treatment",
    question:
      "Have you ever taken any medication and/ or has/ had any symptoms and /or suggested investigation or treatment or surgery in last 2 years or advised to undergo in future?",
    detailPrompt: "Name investigation/ medication/ symptom/ treatment",
  },
  {
    category: "Disability",
    question:
      "Do you have any disability?",
    detailPrompt: "",
  },
  {
    category: "Past insurance proposal history",
    question:
      "Has any proposal/ policy of life or health or critical illness insurance from any insurer declined, deferred, loaded, subject to any special condition such as exclusions?",
    detailPrompt: "Please provide details.",
  },
];

interface Answer {
  value: boolean | null;
  details: string;
}

interface MedicalHistoryData {
  condition: string;
  yearOfDiagnosis: Record<string, string>;
  currentStatus: Record<string, string>;
}

const Index = () => {
  const navigate = useNavigate();
  const medicalHistoryRef = useRef<MedicalHistoryDetailsRef>(null);
  const [age, setAge] = useState("");
  const [ageInMonths, setAgeInMonths] = useState("");
  const [gender, setGender] = useState("");
  const [lifestyleAnswers, setLifestyleAnswers] = useState<Answer[]>(
    lifestyleQuestions.map(() => ({ value: null, details: "" }))
  );
  const [tobaccoForms, setTobaccoForms] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Answer[]>(
    questions.map(() => ({ value: null, details: "" }))
  );
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryData>({
    condition: "",
    yearOfDiagnosis: {},
    currentStatus: {},
  });
  const [hospitalization, setHospitalization] = useState<HospitalizationData>({
    hospitalizationType: [],
    reasons: [],
    reasonOther: "",
    yearsAgo: "",
    monthsAgo: "",
    outcome: "",
    outcomeOther: "",
    hasDischargeRecords: null,
    uploadedFiles: [],
  });
  const [disability, setDisability] = useState<DisabilityData>({
    percentage: "",
    hasCertificate: null,
    certificateFile: null,
  });

  const [discrepancies, setDiscrepancies] = useState<string[]>([]);
  const [ambiguousConditions, setAmbiguousConditions] = useState<AmbiguousCondition[]>([]);
  const [gotClarity, setGotClarity] = useState<boolean>(false);

  // Auto-answer Q2 based on medical history current status
  const surgeryStatuses = [
    "I have a surgery planned",
    "I'm recovering from surgery",
  ];
  const statusValues = Object.values(medicalHistory.currentStatus);
  const hasSurgeryPlanned = statusValues.some(s => s === "I have a surgery planned");
  const hasRecoveringFromSurgery = statusValues.some(s => s === "I'm recovering from surgery");
  const isSurgeryRelated = hasSurgeryPlanned || hasRecoveringFromSurgery;

  const autoAnswerNote = isSurgeryRelated
    ? hasSurgeryPlanned
      ? "Answered Yes as we noted you have a planned surgery."
      : "Answered Yes as we noted you are recovering from surgery."
    : null;

  // Auto-select hospitalization type based on surgery status
  const autoHospitalizationType = (() => {
    const types: string[] = [];
    if (hasRecoveringFromSurgery) types.push("Past hospitalization");
    if (hasSurgeryPlanned) types.push("Planned hospitalization");
    return types;
  })();

  // Sync hospitalization type when surgery status changes
  const effectiveHospitalization = isSurgeryRelated
    ? { ...hospitalization, hospitalizationType: [...new Set([...hospitalization.hospitalizationType, ...autoHospitalizationType])] }
    : hospitalization;

  // Effective value for Q2 (index 1): force Yes if surgery-related
  const getEffectiveValue = (index: number) => {
    if (index === 1 && isSurgeryRelated) return true;
    return answers[index].value;
  };

  // Age-based logic
  const ageNum = age === "" ? null : Number(age);
  const isMinor = ageNum !== null && ageNum <= 18;

  // answered count
  const lifestyleAnswered = lifestyleAnswers.filter((a) => a.value !== null).length;
  const medicalAnswered = questions.filter((_, i) => getEffectiveValue(i) !== null).length;
  const answered = lifestyleAnswered + medicalAnswered;
  const totalQuestions = lifestyleQuestions.length + questions.length;

  // Auto-default lifestyle to No for minors on age blur
  const handleAgeBlur = () => {
    const num = age === "" ? null : Number(age);
    if (num !== null && num <= 18) {
      setLifestyleAnswers((prev) =>
        prev.map((a) => (a.value === null ? { ...a, value: false } : a))
      );
      setTobaccoForms([]);
    }
  };

  const updateLifestyleAnswer = (index: number, value: boolean) => {
    setLifestyleAnswers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], value };
      if (index === 0 && !value) {
        setTobaccoForms([]);
      }
      return next;
    });
  };

  const updateAnswer = (index: number, value: boolean) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], value, details: value ? next[index].details : "" };
      return next;
    });
    // Reset disability data when Q4 (Disability, index 3) is set to No
    if (index === 3 && !value) {
      setDisability({ percentage: "", hasCertificate: null, certificateFile: null });
    }
  };

  const updateDetails = (index: number, details: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], details };
      return next;
    });
  };


  /**
   * deriveUwObject(response)
   */
  function deriveUwObject(response) {
    if (response && typeof response === 'object') return response;
    if (typeof response !== 'string') {
      throw new Error('Unsupported response type');
    }
    let s = response.trim();
    const jsonPrefixMatch = s.match(/^\\s*json\\s*[:=]?\\s*/i);
    if (jsonPrefixMatch) {
      s = s.slice(jsonPrefixMatch[0].length).trim();
    }
    const firstBraceIndex = Math.min(
      ...['{', '[']
        .map(ch => s.indexOf(ch))
        .filter(idx => idx !== -1)
    );
    if (firstBraceIndex > 0) {
      s = s.slice(firstBraceIndex);
    }
    try {
      return JSON.parse(s);
    } catch (e) {
      const startChar = s[0];
      const endChar = startChar === '{' ? '}' : startChar === '[' ? ']' : null;
      if (!endChar) throw new Error('No JSON object or array found in response');
      let depth = 0;
      let inString: string | false = false;
      let escape = false;
      let endIndex = -1;
      for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (escape) { escape = false; continue; }
        if (ch === '\\\\') { escape = true; continue; }
        if (ch === '"' || ch === "'") {
          if (!inString) { inString = ch; } else if (inString === ch) { inString = false; }
          continue;
        }
        if (inString) continue;
        if (ch === startChar) depth++;
        else if (ch === endChar) {
          depth--;
          if (depth === 0) { endIndex = i; break; }
        }
      }
      if (endIndex === -1) throw new Error('Could not find balanced JSON substring');
      const candidate = s.slice(0, endIndex + 1);
      try { return JSON.parse(candidate); }
      catch (err2) { throw new Error('Failed to parse JSON: ' + err2.message); }
    }
  }

  const getClarity = {
    url: getHost() + `proposal/getclarity/`,
    method: "post",
    body: {},
    callBack: (result) => {
      console.log("Raw response:", result.data.response);
      const uwobject = result.data.response;
      console.log("uwobject:", uwobject);

      const hasDiscrepancies = uwobject.discrepancies_detected && uwobject.discrepancies_detected.length > 0;
      const hasAmbiguous = uwobject.ambiguous_conditions_to_clarify && uwobject.ambiguous_conditions_to_clarify.length > 0;

      if (hasDiscrepancies) {
        console.warn("Discrepancies detected:", uwobject.discrepancies_detected);
        setDiscrepancies(uwobject.discrepancies_detected.map((d: any) => d.clarification_question || d));
        toast.error("We detected some discrepancies in your answers. Please review your responses and submit again.");
      }

      if (hasAmbiguous) {
        console.warn("Ambiguous conditions to clarify:", uwobject.ambiguous_conditions_to_clarify);
        setAmbiguousConditions(uwobject.ambiguous_conditions_to_clarify);
        toast.info("Some conditions need clarification. Please review below.");
      }

      if (!hasDiscrepancies && !hasAmbiguous) {
        toast.success("Proposal submitted successfully!");
      }

      setGotClarity(true);
    },
    errorCallBack: (error) => {
      console.error("Error submitting proposal:", error);
      toast.error("An error occurred while submitting your proposal. Please try again later.");
    }
  };

  const postProposal = {
    url: getHost() + `proposal/submit/`,
    method: "post",
    body: {},
    callBack: (result) => {
      console.log("Raw response:", result.data.response);
      console.log("underwriting_decision:", result.data.response.underwriting_decision);
      const uwobject = result.data.response;
      console.log("uwobject:", uwobject);
      if (uwobject.underwriting_decision === "Ask more questions") {
        navigate(`/reflex-questions`, {
          state: { questions: uwobject.more_questions_details },
        });
      } else if (uwobject.underwriting_decision === "Accept") {
        toast.success("Congratulations! Your proposal has been accepted.");
      } else if (uwobject.underwriting_decision === "Reject") {
        toast.error("We regret to inform you that your proposal has been rejected.");
      } else if (uwobject.underwriting_decision === "Refer to UWR" && uwobject.refer_to_uwr_details.suggested_questions && uwobject.refer_to_uwr_details.suggested_questions.length > 0) {
        navigate(`/uw-reflex-questions`, {
          state: { questions: uwobject.refer_to_uwr_details.suggested_questions },
        });
      }
    },
    errorCallBack: (error) => {
      console.error("Error submitting proposal:", error);
      toast.error("An error occurred while submitting your proposal. Please try again later.");
    }
  };

  const handleSubmit = () => {
    medicalHistoryRef.current?.flushPendingInput();

    if (!age.trim() || !gender) {
      toast.error("Please provide your age and gender.");
      return;
    }
    if (age === "0" && !ageInMonths) {
      toast.error("Please select age in months.");
      return;
    }

    const incompleteParentIndices = new Map<number, { label: string; questionText: string }>();

    // Check lifestyle questions
    lifestyleQuestions.forEach((q, i) => {
      if (lifestyleAnswers[i].value === null) {
        incompleteParentIndices.set(i, { label: `Question ${i + 1}`, questionText: q.question });
      }
    });

    // Tobacco sub-question
    if (lifestyleAnswers[0].value === true && tobaccoForms.length === 0) {
      incompleteParentIndices.set(0, { label: "Question 1", questionText: lifestyleQuestions[0].question });
    }

    // Check unanswered medical main questions
    const offset = lifestyleQuestions.length;
    questions.forEach((q, i) => {
      if (getEffectiveValue(i) === null) {
        incompleteParentIndices.set(offset + i, { label: `Question ${offset + i + 1}`, questionText: q.question });
      }
    });

    // Q1 (medical index 0) sub-questions
    if (getEffectiveValue(0) === true) {
      const conditions = medicalHistory.condition.split("||").filter(Boolean);
      const allYearsFilled = conditions.length > 0 && conditions.every(c => medicalHistory.yearOfDiagnosis[c]);
      const allStatusFilled = conditions.length > 0 && conditions.every(c => medicalHistory.currentStatus[c]);
      if (!medicalHistory.condition.trim() || !allYearsFilled || !allStatusFilled) {
        incompleteParentIndices.set(offset + 0, { label: `Question ${offset + 1}`, questionText: questions[0].question });
      }
    }

    // Q2 (medical index 1) hospitalization sub-questions — only reasons is mandatory now
    if (getEffectiveValue(1) === true) {
      if (effectiveHospitalization.hospitalizationType.length === 0) {
        incompleteParentIndices.set(offset + 1, { label: `Question ${offset + 2}`, questionText: questions[1].question });
      }
      if (effectiveHospitalization.reasons.length === 0) {
        incompleteParentIndices.set(offset + 1, { label: `Question ${offset + 2}`, questionText: questions[1].question });
      }
      if (effectiveHospitalization.reasons.includes("Other (please specify)") && !effectiveHospitalization.reasonOther.trim()) {
        incompleteParentIndices.set(offset + 1, { label: `Question ${offset + 2}`, questionText: questions[1].question });
      }
      // When "Past hospitalization" is selected, timing and outcome are mandatory
      if (effectiveHospitalization.hospitalizationType.includes("Past hospitalization")) {
        if (!effectiveHospitalization.yearsAgo && !effectiveHospitalization.monthsAgo) {
          incompleteParentIndices.set(offset + 1, { label: `Question ${offset + 2}`, questionText: questions[1].question });
        }
        if (!effectiveHospitalization.outcome) {
          incompleteParentIndices.set(offset + 1, { label: `Question ${offset + 2}`, questionText: questions[1].question });
        }
        if (effectiveHospitalization.outcome === "Other (please specify)" && !effectiveHospitalization.outcomeOther.trim()) {
          incompleteParentIndices.set(offset + 1, { label: `Question ${offset + 2}`, questionText: questions[1].question });
        }
      }
      if (!effectiveHospitalization.hospitalizationType.includes("Past hospitalization") && effectiveHospitalization.outcome === "Other (please specify)" && !effectiveHospitalization.outcomeOther.trim()) {
        incompleteParentIndices.set(offset + 1, { label: `Question ${offset + 2}`, questionText: questions[1].question });
      }
    }

    // Q3 (medical index 2) - text details required
    if (getEffectiveValue(2) === true && answers[2].details.trim() === "") {
      incompleteParentIndices.set(offset + 2, { label: `Question ${offset + 3}`, questionText: questions[2].question });
    }

    // Q4 (medical index 3) - Disability: percentage required when Yes
    if (getEffectiveValue(3) === true) {
      if (!disability.percentage || disability.hasCertificate === null) {
        incompleteParentIndices.set(offset + 3, { label: `Question ${offset + 4}`, questionText: questions[3].question });
      }
    }

    // Q5 (medical index 4) - Past insurance: details required when Yes
    if (getEffectiveValue(4) === true && answers[4].details.trim() === "") {
      incompleteParentIndices.set(offset + 4, { label: `Question ${offset + 5}`, questionText: questions[4].question });
    }

    if (incompleteParentIndices.size > 1) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    if (incompleteParentIndices.size === 1) {
      const entry = Array.from(incompleteParentIndices.values())[0];
      toast.error(`Please answer ${entry.label} and it's sub-questions before submitting.`);
      return;
    }
    if (gotClarity) {
      toast.success("Proposal submitted successfully!");
    }

    const conditionsList = medicalHistory.condition.split("||").filter(Boolean);
    let medicalHistoryUsable = {
      "Medical condition": medicalHistory.condition,
      "Year Of diagnosis": conditionsList.map(c => `${c}: ${medicalHistory.yearOfDiagnosis[c] || "N/A"}`).join("; "),
      "Current Status": conditionsList.map(c => `${c}: ${medicalHistory.currentStatus[c] || "N/A"}`).join("; ")
    };

    let hospitalizationUsable = {
      "Type of hospitalization": effectiveHospitalization.hospitalizationType.join(", ") || "N/A",
      "Reason(s) for hospitalization/surgery": effectiveHospitalization.reasons.map(r => r === "Other, specified separately" && effectiveHospitalization.reasonOther ? effectiveHospitalization.reasonOther : r).join(", "),
      "Time since hospitalization/surgery": effectiveHospitalization.yearsAgo || effectiveHospitalization.monthsAgo ? `${effectiveHospitalization.yearsAgo || "0"} year(s) and ${effectiveHospitalization.monthsAgo || "0"} month(s) ago` : "N/A",
      "Outcome": effectiveHospitalization.outcome ? (effectiveHospitalization.outcome + (effectiveHospitalization.outcome === "Other (please specify)" ? ` (${effectiveHospitalization.outcomeOther})` : "")) : "N/A",
      "Has discharge records": effectiveHospitalization.hasDischargeRecords === true ? "Yes" : effectiveHospitalization.hasDischargeRecords === false ? "No" : "N/A",
      "Past medical records uploaded": effectiveHospitalization.uploadedFiles.length > 0 ? "Yes" : "No"
    };

    let disabilityUsable = {
      "Percentage of disability": disability.percentage ? `${disability.percentage}%` : "N/A",
      "Disability certificate available": disability.hasCertificate === true ? "Yes" : disability.hasCertificate === false ? "No" : "N/A",
      "Certificate uploaded": disability.certificateFile ? "Yes" : "No",
    };

    let proposal_object: Record<string, any> = {
      age, gender,
      ...(age === "0" ? { ageInMonths } : {}),
      lifestyle: [
        {
          question: lifestyleQuestions[0].question,
          answer: lifestyleAnswers[0].value === true ? "Yes" : "No",
          ...(lifestyleAnswers[0].value === true ? { details: { "Tobacco form(s)": tobaccoForms.join(", ") } } : {}),
        },
        {
          question: lifestyleQuestions[1].question,
          answer: lifestyleAnswers[1].value === true ? "Yes" : "No",
        },
      ],
      answers: answers.map((a, i) => ({
        question: questions[i].question,
        answer: getEffectiveValue(i) === true ? "Yes" : "No",
        ...(getEffectiveValue(i) === true && questions[i].category === "Medication/ Investigations/ Symptoms/ Treatment" ? { details: a.details } : {}),
        ...(getEffectiveValue(i) === true && questions[i].category === "Medical History" ? { details: medicalHistoryUsable } : {}),
        ...(getEffectiveValue(i) === true && questions[i].category === "Hospitalization & Surgery" ? { details: hospitalizationUsable } : {}),
        ...(getEffectiveValue(i) === true && questions[i].category === "Disability" ? { details: disabilityUsable } : {}),
        ...(getEffectiveValue(i) === true && questions[i].category === "Past insurance proposal history" ? { details: a.details } : {}),
      }))
    };

    gotClarity ? fireAjax({ ...postProposal, body: proposal_object }) : fireAjax({ ...getClarity, body: proposal_object });
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
          <ProgressBar answered={answered} total={totalQuestions} />
        </div>

        {/* Answer No for all */}
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-border bg-card px-5 py-3">
          <Switch
            id="answer-no-all"
            checked={
              lifestyleAnswers.every((a) => a.value === false) &&
              answers.every((_, i) => getEffectiveValue(i) === false)
            }
            onCheckedChange={(checked) => {
              if (checked) {
                setLifestyleAnswers((prev) => prev.map(() => ({ value: false, details: "" })));
                setTobaccoForms([]);
                setAnswers((prev) => prev.map(() => ({ value: false, details: "" })));
              } else {
                setLifestyleAnswers((prev) => prev.map(() => ({ value: null, details: "" })));
                setTobaccoForms([]);
                setAnswers((prev) => prev.map(() => ({ value: null, details: "" })));
              }
            }}
          />
          <Label htmlFor="answer-no-all" className="text-sm font-medium text-card-foreground cursor-pointer">
            Answer No for all questions
          </Label>
        </div>

        {/* Personal Info */}
        <PersonalInfoFields
          age={age}
          gender={gender}
          ageInMonths={ageInMonths}
          onAgeChange={setAge}
          onGenderChange={setGender}
          onAgeInMonthsChange={setAgeInMonths}
          onAgeBlur={handleAgeBlur}
        />

        {/* Lifestyle Questions */}
        <div className="space-y-4">
          {lifestyleQuestions.map((q, i) => (
            <ProposalQuestion
              key={`lifestyle-${i}`}
              number={i + 1}
              category={q.category}
              question={q.question}
              detailPrompt={q.detailPrompt}
              value={lifestyleAnswers[i].value}
              details=""
              onAnswer={(v) => updateLifestyleAnswer(i, v)}
              onDetailsChange={() => { }}
              {...(i === 0 && {
                customDetails: (
                  <TobaccoDetails
                    selectedForms={tobaccoForms}
                    onChange={setTobaccoForms}
                  />
                ),
              })}
              {...(i === 1 && { hideDetails: true })}
            />
          ))}
        </div>

        {/* Medical Questions */}
        <div className="mt-4 space-y-4">
          {questions.map((q, i) => (
            <ProposalQuestion
              key={`medical-${i}`}
              number={lifestyleQuestions.length + i + 1}
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
                    ref={medicalHistoryRef}
                    data={medicalHistory}
                    onChange={setMedicalHistory}
                    age={age}
                  />
                ),
              })}
              {...(i === 1 && {
                customDetails: (
                  <HospitalizationDetails
                    data={effectiveHospitalization}
                    onChange={setHospitalization}
                    gender={gender}
                    disabledTypes={autoHospitalizationType}
                  />
                ),
              })}
              {...(i === 3 && {
                customDetails: (
                  <DisabilityDetails
                    data={disability}
                    onChange={setDisability}
                  />
                ),
              })}
            />
          ))}
        </div>

        <div>
          {discrepancies.length > 0 && (
            <div className="mb-4 rounded-xl border border-purple-200 bg-white p-4 text-sm shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                {/* <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100">
                  <AlertTriangle className="h-3.5 w-3.5 text-purple-600" />
                </div> */}
                <p className="font-semibold text-gray-900 tracking-wide text-xs uppercase">
                  Discrepancies Detected
                </p>
                <span className="ml-auto text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5">
                  {discrepancies.length}
                </span>
              </div>

              <ul className="space-y-2">
                {discrepancies.map((d, i) => (
<li
  key={i}
  className="flex items-start justify-between gap-2 rounded-lg border border-red-100 bg-red-50/50 p-3 transition-colors hover:bg-red-50"
>
                    <div className="flex gap-2 flex-1 items-start">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span className="text-gray-800 leading-snug">{d}</span>
                    </div>
                    <button
                      onClick={() => setDiscrepancies((prev) => prev.filter((_, idx) => idx !== i))}
                      className="shrink-0 rounded-full p-1 bg-gray-200 hover:bg-gray-900 transition-colors"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5 text-red-500 stroke-[2.5]" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Submit */}
        {/* Ambiguous Condition Clarification */}
        {ambiguousConditions.length > 0 && (
          <AmbiguousClarification
            items={ambiguousConditions}
            onConfirm={(selections) => {
              // Replace disclosed_term with selected standard term in medical history state
              setMedicalHistory((prev) => {
                const oldChips = prev.condition.split("||").filter(Boolean);
                const newChips = oldChips.map((chip) =>
                  selections[chip] !== undefined ? selections[chip] : chip
                );
                const newYears: Record<string, string> = {};
                const newStatus: Record<string, string> = {};
                for (const oldChip of oldChips) {
                  const newChip = selections[oldChip] !== undefined ? selections[oldChip] : oldChip;
                  if (prev.yearOfDiagnosis[oldChip]) newYears[newChip] = prev.yearOfDiagnosis[oldChip];
                  if (prev.currentStatus[oldChip]) newStatus[newChip] = prev.currentStatus[oldChip];
                }
                return {
                  condition: newChips.join("||"),
                  yearOfDiagnosis: newYears,
                  currentStatus: newStatus,
                };
              });
              setAmbiguousConditions([]);
              setGotClarity(true);
              toast.success("Conditions clarified. You can now submit.");
            }}
          />
        )}

        {/* Submit */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={discrepancies.length > 0 || ambiguousConditions.length > 0}
            className="rounded-lg bg-[hsl(var(--answer-active))] px-10 py-3 text-sm font-semibold text-[hsl(var(--answer-active-foreground))] shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
