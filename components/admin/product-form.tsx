// components/admin/product-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { createProductAction } from "@/app/admin/products/actions";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import {
  ProductFormParsedValues,
  ProductFormValues,
  productFormSchema,
} from "@/src/lib/products/product-form-schema";

type ProductFormCategory = {
  id: string;
  name: string;
  slug: string;
};

type ProductFormProps = {
  categories: ProductFormCategory[];
};

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

export function ProductForm({ categories }: ProductFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [validatedSubmit, setValidatedSubmit] = useState(false);
  const {
    control,
    getValues,
    register,
    setValue,
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
      retailPrice: "",
      wholesalePrice: "",
      minimumWholesaleQty: "",
      inventory: 0,
      trackInventory: true,
      isActive: true,
      imageUrls: "",
      variants: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const suggestedLabels = useMemo(() => {
    const selectedCategory = categories.find(
      (category) => category.id === selectedCategoryId,
    );

    return selectedCategory?.slug === "drinks" ? drinkLabels : weightLabels;
  }, [categories, selectedCategoryId]);

  function addVariant(label = "") {
    append({
      label,
      sku: "",
      retailPrice: "",
      wholesalePrice: "",
      inventory: 0,
      sortOrder: fields.length,
      isActive: true,
    });
  }

  function appendImageUrls(urls: string[]) {
    const existing = String(getValues("imageUrls") ?? "").trim();
    const next = [existing, ...urls].filter(Boolean).join("\n");

    setValue("imageUrls", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

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
            {...register("categoryId", {
              onChange: (event) => setSelectedCategoryId(event.target.value),
            })}
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

        <div className="grid gap-2 md:col-span-2">
          <ProductImageUploader onUploaded={appendImageUrls} />
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
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
        </div>

        <label className="grid gap-1 text-sm font-medium text-neutral-700 md:col-span-2">
          Description
          <textarea
            {...register("description")}
            rows={4}
            className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
          />
        </label>
      </div>

      <section className="grid gap-4 border-t border-neutral-200 pt-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-950">
              Variants
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Add Pack / Size options when this product has multiple package
              sizes.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold hover:bg-neutral-50"
            onClick={() => addVariant()}
          >
            Add variant
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestedLabels.map((label) => (
            <button
              key={label}
              type="button"
              className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              onClick={() => addVariant(label)}
            >
              {label}
            </button>
          ))}
        </div>

        {fields.length ? (
          <div className="grid gap-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-2 xl:grid-cols-4"
              >
                <label className="grid gap-1 text-sm font-medium text-neutral-700">
                  Pack / Size
                  <input
                    {...register(`variants.${index}.label`)}
                    list={`variant-labels-${index}`}
                    className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
                  />
                  <datalist id={`variant-labels-${index}`}>
                    {suggestedLabels.map((label) => (
                      <option key={label} value={label} />
                    ))}
                  </datalist>
                </label>
                <label className="grid gap-1 text-sm font-medium text-neutral-700">
                  SKU
                  <input
                    {...register(`variants.${index}.sku`)}
                    className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium text-neutral-700">
                  Retail
                  <input
                    {...register(`variants.${index}.retailPrice`)}
                    inputMode="decimal"
                    className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium text-neutral-700">
                  Wholesale
                  <input
                    {...register(`variants.${index}.wholesalePrice`)}
                    inputMode="decimal"
                    className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium text-neutral-700">
                  Inventory
                  <input
                    {...register(`variants.${index}.inventory`)}
                    type="number"
                    min="0"
                    className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium text-neutral-700">
                  Sort
                  <input
                    {...register(`variants.${index}.sortOrder`)}
                    type="number"
                    min="0"
                    className="rounded-md border border-neutral-300 px-3 py-2 font-normal"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                  <input
                    {...register(`variants.${index}.isActive`)}
                    type="checkbox"
                    className="h-4 w-4"
                  />
                  Active
                </label>
                <button
                  type="button"
                  className="justify-self-start text-sm font-semibold text-red-700 hover:text-red-800"
                  onClick={() => remove(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-5 text-sm text-neutral-600">
            No variants added. The product will use the base SKU, price, and
            inventory.
          </p>
        )}
        {errors.variants ? (
          <span className="text-xs text-red-600">
            Check variant Pack / Size, SKU, price, and inventory values.
          </span>
        ) : null}
      </section>

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
