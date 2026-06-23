import { NextResponse } from "next/server";
import { getDataStatus } from "@/lib/db";

export async function GET() {
  try {
    const status = getDataStatus();
    const hasData = status.some((s) => s.rowCount > 0);
    return NextResponse.json({ hasData, tables: status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "상태 조회 실패" },
      { status: 500 }
    );
  }
}
