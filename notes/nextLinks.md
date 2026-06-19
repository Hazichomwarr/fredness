# nextLinks.md

## Purpose

Use this note later to instruct cohnmyhow to build real navigation pages for:

- Best Sellers
- Bundles

Do not build these pages until the business has real data or confirmed bundle offers.

---

# 1. Best Sellers Page

## When to build

Build this page only after the store has real orders in the database.

Do not hardcode fake best sellers.

## Route

```txt
/app/best-sellers/page.tsx
```

## Goal

Show the products that customers buy the most.

## Data source

Use:

```txt
OrderItem
Order
Product
ProductImage
Category
```

## Query logic

Only count completed revenue orders.

Use orders with statuses:

```txt
PAID
PROCESSING
FULFILLED
```

Group by:

```txt
productId
```

Calculate:

```txt
totalQuantitySold = SUM(OrderItem.quantity)
totalRevenue = SUM(OrderItem.lineTotal)
```

Sort by:

```txt
totalQuantitySold DESC
```

Take:

```txt
24 products
```

## Page requirements

The page should include:

- Page title: Best Sellers
- Short subtitle
- Product grid
- Product image
- Product name
- Category
- Retail price
- Total sold badge
- Add to Cart button
- Link to product details

## Empty state

If there are no completed orders yet, show:

```txt
Best sellers will appear here once customers start placing orders.
```

Also show a button:

```txt
Shop Products
```

linking to:

```txt
/products
```

## Codex Prompt

Build `/app/best-sellers/page.tsx`.

Requirements:

- Use Prisma.
- Query completed orders only: PAID, PROCESSING, FULFILLED.
- Group OrderItems by productId.
- Calculate total quantity sold.
- Fetch matching active products.
- Display products in a responsive grid.
- Include product image, name, category, retail price, total sold badge, Add to Cart button, and link to product details.
- Add a clean empty state if no best sellers exist yet.
- Reuse existing product card/add-to-cart patterns where possible.
- Do not hardcode products.
- Do not create fake sales data.

---

# 2. Bundles Page

## When to build

Build this page only after the owner confirms real bundle offers.

Examples:

```txt
Jollof Rice Kit
Restaurant Rice Starter Pack
Malt Drink Party Pack
African Grocery Starter Bundle
```

## Route

```txt
/app/bundles/page.tsx
```

## Database required

Use the existing models:

```txt
Bundle
BundleItem
Product
ProductImage
```

If bundle models are not fully connected yet, confirm schema first.

## Bundle page goal

Sell grouped products as ready-to-buy kits.

## Page requirements

The page should include:

- Page title: Bundles
- Short subtitle
- Bundle cards
- Bundle image
- Bundle name
- Bundle description
- Retail price
- Wholesale price if available
- List of included products
- Add Bundle to Cart button
- Request Wholesale Quote button

## Bundle card should show

```txt
Bundle name
Description
Image
Included items
Retail price
Wholesale price
CTA buttons
```

## Bundle detail route

Optional later:

```txt
/app/bundles/[slug]/page.tsx
```

Do not build bundle detail page unless bundles become a major sales feature.

## Cart behavior

When adding a bundle to cart, decide one of two approaches:

### Option A

Add bundle as one cart item.

Good for simple checkout.

### Option B

Expand bundle into individual products.

Good for inventory tracking.

Recommended for Frednes:

```txt
Option B: Expand bundle into individual products
```

because inventory is product-based.

## Empty state

If no bundles exist yet, show:

```txt
Bundles are coming soon. Shop individual products or request wholesale pricing.
```

Buttons:

```txt
Shop Products -> /products
Get Wholesale Pricing -> /quote
```

## Codex Prompt

Build `/app/bundles/page.tsx`.

Requirements:

- Use Prisma.
- Fetch active bundles.
- Include bundle items and their products.
- Display bundles in a responsive grid.
- Show bundle image, name, description, retail price, wholesale price, and included products.
- Add buttons: Add Bundle to Cart and Request Wholesale Quote.
- For Add Bundle to Cart, expand bundle into individual products and add each product to the existing Zustand cart.
- Respect product inventory when adding bundle items.
- Add a clean empty state if no active bundles exist.
- Do not hardcode fake bundles.
- Reuse existing cart/add-to-cart patterns where possible.

---

# 3. Navbar Rule

Until these pages are real, do not link to them from the navbar.

Current recommended navbar:

```txt
Home
Shop
Wholesale
Contact
Cart
```

Future navbar after pages exist:

```txt
Home
Shop
Best Sellers
Bundles
Wholesale
Contact
Cart
```

## Codex Prompt

Update `components/Navbar.tsx`.

Requirements:

- Link Best Sellers to `/best-sellers` only if the page exists.
- Link Bundles to `/bundles` only if the page exists.
- Remove dead `href="#"` links.
- Keep navigation simple and business-focused.
