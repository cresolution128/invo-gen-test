"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { formatCurrencyPlain, formatDatePlain } from "@/lib/pdf-utils";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
  ],
});

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 50,
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  companyDetail: {
    fontSize: 8,
    color: "#555",
    lineHeight: 1.5,
  },
  addressBlock: {
    marginBottom: 30,
  },
  addressLabel: {
    fontSize: 7,
    color: "#888",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 9,
    lineHeight: 1.6,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  metaLabel: {
    width: 100,
    fontSize: 8,
    color: "#666",
  },
  metaValue: {
    fontSize: 9,
  },
  metaBlock: {
    marginBottom: 24,
  },
  subject: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 16,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    paddingBottom: 5,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  colPos: { width: "6%" },
  colName: { width: "32%" },
  colQty: { width: "10%", textAlign: "right" },
  colUnit: { width: "10%", textAlign: "center" },
  colPrice: { width: "14%", textAlign: "right" },
  colTax: { width: "10%", textAlign: "right" },
  colTotal: { width: "18%", textAlign: "right" },
  thText: {
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#666",
    letterSpacing: 0.3,
  },
  cellText: {
    fontSize: 8.5,
  },
  cellDesc: {
    fontSize: 7.5,
    color: "#666",
    marginTop: 1,
  },
  totalsBlock: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 3,
    width: 200,
  },
  totalLabel: {
    fontSize: 8.5,
    color: "#555",
    width: 100,
  },
  totalValue: {
    fontSize: 8.5,
    textAlign: "right",
    width: 100,
  },
  totalRowBold: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 200,
    borderTopWidth: 1,
    borderTopColor: "#222",
    paddingTop: 4,
    marginTop: 4,
  },
  totalLabelBold: {
    fontSize: 10,
    fontWeight: "bold",
    width: 100,
  },
  totalValueBold: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "right",
    width: 100,
  },
  notes: {
    marginTop: 30,
    fontSize: 8,
    color: "#555",
    lineHeight: 1.6,
  },
  notesLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerCol: {
    fontSize: 7,
    color: "#888",
    lineHeight: 1.5,
  },
});

interface DocumentItem {
  position: number;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate: number;
  total: number;
}

interface DocumentData {
  number: string;
  subject: string;
  notes: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  createdAt: string;
  validUntil?: string | null;
  dueDate?: string | null;
  items: DocumentItem[];
  customer: {
    name: string;
    company: string;
    street: string;
    zip: string;
    city: string;
    country: string;
  };
}

interface CompanyData {
  name: string;
  street: string;
  zip: string;
  city: string;
  email: string;
  phone: string;
  website: string;
  taxId: string;
  bankName: string;
  iban: string;
  bic: string;
}

interface Props {
  type: "quote" | "invoice";
  document: DocumentData;
  company: CompanyData | null;
  currency?: string;
}

