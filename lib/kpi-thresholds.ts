export type KpiStatusLevel = "normal" | "caution" | "severe" | "danger";

export interface KpiStatusResult {
  level: KpiStatusLevel;
  label: string;
  description: string;
}

export const KPI_STATUS_LABELS: Record<KpiStatusLevel, string> = {
  normal: "정상",
  caution: "주의",
  severe: "심각",
  danger: "위험",
};

export const KPI_STATUS_STYLES: Record<
  KpiStatusLevel,
  { color: string; topLineColor: string; badge: string; card: string }
> = {
  normal: {
    color: "bg-green-50 text-green-600",
    topLineColor: "border-t-green-600",
    badge: "bg-green-100 text-green-700",
    card: "bg-white border-gray-200",
  },
  caution: {
    color: "bg-amber-50 text-amber-600",
    topLineColor: "border-t-amber-600",
    badge: "bg-amber-100 text-amber-700",
    card: "bg-white border-gray-200",
  },
  severe: {
    color: "bg-white text-orange-600",
    topLineColor: "border-t-orange-600",
    badge: "bg-orange-200 text-orange-800",
    card: "bg-orange-50 border-orange-200",
  },
  danger: {
    color: "bg-white text-red-600",
    topLineColor: "border-t-red-600",
    badge: "bg-red-200 text-red-800",
    card: "bg-red-50 border-red-200",
  },
};

/** 매출총이익률(%) — 높을수록 양호. 이 값 이상이면 해당 단계 */
export const GROSS_PROFIT_RATE_THRESHOLDS = {
  normal: 30,
  caution: 20,
  severe: 10,
} as const;

/** 취소율(%) — 낮을수록 양호. 이 값 이하이면 해당 단계 */
export const CANCEL_RATE_THRESHOLDS = {
  normal: 3,
  caution: 5,
  severe: 10,
} as const;

/** 반품율(%) — 낮을수록 양호. 이 값 이하이면 해당 단계 */
export const RETURN_RATE_THRESHOLDS = {
  normal: 2,
  caution: 5,
  severe: 8,
} as const;

/** 재고 위험 — 전체 상품 대비 비율(%) — 낮을수록 양호 (0건=정상) */
export const INVENTORY_RISK_RATIO_THRESHOLDS = {
  caution: 5,
  severe: 15,
} as const;

/** 단종 상품 — 전체 상품 대비 비율(%) — 낮을수록 양호 (0건=정상) */
export const DISCONTINUED_RATIO_THRESHOLDS = {
  caution: 5,
  severe: 15,
} as const;

function toStatusResult(level: KpiStatusLevel, description: string): KpiStatusResult {
  return { level, label: KPI_STATUS_LABELS[level], description };
}

function evaluateHigherBetter(
  value: number,
  thresholds: { normal: number; caution: number; severe: number },
  descriptions: Record<KpiStatusLevel, string>
): KpiStatusResult {
  if (value >= thresholds.normal) return toStatusResult("normal", descriptions.normal);
  if (value >= thresholds.caution) return toStatusResult("caution", descriptions.caution);
  if (value >= thresholds.severe) return toStatusResult("severe", descriptions.severe);
  return toStatusResult("danger", descriptions.danger);
}

function evaluateLowerBetter(
  value: number,
  thresholds: { normal: number; caution: number; severe: number },
  descriptions: Record<KpiStatusLevel, string>
): KpiStatusResult {
  if (value <= thresholds.normal) return toStatusResult("normal", descriptions.normal);
  if (value <= thresholds.caution) return toStatusResult("caution", descriptions.caution);
  if (value <= thresholds.severe) return toStatusResult("severe", descriptions.severe);
  return toStatusResult("danger", descriptions.danger);
}

function evaluateCountRatio(
  count: number,
  total: number,
  ratioThresholds: { caution: number; severe: number },
  descriptions: Record<KpiStatusLevel, string>
): KpiStatusResult {
  if (count === 0) return toStatusResult("normal", descriptions.normal);

  const ratio = total > 0 ? (count / total) * 100 : 100;
  if (ratio <= ratioThresholds.caution) return toStatusResult("caution", descriptions.caution);
  if (ratio <= ratioThresholds.severe) return toStatusResult("severe", descriptions.severe);
  return toStatusResult("danger", descriptions.danger);
}

export function evaluateGrossProfitRate(value: number): KpiStatusResult {
  return evaluateHigherBetter(value, GROSS_PROFIT_RATE_THRESHOLDS, {
    normal: "기준: 30% 이상",
    caution: "기준: 20% 이상 ~ 30% 미만",
    severe: "기준: 10% 이상 ~ 20% 미만",
    danger: "기준: 10% 미만",
  });
}

export function evaluateCancelRate(value: number): KpiStatusResult {
  return evaluateLowerBetter(value, CANCEL_RATE_THRESHOLDS, {
    normal: "기준: 3% 이하",
    caution: "기준: 3% 초과 ~ 5% 이하",
    severe: "기준: 5% 초과 ~ 10% 이하",
    danger: "기준: 10% 초과",
  });
}

export function evaluateReturnRate(value: number): KpiStatusResult {
  return evaluateLowerBetter(value, RETURN_RATE_THRESHOLDS, {
    normal: "기준: 2% 이하",
    caution: "기준: 2% 초과 ~ 5% 이하",
    severe: "기준: 5% 초과 ~ 8% 이하",
    danger: "기준: 8% 초과",
  });
}

export function evaluateInventoryRisk(count: number, productCount: number): KpiStatusResult {
  return evaluateCountRatio(count, productCount, INVENTORY_RISK_RATIO_THRESHOLDS, {
    normal: "기준: 0건",
    caution: `기준: 1건 이상, 전체 상품의 ${INVENTORY_RISK_RATIO_THRESHOLDS.caution}% 이하`,
    severe: `기준: 전체 상품의 ${INVENTORY_RISK_RATIO_THRESHOLDS.caution}% 초과 ~ ${INVENTORY_RISK_RATIO_THRESHOLDS.severe}% 이하`,
    danger: `기준: 전체 상품의 ${INVENTORY_RISK_RATIO_THRESHOLDS.severe}% 초과`,
  });
}

export function evaluateDiscontinued(count: number, productCount: number): KpiStatusResult {
  return evaluateCountRatio(count, productCount, DISCONTINUED_RATIO_THRESHOLDS, {
    normal: "기준: 0건",
    caution: `기준: 1건 이상, 전체 상품의 ${DISCONTINUED_RATIO_THRESHOLDS.caution}% 이하`,
    severe: `기준: 전체 상품의 ${DISCONTINUED_RATIO_THRESHOLDS.caution}% 초과 ~ ${DISCONTINUED_RATIO_THRESHOLDS.severe}% 이하`,
    danger: `기준: 전체 상품의 ${DISCONTINUED_RATIO_THRESHOLDS.severe}% 초과`,
  });
}

export function getKpiStatusStyles(status: KpiStatusResult) {
  return KPI_STATUS_STYLES[status.level];
}
