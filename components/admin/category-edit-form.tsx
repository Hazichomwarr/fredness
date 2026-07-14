"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  discardCategoryImageUploadAction,
  updateCategoryAction,
} from "@/app/admin/categories/actions";
import {
  CATEGORY_IMAGE_ACCEPT,
  hasValidCategoryImageSignature,
  validateCategoryImageMetadata,
} from "@/src/lib/images/category-image-validation";
import { useUploadThing } from "@/src/lib/uploadthing";

type CategoryEditFormProps = {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    sortOrder: number;
  };
  fallbackImageUrl: string;
};

type FormStatus =
  | {
      type: "success" | "error";
      message: string;
    }
  | null;

function isValidImageLocation(value: string) {
  if (!value) return true;
  if (/^\/(?!\/)\S+$/.test(value)) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function CategoryEditForm({
  category,
  fallbackImageUrl,
}: CategoryEditFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewObjectUrlRef = useRef<string | null>(null);
  const removeDialogRef = useRef<HTMLDialogElement>(null);
  const submissionInFlight = useRef(false);
  const [existingImageUrl, setExistingImageUrl] = useState(category.imageUrl);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState(
    category.imageUrl ?? "",
  );
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<FormStatus>(null);
  const [saveStage, setSaveStage] = useState<
    "idle" | "uploading" | "saving"
  >("idle");
  const { startUpload, isUploading } = useUploadThing(
    "categoryImageUploader",
  );
  const isBusy = saveStage !== "idle" || isUploading;

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const dialog = removeDialogRef.current;
    if (!dialog) return;

    if (removeDialogOpen && !dialog.open) {
      dialog.showModal();
    } else if (!removeDialogOpen && dialog.open) {
      dialog.close();
    }
  }, [removeDialogOpen]);

  function resetPreviewErrors() {
    setPreviewFailed(false);
    setFallbackFailed(false);
  }

  function clearSelectedFile() {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }

    setPendingImageFile(null);
    setPreviewObjectUrl(null);
    setFileError(null);
    resetPreviewErrors();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function selectReplacement(file: File | undefined) {
    if (!file) {
      setFileError("Choose an image to upload.");
      return;
    }

    const metadataError = validateCategoryImageMetadata(file);
    if (metadataError) {
      setFileError(metadataError);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!(await hasValidCategoryImageSignature(file))) {
      setFileError(
        "The file contents do not match a valid JPEG, PNG, or WebP image.",
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    clearSelectedFile();
    const objectUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = objectUrl;
    setPendingImageFile(file);
    setPreviewObjectUrl(objectUrl);
    setRemoveExistingImage(false);
    setFileError(null);
    setStatus(null);
  }

  function confirmRemoval() {
    clearSelectedFile();
    setPendingImageUrl("");
    setRemoveExistingImage(true);
    setRemoveDialogOpen(false);
    setStatus(null);
  }

  function undoRemoval() {
    setPendingImageUrl(existingImageUrl ?? "");
    setRemoveExistingImage(false);
    resetPreviewErrors();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInFlight.current) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const enteredImageUrl = pendingImageUrl.trim();

    if (!pendingImageFile && !isValidImageLocation(enteredImageUrl)) {
      setFieldErrors({
        imageUrl: ["Enter a valid HTTP(S) image URL or public path."],
      });
      setStatus({ type: "error", message: "Check the image URL." });
      return;
    }

    submissionInFlight.current = true;
    setFieldErrors({});
    setFileError(null);
    setStatus(null);

    let uploadedImage: { imageUrl: string; key: string } | null = null;

    try {
      if (pendingImageFile) {
        setSaveStage("uploading");
        const uploadedFiles = await startUpload([pendingImageFile]);
        const uploadedFile = uploadedFiles?.[0];
        const imageUrl = uploadedFile?.serverData?.url;
        const key = uploadedFile?.serverData?.key;

        if (!imageUrl || !key) {
          throw new Error("The image upload did not return a usable file.");
        }

        uploadedImage = { imageUrl, key };
        formData.set("uploadedImageUrl", imageUrl);
        formData.set("uploadedImageKey", key);
      }

      // A verified local upload wins over the manual URL field.
      formData.set("imageUrl", pendingImageFile ? "" : pendingImageUrl);
      formData.set("removeImage", String(removeExistingImage));
      setSaveStage("saving");

      const result = await updateCategoryAction(formData);

      if (!result.success) {
        setFieldErrors(result.fieldErrors ?? {});
        setStatus({ type: "error", message: result.message });
        return;
      }

      clearSelectedFile();
      setExistingImageUrl(result.imageUrl);
      setPendingImageUrl(result.imageUrl ?? "");
      setRemoveExistingImage(false);
      setStatus({ type: "success", message: result.message });
      router.refresh();
    } catch (error) {
      if (uploadedImage) {
        try {
          await discardCategoryImageUploadAction({
            imageUrl: uploadedImage.imageUrl,
            key: uploadedImage.key,
          });
        } catch {
          // The server logs cleanup failures; preserve the original category image.
        }
      }

      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to save the category. Please try again.",
      });
    } finally {
      submissionInFlight.current = false;
      setSaveStage("idle");
    }
  }

  const requestedPreviewUrl = previewObjectUrl
    ? previewObjectUrl
    : removeExistingImage
      ? fallbackImageUrl
      : pendingImageUrl.trim() || fallbackImageUrl;
  const displayedPreviewUrl = previewFailed
    ? fallbackImageUrl
    : requestedPreviewUrl;

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-lg border border-neutral-200 bg-white p-4"
    >
      <input type="hidden" name="id" value={category.id} />

      {status ? (
        <div
          role={status.type === "error" ? "alert" : "status"}
          className={`rounded-md border px-4 py-3 text-sm font-medium ${
            status.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {status.message}
        </div>
      ) : null}

      <label className="grid gap-1 text-sm font-medium text-neutral-700">
        Name
        <input
          name="name"
          defaultValue={category.name}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "category-name-error" : undefined}
          className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
          required
        />
        {fieldErrors.name ? (
          <span id="category-name-error" className="text-xs text-red-700">
            {fieldErrors.name[0]}
          </span>
        ) : null}
      </label>

      <label className="grid gap-1 text-sm font-medium text-neutral-700">
        Slug
        <input
          name="slug"
          defaultValue={category.slug}
          aria-invalid={Boolean(fieldErrors.slug)}
          aria-describedby={fieldErrors.slug ? "category-slug-error" : undefined}
          className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
          required
        />
        {fieldErrors.slug ? (
          <span id="category-slug-error" className="text-xs text-red-700">
            {fieldErrors.slug[0]}
          </span>
        ) : null}
      </label>

      <section className="grid gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-950">
            Category image
          </h2>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            A selected file takes precedence over the URL below. Changes are
            applied only when you save the category.
          </p>
        </div>

        <div className="max-w-[420px] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
          <div className="aspect-[4/3]">
            {fallbackFailed ? (
              <div className="grid h-full place-items-center p-6 text-center text-sm text-neutral-500">
                Image preview unavailable. The storefront fallback will still
                be used.
              </div>
            ) : (
              // A plain image supports local object URLs and arbitrary legacy URLs.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayedPreviewUrl}
                alt={`${category.name} category image preview`}
                onError={() => {
                  if (displayedPreviewUrl === fallbackImageUrl) {
                    setFallbackFailed(true);
                  } else {
                    setPreviewFailed(true);
                  }
                }}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <p className="border-t border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600">
            {pendingImageFile
              ? "Replacement preview — not saved yet"
              : removeExistingImage
                ? "Marked for removal — fallback preview"
                : pendingImageUrl.trim()
                  ? "Current URL preview"
                  : "Fallback preview"}
          </p>
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="category-image-file"
            className="text-sm font-medium text-neutral-700"
          >
            Replace image
          </label>
          <input
            ref={fileInputRef}
            id="category-image-file"
            type="file"
            accept={CATEGORY_IMAGE_ACCEPT}
            disabled={isBusy}
            aria-describedby={
              fileError ? "category-image-file-error" : "category-image-help"
            }
            onChange={(event) => {
              void selectReplacement(event.target.files?.[0]);
            }}
            className="block w-full max-w-md rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-neutral-950 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white disabled:opacity-50"
          />
          <p id="category-image-help" className="text-xs text-neutral-500">
            JPEG, PNG, or WebP. One image, up to 4 MB.
          </p>
          {fileError ? (
            <p
              id="category-image-file-error"
              role="alert"
              className="text-xs font-medium text-red-700"
            >
              {fileError}
            </p>
          ) : null}
          {pendingImageFile ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={clearSelectedFile}
              className="w-fit text-sm font-semibold text-neutral-700 hover:text-neutral-950 disabled:opacity-50"
            >
              Cancel replacement
            </button>
          ) : null}
        </div>

        <label className="grid gap-1 text-sm font-medium text-neutral-700">
          Image URL or public path
          <input
            name="imageUrl"
            value={pendingImageUrl}
            disabled={isBusy}
            aria-invalid={Boolean(fieldErrors.imageUrl)}
            aria-describedby={
              fieldErrors.imageUrl ? "category-image-url-error" : undefined
            }
            placeholder="https://example.com/category.jpg"
            onChange={(event) => {
              const value = event.target.value;
              setPendingImageUrl(value);
              setRemoveExistingImage(!pendingImageFile && !value.trim());
              setFieldErrors((current) => {
                const next = { ...current };
                delete next.imageUrl;
                return next;
              });
              resetPreviewErrors();
              setStatus(null);
            }}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 font-normal disabled:opacity-50"
          />
          {fieldErrors.imageUrl?.length ? (
            <span id="category-image-url-error" className="text-xs text-red-700">
              {fieldErrors.imageUrl[0]}
            </span>
          ) : null}
        </label>

        <div className="flex flex-wrap gap-3 border-t border-neutral-200 pt-3">
          {removeExistingImage ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={undoRemoval}
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
            >
              Undo removal
            </button>
          ) : existingImageUrl || pendingImageUrl.trim() ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setRemoveDialogOpen(true)}
              className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              Remove image
            </button>
          ) : null}
        </div>
      </section>

      <label className="grid gap-1 text-sm font-medium text-neutral-700">
        Sort order
        <input
          name="sortOrder"
          type="number"
          min="0"
          defaultValue={category.sortOrder}
          aria-invalid={Boolean(fieldErrors.sortOrder)}
          aria-describedby={
            fieldErrors.sortOrder ? "category-sort-error" : undefined
          }
          className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
        />
        {fieldErrors.sortOrder ? (
          <span id="category-sort-error" className="text-xs text-red-700">
            {fieldErrors.sortOrder[0]}
          </span>
        ) : null}
      </label>

      <label className="grid gap-1 text-sm font-medium text-neutral-700">
        Description
        <textarea
          name="description"
          rows={4}
          defaultValue={category.description ?? ""}
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby={
            fieldErrors.description ? "category-description-error" : undefined
          }
          className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
        />
        {fieldErrors.description ? (
          <span
            id="category-description-error"
            className="text-xs text-red-700"
          >
            {fieldErrors.description[0]}
          </span>
        ) : null}
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          disabled={isBusy}
          className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveStage === "uploading"
            ? "Uploading..."
            : saveStage === "saving"
              ? "Saving..."
              : "Save changes"}
        </button>
        <Link
          href="/admin/categories"
          aria-disabled={isBusy}
          className={`rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 ${
            isBusy ? "pointer-events-none opacity-50" : ""
          }`}
        >
          Cancel
        </Link>
      </div>

      <dialog
        ref={removeDialogRef}
        onCancel={(event) => {
          if (isBusy) {
            event.preventDefault();
          } else {
            setRemoveDialogOpen(false);
          }
        }}
        onClose={() => setRemoveDialogOpen(false)}
        className="m-auto w-[min(92vw,440px)] rounded-xl border border-neutral-200 bg-white p-6 text-neutral-950 shadow-2xl backdrop:bg-black/50"
      >
        <h2 className="text-lg font-bold">Remove category image?</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          The category will use the default fallback image until another image
          is added. This change is applied when you save the category.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            autoFocus
            onClick={() => setRemoveDialogOpen(false)}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmRemoval}
            className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          >
            Remove image
          </button>
        </div>
      </dialog>
    </form>
  );
}
