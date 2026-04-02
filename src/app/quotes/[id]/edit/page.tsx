"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { QuoteForm, type QuoteFormData } from "../../quote-form";

interface QuoteDetail {
  id: string;
  number: string;
  customerId: string;
  subject: string;
  notes: string;
  validUntil: string | null;
  items: {
    name: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    taxRate: number;
  }[];
}

export default function EditQuotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
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

  async function handleSubmit(data: QuoteFormData) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      router.push(`/quotes/${id}`);
    } catch {
      setError("Failed to save quote.");
      setSaving(false);
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

  const initialData: QuoteFormData = {
    customerId: quote.customerId,
    subject: quote.subject,
    validUntil: quote.validUntil ? quote.validUntil.slice(0, 10) : "",
    notes: quote.notes,
    items: quote.items.map((item) => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
    })),
  };

  return (
    <div>
      <Link
        href={`/quotes/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {quote.number}
      </Link>

      <PageHeader title={`Edit ${quote.number}`} />

      {error && (
        <p className="mb-4 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <QuoteForm
        mode="edit"
        initialData={initialData}
        onSubmit={handleSubmit}
        loading={saving}
      />
    </div>
  );
}
