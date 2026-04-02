"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  formatCurrency,
  calculateLineTotal,
  calculateTotals,
} from "@/lib/utils";

type Customer = {
  id: string;
  name: string;
  company: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  taxRate: number;
};

export type LineItem = {
  key: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate: number;
};

export type InvoiceFormData = {
  customerId: string;
  subject: string;
  dueDate: string;
  notes: string;
  items: Omit<LineItem, "key">[];
};

export type InvoiceData = {
  id: string;
  number: string;
  customerId: string;
  status: string;
  subject: string;
  notes: string;
  dueDate: string | null;
  subtotal: number;
  taxTotal: number;
  total: number;
  quoteId: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  items?: {
    id: string;
    position: number;
    name: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    taxRate: number;
    total: number;
  }[];
};

function makeKey() {
  return Math.random().toString(36).slice(2, 10);
}

const emptyLine = (): LineItem => ({
  key: makeKey(),
  name: "",
  description: "",
  quantity: 1,
  unit: "pcs",
  unitPrice: 0,
  taxRate: 19,
});

interface InvoiceFormProps {
  mode: "create" | "edit";
  invoice?: InvoiceData;
  onSubmit: (data: InvoiceFormData) => Promise<void>;
  loading?: boolean;
}

export function InvoiceForm({
  mode,
  invoice,
  onSubmit,
  loading,
}: InvoiceFormProps) {
  const [customerId, setCustomerId] = useState(invoice?.customerId ?? "");
  const [subject, setSubject] = useState(invoice?.subject ?? "");
  const [dueDate, setDueDate] = useState(
    invoice?.dueDate ? invoice.dueDate.slice(0, 10) : ""
  );
  const [notes, setNotes] = useState(invoice?.notes ?? "");
  const [items, setItems] = useState<LineItem[]>(() => {
    if (invoice?.items?.length) {
      return invoice.items.map((it) => ({
        key: makeKey(),
        name: it.name,
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        unitPrice: it.unitPrice,
        taxRate: it.taxRate,
      }));
    }
    return [emptyLine()];
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/customers");
      if (res.ok) setCustomers(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) setProducts(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, [fetchCustomers, fetchProducts]);

  const updateItem = (key: string, field: keyof LineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((it) => (it.key === key ? { ...it, [field]: value } : it))
    );
  };

  const removeItem = (key: string) => {
    setItems((prev) => {
      const next = prev.filter((it) => it.key !== key);
      return next.length ? next : [emptyLine()];
    });
  };

  const addItem = () => setItems((prev) => [...prev, emptyLine()]);

  const addFromProduct = (p: Product) => {
    setItems((prev) => [
      ...prev,
      {
        key: makeKey(),
        name: p.name,
        description: p.description,
        quantity: 1,
        unit: p.unit,
        unitPrice: p.price,
        taxRate: p.taxRate,
      },
    ]);
  };

  const totals = calculateTotals(
    items.map((it) => ({
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      taxRate: it.taxRate,
    }))
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }
    if (!items.some((it) => it.name.trim())) {
      setError("At least one line item is required.");
      return;
    }

    await onSubmit({
      customerId,
      subject: subject.trim(),
      dueDate: dueDate || "",
      notes: notes.trim(),
      items: items
        .filter((it) => it.name.trim())
        .map(({ key: _key, ...rest }) => rest),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <Card className="p-4 space-y-4">
        <Select
          id="invoice-customer"
          label="Customer *"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          required
        >
          <option value="">Select customer…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.company ? ` (${c.company})` : ""}
            </option>
          ))}
        </Select>

        <Input
          id="invoice-subject"
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <Input
          id="invoice-due-date"
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <Textarea
          id="invoice-notes"
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium text-text">Line Items</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt text-left">
                <th className="px-4 py-2 font-medium text-text-secondary">
                  Name
                </th>
                <th className="px-4 py-2 font-medium text-text-secondary">
                  Description
                </th>
                <th className="px-4 py-2 font-medium text-text-secondary w-20">
                  Qty
                </th>
                <th className="px-4 py-2 font-medium text-text-secondary w-24">
                  Unit
                </th>
                <th className="px-4 py-2 font-medium text-text-secondary w-28">
                  Unit Price
                </th>
                <th className="px-4 py-2 font-medium text-text-secondary w-20">
                  Tax %
                </th>
                <th className="px-4 py-2 font-medium text-text-secondary text-right w-28">
                  Total
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.key} className="border-b border-border">
                  <td className="px-4 py-2">
                    <input
                      className="w-full rounded border border-border bg-surface px-2 py-1 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      value={item.name}
                      onChange={(e) =>
                        updateItem(item.key, "name", e.target.value)
                      }
                      placeholder="Name"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full rounded border border-border bg-surface px-2 py-1 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.key, "description", e.target.value)
                      }
                      placeholder="Description"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full rounded border border-border bg-surface px-2 py-1 text-sm text-text text-right focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          item.key,
                          "quantity",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full rounded border border-border bg-surface px-2 py-1 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      value={item.unit}
                      onChange={(e) =>
                        updateItem(item.key, "unit", e.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full rounded border border-border bg-surface px-2 py-1 text-sm text-text text-right focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(
                          item.key,
                          "unitPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full rounded border border-border bg-surface px-2 py-1 text-sm text-text text-right focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      value={item.taxRate}
                      onChange={(e) =>
                        updateItem(
                          item.key,
                          "taxRate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-text">
                    {formatCurrency(
                      calculateLineTotal(item.quantity, item.unitPrice)
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-text-secondary hover:text-danger"
                      onClick={() => removeItem(item.key)}
                      aria-label="Remove line item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
          <Button type="button" variant="secondary" size="sm" onClick={addItem}>
            <Plus className="h-3.5 w-3.5" />
            Add line item
          </Button>
          {products.length > 0 && (
            <div className="relative group">
              <Button type="button" variant="secondary" size="sm">
                <Package className="h-3.5 w-3.5" />
                From product catalog
              </Button>
              <div className="absolute left-0 top-full z-10 mt-1 hidden w-64 rounded-md border border-border bg-surface shadow-lg group-focus-within:block group-hover:block">
                <div className="max-h-48 overflow-y-auto py-1">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-surface-alt"
                      onClick={() => addFromProduct(p)}
                    >
                      <span className="font-medium text-text">{p.name}</span>
                      <span className="ml-2 text-text-secondary">
                        {formatCurrency(p.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border px-4 py-3">
          <div className="flex justify-end">
            <div className="w-64 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal</span>
                <span className="tabular-nums text-text">
                  {formatCurrency(totals.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Tax</span>
                <span className="tabular-nums text-text">
                  {formatCurrency(totals.taxTotal)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-1 font-medium">
                <span className="text-text">Total</span>
                <span className="tabular-nums text-text">
                  {formatCurrency(totals.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Link href="/invoices">
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </Link>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading
            ? "Saving…"
            : mode === "create"
              ? "Create Invoice"
              : "Save Invoice"}
        </Button>
      </div>
    </form>
  );
}
