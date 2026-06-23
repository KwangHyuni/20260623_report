import { getDb } from "./index";
import { TABLE_CONFIG, type TableName } from "@/lib/constants";
import Papa from "papaparse";

type CsvRow = Record<string, string>;

const SQL_TABLE_MAP: Record<TableName, string> = {
  orders: "sales_orders",
  order_items: "sales_order_items",
  customers: "customers",
  products: "products",
};

export function validateHeaders(table: TableName, headers: string[]): string | null {
  const required = TABLE_CONFIG[table].requiredHeaders;
  const missing = required.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    return `필수 컬럼이 누락되었습니다: ${missing.join(", ")}`;
  }
  return null;
}

function stripBom(content: string): string {
  return content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
}

export function parseCsvContent(content: string): { headers: string[]; rows: CsvRow[] } {
  const cleaned = stripBom(content.replace(/^\uFEFF/, "")).trimEnd();
  const result = Papa.parse<CsvRow>(cleaned, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().replace(/^\uFEFF/, ""),
  });

  const criticalErrors = result.errors.filter(
    (e) => e.code !== "TooFewFields" && e.code !== "TooManyFields"
  );
  if (criticalErrors.length > 0) {
    throw new Error(`CSV 파싱 오류: ${criticalErrors[0].message}`);
  }

  const headers = (result.meta.fields ?? []).map((h) => h.replace(/^\uFEFF/, "").trim());
  const rows = result.data.filter((row) =>
    headers.some((h) => row[h] !== undefined && String(row[h]).trim() !== "")
  );

  return { headers, rows };
}

function insertOrders(rows: CsvRow[]) {
  const db = getDb();
  const insert = db.prepare(`
    INSERT OR REPLACE INTO sales_orders
    (order_no, customer_id, order_date, status, channel, payment_method, total_amount_krw)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const tx = db.transaction((data: CsvRow[]) => {
    for (const row of data) {
      insert.run(
        Number(row.order_no),
        Number(row.customer_id),
        row.order_date,
        row.status,
        row.channel,
        row.payment_method,
        Number(row.total_amount_krw)
      );
    }
  });
  tx(rows);
}

function insertOrderItems(rows: CsvRow[]) {
  const db = getDb();
  const insert = db.prepare(`
    INSERT OR REPLACE INTO sales_order_items
    (order_item_id, order_no, product_id, qty, unit_price_krw, discount_pct, amount_krw)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const tx = db.transaction((data: CsvRow[]) => {
    for (const row of data) {
      insert.run(
        Number(row.order_item_id),
        Number(row.order_no),
        Number(row.product_id),
        Number(row.qty),
        Number(row.unit_price_krw),
        Number(row.discount_pct),
        Number(row.amount_krw)
      );
    }
  });
  tx(rows);
}

function insertCustomers(rows: CsvRow[]) {
  const db = getDb();
  const insert = db.prepare(`
    INSERT OR REPLACE INTO customers
    (customer_id, customer_name, customer_type, city, phone, email, join_date, tier)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const tx = db.transaction((data: CsvRow[]) => {
    for (const row of data) {
      insert.run(
        Number(row.customer_id),
        row.customer_name,
        row.customer_type,
        row.city,
        row.phone,
        row.email,
        row.join_date,
        row.tier
      );
    }
  });
  tx(rows);
}

function insertProducts(rows: CsvRow[]) {
  const db = getDb();
  const insert = db.prepare(`
    INSERT OR REPLACE INTO products
    (product_id, product_name, category, brand, unit_cost_krw, unit_price_krw, stock_qty, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const tx = db.transaction((data: CsvRow[]) => {
    for (const row of data) {
      insert.run(
        Number(row.product_id),
        row.product_name,
        row.category,
        row.brand,
        Number(row.unit_cost_krw),
        Number(row.unit_price_krw),
        Number(row.stock_qty),
        row.status
      );
    }
  });
  tx(rows);
}

const INSERTERS: Record<TableName, (rows: CsvRow[]) => void> = {
  orders: insertOrders,
  order_items: insertOrderItems,
  customers: insertCustomers,
  products: insertProducts,
};

export function ingestCsv(
  table: TableName,
  content: string,
  fileName: string,
  replace = true
): { rowCount: number } {
  const { headers, rows } = parseCsvContent(content);
  const headerError = validateHeaders(table, headers);
  if (headerError) throw new Error(headerError);
  if (rows.length === 0) throw new Error("CSV 파일에 데이터가 없습니다.");

  const db = getDb();
  const sqlTable = SQL_TABLE_MAP[table];

  if (replace) {
    db.prepare(`DELETE FROM ${sqlTable}`).run();
  }

  INSERTERS[table](rows);

  const now = new Date().toISOString();
  db.prepare(
    `INSERT OR REPLACE INTO data_meta (table_name, row_count, file_name, updated_at)
     VALUES (?, ?, ?, ?)`
  ).run(table, rows.length, fileName, now);

  return { rowCount: rows.length };
}
