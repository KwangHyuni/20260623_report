import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ingestCsv } from "@/lib/db/ingest";
import { TABLE_CONFIG, type TableName } from "@/lib/constants";
import { getDataStatus } from "@/lib/db";

const TABLES: TableName[] = ["orders", "order_items", "customers", "products"];

export async function POST() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    const results: Array<{ table: TableName; rowCount: number; fileName: string }> = [];

    for (const table of TABLES) {
      const filePath = path.join(dataDir, TABLE_CONFIG[table].fileName);
      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { error: `샘플 파일을 찾을 수 없습니다: ${TABLE_CONFIG[table].fileName}` },
          { status: 404 }
        );
      }
      const content = fs.readFileSync(filePath, "utf-8");
      const result = ingestCsv(table, content, TABLE_CONFIG[table].fileName);
      results.push({
        table,
        rowCount: result.rowCount,
        fileName: TABLE_CONFIG[table].fileName,
      });
    }

    return NextResponse.json({
      success: true,
      message: "샘플 데이터를 성공적으로 불러왔습니다.",
      tables: getDataStatus(),
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "샘플 데이터 로드 실패" },
      { status: 500 }
    );
  }
}
