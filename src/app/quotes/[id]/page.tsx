"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRightLeft,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  formatCurrency,
  formatDate,
  calculateLineTotal,
} from "@/lib/utils";

interface QuoteItem {
  id: string;
  position: number;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate: number;
  total: number;
}

interface QuoteDetail {
  id: string;
  number: string;
  status: string;
  subject: string;
  notes: string;
  validUntil: string | null;
  subtotal: number;
  taxTotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    company: string;
    street: string;
    zip: string;
    city: string;
    email: string;
  };
  items: QuoteItem[];
}

const statusMap: Record<string, { label: string; variant: "default" | "info" | "success" | "danger" }> = {
  draft: { label: "Draft", variant: "default" },
  sent: { label: "Sent", variant: "info" },
  accepted: { label: "Accepted", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
};

const statusTransitions: Record<string, { label: string; value: string }[]> = {
  draft: [{ label: "Mark as sent", value: "sent" }],
  sent: [
    { label: "Mark as accepted", value: "accepted" },
    { label: "Mark as rejected", value: "rejected" },
  ],
  accepted: [],
  rejected: [{ label: "Revert to draft", value: "draft" }],
};

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/quotes/${id}`);
      if (!res.ok) throw new Error();
      setQuote(await res.json());
    } catch {
      setError("Failed to load quote.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(newStatus: string) {
    if (!quote) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: quote.customer.id,
          subject: quote.subject,
          notes: quote.notes,
          validUntil: quote.validUntil,
          status: newStatus,
          items: quote.items.map((item) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            position: item.position,
          })),
        }),
      });
      if (!res.ok) throw new Error();
      setQuote(await res.json());
    } catch {
      setError("Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  }

  async function convertToInvoice() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${id}/convert`, { method: "POST" });
      if (!res.ok) throw new Error();
      const invoice = await res.json();
      router.push(`/invoices/${invoice.id}`);
    } catch {
      setError("Conversion failed.");
      setActionLoading(false);
    }
  }

  async function confirmDelete() {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/quotes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/quotes");
    } catch {
      setError("Failed to delete quote.");
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-text-secondary">
        Loading…
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="py-12 text-center text-sm text-text-secondary">
        {error || "Quote not found."}
      </div>
    );
  }

  const st = statusMap[quote.status] ?? statusMap.draft;
  const transitions = statusTransitions[quote.status] ?? [];
  const canConvert = quote.status === "sent" || quote.status === "accepted";

  return (
    <div>
      <Link
        href="/quotes"
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to quotes
      </Link>

      <PageHeader
        title={quote.number}
        description={quote.subject || undefined}
        actions={
          <div className="flex items-center gap-2">
            {transitions.map((t) => (
              <Button
                key={t.value}
                variant="secondary"
                size="sm"
                onClick={() => changeStatus(t.value)}
                disabled={actionLoading}
              >
                {t.label}
              </Button>
            ))}
            {canConvert && (
              <Button
                variant="secondary"
                size="sm"
                onClick={convertToInvoice}
                disabled={actionLoading}
              >
                <ArrowRightLeft className="h-4 w-4" />
                Convert to invoice
              </Button>
            )}
            <Link href={`/quotes/${id}/edit`}>
              <Button variant="secondary" size="sm">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Link href={`/quotes/${id}/pdf`} target="_blank">
              <Button variant="secondary" size="sm">
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      {error && (
        <p className="mb-4 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Badge variant={st.variant}>{st.label}</Badge>
          </div>
          <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-text-secondary">Customer</dt>
              <dd className="font-medium text-text">{quote.customer.name}</dd>
            </div>
            {quote.customer.company && (
              <div>
                <dt className="text-text-secondary">Company</dt>
                <dd className="text-text">{quote.customer.company}</dd>
              </div>
            )}
            {(quote.customer.street || quote.customer.city) && (
              <div>
                <dt className="text-text-secondary">Address</dt>
                <dd className="text-text">
                  {quote.customer.street && <span>{quote.customer.street}, </span>}
                  {quote.customer.zip} {quote.customer.city}
                </dd>
              </div>
            )}
            {quote.customer.email && (
              <div>
                <dt className="text-text-secondary">E-Mail</dt>
                <dd className="text-text">{quote.customer.email}</dd>
              </div>
            )}
            <div>
              <dt className="text-text-secondary">Created</dt>
              <dd className="text-text">{formatDate(quote.createdAt)}</dd>
            </div>
            {quote.validUntil && (
              <div>
                <dt className="text-text-secondary">Valid until</dt>
                <dd className="text-text">{formatDate(quote.validUntil)}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card className="flex flex-col justify-center p-5">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Tax</span>
              <span className="tabular-nums">{formatCurrency(quote.taxTotal)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-text">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text">Line Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-text">
            <thead>
              <tr className="border-b border-border bg-surface-alt/60 text-left text-xs font-medium text-text-secondary">
                <th className="px-4 py-2.5 w-12">No.</th>
                <th className="px-4 py-2.5">Description</th>
                <th className="px-4 py-2.5 text-right w-20">Qty</th>
                <th className="px-4 py-2.5 w-24">Unit</th>
                <th className="px-4 py-2.5 text-right w-28">Unit Price</th>
                <th className="px-4 py-2.5 text-right w-20">Tax</th>
                <th className="px-4 py-2.5 text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.items
                .sort((a, b) => a.position - b.position)
                .map((item) => {
                  const lineTotal = calculateLineTotal(item.quantity, item.unitPrice);
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3 text-text-secondary">
                        {item.position + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="mt-0.5 text-text-secondary">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                        {item.taxRate}%
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">
                        {formatCurrency(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>

      {quote.notes && (
        <Card className="mt-6 p-5">
          <h2 className="mb-2 text-sm font-semibold text-text">Notes</h2>
          <p className="whitespace-pre-wrap text-sm text-text-secondary">
            {quote.notes}
          </p>
        </Card>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => !deleteLoading && setDeleteOpen(false)}
        onConfirm={() => void confirmDelete()}
        title="Delete Quote?"
        message={`Are you sure you want to delete quote "${quote.number}"? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
}
