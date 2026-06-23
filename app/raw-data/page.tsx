"use client";

import { useCallback, useEffect, useState } from "react";
import { EmptyDataBanner } from "@/components/layout/EmptyDataBanner";
import { LoadingSpinner } from "@/components/layout/LoadingSpinner";
import { TABLE_CONFIG, getColumnLabel, type TableName } from "@/lib/constants";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn, formatRawCellValue, KRW_COLUMNS } from "@/lib/utils";
import {
  PastelTable,
  PastelTableHead,
  PastelTableBody,
  pastelThClass,
  tableRowClass,
  tableTdClass,
} from "@/components/table/PastelTable";
import { TABLE_HEADER_SORTABLE_CLASS } from "@/lib/chart-colors";

const TABLES: TableName[] = ["orders", "order_items", "customers", "products"];

interface RawDataResponse {
  columns: string[];
  rows: Record<string, unknown>[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  filterOptions: string[];
}

export default function RawDataPage() {
  const [hasData, setHasData] = useState<boolean | null>(null);
  const [activeTable, setActiveTable] = useState<TableName>("orders");
  const [data, setData] = useState<RawDataResponse | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetch("/api/data/status")
      .then((r) => r.json())
      .then((d) => setHasData(d.hasData))
      .catch(() => setHasData(false));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        table: activeTable,
        page: String(page),
        limit: "50",
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filter && { filter }),
        ...(sortBy && { sortBy, sortDir }),
      });
      const res = await fetch(`/api/data/raw?${params}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [activeTable, page, debouncedSearch, filter, sortBy, sortDir]);

  useEffect(() => {
    if (hasData) fetchData();
  }, [hasData, fetchData]);

  useEffect(() => {
    setPage(1);
    setFilter("");
    setSearch("");
    setSortBy("");
    setSortDir("asc");
  }, [activeTable]);

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 text-gray-500" />;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-blue-900" />
    ) : (
      <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-blue-900" />
    );
  };

  if (hasData === null) {
    return <LoadingSpinner message="로딩 중..." />;
  }

  if (!hasData) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">원본 데이터</h1>
        <EmptyDataBanner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">원본 데이터</h1>
        <p className="mt-1 text-sm text-gray-500">업로드된 ERP 데이터를 테이블로 확인합니다.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {TABLES.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTable(t)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTable === t
                ? "bg-primary-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}
          >
            {TABLE_CONFIG[t].label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="검색..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        {data?.filterOptions && data.filterOptions.length > 0 && (
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            <option value="">전체</option>
            {data.filterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <LoadingSpinner message="데이터를 불러오는 중..." size="sm" />
        ) : data ? (
          <>
            <div className="overflow-x-auto p-3">
              <PastelTable>
                <PastelTableHead>
                  <tr className="text-left">
                    {data.columns.map((col, colIndex) => (
                      <th
                        key={col}
                        className={cn(
                          pastelThClass(colIndex),
                          TABLE_HEADER_SORTABLE_CLASS,
                          "whitespace-nowrap"
                        )}
                        onClick={() => handleSort(col)}
                      >
                        {getColumnLabel(col)}
                        <SortIcon col={col} />
                      </th>
                    ))}
                  </tr>
                </PastelTableHead>
                <PastelTableBody>
                  {data.rows.map((row, i) => (
                    <tr key={i} className={tableRowClass}>
                      {data.columns.map((col) => (
                        <td
                          key={col}
                          className={cn(
                            tableTdClass,
                            "whitespace-nowrap",
                            KRW_COLUMNS.has(col) && "text-right tabular-nums"
                          )}
                        >
                          {formatRawCellValue(col, row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </PastelTableBody>
              </PastelTable>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-gray-50 px-4 py-3">
              <p className="text-sm text-gray-500">
                총 {data.pagination.total.toLocaleString()}건 중{" "}
                {((data.pagination.page - 1) * data.pagination.limit + 1).toLocaleString()}-
                {Math.min(
                  data.pagination.page * data.pagination.limit,
                  data.pagination.total
                ).toLocaleString()}
                건
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded p-1 hover:bg-gray-100 disabled:opacity-40"
                  aria-label="이전 페이지"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-600">
                  {data.pagination.page} / {data.pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.pagination.totalPages}
                  className="rounded p-1 hover:bg-gray-100 disabled:opacity-40"
                  aria-label="다음 페이지"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
