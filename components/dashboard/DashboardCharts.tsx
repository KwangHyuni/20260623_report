"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MetricsData } from "@/lib/metrics";
import { formatKRW, formatNumber } from "@/lib/utils";
import {
  PastelTable,
  PastelTableHead,
  PastelTableBody,
  pastelThClass,
  tableRowClass,
  tableTdClass,
} from "@/components/table/PastelTable";
import {
  PASTEL_CHART_PRIMARY,
  PASTEL_GRID_STROKE,
  PASTEL_LABEL_LINE,
  fanPastelColor,
  FAN_PASTEL_LABEL_LINE,
  pastelChartColor,
} from "@/lib/chart-colors";

const CHART_BASIS = "기준: 취소·반품 제외 유효 주문";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-blue-100 bg-white p-2 text-sm shadow-sm">
      <p className="font-medium text-slate-700">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-gray-600">
          {p.name}:{" "}
          {typeof p.value === "number" && p.value > 10000
            ? formatKRW(p.value)
            : formatNumber(p.value)}
        </p>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  basis,
  children,
}: {
  title: string;
  basis: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-white to-blue-50/50 p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mb-4 mt-1 text-xs text-gray-400">{basis}</p>
      {children}
    </div>
  );
}

function RevenueBarChart({
  data,
  xKey,
}: {
  data: Array<Record<string, string | number>>;
  xKey: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={PASTEL_GRID_STROKE} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 12 }} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="revenue" name="매출" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={pastelChartColor(i)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function FanPieAmountLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
  value,
  percent,
  formatValue,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  name: string;
  value: number;
  percent: number;
  formatValue: (v: number) => string;
}) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const anchor = x > cx ? "start" : "end";

  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="central"
      fill="#374151"
      fontSize={11}
    >
      <tspan x={x} dy="-0.6em" fontWeight={600}>
        {name}
      </tspan>
      <tspan x={x} dy="1.3em" fill="#6b7280">
        {formatValue(value)} ({(percent * 100).toFixed(0)}%)
      </tspan>
    </text>
  );
}

function FanPieChart({
  data,
  dataKey,
  nameKey,
  valueLabel,
  showAmountInLabel = false,
}: {
  data: Array<Record<string, string | number>>;
  dataKey: string;
  nameKey: string;
  valueLabel: (value: number) => string;
  showAmountInLabel?: boolean;
}) {
  const defaultLabel = ({ name, percent }: { name: string; percent: number }) =>
    percent >= 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : "";

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="72%"
          startAngle={180}
          endAngle={0}
          innerRadius={55}
          outerRadius={110}
          paddingAngle={2}
          cornerRadius={4}
          label={
            showAmountInLabel
              ? (props) => (
                  <FanPieAmountLabel
                    {...props}
                    formatValue={valueLabel}
                  />
                )
              : (props) => {
                  const { name, percent } = props;
                  if (percent < 0.05) return "";
                  return defaultLabel({ name, percent });
                }
          }
          labelLine={{ stroke: FAN_PASTEL_LABEL_LINE, strokeWidth: 1 }}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={fanPastelColor(i)} stroke="#fff" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [valueLabel(value), name]}
        />
        <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DashboardCharts({ metrics }: { metrics: MetricsData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="월별 매출 추이" basis={`${CHART_BASIS} · 월별 합계`}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={metrics.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke={PASTEL_GRID_STROKE} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="매출"
                stroke={PASTEL_CHART_PRIMARY}
                strokeWidth={2.5}
                dot={{ fill: PASTEL_CHART_PRIMARY, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: pastelChartColor(4) }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="채널별 매출" basis={`${CHART_BASIS} · 채널별 주문금액 합계`}>
          <RevenueBarChart data={metrics.channelRevenue} xKey="channel" />
        </ChartCard>

        <ChartCard title="카테고리별 매출" basis={`${CHART_BASIS} · 주문항목 금액 기준 카테고리 합계`}>
          <RevenueBarChart data={metrics.categoryRevenue} xKey="category" />
        </ChartCard>

        <ChartCard title="결제 수단별 매출" basis={`${CHART_BASIS} · 결제수단별 주문금액 합계`}>
          <FanPieChart
            data={metrics.paymentMethodRevenue}
            dataKey="revenue"
            nameKey="paymentMethod"
            valueLabel={(v) => formatKRW(v)}
            showAmountInLabel
          />
        </ChartCard>

        <ChartCard title="고객 등급별 매출" basis={`${CHART_BASIS} · 고객 tier별 주문금액 합계`}>
          <RevenueBarChart data={metrics.tierRevenue} xKey="tier" />
        </ChartCard>

        <ChartCard title="주문 상태 분포" basis="기준: 전체 주문 건수 · 상태별 비율">
          <FanPieChart
            data={metrics.statusDistribution}
            dataKey="count"
            nameKey="status"
            valueLabel={(v) => `${formatNumber(v)}건`}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="브랜드별 매출 TOP 10" basis={`${CHART_BASIS} · 브랜드별 주문항목 금액 합계`}>
          <RevenueBarChart data={metrics.brandRevenue} xKey="brand" />
        </ChartCard>

        <ChartCard title="지역별 매출 TOP 10" basis={`${CHART_BASIS} · 고객 도시별 주문금액 합계`}>
          <RevenueBarChart data={metrics.regionRevenue} xKey="city" />
        </ChartCard>
      </div>
    </div>
  );
}

export function InventoryRiskList({ items }: { items: MetricsData["inventoryRisk"] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900">재고 위험 목록</h3>
      <p className="mb-4 mt-1 text-xs text-gray-400">
        기준: 판매중 상품 중 재고 50개 미만 (낮은 순)
      </p>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">재고 위험 상품이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <PastelTable>
            <PastelTableHead>
              <tr className="text-left">
                <th className={pastelThClass(0)}>상품명</th>
                <th className={pastelThClass(1)}>카테고리</th>
                <th className={pastelThClass(2)}>브랜드</th>
                <th className={pastelThClass(3, "text-right")}>재고</th>
                <th className={pastelThClass(4, "text-right")}>판매가</th>
              </tr>
            </PastelTableHead>
            <PastelTableBody>
              {items.map((p) => (
                <tr key={p.productId} className={tableRowClass}>
                  <td className={tableTdClass + " font-medium"}>{p.productName}</td>
                  <td className={tableTdClass + " text-gray-500"}>{p.category}</td>
                  <td className={tableTdClass + " text-gray-500"}>{p.brand}</td>
                  <td className={tableTdClass + " text-right font-medium text-red-600"}>
                    {formatNumber(p.stockQty)}
                  </td>
                  <td className={tableTdClass + " text-right"}>{formatKRW(p.unitPriceKrw)}</td>
                </tr>
              ))}
            </PastelTableBody>
          </PastelTable>
        </div>
      )}
    </div>
  );
}

