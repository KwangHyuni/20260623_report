"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ReportContent } from "@/lib/gemini";
import type { MetricsData } from "@/lib/metrics";

interface ReportContextValue {
  report: ReportContent | null;
  metrics: MetricsData | null;
  setReportData: (report: ReportContent, metrics: MetricsData) => void;
  clearReport: () => void;
  hasReport: boolean;
}

const ReportContext = createContext<ReportContextValue | null>(null);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [report, setReport] = useState<ReportContent | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);

  const setReportData = useCallback((nextReport: ReportContent, nextMetrics: MetricsData) => {
    setReport(nextReport);
    setMetrics(nextMetrics);
  }, []);

  const clearReport = useCallback(() => {
    setReport(null);
    setMetrics(null);
  }, []);

  const value = useMemo(
    () => ({
      report,
      metrics,
      setReportData,
      clearReport,
      hasReport: report !== null && metrics !== null,
    }),
    [report, metrics, setReportData, clearReport]
  );

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
}

export function useReport() {
  const ctx = useContext(ReportContext);
  if (!ctx) {
    throw new Error("useReport must be used within ReportProvider");
  }
  return ctx;
}
