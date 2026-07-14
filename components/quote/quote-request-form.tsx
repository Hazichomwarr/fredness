// components/quote/quote-request-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createQuoteAction } from "@/app/quote/actions";
import {
  QuoteRequestParsedValues,
  QuoteRequestValues,
  quoteRequestSchema,
} from "@/src/lib/quotes/quote-request-schema";

export type QuoteRequestProduct = {
  id: string;
  name: string;
  sku: string;
  slug: string;
  imageUrl: string;
  wholesalePrice: number | null;
  minimumWholesaleQty: number | null;
  wholesaleMinimumLabel: string | null;
};

type QuoteRequestFormProps = {
  products: QuoteRequestProduct[];
  selectedProductId?: string;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function QuoteRequestForm({
  products,
  selectedProductId,
}: QuoteRequestFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [validatedSubmit, setValidatedSubmit] = useState(false);
  const {
    register,
    trigger,
    formState: { errors },
  } = useForm<QuoteRequestValues, unknown, QuoteRequestParsedValues>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      businessName: "",
      message: "",
      items: products.map((product) => ({
        productId: product.id,
        selected: product.id === selectedProductId,
        quantity: product.minimumWholesaleQty ?? 1,
      })),
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      action={createQuoteAction}
      onSubmit={handleSubmit}
      className="grid gap-6"
    >
      <section className="grid gap-4 rounded-xl border border-gray-200 bg-white p-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-950">
            Business contact
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Name
            <input
              {...register("name")}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
            {errors.name ? (
              <span className="text-xs text-red-700">
                {errors.name.message}
              </span>
            ) : null}
          </label>

          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Email
            <input
              {...register("email")}
              type="email"
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
            {errors.email ? (
              <span className="text-xs text-red-700">
                {errors.email.message}
              </span>
            ) : null}
          </label>

          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Phone
            <input
              {...register("phone")}
              type="tel"
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
            {errors.phone ? (
              <span className="text-xs text-red-700">
                {errors.phone.message}
              </span>
            ) : null}
          </label>

          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Business name
            <input
              {...register("businessName")}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
            {errors.businessName ? (
              <span className="text-xs text-red-700">
                {errors.businessName.message}
              </span>
            ) : null}
          </label>

          <label className="grid gap-1 text-sm font-medium text-gray-700 md:col-span-2">
            Message
            <textarea
              {...register("message")}
              rows={4}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
        </div>
      </section>

      <section className="grid gap-4 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-950">
              Selected products
            </h2>
          </div>
          {errors.items?.message ? (
            <p className="text-sm font-medium text-red-700">
              {errors.items.message}
            </p>
          ) : null}
        </div>

        {products.length ? (
          <div className="grid gap-3">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="grid gap-4 rounded-lg border border-gray-200 p-3 sm:grid-cols-[88px_1fr_auto]"
              >
                <input
                  type="hidden"
                  {...register(`items.${index}.productId`)}
                />
                <div
                  className="h-22 rounded-md bg-gray-100 bg-cover bg-center"
                  style={{ backgroundImage: `url("${product.imageUrl}")` }}
                  role="img"
                  aria-label={product.name}
                />
                <label className="flex gap-3">
                  <input
                    {...register(`items.${index}.selected`)}
                    type="checkbox"
                    className="mt-1 size-5 rounded border-gray-300 text-green-700"
                  />
                  <span>
                    <span className="block font-semibold text-gray-950">
                      {product.name}
                    </span>
                    <span className="mt-1 block text-sm text-gray-600">
                      SKU {product.sku}
                      {product.wholesalePrice
                        ? ` · Wholesale ${money(product.wholesalePrice)}`
                        : ""}
                    </span>
                  </span>
                </label>
                <label className="grid gap-1 text-sm font-medium text-gray-700 sm:justify-items-end">
                  Quantity
                  <input
                    {...register(`items.${index}.quantity`)}
                    type="number"
                    min={product.minimumWholesaleQty ?? 1}
                    className="w-28 rounded-lg border border-gray-300 px-3 py-2"
                  />
                  {product.minimumWholesaleQty ? (
                    <span className="max-w-52 text-xs font-normal text-gray-500 sm:text-right">
                      Minimum wholesale order:{" "}
                      {product.wholesaleMinimumLabel ??
                        `${product.minimumWholesaleQty} units`}
                    </span>
                  ) : null}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-gray-600">
            No active products found for this quote.
          </p>
        )}
      </section>

      <button
        className="justify-self-start rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!products.length || validatedSubmit}
      >
        {validatedSubmit ? "Sending request..." : "Send quote request"}
      </button>
    </form>
  );
}
