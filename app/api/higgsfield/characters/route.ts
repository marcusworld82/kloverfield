import { NextRequest, NextResponse } from "next/server";
import {
  createCharacter,
  listCharacters,
  isHiggsfieldMockMode,
} from "@/lib/higgsfield/client";

export async function GET() {
  try {
    const characters = await listCharacters();
    return NextResponse.json({
      characters,
      mock: isHiggsfieldMockMode(),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to list characters";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, input_images } = body as {
      name: string;
      input_images: { type: string; image_url: string }[];
    };

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Character name is required" },
        { status: 400 }
      );
    }
    if (!input_images || input_images.length < 5 || input_images.length > 20) {
      return NextResponse.json(
        { error: "Between 5 and 20 reference images are required" },
        { status: 400 }
      );
    }

    const character = await createCharacter(name.trim(), input_images);
    return NextResponse.json({
      character,
      mock: isHiggsfieldMockMode(),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Character creation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
