import { Package, Users, ShoppingCart } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface SummaryBarProps {
  productCount: number;
  customerCount: number;
  orderCount: number;
}

export function SummaryBar({ productCount, customerCount, orderCount }: SummaryBarProps) {
  const items = [
    { icon: Package, label: "상품", value: productCount, unit: "건" },
    { icon: Users, label: "고객", value: customerCount, unit: "명" },
    { icon: ShoppingCart, label: "주문", value: orderCount, unit: "건" },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map(({ icon: Icon, label, value, unit }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-lg border border-primary-100 bg-primary-50 px-4 py-3"
        >
          <div className="rounded-lg bg-white p-2 text-primary-600 shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-primary-700">{label}</p>
            <p className="text-lg font-bold text-primary-900">
              {formatNumber(value)}
              <span className="ml-0.5 text-sm font-normal text-primary-700">{unit}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
