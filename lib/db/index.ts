import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = process.env.VERCEL
  ? path.join("/tmp", "erp-db")
  : path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "erp.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS sales_orders (
      order_no INTEGER PRIMARY KEY,
      customer_id INTEGER,
      order_date TEXT,
      status TEXT,
      channel TEXT,
      payment_method TEXT,
      total_amount_krw REAL
    );

    CREATE TABLE IF NOT EXISTS sales_order_items (
      order_item_id INTEGER PRIMARY KEY,
      order_no INTEGER,
      product_id INTEGER,
      qty INTEGER,
      unit_price_krw REAL,
      discount_pct REAL,
      amount_krw REAL
    );

    CREATE TABLE IF NOT EXISTS customers (
      customer_id INTEGER PRIMARY KEY,
      customer_name TEXT,
      customer_type TEXT,
      city TEXT,
      phone TEXT,
      email TEXT,
      join_date TEXT,
      tier TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      product_id INTEGER PRIMARY KEY,
      product_name TEXT,
      category TEXT,
      brand TEXT,
      unit_cost_krw REAL,
      unit_price_krw REAL,
      stock_qty INTEGER,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS data_meta (
      table_name TEXT PRIMARY KEY,
      row_count INTEGER,
      file_name TEXT,
      updated_at TEXT
    );
  `);
}

export function getTableRowCount(tableName: string): number {
  const tableMap: Record<string, string> = {
    orders: "sales_orders",
    order_items: "sales_order_items",
    customers: "customers",
    products: "products",
  };
  const sqlTable = tableMap[tableName];
  if (!sqlTable) return 0;
  const result = getDb()
    .prepare(`SELECT COUNT(*) as count FROM ${sqlTable}`)
    .get() as { count: number };
  return result.count;
}

export function getDataStatus() {
  const tables = ["orders", "order_items", "customers", "products"] as const;
  const meta = getDb()
    .prepare("SELECT * FROM data_meta")
    .all() as Array<{
    table_name: string;
    row_count: number;
    file_name: string;
    updated_at: string;
  }>;

  const metaMap = Object.fromEntries(meta.map((m) => [m.table_name, m]));

  return tables.map((t) => ({
    table: t,
    rowCount: getTableRowCount(t),
    fileName: metaMap[t]?.file_name ?? null,
    updatedAt: metaMap[t]?.updated_at ?? null,
  }));
}

export function hasAnyData(): boolean {
  return getDataStatus().some((s) => s.rowCount > 0);
}

const SQL_TABLE_MAP: Record<string, string> = {
  orders: "sales_orders",
  order_items: "sales_order_items",
  customers: "customers",
  products: "products",
};

export function clearTableData(tableName: string) {
  const sqlTable = SQL_TABLE_MAP[tableName];
  if (!sqlTable) throw new Error("유효하지 않은 테이블입니다.");
  const database = getDb();
  database.prepare(`DELETE FROM ${sqlTable}`).run();
  database.prepare(`DELETE FROM data_meta WHERE table_name = ?`).run(tableName);
}

export function clearAllData() {
  const database = getDb();
  database.exec(`
    DELETE FROM sales_orders;
    DELETE FROM sales_order_items;
    DELETE FROM customers;
    DELETE FROM products;
    DELETE FROM data_meta;
  `);
}
