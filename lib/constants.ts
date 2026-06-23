export type TableName = "orders" | "order_items" | "customers" | "products";

export const TABLE_CONFIG: Record<
  TableName,
  {
    label: string;
    fileName: string;
    requiredHeaders: string[];
  }
> = {
  orders: {
    label: "주문",
    fileName: "sales_orders.csv",
    requiredHeaders: [
      "order_no",
      "customer_id",
      "order_date",
      "status",
      "channel",
      "payment_method",
      "total_amount_krw",
    ],
  },
  order_items: {
    label: "주문 항목",
    fileName: "sales_order_items.csv",
    requiredHeaders: [
      "order_item_id",
      "order_no",
      "product_id",
      "qty",
      "unit_price_krw",
      "discount_pct",
      "amount_krw",
    ],
  },
  customers: {
    label: "고객",
    fileName: "customers.csv",
    requiredHeaders: [
      "customer_id",
      "customer_name",
      "customer_type",
      "city",
      "phone",
      "email",
      "join_date",
      "tier",
    ],
  },
  products: {
    label: "상품",
    fileName: "products.csv",
    requiredHeaders: [
      "product_id",
      "product_name",
      "category",
      "brand",
      "unit_cost_krw",
      "unit_price_krw",
      "stock_qty",
      "status",
    ],
  },
};

export const NAV_ITEMS = [
  { href: "/data-input", label: "데이터 입력" },
  { href: "/dashboard", label: "대시보드" },
  { href: "/report", label: "보고서 분석" },
  { href: "/raw-data", label: "원본 데이터" },
] as const;

/** 원본 데이터 컬럼 영문명 → 한글명 */
export const COLUMN_LABELS: Record<string, string> = {
  order_no: "주문번호",
  customer_id: "고객ID",
  order_date: "주문일자",
  status: "주문상태",
  channel: "판매채널",
  payment_method: "결제수단",
  total_amount_krw: "주문금액(원)",
  order_item_id: "주문항목ID",
  product_id: "상품ID",
  qty: "수량",
  unit_price_krw: "단가(원)",
  discount_pct: "할인율(%)",
  amount_krw: "금액(원)",
  customer_name: "고객명",
  customer_type: "고객유형",
  city: "도시",
  phone: "연락처",
  email: "이메일",
  join_date: "가입일자",
  tier: "고객등급",
  product_name: "상품명",
  category: "카테고리",
  brand: "브랜드",
  unit_cost_krw: "원가(원)",
  stock_qty: "재고수량",
};

export function getColumnLabel(column: string): string {
  return COLUMN_LABELS[column] ?? column;
}
