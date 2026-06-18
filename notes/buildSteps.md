# Frednes Market - Build Plan

## Project Goal

Build a production-ready e-commerce platform for Frednes International Market.

Requirements:

- 500+ products
- Retail customers
- Wholesale customers
- Product search
- Category browsing
- Retail checkout
- Wholesale quote requests
- Admin dashboard
- CSV product import

Tech Stack:

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- UploadThing (or equivalent)
- Stripe (retail only)
- React Hook Form + Zod
- TanStack Table

---

# STEP 1 - Database Design

Prompt:

Design a Prisma schema for:

Category
Product
Bundle
Quote
QuoteItem
Order
OrderItem
User

Requirements:

- Products belong to categories
- Bundles contain multiple products
- Orders contain multiple order items
- Quotes contain multiple quote items
- Products have inventory tracking
- Products support retail and wholesale pricing
- Include createdAt and updatedAt timestamps
- Use PostgreSQL-compatible Prisma schema

Output only schema.prisma.

---

# STEP 2 - Product Import System

Prompt:

Build a CSV product import system.

Requirements:

- Upload CSV
- Parse CSV
- Validate rows with Zod
- Create products in database
- Skip invalid rows
- Return import summary

Expected output:

- route handler
- parser utility
- validation schema

---

# STEP 3 - Product Admin Dashboard

Prompt:

Build an admin products page.

Requirements:

- TanStack Table
- Search
- Pagination
- Sorting
- Edit product
- Delete product

Use server actions.

Use Prisma.

---

# STEP 4 - Category Management

Prompt:

Build CRUD pages for categories.

Requirements:

- Create category
- Edit category
- Delete category
- List categories

Use Prisma and server actions.

---

# STEP 5 - Product CRUD

Prompt:

Build product management.

Requirements:

- Create product form
- Edit product form
- Product image upload
- Product inventory field
- Retail price field
- Wholesale price field
- Category selection

Use React Hook Form and Zod.

---

# STEP 6 - Storefront Product Listing

Prompt:

Build storefront product listing.

Requirements:

- Category filtering
- Search
- Pagination
- Product cards
- Server-side filtering

Use App Router.

---

# STEP 7 - Product Details Page

Prompt:

Build product details page.

Requirements:

- Product image gallery
- Price
- Inventory status
- Related products
- Add to cart button
- Request wholesale quote button

Use Prisma.

---

# STEP 8 - Cart System

Prompt:

Build cart functionality.

Requirements:

- Add item
- Remove item
- Update quantity
- Persist cart
- Cart summary

Use Zustand.

---

# STEP 9 - Retail Checkout

Prompt:

Build Stripe checkout.

Requirements:

- Create checkout session
- Order creation
- Success page
- Cancel page

Retail orders only.

---

# STEP 10 - Wholesale Quote System

Prompt:

Build quote request system.

Requirements:

Fields:

- Name
- Email
- Phone
- Business name

Include:

- Selected products
- Quantities

Create Quote and QuoteItems.

Send confirmation email.

---

# STEP 11 - Orders Dashboard

Prompt:

Build orders management dashboard.

Requirements:

- View orders
- Filter orders
- Order status
- Customer details

Statuses:

- Pending
- Paid
- Processing
- Fulfilled
- Cancelled

---

# STEP 12 - Wholesale Leads Dashboard

Prompt:

Build wholesale leads dashboard.

Requirements:

- View quote requests
- Search quotes
- Update quote status

Statuses:

- New
- Contacted
- Negotiating
- Closed
- Lost

---

# STEP 13 - Seed Script

Prompt:

Create Prisma seed script.

Requirements:

- Categories
- Sample products
- Sample bundles

Output only seed.ts.

---

# STEP 14 - Production Review

Prompt:

Review the entire project.

Check:

- Type safety
- Prisma queries
- Security issues
- Performance concerns
- Server/client boundaries
- App Router best practices

Provide a report only.
