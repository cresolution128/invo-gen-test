"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Receipt, Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceData } from "./invoice-form";

const statusMap: Record<
  string,
  { label: string; variant: "default" | "info" | "success" | "danger" }
> = {
  draft: { label: "Draft", variant: "default" },
  sent: { label: "Sent", variant: "info" },
  paid: { label: "Paid", variant: "success" },
  overdue: { label: "Overdue", variant: "danger" },
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InvoiceData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/invoices");
      if (!res.ok) throw new Error();
      setInvoices(await res.json());
    } catch {
      setError("Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/invoices/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setDeleteTarget(null);
      await load();
    } catch {
      setError("Failed to delete invoice.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Manage your invoices"
        actions={
          <Link href="/invoices/new">
            <Button variant="primary" size="md">
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        }
      />

      {error && (
        <p className="mb-4 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <Card className="overflow-hidden p-0">
        {loading ? (
          <div className="py-12 text-center text-sm text-text-secondary">
            Loading…
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-10 w-10" strokeWidth={1.25} />}
            title="No invoices yet"
            description="Create your first invoice."
            action={
              <Link href="/invoices/new">
                <Button variant="primary" size="sm">
                  <Plus className="h-4 w-4" />
                  New Invoice
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-text">
              <thead>
                <tr className="border-b border-border bg-surface-alt/60 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
                  <th className="px-4 py-3 font-medium">Number</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="w-px px-4 py-3 font-medium whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const st = statusMap[inv.status] ?? statusMap.draft;
                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-border transition-colors hover:bg-surface-alt"
                    >
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="text-accent hover:underline"
                        >
                          {inv.number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {inv.customer?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {inv.subject || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {formatDate(inv.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/invoices/${inv.id}/edit`}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              aria-label={`Edit ${inv.number}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-text-secondary hover:text-danger"
                            onClick={() => setDeleteTarget(inv)}
                            aria-label={`Delete ${inv.number}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete Invoice?"
        message={
          deleteTarget
            ? `Are you sure you want to delete invoice "${deleteTarget.number}"? This action cannot be undone.`
            : ""
        }
        loading={deleteLoading}
      />
    </div>
  );
}
