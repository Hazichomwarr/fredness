"use client";

import { useState } from "react";
import { UploadButton } from "@/src/lib/uploadthing";

type ProductImageUploaderProps = {
  onUploaded: (urls: string[]) => void;
};

export function ProductImageUploader({ onUploaded }: ProductImageUploaderProps) {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="grid gap-2 rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            Upload product images
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Image files only. Up to 5 files, 4MB each.
          </p>
        </div>
        <UploadButton
          endpoint="productImageUploader"
          onClientUploadComplete={(files) => {
            const urls = files
              .map((file) => file.url)
              .filter((url): url is string => Boolean(url));

            if (urls.length) {
              onUploaded(urls);
              setMessage(
                `${urls.length} image${urls.length === 1 ? "" : "s"} added.`,
              );
            }
          }}
          onUploadError={(error: Error) => {
            setMessage(error.message || "Image upload failed.");
          }}
          appearance={{
            button:
              "rounded-md bg-neutral-950 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-800",
            allowedContent: "hidden",
          }}
        />
      </div>
      {message ? <p className="text-xs text-neutral-600">{message}</p> : null}
    </div>
  );
}
