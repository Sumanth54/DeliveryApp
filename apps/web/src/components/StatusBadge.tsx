import { memo } from "react";

type StatusBadgeProps = {
  status: string;
};

const styles: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  "Out for delivery": "bg-sky-100 text-sky-800",
  Delivered: "bg-emerald-100 text-emerald-800",
  Paid: "bg-emerald-100 text-emerald-800",
  Failed: "bg-red-100 text-red-700"
};

function StatusBadgeComponent({ status }: StatusBadgeProps) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] ?? "bg-stone-100 text-stone-700"}`}>
      {status}
    </span>
  );
}

export const StatusBadge = memo(StatusBadgeComponent);
