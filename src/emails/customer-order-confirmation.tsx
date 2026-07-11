import type { Prisma } from "@prisma/client";

export type OrderEmailItem = {
  id: string;
  productName: string;
  variantLabel: string | null;
  sku: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
  lineTotal: Prisma.Decimal;
};

export type CustomerOrderConfirmationEmailProps = {
  customerName: string;
  orderId: string;
  items: OrderEmailItem[];
  subtotal: Prisma.Decimal;
  tax: Prisma.Decimal;
  shipping: Prisma.Decimal;
  total: Prisma.Decimal;
};

function money(value: Prisma.Decimal) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

function orderNumber(orderId: string) {
  return orderId.slice(-8).toUpperCase();
}

export function customerOrderConfirmationText({
  customerName,
  orderId,
  items,
  subtotal,
  tax,
  shipping,
  total,
}: CustomerOrderConfirmationEmailProps) {
  const itemLines = items.map((item) => {
    const label = item.variantLabel
      ? `${item.productName} - ${item.variantLabel}`
      : item.productName;

    return `- ${label} (${item.sku}) x ${item.quantity}: ${money(
      item.lineTotal,
    )}`;
  });

  return [
    `Hi ${customerName},`,
    "",
    "Thanks for your order from Frednes Wholesale. We received your payment and your order is now being prepared.",
    `Order number: ${orderNumber(orderId)}`,
    "",
    "Purchased items:",
    ...itemLines,
    "",
    `Subtotal: ${money(subtotal)}`,
    `Tax: ${money(tax)}`,
    `Shipping: ${money(shipping)}`,
    `Total: ${money(total)}`,
    "",
    "Thank you for shopping with Frednes Wholesale.",
  ].join("\n");
}

export function CustomerOrderConfirmationEmail({
  customerName,
  orderId,
  items,
  subtotal,
  tax,
  shipping,
  total,
}: CustomerOrderConfirmationEmailProps) {
  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        color: "#0f172a",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          margin: "0 auto",
          maxWidth: "640px",
          padding: "32px",
        }}
      >
        <p
          style={{
            color: "#15803d",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            margin: "0 0 8px",
            textTransform: "uppercase",
          }}
        >
          Order received
        </p>
        <h1 style={{ fontSize: "28px", lineHeight: "1.2", margin: "0 0 16px" }}>
          Thanks for your order, {customerName}
        </h1>
        <p style={{ color: "#475569", fontSize: "16px", margin: "0 0 24px" }}>
          We received your payment and your Frednes Wholesale order is now being
          prepared.
        </p>

        <p
          style={{
            backgroundColor: "#f0fdf4",
            borderRadius: "10px",
            color: "#166534",
            fontSize: "15px",
            fontWeight: 700,
            margin: "0 0 24px",
            padding: "14px 16px",
          }}
        >
          Order #{orderNumber(orderId)}
        </p>

        <table
          cellPadding="0"
          cellSpacing="0"
          style={{
            borderCollapse: "collapse",
            marginBottom: "24px",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th align="left" style={tableHeaderStyle}>
                Item
              </th>
              <th align="center" style={tableHeaderStyle}>
                Qty
              </th>
              <th align="right" style={tableHeaderStyle}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td style={tableCellStyle}>
                  <strong>{item.productName}</strong>
                  {item.variantLabel ? (
                    <div style={{ color: "#64748b", fontSize: "13px" }}>
                      Pack / Size: {item.variantLabel}
                    </div>
                  ) : null}
                  <div style={{ color: "#64748b", fontSize: "13px" }}>
                    SKU {item.sku} · {money(item.unitPrice)} each
                  </div>
                </td>
                <td align="center" style={tableCellStyle}>
                  {item.quantity}
                </td>
                <td align="right" style={tableCellStyle}>
                  {money(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
          <TotalRow label="Subtotal" value={money(subtotal)} />
          <TotalRow label="Tax" value={money(tax)} />
          <TotalRow label="Shipping" value={money(shipping)} />
          <TotalRow label="Total" value={money(total)} strong />
        </div>

        <p style={{ color: "#475569", fontSize: "15px", margin: "24px 0 0" }}>
          Thank you for shopping with Frednes Wholesale.
        </p>
      </div>
    </div>
  );
}

const tableHeaderStyle = {
  borderBottom: "1px solid #cbd5e1",
  color: "#475569",
  fontSize: "12px",
  padding: "0 0 10px",
  textTransform: "uppercase" as const,
};

const tableCellStyle = {
  borderBottom: "1px solid #e2e8f0",
  fontSize: "14px",
  padding: "14px 0",
  verticalAlign: "top" as const,
};

function TotalRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        fontSize: strong ? "18px" : "14px",
        fontWeight: strong ? 700 : 400,
        justifyContent: "space-between",
        marginTop: "8px",
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
