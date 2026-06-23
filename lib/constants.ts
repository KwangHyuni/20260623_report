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
