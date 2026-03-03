import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, Home, ClipboardList, Info, TrendingUp } from "lucide-react";
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

interface LoadingCondition {
  condition: string;
  icd_category_code: string;
  icd_description: string;
  loading_percentage: number;
}

interface LoadingDetails {
  applicable: boolean;
  loading_conditions: LoadingCondition[];
  total_loading_percentage: number;
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
  const loadingDetails: LoadingDetails | null = uwData.loading_details || null;

  const isDecline = decision === "Decline";
  const isAcceptStandard = decision === "Accept standard";
  const isAcceptWaiting = decision === "Accept with waiting period";
  const isReferUWR = decision === "Refer to UWR";
  const isAcceptLoading = decision === "Accept with loading";
  const isAcceptLoadingAndWaiting = decision === "Accept with loading and waiting period";

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
    : isReferUWR
    ? {
        icon: <ClipboardList className="h-10 w-10 text-indigo-600" />,
        bg: "bg-indigo-50 border-indigo-200",
        badgeCls: "bg-indigo-100 text-indigo-700 border-indigo-300",
        title: "Referred to Underwriter",
      }
    : isAcceptLoading
    ? {
        icon: <TrendingUp className="h-10 w-10 text-amber-600" />,
        bg: "bg-amber-50 border-amber-200",
        badgeCls: "bg-amber-100 text-amber-700 border-amber-300",
        title: "Accepted with Loading",
      }
    : isAcceptLoadingAndWaiting
    ? {
        icon: <TrendingUp className="h-10 w-10 text-orange-600" />,
        bg: "bg-orange-50 border-orange-200",
        badgeCls: "bg-orange-100 text-orange-700 border-orange-300",
        title: "Accepted with Loading & Waiting Period",
      }
    : {
        icon: <Clock className="h-10 w-10 text-purple-600" />,
        bg: "bg-purple-50 border-purple-200",
        badgeCls: "bg-purple-100 text-purple-700 border-purple-300",
        title: "Conditional Acceptance",
      };

  // Build merged rows for "Accept with loading and waiting period"
  const mergedRows = (() => {
    if (!isAcceptLoadingAndWaiting) return [];
    const map = new Map<string, { condition: string; icd_category_code: string; icd_description: string; loading_percentage?: number; hasWaiting: boolean }>();

    // Add loading conditions
    if (loadingDetails?.applicable && loadingDetails.loading_conditions?.length) {
      for (const lc of loadingDetails.loading_conditions) {
        map.set(lc.condition, {
          condition: lc.condition,
          icd_category_code: lc.icd_category_code,
          icd_description: lc.icd_description,
          loading_percentage: lc.loading_percentage,
          hasWaiting: false,
        });
      }
    }

    // Mark or add waiting period conditions
    for (const wp of waitingPeriodDetails) {
      const existing = map.get(wp.condition);
      if (existing) {
        existing.hasWaiting = true;
      } else {
        map.set(wp.condition, {
          condition: wp.condition,
          icd_category_code: wp.icd_category_code,
          icd_description: wp.icd_description,
          hasWaiting: true,
        });
      }
    }

    return Array.from(map.values());
  })();

  const showMergedTable = isAcceptLoadingAndWaiting && mergedRows.length > 0;

  const showLoadingTable =
    isAcceptLoading &&
    loadingDetails?.applicable &&
    loadingDetails.loading_conditions?.length > 0;

  const showWaitingTable =
    isAcceptWaiting &&
    waitingPeriodDetails.length > 0;

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

        {/* Decision Rationale — for Decline, Accept with waiting period, Refer to UWR, and loading decisions */}
        {(isDecline || isAcceptWaiting || isReferUWR || isAcceptLoading || isAcceptLoadingAndWaiting) && rationale && (
          <div
            className="rounded-xl border border-border bg-card p-6 mb-6 shadow-sm animate-fade-in"
            style={{ animationDelay: "0.2s", animationFillMode: "both" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Decision Rationale
            </p>
            <div className={`border-l-4 ${isReferUWR ? "border-indigo-400 bg-indigo-50/30" : "border-primary/60 bg-muted/30"} rounded-r-lg px-4 py-3`}>
              <p className="text-sm text-foreground leading-relaxed">
                {rationale}
              </p>
            </div>
          </div>
        )}

        {/* Under Review informational message — only for Refer to UWR */}
        {isReferUWR && (
          <div
            className="rounded-xl border border-blue-100 bg-blue-50 p-5 mb-6 shadow-sm animate-fade-in flex items-start gap-3"
            style={{ animationDelay: "0.25s", animationFillMode: "both" }}
          >
            <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-700 leading-relaxed">
              Your application has been referred to our underwriting team for
              further review. We will get back to you shortly.
            </p>
          </div>
        )}

        {/* Loading Details Table — for Accept with loading only */}
        {showLoadingTable && (
          <div
            className="rounded-xl border border-border bg-card p-6 mb-6 shadow-sm animate-fade-in"
            style={{ animationDelay: "0.25s", animationFillMode: "both" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Loading Details
              </p>
              <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs font-semibold">
                Total Loading: {loadingDetails!.total_loading_percentage}%
              </Badge>
            </div>
            <div className="overflow-x-auto -mx-2">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-bold uppercase tracking-wide">Medical Condition</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wide">Loading Percentage</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wide">ICD Code</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wide">ICD Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingDetails!.loading_conditions.map((item: LoadingCondition, idx: number) => (
                    <TableRow key={idx} className={idx % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                      <TableCell className="text-sm font-medium">{item.condition}</TableCell>
                      <TableCell>
                        <Badge className="bg-amber-100 text-amber-700 border-amber-300 font-semibold text-xs">
                          {item.loading_percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{item.icd_category_code}</TableCell>
                      <TableCell className="text-sm">{item.icd_description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Merged Loading & Waiting Period Table — for Accept with loading and waiting period */}
        {showMergedTable && (
          <div
            className="rounded-xl border border-border bg-card p-6 mb-6 shadow-sm animate-fade-in"
            style={{ animationDelay: "0.25s", animationFillMode: "both" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Loading & Waiting Period Details
              </p>
              {loadingDetails?.applicable && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs font-semibold">
                  Total Loading: {loadingDetails.total_loading_percentage}%
                </Badge>
              )}
            </div>
            <div className="overflow-x-auto -mx-2">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-bold uppercase tracking-wide">Medical Condition</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wide">Loading Percentage</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wide">Waiting Period</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wide">ICD Code</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wide">ICD Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mergedRows.map((item, idx) => (
                    <TableRow key={idx} className={idx % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                      <TableCell className="text-sm font-medium">{item.condition}</TableCell>
                      <TableCell>
                        {item.loading_percentage !== undefined ? (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-300 font-semibold text-xs">
                            {item.loading_percentage}%
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.hasWaiting ? (
                          <Badge className="bg-primary/15 text-primary border-primary/30 font-semibold text-xs">
                            3 Years
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{item.icd_category_code}</TableCell>
                      <TableCell className="text-sm">{item.icd_description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Waiting Period Table — only for Accept with waiting period (standalone) */}
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
