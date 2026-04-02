"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { InvoiceForm, type InvoiceFormData } from "../invoice-form";

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: InvoiceFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      router.push(`/invoices/${created.id}`);
    } catch {
      setLoading(false);
    }
  };

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

      <PageHeader title="New Invoice" />

      <InvoiceForm mode="create" onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
