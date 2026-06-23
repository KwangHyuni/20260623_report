"use client";

import { ReportProvider } from "@/lib/context/ReportContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ReportProvider>{children}</ReportProvider>;
}
