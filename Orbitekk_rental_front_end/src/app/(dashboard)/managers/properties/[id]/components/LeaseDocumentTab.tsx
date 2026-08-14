"use client";

import { Button } from "@/components/ui/button";
import { Copy, FileUp, Upload } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface LeaseDocumentTabProps {
  propertyId: number;
  initialDocumentUrl?: string;
  initialDocumentName?: string;
}

interface LeaseDocumentState {
  name: string;
  url: string;
  isObjectUrl: boolean;
}

const LeaseDocumentTab = ({
  propertyId,
  initialDocumentUrl,
  initialDocumentName = "Lease-document.pdf",
}: LeaseDocumentTabProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [document, setDocument] = useState<LeaseDocumentState | null>(
    initialDocumentUrl
      ? {
          name: initialDocumentName,
          url: initialDocumentUrl,
          isObjectUrl: false,
        }
      : null
  );

  useEffect(() => {
    return () => {
      if (document?.isObjectUrl) {
        URL.revokeObjectURL(document.url);
      }
    };
  }, [document]);

  const openFilePicker = () => inputRef.current?.click();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      toast.error("Please select a PDF document.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("The PDF must be smaller than 15 MB.");
      return;
    }

    if (document?.isObjectUrl) {
      URL.revokeObjectURL(document.url);
    }

    const previewUrl = URL.createObjectURL(file);
    setDocument({ name: file.name, url: previewUrl, isObjectUrl: true });

    // TODO(spring): Replace this browser-only preview with a multipart upload:
    // POST /properties/{propertyId}/lease-document
    // Save the returned persistent URL against the property/lease record.
    toast.success("Lease PDF added for preview.");
  };

  const handleCopyLink = async () => {
    if (!document) return;

    try {
      await navigator.clipboard.writeText(document.url);
      if (document.isObjectUrl) {
        toast.info(
          "Preview link copied. It only works in this browser session until backend storage is connected."
        );
      } else {
        toast.success("Lease document link copied.");
      }
    } catch {
      toast.error("Unable to copy the document link.");
    }
  };

  return (
    <section className="min-h-[460px] rounded-xl border bg-white p-4 shadow-sm sm:p-5">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-950">Lease</h2>
          <p className="mt-1 text-sm text-gray-500">
            Upload and manage the lease document for property #{propertyId}.
          </p>
        </div>

        {document && (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button type="button" variant="ghost" onClick={handleCopyLink}>
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-violet-600 hover:text-violet-700"
              onClick={openFilePicker}
            >
              <Upload className="h-4 w-4" />
              Replace Document
            </Button>
          </div>
        )}
      </div>

      {!document ? (
        <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed bg-gray-50/40">
          <Button
            type="button"
            variant="ghost"
            className="text-violet-600 hover:text-violet-700"
            onClick={openFilePicker}
          >
            <FileUp className="h-5 w-5" />
            Upload Lease Document
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-gray-700">
          <div className="flex flex-col gap-2 bg-gray-800 px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between">
            <span className="truncate font-medium">{document.name}</span>
            <span className="text-xs text-gray-300">PDF preview</span>
          </div>
          <iframe
            src={document.url}
            title={`${document.name} preview`}
            className="h-[620px] w-full bg-white"
          />
        </div>
      )}
    </section>
  );
};

export default LeaseDocumentTab;
