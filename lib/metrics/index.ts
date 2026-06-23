import { hasAnyData, getDb } from "@/lib/db";

export interface MetricsData {
  generatedAt: string;
  hasData: boolean;
  period: { start: string; end: string } | null;
  kpi: {
    totalRevenue: number;
    orderCount: number;
    avgOrderAmount: number;
    activeCustomerCount: number;
    itemCount: number;
    productCount: number;
  };
  monthlyRevenue: Array<{ month: string; revenue: number; orderCount: number }>;
  channelRevenue: Array<{ channel: string; revenue: number; orderCount: number }>;
  categoryRevenue: Array<{ category: string; revenue: number; qty: number }>;
  statusDistribution: Array<{ status: string; count: number; revenue: number }>;
  paymentMethodRevenue: Array<{ paymentMethod: string; revenue: number; count: number }>;
  topCustomers: Array<{ customerId: number; customerName: string; revenue: number; orderCount: number }>;
  topProducts: Array<{ productId: number; productName: string; category: string; revenue: number; qty: number }>;
}

export function computeMetrics(): MetricsData {
  const db = getDb();

  if (!hasAnyData()) {
    return {
      generatedAt: new Date().toISOString(),
      hasData: false,
      period: null,
      kpi: {
        totalRevenue: 0,
        orderCount: 0,
        avgOrderAmount: 0,
        activeCustomerCount: 0,
        itemCount: 0,
        productCount: 0,
      },
      monthlyRevenue: [],
      channelRevenue: [],
      categoryRevenue: [],
      statusDistribution: [],
      paymentMethodRevenue: [],
      topCustomers: [],
      topProducts: [],
    };
  }

  const kpiRow = db
    .prepare(
      `SELECT
        COALESCE(SUM(total_amount_krw), 0) as totalRevenue,
        COUNT(*) as orderCount,
        COALESCE(AVG(total_amount_krw), 0) as avgOrderAmount,
        COUNT(DISTINCT customer_id) as activeCustomerCount
      FROM sales_orders
      WHERE status != '취소'`
    )
    .get() as {
    totalRevenue: number;
    orderCount: number;
    avgOrderAmount: number;
    activeCustomerCount: number;
  };

  const itemCount = (
    db.prepare("SELECT COUNT(*) as c FROM sales_order_items").get() as { c: number }
  ).c;
  const productCount = (
    db.prepare("SELECT COUNT(*) as c FROM products").get() as { c: number }
  ).c;

  const periodRow = db
    .prepare(
      `SELECT MIN(order_date) as start, MAX(order_date) as end FROM sales_orders`
    )
    .get() as { start: string; end: string };

  const monthlyRevenue = db
    .prepare(
      `SELECT
        strftime('%Y-%m', order_date) as month,
        COALESCE(SUM(total_amount_krw), 0) as revenue,
        COUNT(*) as orderCount
      FROM sales_orders
      WHERE status != '취소'
      GROUP BY strftime('%Y-%m', order_date)
      ORDER BY month`
    )
    .all() as Array<{ month: string; revenue: number; orderCount: number }>;

  const channelRevenue = db
    .prepare(
      `SELECT
        channel,
        COALESCE(SUM(total_amount_krw), 0) as revenue,
        COUNT(*) as orderCount
      FROM sales_orders
      WHERE status != '취소'
      GROUP BY channel
      ORDER BY revenue DESC`
    )
    .all() as Array<{ channel: string; revenue: number; orderCount: number }>;

  const categoryRevenue = db
    .prepare(
      `SELECT
        p.category,
        COALESCE(SUM(oi.amount_krw), 0) as revenue,
        COALESCE(SUM(oi.qty), 0) as qty
      FROM sales_order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN sales_orders o ON oi.order_no = o.order_no
      WHERE o.status != '취소'
      GROUP BY p.category
      ORDER BY revenue DESC`
    )
    .all() as Array<{ category: string; revenue: number; qty: number }>;

  const statusDistribution = db
    .prepare(
      `SELECT
        status,
        COUNT(*) as count,
        COALESCE(SUM(total_amount_krw), 0) as revenue
      FROM sales_orders
      GROUP BY status
      ORDER BY count DESC`
    )
    .all() as Array<{ status: string; count: number; revenue: number }>;

  const paymentMethodRevenue = db
    .prepare(
      `SELECT
        payment_method as paymentMethod,
        COALESCE(SUM(total_amount_krw), 0) as revenue,
        COUNT(*) as count
      FROM sales_orders
      WHERE status != '취소'
      GROUP BY payment_method
      ORDER BY revenue DESC`
    )
    .all() as Array<{ paymentMethod: string; revenue: number; count: number }>;

  const topCustomers = db
    .prepare(
      `SELECT
        c.customer_id as customerId,
        c.customer_name as customerName,
        COALESCE(SUM(o.total_amount_krw), 0) as revenue,
        COUNT(o.order_no) as orderCount
      FROM sales_orders o
      JOIN customers c ON o.customer_id = c.customer_id
      WHERE o.status != '취소'
      GROUP BY c.customer_id, c.customer_name
      ORDER BY revenue DESC
      LIMIT 10`
    )
    .all() as Array<{
    customerId: number;
    customerName: string;
    revenue: number;
    orderCount: number;
  }>;

  const topProducts = db
    .prepare(
      `SELECT
        p.product_id as productId,
        p.product_name as productName,
        p.category,
        COALESCE(SUM(oi.amount_krw), 0) as revenue,
        COALESCE(SUM(oi.qty), 0) as qty
      FROM sales_order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN sales_orders o ON oi.order_no = o.order_no
      WHERE o.status != '취소'
      GROUP BY p.product_id, p.product_name, p.category
      ORDER BY revenue DESC
      LIMIT 10`
    )
    .all() as Array<{
    productId: number;
    productName: string;
    category: string;
    revenue: number;
    qty: number;
  }>;

  return {
    generatedAt: new Date().toISOString(),
    hasData: true,
    period: periodRow.start ? { start: periodRow.start, end: periodRow.end } : null,
    kpi: {
      totalRevenue: kpiRow.totalRevenue,
      orderCount: kpiRow.orderCount,
      avgOrderAmount: kpiRow.avgOrderAmount,
      activeCustomerCount: kpiRow.activeCustomerCount,
      itemCount,
      productCount,
    },
    monthlyRevenue,
    channelRevenue,
    categoryRevenue,
    statusDistribution,
    paymentMethodRevenue,
    topCustomers,
    topProducts,
  };
}
