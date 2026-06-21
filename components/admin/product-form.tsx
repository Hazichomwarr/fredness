// components/admin/product-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createProductAction } from "@/app/admin/products/actions";
import {
  ProductFormParsedValues,
  ProductFormValues,
  productFormSchema,
} from "@/src/lib/products/product-form-schema";

type ProductFormCategory = {
  id: string;
  name: string;
};

type ProductFormProps = {
  categories: ProductFormCategory[];
};

export function ProductForm({ categories }: ProductFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [validatedSubmit, setValidatedSubmit] = useState(false);
  const {
    register,
    trigger,
    formState: { errors },
  } = useForm<ProductFormValues, unknown, ProductFormParsedValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      categoryId: "",
      description: "",
      brand: "",
      weight: "",
      retailPrice: "",
      wholesalePrice: "",
      minimumWholesaleQty: "",
      inventory: 0,
      trackInventory: true,
      isActive: true,
      imageUrls: "",
    },
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (validatedSubmit) {
      return;
    }

    event.preventDefault();
    const isValid = await trigger();

    if (isValid) {
      setValidatedSubmit(true);
      requestAnimationFrame(() => formRef.current?.requestSubmit());
    }
  }

  return (
    <form
      ref={formRef}
      action={createProductAction}
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-lg border border-neutral-200 bg-white p-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-neutral-700">
          Product name
          <input
            {...register("name")}
            className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
          />
          {errors.name ? (
            <span className="text-xs text-red-600">{errors.name.message}</span>
          ) : null}
        </label>

        <label className="grid gap-1 text-sm font-medium text-neutral-700">
          Slug
          <input
            {...register("slug")}
            className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
            placeholder="Generated from name if blank"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-neutral-700">
          SKU
          <input
            {...register("sku")}
            className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
          />
          {errors.sku ? (
            <span className="text-xs text-red-600">{errors.sku.message}</span>
          ) : null}
        </label>

        <label className="grid gap-1 text-sm font-medium text-neutral-700">
          Category
          <select
            {...register("categoryId")}
            className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? (
            <span className="text-xs text-red-600">
              {errors.categoryId.message}
            </span>
          ) : null}
        </label>

        <label className="grid gap-1 text-sm font-medium text-neutral-700">
          Brand
          <input
            {...register("brand")}
            className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-neutral-700">
          Weight
          <input
            {...register("weight")}
            className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
            placeholder="25 lb, 500 g, 12 pack"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-neutral-700">
          Retail price
          <input
            {...register("retailPrice")}
            inputMode="decimal"
            className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
          />
          {errors.retailPrice ? (
            <span className="text-xs text-red-600">
              {errors.retailPrice.message}
            </span>
          ) : null}
        </label>

        <label className="grid gap-1 text-sm font-medium text-neutral-700">
          Wholesale price
          <input
            {...register("wholesalePrice")}
            inputMode="decimal"
            className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
          />
          {errors.wholesalePrice ? (
            <span className="text-xs text-red-600">
              {errors.wholesalePrice.message}
            </span>
          ) : null}
        </label>

        <label className="grid gap-1 text-sm font-medium text-neutral-700">
          Inventory
          <input
            {...register("inventory")}
            type="number"
            min="0"
            className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
          />
          {errors.inventory ? (
            <span className="text-xs text-red-600">
              {errors.inventory.message}
            </span>
          ) : null}
        </label>

        <label className="grid gap-1 text-sm font-medium text-neutral-700">
          Minimum wholesale quantity
          <input
            {...register("minimumWholesaleQty")}
            type="number"
            min="0"
            className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
          />
          {errors.minimumWholesaleQty ? (
            <span className="text-xs text-red-600">
              {errors.minimumWholesaleQty.message}
            </span>
          ) : null}
        </label>

        <label className="grid gap-1 text-sm font-medium text-neutral-700 md:col-span-2">
          Image URLs or public paths
          <textarea
            {...register("imageUrls")}
            rows={3}
            className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
            placeholder="https://example.com/product-front.jpg&#10;/products/product.jpeg"
          />
          {errors.imageUrls ? (
            <span className="text-xs text-red-600">
              {errors.imageUrls.message}
            </span>
          ) : null}
        </label>

        <label className="grid gap-1 text-sm font-medium text-neutral-700 md:col-span-2">
          Description
          <textarea
            {...register("description")}
            rows={4}
            className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-4 border-t border-neutral-200 pt-4">
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <input
            {...register("trackInventory")}
            type="checkbox"
            className="h-4 w-4"
          />
          Track inventory
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <input
            {...register("isActive")}
            type="checkbox"
            className="h-4 w-4"
          />
          Active
        </label>
      </div>

      <div>
        <button
          className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
          disabled={!categories.length}
        >
          Create product
        </button>
      </div>
    </form>
  );
}
