"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MetricsData } from "@/lib/metrics";
import { formatKRW, formatNumber } from "@/lib/utils";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-white p-2 shadow-md text-sm">
      <p className="font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-gray-600">
          {p.name}: {typeof p.value === "number" && p.value > 10000 ? formatKRW(p.value) : formatNumber(p.value)}
        </p>
      ))}
    </div>
  );
}

export function DashboardCharts({ metrics }: { metrics: MetricsData }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">월별 매출 추이</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={metrics.monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 12 }} />
            <Tooltip content={<ChartTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="revenue" name="매출" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">채널별 매출</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={metrics.channelRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="channel" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 12 }} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="revenue" name="매출" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">카테고리별 매출</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={metrics.categoryRevenue} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={80} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="revenue" name="매출" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">주문 상태 분포</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={metrics.statusDistribution}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={40}
            >
              {metrics.statusDistribution.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function TopTables({ metrics }: { metrics: MetricsData }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">TOP 10 고객</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4">고객명</th>
                <th className="pb-2 pr-4 text-right">매출</th>
                <th className="pb-2 text-right">주문수</th>
              </tr>
            </thead>
            <tbody>
              {metrics.topCustomers.map((c) => (
                <tr key={c.customerId} className="border-b border-gray-50">
                  <td className="py-2 pr-4 font-medium">{c.customerName}</td>
                  <td className="py-2 pr-4 text-right">{formatKRW(c.revenue)}</td>
                  <td className="py-2 text-right">{formatNumber(c.orderCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">TOP 10 상품</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4">상품명</th>
                <th className="pb-2 pr-4">카테고리</th>
                <th className="pb-2 pr-4 text-right">매출</th>
                <th className="pb-2 text-right">수량</th>
              </tr>
            </thead>
            <tbody>
              {metrics.topProducts.map((p) => (
                <tr key={p.productId} className="border-b border-gray-50">
                  <td className="py-2 pr-4 font-medium">{p.productName}</td>
                  <td className="py-2 pr-4 text-gray-500">{p.category}</td>
                  <td className="py-2 pr-4 text-right">{formatKRW(p.revenue)}</td>
                  <td className="py-2 text-right">{formatNumber(p.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
