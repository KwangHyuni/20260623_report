import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKRW(value: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

/** 원화 금액 컬럼 (원본 데이터 등) */
export const KRW_COLUMNS = new Set([
  "total_amount_krw",
  "unit_price_krw",
  "unit_cost_krw",
  "amount_krw",
]);

export function formatRawCellValue(column: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (KRW_COLUMNS.has(column)) {
    const num = Number(value);
    if (!Number.isNaN(num)) return formatKRW(num);
  }
  return String(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
