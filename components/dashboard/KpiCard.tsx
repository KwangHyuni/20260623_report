import { cn } from "@/lib/utils";
import type { KpiStatusResult } from "@/lib/kpi-thresholds";
import { getKpiStatusStyles } from "@/lib/kpi-thresholds";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  topLineColor?: string;
  status?: KpiStatusResult;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "bg-primary-50 text-primary-600",
  topLineColor = "border-t-primary-600",
  status,
}: KpiCardProps) {
  const statusStyles = status ? getKpiStatusStyles(status) : null;
  const iconColor = statusStyles?.color ?? color;
  const lineColor = statusStyles?.topLineColor ?? topLineColor;
  const cardClass = statusStyles?.card ?? "bg-white border-gray-200";

  return (
    <div
      className={cn(
        "rounded-lg border border-t-4 p-5 shadow-sm",
        cardClass,
        lineColor
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {status && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  statusStyles!.badge
                )}
              >
                {status.label}
              </span>
            )}
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {status && (
            <p className="mt-1 text-xs text-gray-400">{status.description}</p>
          )}
          {subtitle && !status && (
            <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
          )}
          {subtitle && status && (
            <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className={cn("ml-2 shrink-0 rounded-lg p-2.5", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