export function DocumentPDF({ type, document: doc, company, currency = "EUR" }: Props) {
  const isQuote = type === "quote";
  const title = isQuote ? "Quote" : "Invoice";
  const numberLabel = isQuote ? "Quote No." : "Invoice No.";
  const dateLabel = isQuote ? "Valid Until" : "Due Date";
  const secondDate = isQuote ? doc.validUntil : doc.dueDate;

  const fmt = (n: number) => `${formatCurrencyPlain(n)} ${currency}`;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.companyName}>{company?.name || "Your Company"}</Text>
            {company && (
              <Text style={s.companyDetail}>
                {[company.street, `${company.zip} ${company.city}`]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            )}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            {company?.email && <Text style={s.companyDetail}>{company.email}</Text>}
            {company?.phone && <Text style={s.companyDetail}>{company.phone}</Text>}
            {company?.website && <Text style={s.companyDetail}>{company.website}</Text>}
          </View>
        </View>

        {/* Recipient */}
        <View style={s.addressBlock}>
          <Text style={s.addressLabel}>Recipient</Text>
          <Text style={s.addressText}>
            {doc.customer.company && `${doc.customer.company}\n`}
            {doc.customer.name}
            {doc.customer.street && `\n${doc.customer.street}`}
            {(doc.customer.zip || doc.customer.city) &&
              `\n${doc.customer.zip} ${doc.customer.city}`}
          </Text>
        </View>

        {/* Document title & meta */}
        <Text style={s.docTitle}>{title}</Text>
        <View style={s.metaBlock}>
          <View style={s.metaRow}>
            <Text style={s.metaLabel}>{numberLabel}:</Text>
            <Text style={s.metaValue}>{doc.number}</Text>
          </View>
          <View style={s.metaRow}>
            <Text style={s.metaLabel}>Date:</Text>
            <Text style={s.metaValue}>{formatDatePlain(doc.createdAt)}</Text>
          </View>
          {secondDate && (
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>{dateLabel}:</Text>
              <Text style={s.metaValue}>{formatDatePlain(secondDate)}</Text>
            </View>
          )}
        </View>

        {/* Subject */}
        {doc.subject && <Text style={s.subject}>{doc.subject}</Text>}

        {/* Items table */}
        <View style={s.table}>
          <View style={s.tableHeader}>
            <View style={s.colPos}>
              <Text style={s.thText}>No.</Text>
            </View>
            <View style={s.colName}>
              <Text style={s.thText}>Description</Text>
            </View>
            <View style={s.colQty}>
              <Text style={[s.thText, { textAlign: "right" }]}>Qty</Text>
            </View>
            <View style={s.colUnit}>
              <Text style={[s.thText, { textAlign: "center" }]}>Unit</Text>
            </View>
            <View style={s.colPrice}>
              <Text style={[s.thText, { textAlign: "right" }]}>Unit Price</Text>
            </View>
            <View style={s.colTax}>
              <Text style={[s.thText, { textAlign: "right" }]}>Tax</Text>
            </View>
            <View style={s.colTotal}>
              <Text style={[s.thText, { textAlign: "right" }]}>Total</Text>
            </View>
          </View>

          {doc.items.map((item, idx) => (
            <View key={idx} style={s.tableRow}>
              <View style={s.colPos}>
                <Text style={s.cellText}>{item.position || idx + 1}</Text>
              </View>
              <View style={s.colName}>
                <Text style={s.cellText}>{item.name}</Text>
                {item.description && (
                  <Text style={s.cellDesc}>{item.description}</Text>
                )}
              </View>
              <View style={s.colQty}>
                <Text style={[s.cellText, { textAlign: "right" }]}>
                  {item.quantity}
                </Text>
              </View>
              <View style={s.colUnit}>
                <Text style={[s.cellText, { textAlign: "center" }]}>
                  {item.unit}
                </Text>
              </View>
              <View style={s.colPrice}>
                <Text style={[s.cellText, { textAlign: "right" }]}>
                  {fmt(item.unitPrice)}
                </Text>
              </View>
              <View style={s.colTax}>
                <Text style={[s.cellText, { textAlign: "right" }]}>
                  {item.taxRate}%
                </Text>
              </View>
              <View style={s.colTotal}>
                <Text style={[s.cellText, { textAlign: "right" }]}>
                  {fmt(item.total)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={s.totalsBlock}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalValue}>{fmt(doc.subtotal)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Tax</Text>
            <Text style={s.totalValue}>{fmt(doc.taxTotal)}</Text>
          </View>
          <View style={s.totalRowBold}>
            <Text style={s.totalLabelBold}>Total</Text>
            <Text style={s.totalValueBold}>{fmt(doc.total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {doc.notes && (
          <View style={s.notes}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text>{doc.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <View>
            <Text style={s.footerCol}>{company?.name}</Text>
            <Text style={s.footerCol}>
              {company?.street} · {company?.zip} {company?.city}
            </Text>
          </View>
          <View>
            {company?.taxId && (
              <Text style={s.footerCol}>VAT No.: {company.taxId}</Text>
            )}
            {company?.email && (
              <Text style={s.footerCol}>{company.email}</Text>
            )}
          </View>
          <View>
            {company?.bankName && (
              <Text style={s.footerCol}>{company.bankName}</Text>
            )}
            {company?.iban && (
              <Text style={s.footerCol}>IBAN: {company.iban}</Text>
            )}
            {company?.bic && (
              <Text style={s.footerCol}>BIC: {company.bic}</Text>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
