import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { ReportContent } from "@/lib/gemini";
import type { MetricsData } from "@/lib/metrics";
import { formatKRW, formatNumber } from "@/lib/utils";

Font.register({
  family: "NotoSansKR",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/OTF/Korean/NotoSansCJKkr-Regular.otf",
      fontWeight: "normal",
    },
    {
      src: "https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/OTF/Korean/NotoSansCJKkr-Bold.otf",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "NotoSansKR", fontSize: 10 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 10, color: "#666", marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", marginTop: 16, marginBottom: 8 },
  paragraph: { marginBottom: 8, lineHeight: 1.5 },
  bullet: { marginLeft: 12, marginBottom: 4 },
  table: { marginTop: 8 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 4 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: "#333", paddingVertical: 4, fontWeight: "bold" },
  cell: { flex: 1 },
  cellWide: { flex: 2 },
});

function BulletList({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item, i) => (
        <Text key={i} style={styles.bullet}>
          • {item}
        </Text>
      ))}
    </View>
  );
}

export function ReportPdfDocument({
  report,
  metrics,
}: {
  report: ReportContent;
  metrics: MetricsData;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{report.title}</Text>
        <Text style={styles.subtitle}>
          생성일: {new Date(report.generatedAt).toLocaleString("ko-KR")} | 분석 기간: {report.period}
        </Text>

        <Text style={styles.sectionTitle}>요약</Text>
        <Text style={styles.paragraph}>{report.summary}</Text>

        <Text style={styles.sectionTitle}>주요 인사이트</Text>
        <BulletList items={report.insights} />

        <Text style={styles.sectionTitle}>리스크 및 주의사항</Text>
        <BulletList items={report.risks} />

        <Text style={styles.sectionTitle}>개선 제안</Text>
        <BulletList items={report.recommendations} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>핵심 KPI</Text>
        <Text style={styles.paragraph}>총 매출: {formatKRW(metrics.kpi.totalRevenue)}</Text>
        <Text style={styles.paragraph}>주문 건수: {formatNumber(metrics.kpi.orderCount)}건</Text>
        <Text style={styles.paragraph}>평균 주문금액: {formatKRW(metrics.kpi.avgOrderAmount)}</Text>
        <Text style={styles.paragraph}>활성 고객 수: {formatNumber(metrics.kpi.activeCustomerCount)}명</Text>

        <Text style={styles.sectionTitle}>채널별 매출</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.cell}>채널</Text>
            <Text style={styles.cell}>매출</Text>
            <Text style={styles.cell}>주문수</Text>
          </View>
          {metrics.channelRevenue.map((c, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.cell}>{c.channel}</Text>
              <Text style={styles.cell}>{formatKRW(c.revenue)}</Text>
              <Text style={styles.cell}>{formatNumber(c.orderCount)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>TOP 10 고객</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.cellWide}>고객명</Text>
            <Text style={styles.cell}>매출</Text>
            <Text style={styles.cell}>주문수</Text>
          </View>
          {metrics.topCustomers.map((c, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.cellWide}>{c.customerName}</Text>
              <Text style={styles.cell}>{formatKRW(c.revenue)}</Text>
              <Text style={styles.cell}>{formatNumber(c.orderCount)}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
