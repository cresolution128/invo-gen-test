"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import {
  formatCurrency,
  calculateLineTotal,
  calculateTotals,
} from "@/lib/utils";

interface LineItem {
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate: number;
}

interface CustomerOption {
  id: string;
  name: string;
  company: string;
}

interface ProductOption {
  id: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  taxRate: number;
}

export interface QuoteFormData {
  customerId: string;
  subject: string;
  validUntil: string;
  notes: string;
  items: LineItem[];
}

interface QuoteFormProps {
  mode: "create" | "edit";
  initialData?: QuoteFormData;
  onSubmit: (data: QuoteFormData) => Promise<void>;
  loading?: boolean;
}

const emptyItem: LineItem = {
  name: "",
  description: "",
  quantity: 1,
  unit: "pcs",
  unitPrice: 0,
  taxRate: 19,
};

export function QuoteForm({ mode, initialData, onSubmit, loading }: QuoteFormProps) {
  const [customerId, setCustomerId] = useState(initialData?.customerId ?? "");
  const [subject, setSubject] = useState(initialData?.subject ?? "");
  const [validUntil, setValidUntil] = useState(initialData?.validUntil ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [items, setItems] = useState<LineItem[]>(
    initialData?.items?.length ? initialData.items : [{ ...emptyItem }]
  );

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productTargetIndex, setProductTargetIndex] = useState<number>(0);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/customers");
      if (res.ok) setCustomers(await res.json());
    } catch { /* ignore */ }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) setProducts(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadCustomers();
    loadProducts();
  }, [loadCustomers, loadProducts]);

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  function removeItem(index: number) {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function openProductPicker(index: number) {
    setProductTargetIndex(index);
    setProductModalOpen(true);
  }

  function selectProduct(product: ProductOption) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === productTargetIndex
          ? {
              ...item,
              name: product.name,
              description: product.description,
              unit: product.unit,
              unitPrice: product.price,
              taxRate: product.taxRate,
            }
          : item
      )
    );
    setProductModalOpen(false);
  }

  const totals = calculateTotals(items);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({ customerId, subject, validUntil, notes, items });
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id="customerId"
              label="Customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
            >
              <option value="">Select customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.company ? ` (${c.company})` : ""}
                </option>
              ))}
            </Select>
            <Input
              id="subject"
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Web Design Project"
            />
            <Input
              id="validUntil"
              label="Valid until"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-text">Line Items</h2>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => openProductPicker(items.length - 1)}
              >
                <Package className="h-4 w-4" />
                From product catalog
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4" />
                Add line item
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-alt/60 text-left text-xs font-medium text-text-secondary">
                  <th className="px-4 py-2.5 w-8">#</th>
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Description</th>
                  <th className="px-4 py-2.5 w-20">Qty</th>
                  <th className="px-4 py-2.5 w-24">Unit</th>
                  <th className="px-4 py-2.5 w-28">Unit Price</th>
                  <th className="px-4 py-2.5 w-20">Tax %</th>
                  <th className="px-4 py-2.5 w-28 text-right">Total</th>
                  <th className="px-4 py-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const lineTotal = calculateLineTotal(item.quantity, item.unitPrice);
                  return (
                    <tr
                      key={index}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-2 text-text-secondary">{index + 1}</td>
                      <td className="px-2 py-2">
                        <input
                          className="w-full rounded border border-border bg-surface px-2 py-1.5 text-sm text-text focus:border-accent focus:outline-none"
                          value={item.name}
                          onChange={(e) => updateItem(index, "name", e.target.value)}
                          placeholder="Name"
                          required
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          className="w-full rounded border border-border bg-surface px-2 py-1.5 text-sm text-text focus:border-accent focus:outline-none"
                          value={item.description}
                          onChange={(e) => updateItem(index, "description", e.target.value)}
                          placeholder="Description"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className="w-full rounded border border-border bg-surface px-2 py-1.5 text-sm text-text text-right tabular-nums focus:border-accent focus:outline-none"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                          required
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          className="w-full rounded border border-border bg-surface px-2 py-1.5 text-sm text-text focus:border-accent focus:outline-none"
                          value={item.unit}
                          onChange={(e) => updateItem(index, "unit", e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full rounded border border-border bg-surface px-2 py-1.5 text-sm text-text text-right tabular-nums focus:border-accent focus:outline-none"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                          required
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full rounded border border-border bg-surface px-2 py-1.5 text-sm text-text text-right tabular-nums focus:border-accent focus:outline-none"
                          value={item.taxRate}
                          onChange={(e) => updateItem(index, "taxRate", parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums text-text">
                        {formatCurrency(lineTotal)}
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="rounded p-1 text-text-muted hover:bg-surface-alt hover:text-danger transition-colors"
                          disabled={items.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border px-5 py-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Tax</span>
                  <span className="tabular-nums">{formatCurrency(totals.taxTotal)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1.5 font-semibold text-text">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <Textarea
            id="notes"
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes…"
          />
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving…"
              : mode === "create"
                ? "Create Quote"
                : "Save Quote"}
          </Button>
        </div>
      </form>

      <Modal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title="Select product"
        wide
      >
        {products.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-secondary">
            No products available.
          </p>
        ) : (
          <div className="max-h-80 overflow-y-auto -mx-5 -mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="sticky top-0 border-b border-border bg-surface text-left text-xs font-medium text-text-secondary">
                  <th className="px-5 py-2.5">Name</th>
                  <th className="px-5 py-2.5">Unit</th>
                  <th className="px-5 py-2.5 text-right">Price</th>
                  <th className="px-5 py-2.5 text-right">Tax</th>
                  <th className="px-5 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-0 hover:bg-surface-alt/60 cursor-pointer"
                    onClick={() => selectProduct(p)}
                  >
                    <td className="px-5 py-2.5 font-medium text-text">{p.name}</td>
                    <td className="px-5 py-2.5 text-text-secondary">{p.unit}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-text">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-text-secondary">
                      {p.taxRate}%
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectProduct(p);
                        }}
                      >
                        Select
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </>
  );
}
