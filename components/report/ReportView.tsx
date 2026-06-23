"use client";

import type { ReportContent } from "@/lib/gemini";
import type { MetricsData } from "@/lib/metrics";
import { DashboardCharts, TopTables } from "@/components/dashboard/DashboardCharts";

export function ReportView({
  report,
  metrics,
}: {
  report: ReportContent;
  metrics: MetricsData;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">{report.title}</h2>
        <p className="mt-1 text-sm text-gray-500">
          생성일: {new Date(report.generatedAt).toLocaleString("ko-KR")} | 분석 기간: {report.period}
        </p>

        <section className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900">요약</h3>
          <p className="mt-2 leading-relaxed text-gray-700">{report.summary}</p>
        </section>

        <section className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900">주요 인사이트</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
            {report.insights.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900">리스크 및 주의사항</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
            {report.risks.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900">개선 제안</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
            {report.recommendations.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <DashboardCharts metrics={metrics} />
      <TopTables metrics={metrics} />
    </div>
  );
}
