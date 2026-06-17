// components/admin/products-table.tsx
"use client";

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

export type AdminProductRow = {
  id: string;
  name: string;
  sku: string;
  categoryName: string;
  retailPrice: string;
  wholesalePrice: string | null;
  inventory: number;
  isActive: boolean;
  createdAt: string;
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

function money(value: string | null) {
  if (!value) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
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
            <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-neutral-200 bg-white p-4 shadow-xl">
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
                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-1 text-sm font-medium text-neutral-700">
                    Retail
                    <input
                      name="retailPrice"
                      defaultValue={row.original.retailPrice}
                      className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
                      inputMode="decimal"
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-neutral-700">
                    Wholesale
                    <input
                      name="wholesalePrice"
                      defaultValue={row.original.wholesalePrice ?? ""}
                      className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
                      inputMode="decimal"
                    />
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
                <button className="rounded-md bg-neutral-950 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-800">
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
            <button className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50">
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
            className="rounded-md border border-neutral-300 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setParam({ page: page - 1 })}
          >
            Previous
          </button>
          <button
            className="rounded-md border border-neutral-300 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40"
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
