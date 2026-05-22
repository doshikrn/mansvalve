import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/current-user";
import { buildProductsImportTemplate } from "@/lib/products-import/template";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin("/admin/products/import");

  const buffer = await buildProductsImportTemplate();
  // Передаём в Response/NextResponse именно Uint8Array (валидный BodyInit).
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="mansvalve-products-template.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
