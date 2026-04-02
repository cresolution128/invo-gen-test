"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { QuoteForm, type QuoteFormData } from "../quote-form";

export default function NewQuotePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: QuoteFormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const quote = await res.json();
      router.push(`/quotes/${quote.id}`);
    } catch {
      setError("Failed to create quote.");
      setLoading(false);
    }
  }

  return (
    <div>
      <Link
        href="/quotes"
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to quotes
      </Link>

      <PageHeader title="New Quote" />

      {error && (
        <p className="mb-4 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <QuoteForm mode="create" onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