export function TopTables({ metrics }: { metrics: MetricsData }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-1 font-semibold text-gray-900">TOP 10 고객</h3>
        <p className="mb-4 text-xs text-gray-400">기준: 취소·반품 제외 유효 주문 매출 합계</p>
        <div className="overflow-x-auto">
          <PastelTable>
            <PastelTableHead>
              <tr className="text-left">
                <th className={pastelThClass(0)}>고객명</th>
                <th className={pastelThClass(1, "text-right")}>매출</th>
                <th className={pastelThClass(2, "text-right")}>주문수</th>
              </tr>
            </PastelTableHead>
            <PastelTableBody>
              {metrics.topCustomers.map((c) => (
                <tr key={c.customerId} className={tableRowClass}>
                  <td className={tableTdClass + " font-medium"}>{c.customerName}</td>
                  <td className={tableTdClass + " text-right"}>{formatKRW(c.revenue)}</td>
                  <td className={tableTdClass + " text-right"}>{formatNumber(c.orderCount)}</td>
                </tr>
              ))}
            </PastelTableBody>
          </PastelTable>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-1 font-semibold text-gray-900">TOP 10 상품</h3>
        <p className="mb-4 text-xs text-gray-400">기준: 취소·반품 제외 주문항목 매출 합계</p>
        <div className="overflow-x-auto">
          <PastelTable>
            <PastelTableHead>
              <tr className="text-left">
                <th className={pastelThClass(0)}>상품명</th>
                <th className={pastelThClass(1)}>카테고리</th>
                <th className={pastelThClass(2, "text-right")}>매출</th>
                <th className={pastelThClass(3, "text-right")}>수량</th>
              </tr>
            </PastelTableHead>
            <PastelTableBody>
              {metrics.topProducts.map((p) => (
                <tr key={p.productId} className={tableRowClass}>
                  <td className={tableTdClass + " font-medium"}>{p.productName}</td>
                  <td className={tableTdClass + " text-gray-500"}>{p.category}</td>
                  <td className={tableTdClass + " text-right"}>{formatKRW(p.revenue)}</td>
                  <td className={tableTdClass + " text-right"}>{formatNumber(p.qty)}</td>
                </tr>
              ))}
            </PastelTableBody>
          </PastelTable>
        </div>
      </div>
    </div>
  );
}
