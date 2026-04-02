"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import {
  CustomerForm,
  type CustomerData,
  type CustomerSavePayload,
} from "./customer-form";

async function fetchCustomers(): Promise<CustomerData[]> {
  const res = await fetch("/api/customers");
  if (!res.ok) throw new Error("Failed to load customers");
  return res.json();
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerData | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<CustomerData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setListError(null);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch {
      setListError("Could not load customers.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (c: CustomerData) => {
    setEditing(c);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSave = async (data: CustomerSavePayload) => {
    setFormLoading(true);
    try {
      if (editing) {
        const res = await fetch(`/api/customers/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("update failed");
      } else {
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("create failed");
      }
      closeForm();
      await load();
    } catch {
      setListError(
        editing
          ? "The customer could not be saved."
          : "The customer could not be created."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/customers/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete failed");
      setDeleteTarget(null);
      await load();
    } catch {
      setListError("The customer could not be deleted.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Customers"
        actions={
          <Button variant="primary" size="md" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Customer
          </Button>
        }
      />

      {listError && (
        <p className="mb-4 text-sm text-danger" role="alert">
          {listError}
        </p>
      )}

      <Card className="overflow-hidden p-0">
        {listLoading ? (
          <div className="py-12 text-center text-sm text-text-secondary">
            Loading…
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={<Users className="h-10 w-10" strokeWidth={1.25} />}
            title="No customers yet"
            description="Create your first customer to generate quotes and invoices."
            action={
              <Button variant="primary" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                New Customer
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-text">
              <thead>
                <tr className="border-b border-border bg-surface-alt/60 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="w-px px-4 py-3 font-medium whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border transition-colors hover:bg-surface-alt"
                  >
                    <td className={cn("px-4 py-3 font-medium")}>{c.name}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {c.company || "—"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {c.city || "—"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {c.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {c.phone || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openEdit(c)}
                          aria-label={`Edit ${c.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-text-secondary hover:text-danger"
                          onClick={() => setDeleteTarget(c)}
                          aria-label={`Delete ${c.name}`}
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
      </Card>

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? "Edit Customer" : "New Customer"}
        wide
      >
        <CustomerForm
          key={editing?.id ?? "new"}
          customer={editing ?? undefined}
          onSave={handleSave}
          onCancel={closeForm}
          loading={formLoading}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Customer?"
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
