"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, Package, Receipt, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

type QuoteStatus = "draft" | "sent" | "accepted" | "rejected";
type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

interface DashboardData {
  totalCustomers: number;
  totalProducts: number;
  quotesByStatus: Record<QuoteStatus, number>;
  invoicesByStatus: Record<InvoiceStatus, number>;
  recentQuotes: Array<{
    id: string;
    number: string;
    subject: string;
    status: QuoteStatus;
    total: number;
    createdAt: string;
    customer: { name: string };
  }>;
  recentInvoices: Array<{
    id: string;
    number: string;
    subject: string;
    status: InvoiceStatus;
    total: number;
    createdAt: string;
    customer: { name: string };
  }>;
}

const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
};

const QUOTE_STATUS_VARIANT: Record<
  QuoteStatus,
  "default" | "info" | "success" | "danger"
> = {
  draft: "default",
  sent: "info",
  accepted: "success",
  rejected: "danger",
};

const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
};

const INVOICE_STATUS_VARIANT: Record<
  InvoiceStatus,
  "default" | "info" | "success" | "danger"
> = {
  draft: "default",
  sent: "info",
  paid: "success",
  overdue: "danger",
};

function sumCounts(obj: Record<string, number>): number {
  return Object.values(obj).reduce((a, b) => a + (b || 0), 0);
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = (await res.json()) as DashboardData;
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of customers, products, quotes, and invoices."
      />

      {loading && (
        <p className="text-sm text-text-secondary">Loading data…</p>
      )}

      {error && !loading && (
        <Card className="border-red-200 bg-red-50/50 p-4">
          <p className="text-sm text-red-800">
            Failed to load dashboard. {error}
          </p>
        </Card>
      )}

      {data && !loading && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-text-secondary">
                    Customers
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-text">
                    {data.totalCustomers}
                  </p>
                </div>
                <div className="rounded-md border border-border bg-surface p-2 text-text-secondary">
                  <Users className="h-4 w-4" aria-hidden />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-text-secondary">
                    Products
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-text">
                    {data.totalProducts}
                  </p>
                </div>
                <div className="rounded-md border border-border bg-surface p-2 text-text-secondary">
                  <Package className="h-4 w-4" aria-hidden />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-text-secondary">
                    Quotes
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-text">
                    {sumCounts(data.quotesByStatus)}
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary">total</p>
                </div>
                <div className="rounded-md border border-border bg-surface p-2 text-text-secondary">
                  <FileText className="h-4 w-4" aria-hidden />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-text-secondary">
                    Invoices
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-text">
                    {sumCounts(data.invoicesByStatus)}
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary">total</p>
                </div>
                <div className="rounded-md border border-border bg-surface p-2 text-text-secondary">
                  <Receipt className="h-4 w-4" aria-hidden />
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold text-text">
                  Recent Quotes
                </h2>
                <p className="text-xs text-text-secondary">
                  Recently created or updated quotes
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface text-xs text-text-secondary">
                      <th className="px-4 py-2 font-medium">No.</th>
                      <th className="px-4 py-2 font-medium">Customer</th>
                      <th className="px-4 py-2 font-medium">Subject</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 text-right font-medium">Amount</th>
                      <th className="px-4 py-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentQuotes.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-center text-sm text-text-secondary"
                        >
                          No quotes yet.
                        </td>
                      </tr>
                    ) : (
                      data.recentQuotes.map((q) => (
                        <tr
                          key={q.id}
                          className="border-b border-border last:border-0"
                        >
                          <td className="px-4 py-2.5">
                            <Link
                              href={`/quotes/${q.id}`}
                              className={cn(
                                "font-medium text-text underline-offset-2 hover:underline",
                                "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
                              )}
                            >
                              {q.number}
                            </Link>
                          </td>
                          <td className="px-4 py-2.5 text-text">
                            {q.customer.name}
                          </td>
                          <td
                            className="max-w-[140px] truncate px-4 py-2.5 text-text-secondary"
                            title={q.subject}
                          >
                            {q.subject}
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge variant={QUOTE_STATUS_VARIANT[q.status]}>
                              {QUOTE_STATUS_LABEL[q.status]}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-text">
                            {formatCurrency(q.total)}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-text-secondary">
                            {formatDate(q.createdAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold text-text">
                  Recent Invoices
                </h2>
                <p className="text-xs text-text-secondary">
                  Recently created or updated invoices
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface text-xs text-text-secondary">
                      <th className="px-4 py-2 font-medium">No.</th>
                      <th className="px-4 py-2 font-medium">Customer</th>
                      <th className="px-4 py-2 font-medium">Subject</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 text-right font-medium">Amount</th>
                      <th className="px-4 py-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentInvoices.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-center text-sm text-text-secondary"
                        >
                          No invoices yet.
                        </td>
                      </tr>
                    ) : (
                      data.recentInvoices.map((inv) => (
                        <tr
                          key={inv.id}
                          className="border-b border-border last:border-0"
                        >
                          <td className="px-4 py-2.5">
                            <Link
                              href={`/invoices/${inv.id}`}
                              className={cn(
                                "font-medium text-text underline-offset-2 hover:underline",
                                "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
                              )}
                            >
                              {inv.number}
                            </Link>
                          </td>
                          <td className="px-4 py-2.5 text-text">
                            {inv.customer.name}
                          </td>
                          <td
                            className="max-w-[140px] truncate px-4 py-2.5 text-text-secondary"
                            title={inv.subject}
                          >
                            {inv.subject}
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge variant={INVOICE_STATUS_VARIANT[inv.status]}>
                              {INVOICE_STATUS_LABEL[inv.status]}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-text">
                            {formatCurrency(inv.total)}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-text-secondary">
                            {formatDate(inv.createdAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
