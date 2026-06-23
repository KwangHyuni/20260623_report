import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { TableName } from "@/lib/constants";

const TABLE_MAP: Record<TableName, { sql: string; columns: string[] }> = {
  orders: {
    sql: "sales_orders",
    columns: [
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
    sql: "sales_order_items",
    columns: [
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
    sql: "customers",
    columns: [
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
    sql: "products",
    columns: [
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

const FILTER_COLUMNS: Partial<Record<TableName, string>> = {
  orders: "status",
  products: "category",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table") as TableName | null;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") ?? "50", 10)));
    const search = searchParams.get("search") ?? "";
    const filter = searchParams.get("filter") ?? "";
    const sortBy = searchParams.get("sortBy") ?? "";
    const sortDir = searchParams.get("sortDir") === "desc" ? "DESC" : "ASC";

    if (!table || !TABLE_MAP[table]) {
      return NextResponse.json({ error: "유효하지 않은 테이블입니다." }, { status: 400 });
    }

    const config = TABLE_MAP[table];
    const db = getDb();
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params: (string | number)[] = [];

    if (search) {
      const searchCols = config.columns.slice(0, 3);
      const searchConditions = searchCols
        .map((col) => `CAST(${col} AS TEXT) LIKE ?`)
        .join(" OR ");
      whereClause += ` AND (${searchConditions})`;
      searchCols.forEach(() => params.push(`%${search}%`));
    }

    const filterCol = FILTER_COLUMNS[table];
    if (filter && filterCol) {
      whereClause += ` AND ${filterCol} = ?`;
      params.push(filter);
    }

    const orderCol =
      sortBy && config.columns.includes(sortBy) ? sortBy : config.columns[0];

    const countRow = db
      .prepare(`SELECT COUNT(*) as total FROM ${config.sql} ${whereClause}`)
      .get(...params) as { total: number };

    const rows = db
      .prepare(
        `SELECT * FROM ${config.sql} ${whereClause} ORDER BY ${orderCol} ${sortDir} LIMIT ? OFFSET ?`
      )
      .all(...params, limit, offset);

    const filterOptions: string[] = [];
    if (filterCol) {
      const opts = db
        .prepare(`SELECT DISTINCT ${filterCol} as val FROM ${config.sql} ORDER BY val`)
        .all() as Array<{ val: string }>;
      filterOptions.push(...opts.map((o) => o.val));
    }

    return NextResponse.json({
      table,
      columns: config.columns,
      rows,
      pagination: {
        page,
        limit,
        total: countRow.total,
        totalPages: Math.ceil(countRow.total / limit),
      },
      filterOptions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "데이터 조회 실패" },
      { status: 500 }
    );
  }
}
