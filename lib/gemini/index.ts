import { GoogleGenerativeAI } from "@google/generative-ai";
import type { MetricsData } from "@/lib/metrics";

export interface ReportContent {
  title: string;
  generatedAt: string;
  period: string;
  summary: string;
  insights: string[];
  risks: string[];
  recommendations: string[];
  rawMarkdown: string;
}

function buildPrompt(metrics: MetricsData): string {
  return `당신은 ERP 매출 데이터 분석 전문가입니다. 아래 집계 데이터를 바탕으로 한국어 경영 분석 보고서를 작성하세요.

## 분석 기간
${metrics.period ? `${metrics.period.start} ~ ${metrics.period.end}` : "데이터 없음"}

## 집계 데이터 (JSON)
${JSON.stringify(metrics, null, 2)}

## 출력 형식 (반드시 아래 마크다운 구조를 따르세요)

# ERP 매출 분석 보고서

## 요약
(3~5문장으로 전체 매출 현황 요약)

## 주요 인사이트
- (인사이트 1)
- (인사이트 2)
- (인사이트 3)
- (인사이트 4)

## 리스크 및 주의사항
- (리스크 1)
- (리스크 2)
- (리스크 3)

## 개선 제안
- (제안 1)
- (제안 2)
- (제안 3)

데이터에 기반한 구체적인 수치를 포함하고, 추측이 아닌 분석적 관점을 유지하세요.`;
}

function parseReportMarkdown(markdown: string, metrics: MetricsData): ReportContent {
  const extractSection = (heading: string): string => {
    const regex = new RegExp(`## ${heading}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, "i");
    const match = markdown.match(regex);
    return match ? match[1].trim() : "";
  };

  const extractBullets = (text: string): string[] => {
    return text
      .split("\n")
      .map((line) => line.replace(/^[-*]\s*/, "").trim())
      .filter((line) => line.length > 0);
  };

  const summary = extractSection("요약");
  const insights = extractBullets(extractSection("주요 인사이트"));
  const risks = extractBullets(extractSection("리스크 및 주의사항"));
  const recommendations = extractBullets(extractSection("개선 제안"));

  return {
    title: "ERP 매출 분석 보고서",
    generatedAt: new Date().toISOString(),
    period: metrics.period
      ? `${metrics.period.start} ~ ${metrics.period.end}`
      : "전체 기간",
    summary: summary || "분석 요약을 생성하지 못했습니다.",
    insights: insights.length > 0 ? insights : ["주요 인사이트를 추출하지 못했습니다."],
    risks: risks.length > 0 ? risks : ["리스크 항목을 추출하지 못했습니다."],
    recommendations:
      recommendations.length > 0
        ? recommendations
        : ["개선 제안을 추출하지 못했습니다."],
    rawMarkdown: markdown,
  };
}

export async function generateReport(metrics: MetricsData): Promise<ReportContent> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  if (!metrics.hasData) {
    throw new Error("분석할 데이터가 없습니다. 먼저 ERP 데이터를 업로드하세요.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent(buildPrompt(metrics));
  const markdown = result.response.text();

  return parseReportMarkdown(markdown, metrics);
}
