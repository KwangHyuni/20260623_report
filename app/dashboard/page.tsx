"use client";

import { useEffect, useState } from "react";
import { EmptyDataBanner } from "@/components/layout/EmptyDataBanner";
import { LoadingSpinner } from "@/components/layout/LoadingSpinner";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  DashboardCharts,
  TopTables,
  InventoryRiskList,
} from "@/components/dashboard/DashboardCharts";
import { SummaryBar } from "@/components/dashboard/SummaryBar";
import type { MetricsData } from "@/lib/metrics";
import {
  evaluateCancelRate,
  evaluateDiscontinued,
  evaluateGrossProfitRate,
  evaluateInventoryRisk,
  evaluateReturnRate,
} from "@/lib/kpi-thresholds";
import { formatKRW, formatNumber, formatPercent } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  Ban,
  ShoppingCart,
  Percent,
  RotateCcw,
  XCircle,
  BarChart3,
  Coins,
} from "lucide-react";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/metrics")
      .then((r) => r.json())
      .then(setMetrics)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner message="대시보드를 불러오는 중..." />;
  }

  if (!metrics?.hasData) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">대시보드</h1>
        <EmptyDataBanner />
      </div>
    );
  }

  const { kpi } = metrics;

  const grossProfitRateStatus = evaluateGrossProfitRate(kpi.grossProfitRate);
  const cancelRateStatus = evaluateCancelRate(kpi.cancelRate);
  const returnRateStatus = evaluateReturnRate(kpi.returnRate);
  const inventoryRiskStatus = evaluateInventoryRisk(kpi.inventoryRiskCount, kpi.productCount);
  const discontinuedStatus = evaluateDiscontinued(kpi.discontinuedCount, kpi.productCount);

  const kpiItems = [
    { title: "유효매출", value: formatKRW(kpi.validRevenue), icon: DollarSign, color: "bg-blue-50 text-blue-600", topLineColor: "border-t-blue-600" },
    { title: "매출원가", value: formatKRW(kpi.cogs), icon: Coins, color: "bg-slate-50 text-slate-600", topLineColor: "border-t-slate-600" },
    { title: "매출총이익", value: formatKRW(kpi.grossProfit), icon: TrendingUp, color: "bg-green-50 text-green-600", topLineColor: "border-t-green-600" },
    { title: "매출총이익률", value: formatPercent(kpi.grossProfitRate), icon: Percent, status: grossProfitRateStatus },
    { title: "평균 주문금액", value: formatKRW(kpi.avgOrderAmount), icon: BarChart3, color: "bg-amber-50 text-amber-600", topLineColor: "border-t-amber-600" },
    { title: "판매수량", value: `${formatNumber(kpi.salesQty)}개`, icon: Package, color: "bg-indigo-50 text-indigo-600", topLineColor: "border-t-indigo-600" },
    { title: "취소율", value: formatPercent(kpi.cancelRate), icon: XCircle, status: cancelRateStatus },
    { title: "반품율", value: formatPercent(kpi.returnRate), icon: RotateCcw, status: returnRateStatus },
    { title: "활성 고객", value: `${formatNumber(kpi.activeCustomerCount)}명`, icon: Users, color: "bg-purple-50 text-purple-600", topLineColor: "border-t-purple-600" },
    { title: "재고 위험", value: `${formatNumber(kpi.inventoryRiskCount)}건`, icon: AlertTriangle, status: inventoryRiskStatus, subtitle: "재고 50개 미만" },
    { title: "단종 상품", value: `${formatNumber(kpi.discontinuedCount)}건`, icon: Ban, status: discontinuedStatus },
    { title: "총거래액", value: formatKRW(kpi.totalTransactionAmount), icon: ShoppingCart, color: "bg-cyan-50 text-cyan-600", topLineColor: "border-t-cyan-600", subtitle: "전체 주문 포함" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        {metrics.period && (
          <p className="mt-1 text-sm text-gray-500">
            분석 기간: {metrics.period.start} ~ {metrics.period.end}
          </p>
        )}
      </div>

      <SummaryBar
        productCount={kpi.productCount}
        customerCount={kpi.customerCount}
        orderCount={kpi.orderCount}
      />

      <div className="mb-6 grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {kpiItems.map((item) => (
          <div key={item.title} className="min-w-0">
            <KpiCard {...item} />
          </div>
        ))}
      </div>

      <DashboardCharts metrics={metrics} />

      <div className="mt-6 space-y-6">
        <InventoryRiskList items={metrics.inventoryRisk} />
        <TopTables metrics={metrics} />
      </div>
    </div>
  );
}
