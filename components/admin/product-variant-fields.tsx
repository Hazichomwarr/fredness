"use client";

import { Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { deleteProductVariantAction } from "@/app/admin/products/actions";

type EditableVariant = {
  id: string;
  label: string;
  sku: string;
  retailPrice: string;
  wholesalePrice: string | null;
  inventory: number;
  sortOrder: number;
  isActive: boolean;
};

type VariantRow = EditableVariant & {
  clientKey: string;
};

type ProductVariantFieldsProps = {
  productId: string;
  variants: EditableVariant[];
  suggestedLabels: string[];
  onDeleted: (message: string) => void;
};

function newVariant(clientKey: string, sortOrder: number): VariantRow {
  return {
    clientKey,
    id: "",
    label: "",
    sku: "",
    retailPrice: "",
    wholesalePrice: null,
    inventory: 0,
    sortOrder,
    isActive: true,
  };
}

export function ProductVariantFields({
  productId,
  variants,
  suggestedLabels,
  onDeleted,
}: ProductVariantFieldsProps) {
  const nextNewVariant = useRef(3);
  const deletionInFlight = useRef(false);
  const [rows, setRows] = useState<VariantRow[]>(() => [
    ...variants.map((variant) => ({
      ...variant,
      clientKey: variant.id,
    })),
    ...Array.from({ length: 3 }, (_, index) =>
      newVariant(`new-${index}`, variants.length + index),
    ),
  ]);
  const [variantToDelete, setVariantToDelete] =
    useState<VariantRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function removeUnsavedVariant(clientKey: string) {
    setRows((current) =>
      current.filter((variant) => variant.clientKey !== clientKey),
    );
  }

  function addVariant() {
    const nextIndex = nextNewVariant.current++;
    setRows((current) => [
      ...current,
      newVariant(`added-${nextIndex}`, current.length),
    ]);
  }

  function confirmDeletion() {
    if (!variantToDelete || deletionInFlight.current) return;

    const selectedVariant = variantToDelete;
    deletionInFlight.current = true;
    setError(null);

    startTransition(async () => {
      try {
        const result = await deleteProductVariantAction({
          productId,
          variantId: selectedVariant.id,
        });

        if (!result.success) {
          setError(result.message);
          return;
        }

        setRows((current) =>
          current.filter(
            (variant) => variant.clientKey !== selectedVariant.clientKey,
          ),
        );
        setVariantToDelete(null);
        onDeleted(result.message);
      } catch {
        setError("Unable to delete the variant. Please try again.");
      } finally {
        deletionInFlight.current = false;
      }
    });
  }

  return (
    <div className="grid gap-3 border-t border-neutral-200 pt-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-950">Variants</p>
          <p className="mt-1 text-xs text-neutral-500">
            Use Pack / Size labels. Leave new rows blank to ignore them.
          </p>
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Add variant
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
        >
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {suggestedLabels.map((label) => (
          <span
            key={label}
            className="rounded-full border border-neutral-200 px-2 py-1 text-xs text-neutral-600"
          >
            {label}
          </span>
        ))}
      </div>

      {rows.map((variant, index) => (
        <div
          key={variant.clientKey}
          className="grid gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          <input
            type="hidden"
            name={`variants.${index}.id`}
            value={variant.id}
          />
          <label className="grid gap-1 text-xs font-medium text-neutral-700">
            Pack / Size
            <input
              name={`variants.${index}.label`}
              defaultValue={variant.label}
              list={`edit-variant-labels-${productId}-${variant.clientKey}`}
              className="rounded-md border border-neutral-300 px-2 py-1.5 font-normal"
            />
            <datalist
              id={`edit-variant-labels-${productId}-${variant.clientKey}`}
            >
              {suggestedLabels.map((label) => (
                <option key={label} value={label} />
              ))}
            </datalist>
          </label>
          <label className="grid gap-1 text-xs font-medium text-neutral-700">
            SKU
            <input
              name={`variants.${index}.sku`}
              defaultValue={variant.sku}
              className="rounded-md border border-neutral-300 px-2 py-1.5 font-normal"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium text-neutral-700">
            Retail
            <input
              name={`variants.${index}.retailPrice`}
              defaultValue={variant.retailPrice}
              inputMode="decimal"
              className="rounded-md border border-neutral-300 px-2 py-1.5 font-normal"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium text-neutral-700">
            Wholesale
            <input
              name={`variants.${index}.wholesalePrice`}
              defaultValue={variant.wholesalePrice ?? ""}
              inputMode="decimal"
              className="rounded-md border border-neutral-300 px-2 py-1.5 font-normal"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium text-neutral-700">
            Inventory
            <input
              name={`variants.${index}.inventory`}
              type="number"
              min="0"
              defaultValue={variant.inventory}
              className="rounded-md border border-neutral-300 px-2 py-1.5 font-normal"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium text-neutral-700">
            Sort
            <input
              name={`variants.${index}.sortOrder`}
              type="number"
              min="0"
              defaultValue={variant.sortOrder}
              className="rounded-md border border-neutral-300 px-2 py-1.5 font-normal"
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700">
            <input
              name={`variants.${index}.isActive`}
              type="checkbox"
              defaultChecked={variant.isActive}
              className="h-4 w-4"
            />
            Active
          </label>
          <div className="flex items-center border-t border-neutral-200 pt-3 sm:col-span-2 xl:col-span-4">
            {variant.id ? (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setVariantToDelete(variant);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
              >
                <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                Delete variant
              </button>
            ) : (
              <button
                type="button"
                onClick={() => removeUnsavedVariant(variant.clientKey)}
                className="text-xs font-semibold text-neutral-600 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}

      {variantToDelete ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isPending) {
              setVariantToDelete(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-variant-title"
            aria-describedby="delete-variant-description"
            onKeyDown={(event) => {
              if (event.key === "Escape" && !isPending) {
                setVariantToDelete(null);
              }
            }}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-red-50 p-2 text-red-700">
                <Trash2 aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <h2
                  id="delete-variant-title"
                  className="text-lg font-bold text-neutral-950"
                >
                  Delete this variant?
                </h2>
                <p
                  id="delete-variant-description"
                  className="mt-2 text-sm leading-6 text-neutral-600"
                >
                  This will permanently remove the selected product option. The
                  parent product will not be deleted.
                </p>
              </div>
            </div>

            <dl className="mt-4 grid gap-2 rounded-lg bg-neutral-50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Pack / Size</dt>
                <dd className="font-semibold text-neutral-900">
                  {variantToDelete.label || "Not specified"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">SKU</dt>
                <dd className="font-semibold text-neutral-900">
                  {variantToDelete.sku || "Not specified"}
                </dd>
              </div>
            </dl>

            {error ? (
              <p role="alert" className="mt-4 text-sm font-medium text-red-700">
                {error}
              </p>
            ) : null}

            <p className="mt-4 text-sm font-semibold text-red-700">
              This deletion is permanent.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                autoFocus
                disabled={isPending}
                onClick={() => setVariantToDelete(null)}
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirmDeletion}
                className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Delete variant"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
