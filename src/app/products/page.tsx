"use client";

import { useCallback, useEffect, useState } from "react";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";
import {
  ProductForm,
  type ProductData,
  type ProductFormValues,
} from "./product-form";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductData | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setFetchError(null);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to load");
      const data = (await res.json()) as ProductData[];
      setProducts(data);
    } catch {
      setFetchError("Could not load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  function openCreate() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(p: ProductData) {
    setEditing(p);
    setModalOpen(true);
  }

  function closeModal() {
    if (formLoading) return;
    setModalOpen(false);
    setEditing(undefined);
  }

  async function handleSave(body: ProductFormValues) {
    setFormLoading(true);
    try {
      if (editing) {
        const res = await fetch(`/api/products/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
      }
      setModalOpen(false);
      setEditing(undefined);
      await fetchProducts();
    } catch {
      setFetchError("Save failed.");
    } finally {
      setFormLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setDeleteTarget(null);
      await fetchProducts();
    } catch {
      setFetchError("Delete failed.");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Products"
        actions={
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4" />
            New Product
          </Button>
        }
      />

      {fetchError && (
        <p className="mb-4 text-sm text-danger" role="alert">
          {fetchError}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface">
          <EmptyState
            icon={<Package className="h-10 w-10" strokeWidth={1.25} />}
            title="No products yet"
            description="Create your first product to use it in quotes and invoices."
            action={
              <Button onClick={openCreate} size="sm">
                <Plus className="h-4 w-4" />
                New Product
              </Button>
            }
          />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt text-left">
                <th className="px-4 py-3 font-medium text-text-secondary">Name</th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  Description
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">Unit</th>
                <th className="px-4 py-3 font-medium text-text-secondary text-right">
                  Price
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary text-right">
                  Tax (%)
                </th>
                <th className="w-[1%] px-4 py-3 font-medium text-text-secondary text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-surface-alt/60"
                >
                  <td className="px-4 py-3 font-medium text-text">{p.name}</td>
                  <td className="max-w-[220px] px-4 py-3 text-text-secondary">
                    <span className="line-clamp-2">{p.description || "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{p.unit}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-text">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                    {new Intl.NumberFormat("de-DE", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    }).format(p.taxRate)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openEdit(p)}
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-danger hover:text-danger"
                        onClick={() => setDeleteTarget(p)}
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit Product" : "New Product"}
      >
        <ProductForm
          key={editing?.id ?? "new"}
          product={editing}
          onSave={handleSave}
          onCancel={closeModal}
          loading={formLoading}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete Product"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : ""
        }
        loading={deleteLoading}
      />
    </div>
  );
}
