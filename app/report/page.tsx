"use client";

import { useEffect, useState } from "react";
import { EmptyDataBanner } from "@/components/layout/EmptyDataBanner";
import { LoadingSpinner } from "@/components/layout/LoadingSpinner";
import { ReportView } from "@/components/report/ReportView";
import { useReport } from "@/lib/context/ReportContext";
import { FileDown, FileText, Loader2, Sparkles } from "lucide-react";

export default function ReportPage() {
  const { report, metrics, setReportData } = useReport();
  const [hasData, setHasData] = useState<boolean | null>(null);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/data/status")
      .then((r) => r.json())
      .then((d) => setHasData(d.hasData))
      .catch(() => setHasData(false));
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/report/generate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "보고서 생성 실패");
      setReportData(data.report, data.metrics);
    } catch (e) {
      setError(e instanceof Error ? e.message : "보고서 생성 실패");
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (!report || !metrics) return;
    setExporting(format);
    try {
      const res = await fetch("/api/report/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report, metrics, format }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "다운로드 실패");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ERP_Report_${new Date().toISOString().slice(0, 10)}.${format === "pdf" ? "pdf" : "docx"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "다운로드 실패");
    } finally {
      setExporting(null);
    }
  };

  if (hasData === null) {
    return <LoadingSpinner message="로딩 중..." />;
  }

  if (!hasData) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">보고서 분석</h1>
        <EmptyDataBanner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">보고서 분석</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gemini AI가 집계 지표를 바탕으로 분석 보고서를 작성합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generating ? "분석 중..." : report ? "AI 보고서 재생성" : "AI 보고서 생성"}
          </button>
          {report && metrics && (
            <>
              <button
                onClick={() => handleExport("pdf")}
                disabled={!!exporting}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {exporting === "pdf" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                PDF 다운로드
              </button>
              <button
                onClick={() => handleExport("docx")}
                disabled={!!exporting}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {exporting === "docx" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                Word 다운로드
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!report ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-600">
            「AI 보고서 생성」 버튼을 클릭하여 Gemini AI 분석 보고서를 생성하세요.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            생성된 보고서는 다른 메뉴로 이동해도 유지됩니다. 데이터를 새로 입력하면 초기화됩니다.
          </p>
        </div>
      ) : (
        metrics && <ReportView report={report} metrics={metrics} />
      )}
    </div>
  );
}
