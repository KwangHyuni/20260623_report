"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileSpreadsheet, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CsvDropzoneProps {
  label: string;
  description: string;
  onUpload: (file: File) => Promise<void>;
  fileName?: string | null;
  rowCount?: number;
  updatedAt?: string | null;
  onClear?: () => void;
  disabled?: boolean;
}

export function CsvDropzone({
  label,
  description,
  onUpload,
  fileName,
  rowCount,
  updatedAt,
  onClear,
  disabled,
}: CsvDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("CSV 파일만 업로드할 수 있습니다.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("파일 크기는 10MB 이하여야 합니다.");
        return;
      }
      setError(null);
      setIsUploading(true);
      try {
        await onUpload(file);
      } catch (e) {
        setError(e instanceof Error ? e.message : "업로드에 실패했습니다.");
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || isUploading) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, isUploading, handleFile]
  );

  const dropzoneClasses = cn(
    "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 transition-colors",
    isDragging
      ? "border-primary-500 bg-primary-50"
      : "border-gray-300 hover:border-primary-400 hover:bg-gray-50",
    (disabled || isUploading) && "cursor-not-allowed opacity-60"
  );

  const hasData = fileName && rowCount && rowCount > 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{label}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>

      {hasData && (
        <div className="mb-3 flex items-center gap-3 rounded-md bg-green-50 p-3">
          <FileSpreadsheet className="h-8 w-8 shrink-0 text-green-600" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-green-800">{fileName}</p>
            <p className="text-xs text-green-600">
              {rowCount?.toLocaleString()}행
              {updatedAt && ` · ${new Date(updatedAt).toLocaleString("ko-KR")}`}
            </p>
          </div>
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        aria-label={`${label} CSV 파일 업로드`}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !isUploading) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(dropzoneClasses, hasData ? "py-4" : "py-8")}
      >
        {hasData ? (
          <>
            <RefreshCw className={cn("mb-1 h-5 w-5", isDragging ? "text-primary-600" : "text-gray-400")} />
            <p className="text-sm font-medium text-gray-700">
              {isUploading ? "업로드 중..." : "파일을 끌어다 놓거나 클릭하여 변경"}
            </p>
          </>
        ) : (
          <>
            <Upload className={cn("mb-2 h-8 w-8", isDragging ? "text-primary-600" : "text-gray-400")} />
            <p className="text-sm font-medium text-gray-700">
              {isUploading ? "업로드 중..." : "파일을 끌어다 놓거나 클릭하여 선택"}
            </p>
            <p className="mt-1 text-xs text-gray-500">CSV 파일 (최대 10MB)</p>
          </>
        )}
      </div>

      {hasData && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-2 text-xs text-red-500 hover:text-red-700 hover:underline"
        >
          이 테이블 데이터 삭제
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
