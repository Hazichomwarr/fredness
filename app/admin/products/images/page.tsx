import Link from "next/link";

import { ProductImageManager } from "@/components/admin/product-image-manager";
import { requireAdmin } from "@/src/lib/auth/admin";
import { FALLBACK_IMAGE_URL } from "@/src/lib/images";
import {
  getProductsMissingImages,
  PRODUCT_IMAGE_UPLOAD_PAGE_SIZE,
} from "@/src/lib/products/product-image-workflow";

type ProductImagesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | string[] | undefined) {
  const parsed = Number(firstParam(value) ?? "1");
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
}

export default async function ProductImagesPage({
  searchParams,
}: ProductImagesPageProps) {
  await requireAdmin();

  const params = (await searchParams) ?? {};
  const query = firstParam(params.q)?.trim() ?? "";
  const page = parsePage(params.page);
  const result = await getProductsMissingImages({
    query,
    page,
    pageSize: PRODUCT_IMAGE_UPLOAD_PAGE_SIZE,
  });

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Product images
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-600">
              Upload real product photos for items that still use the fallback
              image.
            </p>
          </div>
          <Link
            href="/admin/products"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
          >
            Back to products
          </Link>
        </div>

        <ProductImageManager
          products={result.products}
          query={query}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          pageCount={result.pageCount}
          fallbackImageUrl={FALLBACK_IMAGE_URL}
        />
      </div>
    </main>
  );
}
