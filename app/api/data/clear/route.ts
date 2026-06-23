import { NextRequest, NextResponse } from "next/server";
import { clearAllData, clearTableData } from "@/lib/db";
import { TABLE_CONFIG, type TableName } from "@/lib/constants";

export async function DELETE(request: NextRequest) {
  try {
    const table = request.nextUrl.searchParams.get("table") as TableName | null;

    if (table) {
      if (!TABLE_CONFIG[table]) {
        return NextResponse.json({ error: "유효하지 않은 테이블입니다." }, { status: 400 });
      }
      clearTableData(table);
      return NextResponse.json({
        success: true,
        message: `${TABLE_CONFIG[table].label} 데이터가 삭제되었습니다.`,
      });
    }

    clearAllData();
    return NextResponse.json({ success: true, message: "모든 데이터가 초기화되었습니다." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "초기화 실패" },
      { status: 500 }
    );
  }
}
