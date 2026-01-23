"use client";

import { useSearchParams } from "next/navigation";
import InventoryReportA4 from "../../../components/InventoryReportA4";

export default function ReportViewPage() {
  const params = useSearchParams();
  const type = params.get("type") || "Inventory Snapshot";

  return (
    <div className="min-h-screen bg-gray-200 py-10 flex justify-center">
      <InventoryReportA4 reportType={type} />
    </div>
  );
}