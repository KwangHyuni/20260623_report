import { hasAnyData, getDb } from "@/lib/db";

const VALID_ORDER_FILTER = "o.status NOT IN ('취소', '반품')";
const INVENTORY_RISK_THRESHOLD = 50;

export interface MetricsData {
  generatedAt: string;
  hasData: boolean;
  period: { start: string; end: string } | null;
  kpi: {
    validRevenue: number;
    cogs: number;
    grossProfit: number;
    grossProfitRate: number;
    avgOrderAmount: number;
    salesQty: number;
    cancelRate: number;
    returnRate: number;
    activeCustomerCount: number;
    inventoryRiskCount: number;
    discontinuedCount: number;
    totalTransactionAmount: number;
    productCount: number;
    customerCount: number;
    orderCount: number;
    validOrderCount: number;
  };
  monthlyRevenue: Array<{ month: string; revenue: number; orderCount: number }>;
  channelRevenue: Array<{ channel: string; revenue: number; orderCount: number }>;
  categoryRevenue: Array<{ category: string; revenue: number; orderCount: number }>;
  paymentMethodRevenue: Array<{ paymentMethod: string; revenue: number; count: number }>;
  tierRevenue: Array<{ tier: string; revenue: number; orderCount: number }>;
  brandRevenue: Array<{ brand: string; revenue: number; qty: number }>;
  regionRevenue: Array<{ city: string; revenue: number; orderCount: number }>;
  statusDistribution: Array<{ status: string; count: number; revenue: number }>;
  inventoryRisk: Array<{
    productId: number;
    productName: string;
    category: string;
    brand: string;
    stockQty: number;
    unitPriceKrw: number;
  }>;
  topCustomers: Array<{ customerId: number; customerName: string; revenue: number; orderCount: number }>;
  topProducts: Array<{ productId: number; productName: string; category: string; revenue: number; qty: number }>;
}

const EMPTY_KPI = {
  validRevenue: 0,
  cogs: 0,
  grossProfit: 0,
  grossProfitRate: 0,
  avgOrderAmount: 0,
  salesQty: 0,
  cancelRate: 0,
  returnRate: 0,
  activeCustomerCount: 0,
  inventoryRiskCount: 0,
  discontinuedCount: 0,
  totalTransactionAmount: 0,
  productCount: 0,
  customerCount: 0,
  orderCount: 0,
  validOrderCount: 0,
};

