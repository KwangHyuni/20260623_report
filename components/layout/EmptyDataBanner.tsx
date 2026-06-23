import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function EmptyDataBanner() {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <div>
        <p className="font-medium text-amber-800">데이터가 없습니다</p>
        <p className="mt-1 text-sm text-amber-700">
          분석을 시작하려면 ERP CSV 데이터를 업로드하거나 샘플 데이터를 불러오세요.{" "}
          <Link href="/data-input" className="font-medium underline hover:text-amber-900">
            데이터 입력으로 이동
          </Link>
        </p>
      </div>
    </div>
  );
}
