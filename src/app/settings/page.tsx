"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type CompanyForm = {
  name: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  website: string;
  taxId: string;
  bankName: string;
  iban: string;
  bic: string;
};

type SettingsForm = {
  quotePrefix: string;
  quoteCounter: string;
  invoicePrefix: string;
  invoiceCounter: string;
  defaultTaxRate: string;
  currency: string;
  paymentTermDays: string;
};

const emptyCompany: CompanyForm = {
  name: "",
  street: "",
  zip: "",
  city: "",
  country: "",
  email: "",
  phone: "",
  website: "",
  taxId: "",
  bankName: "",
  iban: "",
  bic: "",
};

const defaultSettings: SettingsForm = {
  quotePrefix: "AG",
  quoteCounter: "0",
  invoicePrefix: "RE",
  invoiceCounter: "0",
  defaultTaxRate: "19",
  currency: "EUR",
  paymentTermDays: "14",
};

function companyFromApi(data: Record<string, unknown>): CompanyForm {
  return {
    name: String(data.name ?? ""),
    street: String(data.street ?? ""),
    zip: String(data.zip ?? ""),
    city: String(data.city ?? ""),
    country: String(data.country ?? ""),
    email: String(data.email ?? ""),
    phone: String(data.phone ?? ""),
    website: String(data.website ?? ""),
    taxId: String(data.taxId ?? ""),
    bankName: String(data.bankName ?? ""),
    iban: String(data.iban ?? ""),
    bic: String(data.bic ?? ""),
  };
}

function settingsFromApi(data: Record<string, unknown>): SettingsForm {
  return {
    quotePrefix: String(data.quotePrefix ?? "AG"),
    quoteCounter: String(data.quoteCounter ?? 0),
    invoicePrefix: String(data.invoicePrefix ?? "RE"),
    invoiceCounter: String(data.invoiceCounter ?? 0),
    defaultTaxRate: String(data.defaultTaxRate ?? 19),
    currency: String(data.currency ?? "EUR"),
    paymentTermDays: String(data.paymentTermDays ?? 14),
  };
}

