import { NextRequest, NextResponse } from "next/server";
import { ingestCsv } from "@/lib/db/ingest";
import { TABLE_CONFIG, type TableName } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const table = formData.get("table") as TableName | null;

    if (!file || !table) {
      return NextResponse.json({ error: "파일과 테이블 유형이 필요합니다." }, { status: 400 });
    }

    if (!TABLE_CONFIG[table]) {
      return NextResponse.json({ error: "유효하지 않은 테이블 유형입니다." }, { status: 400 });
    }

    const content = await file.text();
    const result = ingestCsv(table, content, file.name);

    return NextResponse.json({
      success: true,
      table,
      fileName: file.name,
      rowCount: result.rowCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "업로드 실패" },
      { status: 400 }
    );
  }
}