export function computeMetrics(): MetricsData {
  const db = getDb();

  if (!hasAnyData()) {
    return {
      generatedAt: new Date().toISOString(),
      hasData: false,
      period: null,
      kpi: EMPTY_KPI,
      monthlyRevenue: [],
      channelRevenue: [],
      categoryRevenue: [],
      paymentMethodRevenue: [],
      tierRevenue: [],
      brandRevenue: [],
      regionRevenue: [],
      statusDistribution: [],
      inventoryRisk: [],
      topCustomers: [],
      topProducts: [],
    };
  }

  const salesRow = db
    .prepare(
      `SELECT
        COALESCE(SUM(oi.amount_krw), 0) as validRevenue,
        COALESCE(SUM(oi.qty * p.unit_cost_krw), 0) as cogs,
        COALESCE(SUM(oi.qty), 0) as salesQty
      FROM sales_order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN sales_orders o ON oi.order_no = o.order_no
      WHERE ${VALID_ORDER_FILTER}`
    )
    .get() as { validRevenue: number; cogs: number; salesQty: number };

  const grossProfit = salesRow.validRevenue - salesRow.cogs;
  const grossProfitRate =
    salesRow.validRevenue > 0 ? (grossProfit / salesRow.validRevenue) * 100 : 0;

  const orderStats = db
    .prepare(
      `SELECT
        COUNT(*) as orderCount,
        COUNT(CASE WHEN status NOT IN ('취소', '반품') THEN 1 END) as validOrderCount,
        COALESCE(SUM(total_amount_krw), 0) as totalTransactionAmount,
        COALESCE(AVG(CASE WHEN status NOT IN ('취소', '반품') THEN total_amount_krw END), 0) as avgOrderAmount,
        COUNT(DISTINCT CASE WHEN status NOT IN ('취소', '반품') THEN customer_id END) as activeCustomerCount,
        COUNT(CASE WHEN status = '취소' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as cancelRate,
        COUNT(CASE WHEN status = '반품' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as returnRate
      FROM sales_orders`
    )
    .get() as {
    orderCount: number;
    validOrderCount: number;
    totalTransactionAmount: number;
    avgOrderAmount: number;
    activeCustomerCount: number;
    cancelRate: number;
    returnRate: number;
  };

  const productCount = (
    db.prepare("SELECT COUNT(*) as c FROM products").get() as { c: number }
  ).c;
  const customerCount = (
    db.prepare("SELECT COUNT(*) as c FROM customers").get() as { c: number }
  ).c;
  const discontinuedCount = (
    db
      .prepare("SELECT COUNT(*) as c FROM products WHERE TRIM(status) = '단종'")
      .get() as { c: number }
  ).c;
  const inventoryRiskCount = (
    db
      .prepare(
        `SELECT COUNT(*) as c FROM products
         WHERE TRIM(status) = '판매중' AND stock_qty < ?`
      )
      .get(INVENTORY_RISK_THRESHOLD) as { c: number }
  ).c;

  const periodRow = db
    .prepare(`SELECT MIN(order_date) as start, MAX(order_date) as end FROM sales_orders`)
    .get() as { start: string; end: string };

  const monthlyRevenue = db
    .prepare(
      `SELECT
        strftime('%Y-%m', order_date) as month,
        COALESCE(SUM(total_amount_krw), 0) as revenue,
        COUNT(*) as orderCount
      FROM sales_orders
      WHERE status NOT IN ('취소', '반품')
      GROUP BY strftime('%Y-%m', order_date)
      ORDER BY month`
    )
    .all() as Array<{ month: string; revenue: number; orderCount: number }>;

  const channelRevenue = db
    .prepare(
      `SELECT channel, COALESCE(SUM(total_amount_krw), 0) as revenue, COUNT(*) as orderCount
       FROM sales_orders WHERE status NOT IN ('취소', '반품')
       GROUP BY channel ORDER BY revenue DESC`
    )
    .all() as Array<{ channel: string; revenue: number; orderCount: number }>;

  const categoryRevenue = db
    .prepare(
      `SELECT p.category, COALESCE(SUM(oi.amount_krw), 0) as revenue, COUNT(DISTINCT o.order_no) as orderCount
       FROM sales_order_items oi
       JOIN products p ON oi.product_id = p.product_id
       JOIN sales_orders o ON oi.order_no = o.order_no
       WHERE ${VALID_ORDER_FILTER}
       GROUP BY p.category ORDER BY revenue DESC`
    )
    .all() as Array<{ category: string; revenue: number; orderCount: number }>;

  const paymentMethodRevenue = db
    .prepare(
      `SELECT payment_method as paymentMethod, COALESCE(SUM(total_amount_krw), 0) as revenue, COUNT(*) as count
       FROM sales_orders WHERE status NOT IN ('취소', '반품')
       GROUP BY payment_method ORDER BY revenue DESC`
    )
    .all() as Array<{ paymentMethod: string; revenue: number; count: number }>;

  const tierRevenue = db
    .prepare(
      `SELECT c.tier, COALESCE(SUM(o.total_amount_krw), 0) as revenue, COUNT(o.order_no) as orderCount
       FROM sales_orders o
       JOIN customers c ON o.customer_id = c.customer_id
       WHERE o.status NOT IN ('취소', '반품')
       GROUP BY c.tier ORDER BY revenue DESC`
    )
    .all() as Array<{ tier: string; revenue: number; orderCount: number }>;

  const brandRevenue = db
    .prepare(
      `SELECT p.brand, COALESCE(SUM(oi.amount_krw), 0) as revenue, COALESCE(SUM(oi.qty), 0) as qty
       FROM sales_order_items oi
       JOIN products p ON oi.product_id = p.product_id
       JOIN sales_orders o ON oi.order_no = o.order_no
       WHERE ${VALID_ORDER_FILTER}
       GROUP BY p.brand ORDER BY revenue DESC LIMIT 10`
    )
    .all() as Array<{ brand: string; revenue: number; qty: number }>;

  const regionRevenue = db
    .prepare(
      `SELECT c.city, COALESCE(SUM(o.total_amount_krw), 0) as revenue, COUNT(o.order_no) as orderCount
       FROM sales_orders o
       JOIN customers c ON o.customer_id = c.customer_id
       WHERE o.status NOT IN ('취소', '반품')
       GROUP BY c.city ORDER BY revenue DESC LIMIT 10`
    )
    .all() as Array<{ city: string; revenue: number; orderCount: number }>;

  const statusDistribution = db
    .prepare(
      `SELECT status, COUNT(*) as count, COALESCE(SUM(total_amount_krw), 0) as revenue
       FROM sales_orders GROUP BY status ORDER BY count DESC`
    )
    .all() as Array<{ status: string; count: number; revenue: number }>;

  const inventoryRisk = db
    .prepare(
      `SELECT product_id as productId, product_name as productName, category, brand,
              stock_qty as stockQty, unit_price_krw as unitPriceKrw
       FROM products
       WHERE TRIM(status) = '판매중' AND stock_qty < ?
       ORDER BY stock_qty ASC LIMIT 20`
    )
    .all(INVENTORY_RISK_THRESHOLD) as MetricsData["inventoryRisk"];

  const topCustomers = db
    .prepare(
      `SELECT c.customer_id as customerId, c.customer_name as customerName,
              COALESCE(SUM(o.total_amount_krw), 0) as revenue, COUNT(o.order_no) as orderCount
       FROM sales_orders o
       JOIN customers c ON o.customer_id = c.customer_id
       WHERE o.status NOT IN ('취소', '반품')
       GROUP BY c.customer_id, c.customer_name
       ORDER BY revenue DESC LIMIT 10`
    )
    .all() as MetricsData["topCustomers"];

  const topProducts = db
    .prepare(
      `SELECT p.product_id as productId, p.product_name as productName, p.category,
              COALESCE(SUM(oi.amount_krw), 0) as revenue, COALESCE(SUM(oi.qty), 0) as qty
       FROM sales_order_items oi
       JOIN products p ON oi.product_id = p.product_id
       JOIN sales_orders o ON oi.order_no = o.order_no
       WHERE ${VALID_ORDER_FILTER}
       GROUP BY p.product_id, p.product_name, p.category
       ORDER BY revenue DESC LIMIT 10`
    )
    .all() as MetricsData["topProducts"];

  return {
    generatedAt: new Date().toISOString(),
    hasData: true,
    period: periodRow.start ? { start: periodRow.start, end: periodRow.end } : null,
    kpi: {
      validRevenue: salesRow.validRevenue,
      cogs: salesRow.cogs,
      grossProfit,
      grossProfitRate,
      avgOrderAmount: orderStats.avgOrderAmount,
      salesQty: salesRow.salesQty,
      cancelRate: orderStats.cancelRate ?? 0,
      returnRate: orderStats.returnRate ?? 0,
      activeCustomerCount: orderStats.activeCustomerCount,
      inventoryRiskCount,
      discontinuedCount,
      totalTransactionAmount: orderStats.totalTransactionAmount,
      productCount,
      customerCount,
      orderCount: orderStats.orderCount,
      validOrderCount: orderStats.validOrderCount,
    },
    monthlyRevenue,
    channelRevenue,
    categoryRevenue,
    paymentMethodRevenue,
    tierRevenue,
    brandRevenue,
    regionRevenue,
    statusDistribution,
    inventoryRisk,
    topCustomers,
    topProducts,
  };
}
