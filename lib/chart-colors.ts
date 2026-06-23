/** 딥블루 계열 파스텔 팔레트 (차트·테이블 목차 공통) */
export const DEEP_BLUE_PASTEL_HEX = [
  "#bfdbfe", // blue-200
  "#93c5fd", // blue-300
  "#60a5fa", // blue-400
  "#3b82f6", // blue-500
  "#2563eb", // blue-600
  "#1d4ed8", // blue-700
  "#818cf8", // indigo-400
  "#6366f1", // indigo-500
  "#7dd3fc", // sky-300
  "#1e40af", // blue-800
] as const;

export const PASTEL_CHART_COLORS = DEEP_BLUE_PASTEL_HEX;

export const PASTEL_CHART_PRIMARY = "#2563eb"; // blue-600

export const PASTEL_GRID_STROKE = "#dbeafe"; // blue-100

export const PASTEL_LABEL_LINE = "#93c5fd"; // blue-300

/**
 * 테이블 목차(헤더) — deep blue + gray, WCAG AA 대비 (4.5:1 이상)
 * 배경 gray-200 (#e5e7eb) + 글자 blue-950 (#172554) ≈ 11.2:1
 * 하단 구분선 blue-900으로 딥블루 포인트
 */
export const TABLE_HEADER_CLASS =
  "bg-gray-200 text-[#172554] border-b-2 border-blue-900";

/** 정렬 가능 목차 호버 — gray-300 배경 유지 대비 */
export const TABLE_HEADER_SORTABLE_CLASS = "hover:bg-gray-300 cursor-pointer select-none";

export function pastelChartColor(index: number): string {
  return PASTEL_CHART_COLORS[index % PASTEL_CHART_COLORS.length];
}

/** 부채꼴 그래프용 — 다양한 색 파스텔 톤 */
export const FAN_PASTEL_COLORS = [
  "#fda4af", // rose-300
  "#7dd3fc", // sky-300
  "#6ee7b7", // emerald-300
  "#fcd34d", // amber-300
  "#c4b5fd", // violet-300
  "#67e8f9", // cyan-300
  "#f9a8d4", // pink-300
  "#bef264", // lime-300
  "#fdba74", // orange-300
  "#5eead4", // teal-300
] as const;

export const FAN_PASTEL_LABEL_LINE = "#d1d5db"; // gray-300

export function fanPastelColor(index: number): string {
  return FAN_PASTEL_COLORS[index % FAN_PASTEL_COLORS.length];
}
