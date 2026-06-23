import { cn } from "@/lib/utils";
import { TABLE_HEADER_CLASS } from "@/lib/chart-colors";

export { TABLE_HEADER_CLASS };

export function pastelThClass(_index = 0, extra?: string) {
  return cn("px-4 py-3 font-semibold transition-colors", TABLE_HEADER_CLASS, extra);
}

export const tableRowClass =
  "border-b border-gray-200 hover:bg-gray-50 transition-colors";

export const tableTdClass = "px-4 py-2.5 text-gray-700";

interface PastelTableProps {
  children: React.ReactNode;
  className?: string;
}

export function PastelTable({ children, className }: PastelTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300">
      <table className={cn("w-full text-sm", className)}>{children}</table>
    </div>
  );
}

export function PastelTableHead({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>;
}

export function PastelTableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}
