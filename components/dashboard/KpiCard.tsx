import { cn } from "@/lib/utils";
import type { KpiStatusResult } from "@/lib/kpi-thresholds";
import { getKpiStatusStyles } from "@/lib/kpi-thresholds";
import { AutoFitText } from "@/components/ui/AutoFitText";
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
        "flex h-full min-h-[8.5rem] flex-col rounded-lg border border-t-4 p-5 shadow-sm",
        cardClass,
        lineColor
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-h-6 min-w-0 flex-1 flex-wrap items-center gap-2">
          <p className="text-sm font-medium leading-tight text-gray-500">{title}</p>
          {status && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold leading-none",
                statusStyles!.badge
              )}
            >
              {status.label}
            </span>
          )}
        </div>
        <div className={cn("shrink-0 rounded-lg p-2.5", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-auto flex flex-col justify-end">
        <div className="flex h-8 items-end">
          <AutoFitText
            className="font-bold text-gray-900"
            maxFontSize={24}
            minFontSize={11}
          >
            {value}
          </AutoFitText>
        </div>

        <div className="mt-1 min-h-10">
          {status && (
            <p className="line-clamp-2 text-xs leading-snug text-gray-400">
              {status.description}
            </p>
          )}
          {subtitle && (
            <p
              className={cn(
                "line-clamp-1 text-xs leading-snug text-gray-400",
                status && "mt-0.5"
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
