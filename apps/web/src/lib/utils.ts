export function formatPrice(value: number) {
  return `Rs ${value.toFixed(0)}`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit"
  });
}
