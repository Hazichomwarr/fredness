"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveProductUploadedImagesAction } from "@/app/admin/products/images/actions";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";

type ProductImageManagerProduct = {
  id: string;
  name: string;
  sku: string;
  slug: string;
  brand: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: {
    id: string;
    url: string;
    altText: string | null;
    sortOrder: number;
  }[];
};

type ProductImageManagerProps = {
  products: ProductImageManagerProduct[];
  query: string;
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  fallbackImageUrl: string;
};

type StatusState =
  | {
      type: "success" | "error" | "loading";
      message: string;
    }
  | null;

function pageHref(query: string, page: number) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();

  return `/admin/products/images${queryString ? `?${queryString}` : ""}`;
}

function ProductImageCard({
  product,
  fallbackImageUrl,
}: {
  product: ProductImageManagerProduct;
  fallbackImageUrl: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusState>(null);
  const [isPending, startTransition] = useTransition();
  const firstImage = product.images[0];
  const previewUrl = firstImage?.url ?? fallbackImageUrl;
  const hasFallbackOnly =
    product.images.length > 0 &&
    product.images.every(
      (image) =>
        image.url === fallbackImageUrl ||
        image.url.includes("african-best-fallback.png"),
    );

  function handleUploaded(urls: string[]) {
    setStatus({ type: "loading", message: "Saving uploaded image..." });

    startTransition(async () => {
      try {
        const result = await saveProductUploadedImagesAction({
          productId: product.id,
          urls,
        });

        setStatus({
          type: "success",
          message:
            result.addedCount === 1
              ? "Image saved."
              : `${result.addedCount} images saved.`,
        });
        router.refresh();
      } catch (error) {
        setStatus({
          type: "error",
          message:
            error instanceof Error ? error.message : "Could not save image.",
        });
      }
    });
  }

  return (
    <article className="grid gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm md:grid-cols-[96px_1fr_280px]">
      <div className="h-24 w-24 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
        <img
          src={previewUrl}
          alt={firstImage?.altText ?? product.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-neutral-950">
            {product.name}
          </h2>
          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
            {hasFallbackOnly ? "Fallback only" : "No image"}
          </span>
        </div>

        <dl className="mt-3 grid gap-2 text-sm text-neutral-600 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-neutral-500">SKU</dt>
            <dd className="font-mono text-neutral-900">{product.sku}</dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-500">Slug</dt>
            <dd className="truncate text-neutral-900">{product.slug}</dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-500">Category</dt>
            <dd className="text-neutral-900">{product.category.name}</dd>
          </div>
          {product.brand ? (
            <div>
              <dt className="font-medium text-neutral-500">Brand</dt>
              <dd className="text-neutral-900">{product.brand}</dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-3 text-xs text-neutral-500">
          {product.images.length
            ? `Current image records: ${product.images.length}`
            : "No ProductImage records yet."}
        </p>
      </div>

      <div className="grid content-start gap-2">
        <ProductImageUploader onUploaded={handleUploaded} />
        {isPending ? (
          <p className="text-xs text-neutral-500">Saving to product...</p>
        ) : null}
        {status ? (
          <p
            className={
              status.type === "error"
                ? "text-xs font-medium text-red-700"
                : "text-xs font-medium text-emerald-700"
            }
          >
            {status.message}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function ProductImageManager({
  products,
  query,
  page,
  pageSize,
  total,
  pageCount,
  fallbackImageUrl,
}: ProductImageManagerProps) {
  return (
    <div className="grid gap-5">
      <form
        action="/admin/products/images"
        className="flex flex-wrap gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
      >
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search product name or SKU"
          className="min-w-0 flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Search
        </button>
        {query ? (
          <Link
            href="/admin/products/images"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
          >
            Clear
          </Link>
        ) : null}
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-600">
        <p>
          {total} product{total === 1 ? "" : "s"} missing real images
        </p>
        <p>
          Page {page} of {pageCount}
        </p>
      </div>

      {products.length ? (
        <div className="grid gap-4">
          {products.map((product) => (
            <ProductImageCard
              key={product.id}
              product={product}
              fallbackImageUrl={fallbackImageUrl}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-600 shadow-sm">
          No products need images right now.
        </div>
      )}

      <div className="flex items-center justify-between gap-3 text-sm">
        {page > 1 ? (
          <Link
            href={pageHref(query, page - 1)}
            className="rounded-md border border-neutral-300 px-4 py-2 font-semibold text-neutral-800 hover:bg-neutral-100"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-md border border-neutral-200 px-4 py-2 font-semibold text-neutral-300">
            Previous
          </span>
        )}

        <span className="text-neutral-500">{pageSize} per page</span>

        {page < pageCount ? (
          <Link
            href={pageHref(query, page + 1)}
            className="rounded-md border border-neutral-300 px-4 py-2 font-semibold text-neutral-800 hover:bg-neutral-100"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-md border border-neutral-200 px-4 py-2 font-semibold text-neutral-300">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
