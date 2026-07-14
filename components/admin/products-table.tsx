// components/admin/products-table.tsx
"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  hideProductAction,
  updateProductAction,
} from "@/app/admin/products/actions";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import { ProductVariantFields } from "@/components/admin/product-variant-fields";

export type AdminProductRow = {
  id: string;
  name: string;
  sku: string;
  categoryName: string;
  categorySlug: string;
  retailPrice: string;
  wholesalePrice: string | null;
  minimumWholesaleQty: number | null;
  wholesaleMinimumLabel: string | null;
  inventory: number;
  isActive: boolean;
  createdAt: string;
  imageUrls: string[];
  variants: {
    id: string;
    label: string;
    sku: string;
    retailPrice: string;
    wholesalePrice: string | null;
    inventory: number;
    sortOrder: number;
    isActive: boolean;
  }[];
};

type ProductsTableProps = {
  products: AdminProductRow[];
  page: number;
  pageSize: number;
  total: number;
  sort: string;
  direction: "asc" | "desc";
};

const sortableColumns = new Set([
  "name",
  "sku",
  "retailPrice",
  "inventory",
  "createdAt",
]);
const drinkLabels = ["1 unit", "4 pack", "6 pack", "12 pack", "24 pack"];
const weightLabels = [
  "1 lb",
  "2 lb",
  "4 lb",
  "5 lb",
  "8 lb",
  "10 lb",
  "16 lb",
  "25 lb",
  "50 lb",
];

