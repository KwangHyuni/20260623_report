import { NextResponse } from "next/server";
import { computeMetrics } from "@/lib/metrics";
import { generateReport } from "@/lib/gemini";

export async function POST() {
  try {
    const metrics = computeMetrics();
    const report = await generateReport(metrics);
    return NextResponse.json({ report, metrics });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "보고서 생성 실패" },
      { status: 500 }
    );
  }
}
