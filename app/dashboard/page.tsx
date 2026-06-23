"use client";

import { useEffect, useState } from "react";
import { EmptyDataBanner } from "@/components/layout/EmptyDataBanner";
import { LoadingSpinner } from "@/components/layout/LoadingSpinner";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { DashboardCharts, TopTables } from "@/components/dashboard/DashboardCharts";
import type { MetricsData } from "@/lib/metrics";
import { formatKRW, formatNumber } from "@/lib/utils";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";

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

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="총 매출"
          value={formatKRW(metrics.kpi.totalRevenue)}
          icon={DollarSign}
          color="bg-blue-50 text-blue-600"
        />
        <KpiCard
          title="주문 건수"
          value={`${formatNumber(metrics.kpi.orderCount)}건`}
          icon={ShoppingCart}
          color="bg-green-50 text-green-600"
        />
        <KpiCard
          title="평균 주문금액"
          value={formatKRW(metrics.kpi.avgOrderAmount)}
          icon={TrendingUp}
          color="bg-amber-50 text-amber-600"
        />
        <KpiCard
          title="활성 고객 수"
          value={`${formatNumber(metrics.kpi.activeCustomerCount)}명`}
          icon={Users}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      <DashboardCharts metrics={metrics} />
      <div className="mt-6">
        <TopTables metrics={metrics} />
      </div>
    </div>
  );
}
