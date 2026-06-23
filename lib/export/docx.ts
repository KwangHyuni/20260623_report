import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
import type { ReportContent } from "@/lib/gemini";
import type { MetricsData } from "@/lib/metrics";
import { formatKRW, formatNumber } from "@/lib/utils";

function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]) {
  return new Paragraph({ text, heading: level, spacing: { before: 240, after: 120 } });
}

function bullet(text: string) {
  return new Paragraph({
    children: [new TextRun({ text: `• ${text}` })],
    spacing: { after: 80 },
  });
}

function makeTable(headers: string[], rows: string[][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: headers.map(
          (h) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
            })
        ),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [new Paragraph({ text: cell })],
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 },
                  },
                })
            ),
          })
      ),
    ],
  });
}

export async function generateDocxBuffer(
  report: ReportContent,
  metrics: MetricsData
): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [
    heading(report.title, HeadingLevel.TITLE),
    new Paragraph({
      children: [
        new TextRun({
          text: `생성일: ${new Date(report.generatedAt).toLocaleString("ko-KR")} | 분석 기간: ${report.period}`,
          color: "666666",
        }),
      ],
      spacing: { after: 240 },
    }),
    heading("요약", HeadingLevel.HEADING_1),
    new Paragraph({ text: report.summary, spacing: { after: 120 } }),
    heading("주요 인사이트", HeadingLevel.HEADING_1),
    ...report.insights.map(bullet),
    heading("리스크 및 주의사항", HeadingLevel.HEADING_1),
    ...report.risks.map(bullet),
    heading("개선 제안", HeadingLevel.HEADING_1),
    ...report.recommendations.map(bullet),
    heading("핵심 KPI", HeadingLevel.HEADING_1),
    bullet(`유효매출: ${formatKRW(metrics.kpi.validRevenue)}`),
    bullet(`매출총이익: ${formatKRW(metrics.kpi.grossProfit)} (${metrics.kpi.grossProfitRate.toFixed(1)}%)`),
    bullet(`평균 주문금액: ${formatKRW(metrics.kpi.avgOrderAmount)}`),
    bullet(`활성 고객: ${formatNumber(metrics.kpi.activeCustomerCount)}명`),
    bullet(`총거래액: ${formatKRW(metrics.kpi.totalTransactionAmount)}`),
    heading("채널별 매출", HeadingLevel.HEADING_1),
    makeTable(
      ["채널", "매출", "주문수"],
      metrics.channelRevenue.map((c) => [
        c.channel,
        formatKRW(c.revenue),
        formatNumber(c.orderCount),
      ])
    ),
    heading("TOP 10 고객", HeadingLevel.HEADING_1),
    makeTable(
      ["고객명", "매출", "주문수"],
      metrics.topCustomers.map((c) => [
        c.customerName,
        formatKRW(c.revenue),
        formatNumber(c.orderCount),
      ])
    ),
    heading("TOP 10 상품", HeadingLevel.HEADING_1),
    makeTable(
      ["상품명", "카테고리", "매출", "수량"],
      metrics.topProducts.map((p) => [
        p.productName,
        p.category,
        formatKRW(p.revenue),
        formatNumber(p.qty),
      ])
    ),
  ];

  const doc = new Document({ sections: [{ children }] });
  return Buffer.from(await Packer.toBuffer(doc));
}
