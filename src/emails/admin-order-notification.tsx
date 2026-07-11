import type { Prisma } from "@prisma/client";
import type { OrderEmailItem } from "@/src/emails/customer-order-confirmation";

export type AdminOrderNotificationEmailProps = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  items: OrderEmailItem[];
  subtotal: Prisma.Decimal;
  tax: Prisma.Decimal;
  shipping: Prisma.Decimal;
  total: Prisma.Decimal;
  stripePaymentIntent: string | null;
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

function formatShippingAddress({
  shippingAddress,
  city,
  state,
  zipCode,
}: Pick<
  AdminOrderNotificationEmailProps,
  "shippingAddress" | "city" | "state" | "zipCode"
>) {
  return [shippingAddress, city, state, zipCode].filter(Boolean).join(", ");
}

export function adminOrderNotificationText(
  props: AdminOrderNotificationEmailProps,
) {
  const itemLines = props.items.map((item) => {
    const label = item.variantLabel
      ? `${item.productName} - ${item.variantLabel}`
      : item.productName;

    return `- ${label} (${item.sku}) x ${item.quantity}: ${money(
      item.lineTotal,
    )}`;
  });

  return [
    "New paid order",
    "",
    `Order ID: ${props.orderId}`,
    `Order number: ${orderNumber(props.orderId)}`,
    `Stripe payment ID: ${props.stripePaymentIntent ?? "Not available"}`,
    "",
    `Customer: ${props.customerName}`,
    `Email: ${props.customerEmail}`,
    `Phone: ${props.customerPhone ?? "Not provided"}`,
    `Shipping address: ${
      formatShippingAddress(props) || "Not provided"
    }`,
    "",
    "Ordered items:",
    ...itemLines,
    "",
    `Subtotal: ${money(props.subtotal)}`,
    `Tax: ${money(props.tax)}`,
    `Shipping: ${money(props.shipping)}`,
    `Total: ${money(props.total)}`,
  ].join("\n");
}

export function AdminOrderNotificationEmail(
  props: AdminOrderNotificationEmailProps,
) {
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
          maxWidth: "680px",
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
          New paid order
        </p>
        <h1 style={{ fontSize: "28px", lineHeight: "1.2", margin: "0 0 16px" }}>
          Order #{orderNumber(props.orderId)}
        </h1>

        <InfoGrid
          rows={[
            ["Order ID", props.orderId],
            ["Stripe payment ID", props.stripePaymentIntent ?? "Not available"],
            ["Customer", props.customerName],
            ["Customer email", props.customerEmail],
            ["Phone", props.customerPhone ?? "Not provided"],
            [
              "Shipping address",
              formatShippingAddress(props) || "Not provided",
            ],
          ]}
        />

        <h2 style={{ fontSize: "18px", margin: "28px 0 12px" }}>
          Ordered items
        </h2>
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
            {props.items.map((item) => (
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
          <TotalRow label="Subtotal" value={money(props.subtotal)} />
          <TotalRow label="Tax" value={money(props.tax)} />
          <TotalRow label="Shipping" value={money(props.shipping)} />
          <TotalRow label="Total" value={money(props.total)} strong />
        </div>
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

function InfoGrid({ rows }: { rows: [string, string][] }) {
  return (
    <dl
      style={{
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        margin: 0,
        padding: "16px",
      }}
    >
      {rows.map(([label, value]) => (
        <div
          key={label}
          style={{
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            gap: "16px",
            justifyContent: "space-between",
            padding: "10px 0",
          }}
        >
          <dt style={{ color: "#64748b", fontSize: "13px" }}>{label}</dt>
          <dd
            style={{
              fontSize: "13px",
              fontWeight: 600,
              margin: 0,
              textAlign: "right",
            }}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

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
