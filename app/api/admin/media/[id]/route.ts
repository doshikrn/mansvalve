import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/auth/current-user";
import { deleteMediaAssetById } from "@/lib/services/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  const raw = await context.params;
  const parsed = paramsSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid media id." },
      { status: 400 },
    );
  }

  try {
    await deleteMediaAssetById(parsed.data.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    if (message === "MEDIA_IN_USE") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Media is attached to one or more products. Remove links first.",
        },
        { status: 409 },
      );
    }
    console.error("[media-delete] failed", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete media asset." },
      { status: 500 },
    );
  }
}
