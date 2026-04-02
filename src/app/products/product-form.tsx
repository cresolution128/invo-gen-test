"use client";

import { useEffect, useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export type ProductFormValues = {
  name: string;
  description: string;
  unit: string;
  price: number;
  taxRate: number;
};

export type ProductData = ProductFormValues & {
  id: string;
  createdAt?: string;
  updatedAt?: string;
};

interface ProductFormProps {
  product?: ProductData;
  onSave: (data: ProductFormValues) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ProductForm({
  product,
  onSave,
  onCancel,
  loading,
}: ProductFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("Unit");
  const [price, setPrice] = useState<string>("");
  const [taxRate, setTaxRate] = useState<string>("19");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description ?? "");
      setUnit(product.unit ?? "Unit");
      setPrice(String(product.price));
      setTaxRate(String(product.taxRate));
    } else {
      setName("");
      setDescription("");
      setUnit("Unit");
      setPrice("");
      setTaxRate("19");
    }
    setNameError("");
  }, [product]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Name is required");
      return;
    }
    setNameError("");
    const priceRaw = price.trim().replace(",", ".");
    const taxRaw = taxRate.trim().replace(",", ".");
    const priceNum = priceRaw === "" ? 0 : parseFloat(priceRaw);
    const taxNum = taxRaw === "" ? 19 : parseFloat(taxRaw);
    if (Number.isNaN(priceNum) || Number.isNaN(taxNum)) {
      return;
    }
    onSave({
      name: trimmed,
      description: description.trim(),
      unit: unit.trim() || "Unit",
      price: priceNum,
      taxRate: taxNum,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="product-name"
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={nameError}
        required
        autoComplete="off"
      />
      <Textarea
        id="product-description"
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      <Input
        id="product-unit"
        label="Unit"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        autoComplete="off"
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="product-price"
          label="Price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Input
          id="product-tax"
          label="Tax (%)"
          type="number"
          step="0.01"
          min="0"
          value={taxRate}
          onChange={(e) => setTaxRate(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
