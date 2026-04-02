"use client";

import { useEffect, useState, use } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

import { DocumentPDF } from "@/components/pdf/document-pdf";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function QuotePDFPage({ params }: PageProps) {
  const { id } = use(params);
  const [data, setData] = useState<{
    document: any;
    company: any;
    settings: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/quotes/${id}/pdf`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-text-secondary">
        Generating PDF...
      </div>
    );
  }

  if (!data?.document) {
    return (
      <div className="py-20 text-center text-sm text-text-secondary">
        Quote not found.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/quotes/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to quote
        </Link>
        <PDFDownloadLink
          document={
            <DocumentPDF
              type="quote"
              document={data.document}
              company={data.company}
              currency={data.settings?.currency}
            />
          }
          fileName={`${data.document.number}.pdf`}
        >
          {({ loading: pdfLoading }) => (
            <Button variant="primary" size="sm" disabled={pdfLoading}>
              <Download className="h-3.5 w-3.5" />
              {pdfLoading ? "Generating..." : "Download PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      </div>
      <div className="rounded-lg border border-border bg-white overflow-hidden" style={{ height: "80vh" }}>
        <PDFViewer width="100%" height="100%" showToolbar={false}>
          <DocumentPDF
            type="quote"
            document={data.document}
            company={data.company}
            currency={data.settings?.currency}
          />
        </PDFViewer>
      </div>
    </div>
  );
}
