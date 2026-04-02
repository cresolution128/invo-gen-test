"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type CustomerData = {
  id: string;
  name: string;
  company: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CustomerSavePayload = Omit<
  CustomerData,
  "id" | "createdAt" | "updatedAt"
>;

const emptyValues: CustomerSavePayload = {
  name: "",
  company: "",
  street: "",
  zip: "",
  city: "",
  country: "",
  email: "",
  phone: "",
  notes: "",
};

function toFormValues(customer: CustomerData): CustomerSavePayload {
  return {
    name: customer.name,
    company: customer.company,
    street: customer.street,
    zip: customer.zip,
    city: customer.city,
    country: customer.country,
    email: customer.email,
    phone: customer.phone,
    notes: customer.notes,
  };
}

interface CustomerFormProps {
  customer?: CustomerData;
  onSave: (data: CustomerSavePayload) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function CustomerForm({
  customer,
  onSave,
  onCancel,
  loading,
}: CustomerFormProps) {
  const [values, setValues] = useState<CustomerSavePayload>(
    customer ? toFormValues(customer) : emptyValues
  );
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    setValues(customer ? toFormValues(customer) : emptyValues);
    setNameError("");
  }, [customer]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = values.name.trim();
    if (!trimmed) {
      setNameError("Name is required");
      return;
    }
    setNameError("");
    onSave({ ...values, name: trimmed });
  };

  const update =
    (field: keyof CustomerSavePayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
    };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="customer-name"
        label="Name *"
        value={values.name}
        onChange={update("name")}
        error={nameError}
        required
        autoComplete="name"
      />
      <Input
        id="customer-company"
        label="Company"
        value={values.company}
        onChange={update("company")}
        autoComplete="organization"
      />
      <div className="space-y-3">
        <Input
          id="customer-street"
          label="Street"
          value={values.street}
          onChange={update("street")}
          autoComplete="street-address"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="customer-zip"
            label="Zip Code"
            value={values.zip}
            onChange={update("zip")}
            autoComplete="postal-code"
          />
          <Input
            id="customer-city"
            label="City"
            value={values.city}
            onChange={update("city")}
            autoComplete="address-level2"
          />
        </div>
        <Input
          id="customer-country"
          label="Country"
          value={values.country}
          onChange={update("country")}
          autoComplete="country-name"
        />
      </div>
      <Input
        id="customer-email"
        type="email"
        label="Email"
        value={values.email}
        onChange={update("email")}
        autoComplete="email"
      />
      <Input
        id="customer-phone"
        type="tel"
        label="Phone"
        value={values.phone}
        onChange={update("phone")}
        autoComplete="tel"
      />
      <Textarea
        id="customer-notes"
        label="Notes"
        value={values.notes}
        onChange={update("notes")}
        rows={4}
      />
      <div className={cn("flex justify-end gap-2 pt-2")}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
