import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, Home } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface WaitingPeriodCondition {
  condition: string;
  icd_category_code: string;
  icd_description: string;
}

const Summary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const uwData = location.state?.uwData;

  if (!uwData) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No summary data available.</p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const decision: string = uwData.underwriting_decision || "";
  const rationale: string = uwData.decision_rationale || "";
  const waitingPeriodDetails: WaitingPeriodCondition[] =
    uwData.waiting_period_details || uwData.conditions || [];

  const isDecline = decision === "Decline";
  const isAcceptStandard = decision === "Accept standard";
  const isAcceptWaiting = decision === "Accept with waiting period";

  const bannerConfig = isDecline
    ? {
        icon: <XCircle className="h-10 w-10 text-slate-500" />,
        bg: "bg-slate-100 border-slate-200",
        badgeCls: "bg-slate-200 text-slate-700 border-slate-300",
        title: "Application Declined",
      }
    : isAcceptStandard
    ? {
        icon: <CheckCircle2 className="h-10 w-10 text-green-600" />,
        bg: "bg-green-50 border-green-200",
        badgeCls: "bg-green-100 text-green-700 border-green-300",
        title: "Application Accepted",
      }
    : {
        icon: <Clock className="h-10 w-10 text-purple-600" />,
        bg: "bg-purple-50 border-purple-200",
        badgeCls: "bg-purple-100 text-purple-700 border-purple-300",
        title: "Conditional Acceptance",
      };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Status Banner */}
        <div
          className={`rounded-xl border p-6 md:p-8 mb-6 animate-fade-in ${bannerConfig.bg}`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {bannerConfig.icon}
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                {bannerConfig.title}
              </h1>
              <Badge
                className={`text-xs font-semibold px-3 py-1 ${bannerConfig.badgeCls}`}
              >
                {decision}
              </Badge>
            </div>
          </div>
        </div>

        {/* Congratulations message for Accept standard */}
        {isAcceptStandard && (
          <div
            className="rounded-xl border border-green-100 bg-card p-6 mb-6 shadow-sm animate-fade-in"
            style={{ animationDelay: "0.1s", animationFillMode: "both" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Congratulations
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              Congratulations! Your application has been accepted. You are
              eligible for standard coverage with no additional conditions.
            </p>
          </div>
        )}

        {/* Underwriting Decision Card */}
        <div
          className="rounded-xl border border-border bg-card p-6 mb-6 shadow-sm animate-fade-in"
          style={{ animationDelay: "0.15s", animationFillMode: "both" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Underwriting Decision
          </p>
          <p className="text-base font-medium text-foreground">{decision}</p>
        </div>

        {/* Decision Rationale — for Decline and Accept with waiting period */}
        {(isDecline || isAcceptWaiting) && rationale && (
          <div
            className="rounded-xl border border-border bg-card p-6 mb-6 shadow-sm animate-fade-in"
            style={{ animationDelay: "0.2s", animationFillMode: "both" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Decision Rationale
            </p>
            <div className="border-l-4 border-primary/60 bg-muted/30 rounded-r-lg px-4 py-3">
              <p className="text-sm text-foreground leading-relaxed">
                {rationale}
              </p>
            </div>
          </div>
        )}

        {/* Waiting Period Table — only for Accept with waiting period */}
        {isAcceptWaiting && waitingPeriodDetails.length > 0 && (
          <div
            className="rounded-xl border border-border bg-card p-6 mb-6 shadow-sm animate-fade-in"
            style={{ animationDelay: "0.25s", animationFillMode: "both" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              Waiting Period Details
            </p>
            <div className="overflow-x-auto -mx-2">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-bold uppercase tracking-wide">
                      Medical Condition
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wide">
                      ICD Category Code
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wide">
                      ICD Description
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wide">
                      Waiting Period
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitingPeriodDetails.map(
                    (item: WaitingPeriodCondition, idx: number) => (
                      <TableRow
                        key={idx}
                        className={idx % 2 === 0 ? "bg-card" : "bg-muted/20"}
                      >
                        <TableCell className="text-sm font-medium">
                          {item.condition}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.icd_category_code}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.icd_description}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-primary/15 text-primary border-primary/30 font-semibold text-xs">
                            3 Years
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in"
          style={{ animationDelay: "0.3s", animationFillMode: "both" }}
        >
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Home className="h-4 w-4" />
            Start New Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default Summary;
