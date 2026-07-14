"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

type PurchaseVariant = {
  id: string;
  label: string;
  sku: string;
  retailPrice: number;
  wholesalePrice: number | null;
  inventory: number;
  sortOrder: number;
  isActive: boolean;
};

type ProductPurchaseOptionsProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    sku: string;
    imageUrl: string;
    retailPrice: number;
    wholesalePrice: number | null;
    minimumWholesaleQty: number | null;
    wholesaleMinimumLabel: string | null;
    inventory: number;
    trackInventory: boolean;
  };
  variants: PurchaseVariant[];
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function ProductPurchaseOptions({
  product,
  variants,
}: ProductPurchaseOptionsProps) {
  const activeVariants = useMemo(
    () =>
      variants
        .filter((variant) => variant.isActive)
        .sort(
          (left, right) =>
            left.sortOrder - right.sortOrder ||
            left.label.localeCompare(right.label),
        ),
    [variants],
  );
  const [selectedVariantId, setSelectedVariantId] = useState(
    activeVariants[0]?.id ?? "",
  );
  const selectedVariant =
    activeVariants.find((variant) => variant.id === selectedVariantId) ??
    activeVariants[0] ??
    null;
  const displayPrice = selectedVariant?.retailPrice ?? product.retailPrice;
  const displayWholesalePrice =
    selectedVariant?.wholesalePrice ?? product.wholesalePrice;
  const displaySku = selectedVariant?.sku ?? product.sku;
  const displayInventory = selectedVariant?.inventory ?? product.inventory;
  const isOutOfStock = product.trackInventory && displayInventory <= 0;

  return (
    <>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-y border-gray-200 py-5">
        <div>
          <p className="text-3xl font-bold text-green-700">
            {money(displayPrice)}
          </p>
          {displayWholesalePrice ? (
            <div className="mt-1 grid gap-0.5 text-sm text-gray-600">
              <p>Wholesale price: {money(displayWholesalePrice)}</p>
              {product.minimumWholesaleQty ? (
                <p>
                  Minimum wholesale order:{" "}
                  {product.wholesaleMinimumLabel ??
                    `${product.minimumWholesaleQty} units`}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            isOutOfStock
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {isOutOfStock ? "Out of stock" : "In stock"}
        </span>
      </div>

      {activeVariants.length ? (
        <fieldset className="mt-6 grid gap-3">
          <legend className="text-sm font-semibold text-gray-900">
            Pack / Size
          </legend>
          <div className="flex flex-wrap gap-2">
            {activeVariants.map((variant) => (
              <label
                key={variant.id}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold ${
                  selectedVariant?.id === variant.id
                    ? "border-green-700 bg-green-50 text-green-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="variant"
                  value={variant.id}
                  checked={selectedVariant?.id === variant.id}
                  onChange={() => setSelectedVariantId(variant.id)}
                  className="sr-only"
                />
                {variant.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <AddToCartButton
          item={{
            productId: product.id,
            variantId: selectedVariant?.id,
            variantLabel: selectedVariant?.label,
            slug: product.slug,
            name: product.name,
            sku: displaySku,
            imageUrl: product.imageUrl,
            price: displayPrice,
            inventory: displayInventory,
            trackInventory: product.trackInventory,
          }}
          className="rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          disabled={isOutOfStock}
        />
        <Link
          href={`/quote?product=${product.slug}`}
          className="rounded-lg border border-green-700 px-5 py-3 text-center text-sm font-semibold text-green-800 transition hover:bg-green-50"
        >
          Request wholesale quote
        </Link>
      </div>

      <dl className="mt-8 grid gap-3 border-t border-gray-200 pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="font-medium text-gray-500">SKU</dt>
          <dd className="text-gray-900">{displaySku}</dd>
        </div>
        {selectedVariant ? (
          <div className="flex justify-between gap-4">
            <dt className="font-medium text-gray-500">Pack / Size</dt>
            <dd className="text-gray-900">{selectedVariant.label}</dd>
          </div>
        ) : null}
        {product.trackInventory ? (
          <div className="flex justify-between gap-4">
            <dt className="font-medium text-gray-500">Inventory</dt>
            <dd className="text-gray-900">{displayInventory}</dd>
          </div>
        ) : null}
      </dl>
    </>
  );
}
