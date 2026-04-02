"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import {
  InvoiceForm,
  type InvoiceData,
  type InvoiceFormData,
} from "../../invoice-form";

export default function EditInvoicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/invoices/${params.id}`);
      if (!res.ok) throw new Error();
      setInvoice(await res.json());
    } catch {
      setError("Failed to load invoice.");
    } finally {
      setPageLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (data: InvoiceFormData) => {
    setSaveLoading(true);
    try {
      const res = await fetch(`/api/invoices/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      router.push(`/invoices/${params.id}`);
    } catch {
      setError("Failed to save invoice.");
      setSaveLoading(false);
    }
  };

  if (pageLoading) {
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

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/invoices/${params.id}`}
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to invoice
        </Link>
      </div>

      <PageHeader title={`Edit Invoice ${invoice.number}`} />

      {error && (
        <p className="mb-4 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <InvoiceForm
        mode="edit"
        invoice={invoice}
        onSubmit={handleSubmit}
        loading={saveLoading}
      />
    </div>
  );
}
