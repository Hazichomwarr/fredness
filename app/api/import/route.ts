// // app/api/export/route.ts
// import { NextResponse } from "next/server";
// import { importProductsFromCsv } from "@/src/lib/products/import-products";

// export const runtime = "nodejs";

// export async function POST(request: Request) {
//   const formData = await request.formData();
//   const file = formData.get("file");
//   if (!(file instanceof File)) {
//     return NextResponse.json(
//       { error: "Upload a CSV file in the file field." },
//       { status: 400 },
//     );
//   }
//   if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
//     return NextResponse.json(
//       { error: "Only CSV files are supported." },
//       { status: 400 },
//     );
//   }
//   const csvText = await file.text();
//   const summary = await importProductsFromCsv(csvText);
//   return NextResponse.json(summary);
// }
