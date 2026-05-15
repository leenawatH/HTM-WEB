const STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "รอดำเนินการ", className: "bg-amber-500/15 text-amber-600" },
  PAID: { label: "ชำระเงินแล้ว", className: "bg-sky-500/15 text-sky-600" },
  PROCESSING: {
    label: "กำลังเตรียมสินค้า",
    className: "bg-sky-500/15 text-sky-600",
  },
  SHIPPED: { label: "จัดส่งแล้ว", className: "bg-indigo-500/15 text-indigo-600" },
  DELIVERED: { label: "สำเร็จ", className: "bg-success/15 text-success" },
  CANCELLED: {
    label: "ยกเลิก",
    className: "bg-destructive/15 text-destructive",
  },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.PENDING;
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.className}`}
    >
      {s.label}
    </span>
  );
}
