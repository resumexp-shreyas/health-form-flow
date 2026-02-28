import { useState, useRef } from "react";
import { toast } from "sonner";
import ProposalQuestion from "@/components/ProposalQuestion";
import MedicalHistoryDetails, { type MedicalHistoryDetailsRef } from "@/components/MedicalHistoryDetails";
import HospitalizationDetails, { type HospitalizationData } from "@/components/HospitalizationDetails";
import PersonalInfoFields from "@/components/PersonalInfoFields";
import ProgressBar from "@/components/ProgressBar";
import { ShieldCheck } from "lucide-react";
import { fireAjax, getHost } from "../assets/Karma";
import axios from "axios";
import { useNavigate } from "react-router-dom";


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
  const navigate = useNavigate();
  const medicalHistoryRef = useRef<MedicalHistoryDetailsRef>(null);
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



/**
 * deriveUwObject(response)
 * - Accepts a string (possibly prefixed with the word "json" or other noise)
 *   or an already-parsed object.
 * - Returns a JavaScript object parsed from the JSON content, or throws an Error.
 */
function deriveUwObject(response) {
  // If it's already an object, return it directly
  if (response && typeof response === 'object') return response;

  if (typeof response !== 'string') {
    throw new Error('Unsupported response type');
  }

  // Trim whitespace
  let s = response.trim();

  // If the string starts with the literal word "json" (case-insensitive),
  // remove that prefix and any following punctuation or whitespace.
  // Examples handled: "json{...}", "json { ... }", "JSON: {...}", "json=\n{...}"
  const jsonPrefixMatch = s.match(/^\s*json\s*[:=]?\s*/i);
  if (jsonPrefixMatch) {
    s = s.slice(jsonPrefixMatch[0].length).trim();
  }

  // Find the first JSON opening character ({ or [)
  const firstBraceIndex = Math.min(
    ...['{', '[']
      .map(ch => s.indexOf(ch))
      .filter(idx => idx !== -1)
  );

  if (firstBraceIndex > 0) {
    s = s.slice(firstBraceIndex);
  }

  // Remove any trailing characters after the JSON (like semicolons or stray text)
  // We attempt to parse progressively: try full string, if fails try to find matching bracket.
  try {
    return JSON.parse(s);
  } catch (e) {
    // Attempt to extract a balanced JSON substring by scanning for matching braces/brackets
    const startChar = s[0];
    const endChar = startChar === '{' ? '}' : startChar === '[' ? ']' : null;
    if (!endChar) throw new Error('No JSON object or array found in response');

    let depth = 0;
    let inString: string | false = false;
    let escape = false;
    let endIndex = -1;

    for (let i = 0; i < s.length; i++) {
      const ch = s[i];

      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === '"' || ch === "'") {
        // toggle inString only for double quotes (JSON uses double quotes),
        // but handle single quotes gracefully if present inside string content.
        if (!inString) {
          inString = ch;
        } else if (inString === ch) {
          inString = false;
        }
        continue;
      }
      if (inString) continue;

      if (ch === startChar) depth++;
      else if (ch === endChar) {
        depth--;
        if (depth === 0) {
          endIndex = i;
          break;
        }
      }
    }

    if (endIndex === -1) {
      throw new Error('Could not find balanced JSON substring');
    }

    const candidate = s.slice(0, endIndex + 1);
    try {
      return JSON.parse(candidate);
    } catch (err2) {
      throw new Error('Failed to parse JSON: ' + err2.message);
    }
  }
}
  const getClarity = {
    url: getHost() + `proposal/getclarity/`,
    method: "post",
    body: {},

    callBack: (result) => {

      console.log("Raw response:", result.data.response);

      // // Convert to object
    // const uwobject = deriveUwObject(result.data.response);
    const uwobject = result.data.response; // Assuming the API now returns a clean JSON object without the "json" prefix or other noise

    // // Access values
    console.log("uwobject:", uwobject);

    if (uwobject.underwriting_decision === "Ask more questions") {
      navigate(`/reflex-questions`, {
        state: { questions: uwobject.more_questions_details },
      });
    }else if (uwobject.underwriting_decision === "Accept") {
      toast.success("Congratulations! Your proposal has been accepted.");
    } else if (uwobject.underwriting_decision === "Reject") {
      toast.error("We regret to inform you that your proposal has been rejected.");
          } //else {
            //navigate(`/uw-decision-summary`, {
            // state: { uwobject: uwobject },
            // });
            //}

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


    // // Convert to object
    // const uwobject = deriveUwObject(result.data.response);
    const uwobject = result.data.response; // Assuming the API now returns a clean JSON object without the "json" prefix or other noise

    // // Access values
    // console.log("identified_health_profile=", uwobject.identified_health_profile);
    // console.log("medical_conditions=", uwobject.identified_health_profile.medical_conditions);
    // console.log("underwriting_decision=",uwobject.underwriting_decision);
    console.log("uwobject:", uwobject);

    if (uwobject.underwriting_decision === "Ask more questions") {
      navigate(`/reflex-questions`, {
        state: { questions: uwobject.more_questions_details },
      });
    }else if (uwobject.underwriting_decision === "Accept") {
      toast.success("Congratulations! Your proposal has been accepted.");
    } else if (uwobject.underwriting_decision === "Reject") {
      toast.error("We regret to inform you that your proposal has been rejected.");
          } //else {
            //navigate(`/uw-decision-summary`, {
            // state: { uwobject: uwobject },
            // });
            //}

  },
    errorCallBack: (error) => { 
      console.error("Error submitting proposal:", error);
      toast.error("An error occurred while submitting your proposal. Please try again later.");
    }
  };

  const handleSubmit = () => {
    // Flush any pending text in the condition input to chips before validation
    medicalHistoryRef.current?.flushPendingInput();

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

    let medicalHistoryUsable = {
      "Medical condition": medicalHistory.condition,
      "Year Of diagnosis": medicalHistory.yearOfDiagnosis,
      "Current Status": medicalHistory.currentStatus
    };

    let hospitalizationUsable = {
      "Reason(s) for hospitalization/surgery": hospitalization.reasons.join(", ") + (hospitalization.reasons.includes("Other (please specify)") ? ` (${hospitalization.reasonOther})` : ""),
      "Time since hospitalization/surgery": `${hospitalization.yearsAgo} year(s) and ${hospitalization.monthsAgo} month(s) ago`,
      "Outcome": hospitalization.outcome + (hospitalization.outcome === "Other (please specify)" ? ` (${hospitalization.outcomeOther})` : ""),
      "Has discharge records": hospitalization.hasDischargeRecords === true ? "Yes" : hospitalization.hasDischargeRecords === false ? "No" : "N/A",
      "Past medical records uploaded": hospitalization.uploadedFiles.length > 0 ? "Yes" : "No"
    };

    let proposal_object = {
      age, gender,
      answers: answers.map((a, i) => ({
        question: questions[i].question,
        answer: a.value === true ? "Yes" : "No",
        ...(a.value === true && (questions[i].category === "Investigations & Tests" || questions[i].category === "Chronic or Severe Conditions") ? { details: a.details } : {}),
        ...(a.value === true && (questions[i].category === "Medical History" ? { details: medicalHistoryUsable } : {})),
        ...(a.value === true && (questions[i].category === "Hospitalization & Surgery" ? { details: hospitalizationUsable } : {}))
      }))
    };


//    console.log("Prepared Proposal Object:", proposal_object);
    fireAjax({ ...getClarity, body: proposal_object });
//    fireAjax({ ...postProposal, body: proposal_object });
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
                    ref={medicalHistoryRef}
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