function money(value: string | null) {
  if (!value) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

function ProductEditImageUrls({ initialUrls }: { initialUrls: string[] }) {
  const [imageUrls, setImageUrls] = useState(initialUrls.join("\n"));

  function appendImageUrls(urls: string[]) {
    setImageUrls((current) => [current.trim(), ...urls].filter(Boolean).join("\n"));
  }

  return (
    <div className="grid gap-2">
      <ProductImageUploader onUploaded={appendImageUrls} />
      <label className="grid gap-1 text-sm font-medium text-neutral-700">
        Image URLs or public paths
        <textarea
          name="imageUrls"
          rows={3}
          value={imageUrls}
          onChange={(event) => setImageUrls(event.target.value)}
          className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
          placeholder="https://example.com/product-front.jpg&#10;/products/product.jpeg"
        />
      </label>
    </div>
  );
}

export function ProductsTable({
  products,
  page,
  pageSize,
  total,
  sort,
  direction,
}: ProductsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function setParam(updates: Record<string, string | number>) {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      params.set(key, String(value));
    });

    router.push(`${pathname}?${params.toString()}`);
  }

  const columns: ColumnDef<AdminProductRow>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-neutral-950">{row.original.name}</p>
          <p className="text-xs text-neutral-500">
            {row.original.categoryName}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
    },
    {
      accessorKey: "retailPrice",
      header: "Retail",
      cell: ({ row }) => money(row.original.retailPrice),
    },
    {
      accessorKey: "wholesalePrice",
      header: "Wholesale",
      cell: ({ row }) => money(row.original.wholesalePrice),
    },
    {
      accessorKey: "inventory",
      header: "Inventory",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            row.original.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-neutral-100 text-neutral-600"
          }`}
        >
          {row.original.isActive ? "Active" : "Hidden"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <details className="group relative">
            <summary className="cursor-pointer rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-800 marker:hidden hover:bg-neutral-50">
              Edit
            </summary>
            <div className="absolute right-0 z-20 mt-2 max-h-[80vh] w-[min(92vw,760px)] overflow-y-auto rounded-lg border border-neutral-200 bg-white p-4 shadow-xl">
              <form action={updateProductAction} className="grid gap-3">
                <input type="hidden" name="id" value={row.original.id} />
                <label className="grid gap-1 text-sm font-medium text-neutral-700">
                  Name
                  <input
                    name="name"
                    defaultValue={row.original.name}
                    className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium text-neutral-700">
                  SKU
                  <input
                    name="sku"
                    defaultValue={row.original.sku}
                    className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
                    required
                  />
                </label>

                <ProductEditImageUrls initialUrls={row.original.imageUrls} />

                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-2 text-sm font-medium text-neutral-700">
                    Retail
                    <input
                      name="retailPrice"
                      defaultValue={row.original.retailPrice}
                      className="w-[80%] rounded-md border border-neutral-300 px-3 py-2 font-normal"
                      inputMode="decimal"
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-neutral-700">
                    Wholesale
                    <input
                      name="wholesalePrice"
                      defaultValue={row.original.wholesalePrice ?? ""}
                      className="w-[80%] rounded-md border border-neutral-300 px-3 py-2 font-normal"
                      inputMode="decimal"
                    />
                  </label>
                </div>
                <div className="grid gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <label className="grid gap-1 text-sm font-medium text-neutral-700">
                    Minimum wholesale quantity
                    <input
                      name="minimumWholesaleQty"
                      type="number"
                      min="1"
                      defaultValue={row.original.minimumWholesaleQty ?? ""}
                      className="rounded-md border border-neutral-300 bg-white px-3 py-2 font-normal"
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-neutral-700">
                    Wholesale minimum description
                    <input
                      name="wholesaleMinimumLabel"
                      maxLength={120}
                      defaultValue={row.original.wholesaleMinimumLabel ?? ""}
                      className="rounded-md border border-neutral-300 bg-white px-3 py-2 font-normal"
                      placeholder="Example: 2 bags — 100 lb total"
                    />
                    <span className="text-xs font-normal text-neutral-500">
                      Explain what the minimum quantity represents: pieces,
                      boxes, cases, bags, or total weight.
                    </span>
                  </label>
                </div>
                <div className="grid grid-cols-[1fr_auto] items-end gap-3">
                  <label className="grid gap-1 text-sm font-medium text-neutral-700">
                    Inventory
                    <input
                      name="inventory"
                      type="number"
                      min="0"
                      defaultValue={row.original.inventory}
                      className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
                      required
                    />
                  </label>

                  <label className="flex items-center gap-2 pb-2 text-sm font-medium text-neutral-700">
                    <input
                      name="isActive"
                      type="checkbox"
                      defaultChecked={row.original.isActive}
                      className="h-4 w-4"
                    />
                    Active
                  </label>
                </div>
                <ProductVariantFields
                  key={row.original.variants
                    .map((variant) => variant.id)
                    .join(":")}
                  productId={row.original.id}
                  variants={row.original.variants}
                  suggestedLabels={
                    row.original.categorySlug === "drinks"
                      ? drinkLabels
                      : weightLabels
                  }
                  onDeleted={setSuccessMessage}
                />
                <button className="rounded-md bg-neutral-950 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-700 cursor-pointer">
                  Save product
                </button>
              </form>
            </div>
          </details>
          <form
            action={hideProductAction}
            onSubmit={(event) => {
              if (!window.confirm(`Hide ${row.original.name}?`)) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={row.original.id} />
            <button className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 cursor-pointer">
              {row.original.isActive ? "Hide" : "Hidden"}
            </button>
          </form>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount,
  });

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      {successMessage ? (
        <div
          role="status"
          className="flex items-center justify-between gap-4 border-b border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <span>{successMessage}</span>
          <button
            type="button"
            aria-label="Dismiss success message"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-900 hover:text-emerald-950"
          >
            &times;
          </button>
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-225 border-collapse text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnId = header.column.id;
                  const isSortable = sortableColumns.has(columnId);
                  const nextDirection =
                    sort === columnId && direction === "asc" ? "desc" : "asc";

                  return (
                    <th
                      key={header.id}
                      className="border-b border-neutral-200 px-4 py-3"
                    >
                      {isSortable ? (
                        <button
                          className="font-semibold hover:text-neutral-950"
                          onClick={() =>
                            setParam({
                              sort: columnId,
                              direction: nextDirection,
                              page: 1,
                            })
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sort === columnId
                            ? direction === "asc"
                              ? " ↑"
                              : " ↓"
                            : ""}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-neutral-100 last:border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-4 align-top text-neutral-700"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-4 py-10 text-center text-neutral-500"
                  colSpan={columns.length}
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 text-sm text-neutral-600">
        <span>
          Page {page} of {pageCount} · {total} products
        </span>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-neutral-300 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            disabled={page <= 1}
            onClick={() => setParam({ page: page - 1 })}
          >
            Previous
          </button>
          <button
            className="rounded-md border border-neutral-300 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            disabled={page >= pageCount}
            onClick={() => setParam({ page: page + 1 })}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
