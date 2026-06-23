"use client";

import { useCallback, useEffect, useState } from "react";
import { CsvDropzone } from "@/components/upload/CsvDropzone";
import { TABLE_CONFIG, type TableName } from "@/lib/constants";
import { useReport } from "@/lib/context/ReportContext";
import { Database, Trash2, Loader2 } from "lucide-react";

interface TableStatus {
  table: TableName;
  rowCount: number;
  fileName: string | null;
  updatedAt: string | null;
}

const TABLE_ORDER: TableName[] = ["orders", "order_items", "customers", "products"];

export default function DataInputPage() {
  const { clearReport } = useReport();
  const [status, setStatus] = useState<TableStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/data/status");
      const data = await res.json();
      setStatus(data.tables ?? []);
    } catch {
      setToast({ type: "error", message: "상태 조회에 실패했습니다." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
  };

  const handleUpload = async (table: TableName, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("table", table);

    const res = await fetch("/api/data/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error ?? "업로드 실패");

    clearReport();
    showToast("success", `${TABLE_CONFIG[table].label} ${data.rowCount.toLocaleString()}행 업로드 완료`);
    await fetchStatus();
  };

  const handleLoadSample = async () => {
    if (!confirm("샘플 데이터를 불러오면 기존 데이터를 덮어씁니다. 계속하시겠습니까?")) return;

    setSampleLoading(true);
    try {
      const res = await fetch("/api/data/load-sample", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "샘플 로드 실패");
      clearReport();
      showToast("success", data.message);
      await fetchStatus();
    } catch (e) {
      showToast("error", e instanceof Error ? e.message : "샘플 로드 실패");
    } finally {
      setSampleLoading(false);
    }
  };

  const handleClearTable = async (table: TableName) => {
    if (!confirm(`${TABLE_CONFIG[table].label} 데이터를 삭제하시겠습니까?`)) return;
    const res = await fetch(`/api/data/clear?table=${table}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      showToast("error", data.error ?? "삭제 실패");
      return;
    }
    showToast("success", data.message);
    clearReport();
    await fetchStatus();
  };

  const handleClearAll = async () => {
    if (!confirm("모든 데이터를 초기화하시겠습니까?")) return;
    const res = await fetch("/api/data/clear", { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      showToast("error", data.error ?? "초기화 실패");
      return;
    }
    showToast("success", "모든 데이터가 초기화되었습니다.");
    clearReport();
    await fetchStatus();
  };

  const getTableStatus = (table: TableName) =>
    status.find((s) => s.table === table);

  const totalRows = status.reduce((sum, s) => sum + s.rowCount, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">데이터 입력</h1>
          <p className="mt-1 text-sm text-gray-500">
            ERP CSV 파일을 업로드하거나 샘플 데이터를 불러오세요.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleLoadSample}
            disabled={sampleLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {sampleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            샘플 데이터 불러오기
          </button>
          {totalRows > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              전체 초기화
            </button>
          )}
        </div>
      </div>

      {toast && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">데이터 상태</h2>
        {loading ? (
          <p className="text-sm text-gray-500">로딩 중...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TABLE_ORDER.map((table) => {
              const s = getTableStatus(table);
              return (
                <div key={table} className="rounded-md bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">{TABLE_CONFIG[table].label}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {s?.rowCount?.toLocaleString() ?? 0}행
                  </p>
                  {s?.updatedAt && (
                    <p className="text-xs text-gray-400">
                      {new Date(s.updatedAt).toLocaleString("ko-KR")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {TABLE_ORDER.map((table) => {
          const s = getTableStatus(table);
          return (
            <CsvDropzone
              key={table}
              label={TABLE_CONFIG[table].label}
              description={`${TABLE_CONFIG[table].fileName} · 필수 컬럼: ${TABLE_CONFIG[table].requiredHeaders.slice(0, 3).join(", ")}...`}
              fileName={s?.fileName}
              rowCount={s?.rowCount}
              updatedAt={s?.updatedAt}
              onUpload={(file) => handleUpload(table, file)}
              onClear={() => handleClearTable(table)}
            />
          );
        })}
      </div>
    </div>
  );
}
