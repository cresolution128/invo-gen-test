"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Receipt } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceData } from "../invoice-form";

const statusMap: Record<
  string,
  { label: string; variant: "default" | "info" | "success" | "danger" }
> = {
  draft: { label: "Draft", variant: "default" },
  sent: { label: "Sent", variant: "info" },
  paid: { label: "Paid", variant: "success" },
  overdue: { label: "Overdue", variant: "danger" },
};

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/invoices/${params.id}`);
      if (!res.ok) throw new Error();
      setInvoice(await res.json());
    } catch {
      setError("Failed to load invoice.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (status: string) => {
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/invoices/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          items: invoice?.items?.map((it) => ({
            name: it.name,
            description: it.description,
            quantity: it.quantity,
            unit: it.unit,
            unitPrice: it.unitPrice,
            taxRate: it.taxRate,
          })) ?? [],
        }),
      });
      if (!res.ok) throw new Error();
      setInvoice(await res.json());
    } catch {
      setError("Failed to update status.");
    } finally {
      setStatusLoading(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/invoices/${params.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      router.push("/invoices");
    } catch {
      setError("Failed to delete invoice.");
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-text-secondary">
        Loading…
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to invoices
        </Link>
        <p className="mt-4 text-sm text-danger">{error}</p>
      </div>
    );
  }

  if (!invoice) return null;

  const st = statusMap[invoice.status] ?? statusMap.draft;
  const sortedItems = [...(invoice.items ?? [])].sort(
    (a, b) => a.position - b.position
  );

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to invoices
        </Link>
      </div>

      {error && (
        <p className="mb-4 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-text">
              {invoice.number}
            </h1>
            <Badge variant={st.variant}>{st.label}</Badge>
          </div>
          {invoice.subject && (
            <p className="mt-1 text-sm text-text-secondary">
              {invoice.subject}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/invoices/${invoice.id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Link href={`/invoices/${invoice.id}/pdf`} target="_blank">
            <Button variant="secondary" size="sm">
              <Receipt className="h-4 w-4" />
              PDF
            </Button>
          </Link>
          {invoice.status === "draft" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => updateStatus("sent")}
              disabled={statusLoading}
            >
              Mark as sent
            </Button>
          )}
          {invoice.status === "sent" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => updateStatus("paid")}
              disabled={statusLoading}
            >
              Mark as paid
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-danger"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-4 space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Customer
          </h3>
          {invoice.customer ? (
            <div className="text-sm text-text">
              <p className="font-medium">{invoice.customer.name}</p>
              {invoice.customer.company && (
                <p className="text-text-secondary">
                  {invoice.customer.company}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-text-secondary">—</p>
          )}
        </Card>

        <Card className="p-4 space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Details
          </h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-text-secondary">Created</span>
              <span className="text-text">{formatDate(invoice.createdAt)}</span>
            </div>
            {invoice.dueDate && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Due</span>
                <span className="text-text">
                  {formatDate(invoice.dueDate)}
                </span>
              </div>
            )}
            {invoice.quoteId && (
              <div className="flex justify-between">
                <span className="text-text-secondary">From Quote</span>
                <Link
                  href={`/quotes/${invoice.quoteId}`}
                  className="text-accent hover:underline"
                >
                  {invoice.quoteId}
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden p-0 mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt/60 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
                <th className="px-4 py-3 font-medium w-12">No.</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium text-right w-20">
                  Qty
                </th>
                <th className="px-4 py-3 font-medium w-24">Unit</th>
                <th className="px-4 py-3 font-medium text-right w-28">
                  Unit Price
                </th>
                <th className="px-4 py-3 font-medium text-right w-20">
                  Tax
                </th>
                <th className="px-4 py-3 font-medium text-right w-28">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item, idx) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 text-text-secondary">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-text">{item.name}</div>
                    {item.description && (
                      <div className="text-text-secondary text-xs mt-0.5">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-text">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {item.unit}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-text">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                    {item.taxRate}%
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-text font-medium">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border px-4 py-3">
          <div className="flex justify-end">
            <div className="w-64 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal</span>
                <span className="tabular-nums text-text">
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Tax</span>
                <span className="tabular-nums text-text">
                  {formatCurrency(invoice.taxTotal)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-1 font-medium">
                <span className="text-text">Total</span>
                <span className="tabular-nums text-text">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {invoice.notes && (
        <Card className="p-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">
            Notes
          </h3>
          <p className="text-sm text-text whitespace-pre-wrap">
            {invoice.notes}
          </p>
        </Card>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => !deleteLoading && setDeleteOpen(false)}
        onConfirm={() => void confirmDelete()}
        title="Delete Invoice?"
        message={`Are you sure you want to delete invoice "${invoice.number}"? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
}
