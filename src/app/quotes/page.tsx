"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Plus, Pencil, Trash2, ArrowRightLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";

interface QuoteRow {
  id: string;
  number: string;
  status: string;
  subject: string;
  total: number;
  createdAt: string;
  customer: { id: string; name: string; company: string };
}

const statusMap: Record<string, { label: string; variant: "default" | "info" | "success" | "danger" }> = {
  draft: { label: "Draft", variant: "default" },
  sent: { label: "Sent", variant: "info" },
  accepted: { label: "Accepted", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
};

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<QuoteRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [convertLoading, setConvertLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/quotes");
      if (!res.ok) throw new Error();
      setQuotes(await res.json());
    } catch {
      setError("Failed to load quotes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/quotes/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setDeleteTarget(null);
      await load();
    } catch {
      setError("Failed to delete quote.");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function convertToInvoice(quote: QuoteRow) {
    setConvertLoading(quote.id);
    try {
      const res = await fetch(`/api/quotes/${quote.id}/convert`, { method: "POST" });
      if (!res.ok) throw new Error();
      const invoice = await res.json();
      router.push(`/invoices/${invoice.id}`);
    } catch {
      setError("Conversion failed.");
      setConvertLoading(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Quotes"
        description="Manage your quotes"
        actions={
          <Link href="/quotes/new">
            <Button size="md">
              <Plus className="h-4 w-4" />
              New Quote
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
        ) : quotes.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-10 w-10" strokeWidth={1.25} />}
            title="No quotes yet"
            description="Create your first quote."
            action={
              <Link href="/quotes/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  New Quote
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
                  <th className="w-px px-4 py-3 font-medium whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => {
                  const st = statusMap[q.status] ?? statusMap.draft;
                  const canConvert = q.status === "sent" || q.status === "accepted";
                  return (
                    <tr
                      key={q.id}
                      className="border-b border-border transition-colors hover:bg-surface-alt"
                    >
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/quotes/${q.id}`}
                          className="text-accent hover:underline"
                        >
                          {q.number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {q.customer.name}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {q.subject || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatCurrency(q.total)}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {formatDate(q.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/quotes/${q.id}/edit`}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              aria-label="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          {canConvert && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => convertToInvoice(q)}
                              disabled={convertLoading === q.id}
                              aria-label="Convert to invoice"
                            >
                              <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-text-secondary hover:text-danger"
                            onClick={() => setDeleteTarget(q)}
                            aria-label="Delete"
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
        title="Delete Quote?"
        message={
          deleteTarget
            ? `Are you sure you want to delete quote "${deleteTarget.number}"? This action cannot be undone.`
            : ""
        }
        loading={deleteLoading}
      />
    </div>
  );
}