export default function SettingsPage() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [company, setCompany] = useState<CompanyForm>(emptyCompany);
  const [settings, setSettings] = useState<SettingsForm>(defaultSettings);

  const [companyError, setCompanyError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [companySaving, setCompanySaving] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [companySaved, setCompanySaved] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const load = useCallback(async () => {
    setCompanyError(null);
    setSettingsError(null);
    setInitialLoading(true);
    const [companyRes, settingsRes] = await Promise.all([
      fetch("/api/company"),
      fetch("/api/settings"),
    ]);
    try {
      if (companyRes.ok) {
        const companyData = (await companyRes.json()) as Record<
          string,
          unknown
        >;
        setCompany(companyFromApi(companyData));
      } else {
        setCompanyError("Failed to load company details.");
      }
    } catch {
      setCompanyError("Failed to load company details.");
    }
    try {
      if (settingsRes.ok) {
        const settingsData = (await settingsRes.json()) as Record<
          string,
          unknown
        >;
        setSettings(settingsFromApi(settingsData));
      } else {
        setSettingsError("Failed to load settings.");
      }
    } catch {
      setSettingsError("Failed to load settings.");
    }
    setInitialLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!companySaved) return;
    const t = setTimeout(() => setCompanySaved(false), 2800);
    return () => clearTimeout(t);
  }, [companySaved]);

  useEffect(() => {
    if (!settingsSaved) return;
    const t = setTimeout(() => setSettingsSaved(false), 2800);
    return () => clearTimeout(t);
  }, [settingsSaved]);

  const saveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompanySaving(true);
    setCompanyError(null);
    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(company),
      });
      if (!res.ok) throw new Error("save");
      const data = (await res.json()) as Record<string, unknown>;
      setCompany(companyFromApi(data));
      setCompanySaved(true);
    } catch {
      setCompanyError("Failed to save company details.");
    } finally {
      setCompanySaving(false);
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsError(null);
    const payload = {
      quotePrefix: settings.quotePrefix.trim() || "AG",
      quoteCounter: parseInt(settings.quoteCounter, 10) || 0,
      invoicePrefix: settings.invoicePrefix.trim() || "RE",
      invoiceCounter: parseInt(settings.invoiceCounter, 10) || 0,
      defaultTaxRate: parseFloat(settings.defaultTaxRate) || 0,
      currency: settings.currency.trim() || "EUR",
      paymentTermDays: parseInt(settings.paymentTermDays, 10) || 0,
    };
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save");
      const data = (await res.json()) as Record<string, unknown>;
      setSettings(settingsFromApi(data));
      setSettingsSaved(true);
    } catch {
      setSettingsError("Failed to save settings.");
    } finally {
      setSettingsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" />

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-text">
            Company Details
          </h2>
          {companyError && (
            <p className="mb-4 text-sm text-danger" role="alert">
              {companyError}
            </p>
          )}
          <form onSubmit={saveCompany} className="space-y-4">
            <Input
              id="company-name"
              label="Company Name"
              value={company.name}
              onChange={(e) =>
                setCompany((c) => ({ ...c, name: e.target.value }))
              }
              disabled={initialLoading}
              autoComplete="organization"
            />
            <Input
              id="company-street"
              label="Street"
              value={company.street}
              onChange={(e) =>
                setCompany((c) => ({ ...c, street: e.target.value }))
              }
              disabled={initialLoading}
              autoComplete="street-address"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="company-zip"
                label="Zip Code"
                value={company.zip}
                onChange={(e) =>
                  setCompany((c) => ({ ...c, zip: e.target.value }))
                }
                disabled={initialLoading}
                autoComplete="postal-code"
              />
              <Input
                id="company-city"
                label="City"
                value={company.city}
                onChange={(e) =>
                  setCompany((c) => ({ ...c, city: e.target.value }))
                }
                disabled={initialLoading}
                autoComplete="address-level2"
              />
            </div>
            <Input
              id="company-country"
              label="Country"
              value={company.country}
              onChange={(e) =>
                setCompany((c) => ({ ...c, country: e.target.value }))
              }
              disabled={initialLoading}
              autoComplete="country-name"
            />
            <Input
              id="company-email"
              label="Email"
              type="email"
              value={company.email}
              onChange={(e) =>
                setCompany((c) => ({ ...c, email: e.target.value }))
              }
              disabled={initialLoading}
              autoComplete="email"
            />
            <Input
              id="company-phone"
              label="Phone"
              type="tel"
              value={company.phone}
              onChange={(e) =>
                setCompany((c) => ({ ...c, phone: e.target.value }))
              }
              disabled={initialLoading}
              autoComplete="tel"
            />
            <Input
              id="company-website"
              label="Website"
              type="url"
              value={company.website}
              onChange={(e) =>
                setCompany((c) => ({ ...c, website: e.target.value }))
              }
              disabled={initialLoading}
            />
            <Input
              id="company-taxId"
              label="Tax ID / VAT Number"
              value={company.taxId}
              onChange={(e) =>
                setCompany((c) => ({ ...c, taxId: e.target.value }))
              }
              disabled={initialLoading}
            />
            <Input
              id="company-bankName"
              label="Bank"
              value={company.bankName}
              onChange={(e) =>
                setCompany((c) => ({ ...c, bankName: e.target.value }))
              }
              disabled={initialLoading}
            />
            <Input
              id="company-iban"
              label="IBAN"
              value={company.iban}
              onChange={(e) =>
                setCompany((c) => ({ ...c, iban: e.target.value }))
              }
              disabled={initialLoading}
            />
            <Input
              id="company-bic"
              label="BIC"
              value={company.bic}
              onChange={(e) =>
                setCompany((c) => ({ ...c, bic: e.target.value }))
              }
              disabled={initialLoading}
            />
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={initialLoading || companySaving}
              >
                {companySaving ? "Saving…" : "Save"}
              </Button>
              {companySaved && (
                <p className="text-sm text-success" role="status">
                  Saved.
                </p>
              )}
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-text">
            Number Series &amp; Defaults
          </h2>
          {settingsError && (
            <p className="mb-4 text-sm text-danger" role="alert">
              {settingsError}
            </p>
          )}
          <form onSubmit={saveSettings} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="settings-quotePrefix"
                label="Quote Prefix"
                value={settings.quotePrefix}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, quotePrefix: e.target.value }))
                }
                disabled={initialLoading}
              />
              <Input
                id="settings-quoteCounter"
                label="Quote Counter"
                type="number"
                min={0}
                step={1}
                value={settings.quoteCounter}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, quoteCounter: e.target.value }))
                }
                disabled={initialLoading}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="settings-invoicePrefix"
                label="Invoice Prefix"
                value={settings.invoicePrefix}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    invoicePrefix: e.target.value,
                  }))
                }
                disabled={initialLoading}
              />
              <Input
                id="settings-invoiceCounter"
                label="Invoice Counter"
                type="number"
                min={0}
                step={1}
                value={settings.invoiceCounter}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    invoiceCounter: e.target.value,
                  }))
                }
                disabled={initialLoading}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="settings-defaultTaxRate"
                label="Default Tax Rate (%)"
                type="number"
                min={0}
                step={0.01}
                value={settings.defaultTaxRate}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    defaultTaxRate: e.target.value,
                  }))
                }
                disabled={initialLoading}
              />
              <Input
                id="settings-currency"
                label="Currency"
                value={settings.currency}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, currency: e.target.value }))
                }
                disabled={initialLoading}
              />
            </div>
            <Input
              id="settings-paymentTermDays"
              label="Payment Terms (Days)"
              type="number"
              min={0}
              step={1}
              value={settings.paymentTermDays}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  paymentTermDays: e.target.value,
                }))
              }
              disabled={initialLoading}
            />
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={initialLoading || settingsSaving}
              >
                {settingsSaving ? "Saving…" : "Save"}
              </Button>
              {settingsSaved && (
                <p className="text-sm text-success" role="status">
                  Saved.
                </p>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
