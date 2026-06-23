import { NextResponse } from "next/server";
import { computeMetrics } from "@/lib/metrics";

export async function GET() {
  try {
    const metrics = computeMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "집계 실패" },
      { status: 500 }
    );
  }
}
