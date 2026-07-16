// app/api/test/route.ts
import { NextResponse } from "next/server";
import { resend } from "@/src/lib/email/resend";

export async function GET() {
  const result = await resend.emails.send({
    from: process.env.QUOTE_FROM_EMAIL!,
    to: process.env.QUOTE_ADMIN_EMAIL!,
    cc: "batchiy4@gmail.com",
    subject: "Frednes email test",
    text: "Direct Resend test from Frednes production.",
  });

  return NextResponse.json({
    data: result.data,
    error: result.error,
  });
}
