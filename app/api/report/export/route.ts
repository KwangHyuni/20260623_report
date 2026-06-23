import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportPdfDocument } from "@/lib/export/pdf";
import { generateDocxBuffer } from "@/lib/export/docx";
import type { ReportContent } from "@/lib/gemini";
import type { MetricsData } from "@/lib/metrics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { report, metrics, format } = body as {
      report: ReportContent;
      metrics: MetricsData;
      format: "pdf" | "docx";
    };

    if (!report || !metrics || !format) {
      return NextResponse.json({ error: "report, metrics, format이 필요합니다." }, { status: 400 });
    }

    const dateStr = new Date().toISOString().slice(0, 10);

    if (format === "pdf") {
      const buffer = await renderToBuffer(
        ReportPdfDocument({ report, metrics })
      );
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="ERP_Report_${dateStr}.pdf"`,
        },
      });
    }

    if (format === "docx") {
      const buffer = await generateDocxBuffer(report, metrics);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="ERP_Report_${dateStr}.docx"`,
        },
      });
    }

    return NextResponse.json({ error: "지원하지 않는 형식입니다." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "보내기 실패" },
      { status: 500 }
    );
  }
}
