import { NextRequest, NextResponse } from "next/server";
import { getCharacter, deleteCharacter } from "@/lib/higgsfield/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const character = await getCharacter(id);
    return NextResponse.json({ character });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch character";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await deleteCharacter(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete character";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
