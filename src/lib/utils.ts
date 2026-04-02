export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateNumber(prefix: string, counter: number): string {
  const year = new Date().getFullYear();
  const num = String(counter).padStart(4, "0");
  return `${prefix}-${year}-${num}`;
}

export function calculateLineTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

export function calculateTotals(
  items: { quantity: number; unitPrice: number; taxRate: number }[]
) {
  const subtotal = items.reduce(
    (sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice),
    0
  );
  const taxTotal = items.reduce(
    (sum, item) =>
      sum +
      calculateLineTotal(item.quantity, item.unitPrice) * (item.taxRate / 100),
    0
  );
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxTotal: Math.round(taxTotal * 100) / 100,
    total: Math.round((subtotal + taxTotal) * 100) / 100,
  };
}
