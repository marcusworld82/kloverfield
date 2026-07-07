import { NextRequest, NextResponse } from "next/server";
import { chatCompletion, isOpenRouterMockMode } from "@/lib/openrouter/client";
import { withLlmSlot, GuardrailError } from "@/lib/guardrails";

export interface StoryboardScene {
  order: number;
  title: string;
  prompt: string;
  image_url: string | null;
  video_url: string | null;
}

const MOCK_SCENES: StoryboardScene[] = [
  { order: 1, title: "Opening hook", prompt: "Extreme close-up, subject's eyes opening in red neon light, shallow depth of field, cinematic", image_url: null, video_url: null },
  { order: 2, title: "The world", prompt: "Wide establishing shot of a rain-soaked city street at night, red signage reflections on wet asphalt", image_url: null, video_url: null },
  { order: 3, title: "The walk", prompt: "Tracking shot following subject in black varsity jacket walking through the crowd, 35mm anamorphic", image_url: null, video_url: null },
  { order: 4, title: "Turning point", prompt: "Low-angle hero shot, subject stops under a flickering streetlight, wind moving fabric, dramatic rim light", image_url: null, video_url: null },
  { order: 5, title: "Closing frame", prompt: "Slow push-in on subject's silhouette against a wall of red light, title card space on the right third", image_url: null, video_url: null },
];

export async function POST(req: NextRequest) {
  try {
    const { concept, sceneCount = 5, hasReferenceImage = false } =
      (await req.json()) as {
        concept: string;
        sceneCount?: number;
        hasReferenceImage?: boolean;
      };

    if (!concept?.trim()) {
      return NextResponse.json(
        { error: "A story concept is required" },
        { status: 400 }
      );
    }

    if (isOpenRouterMockMode()) {
      return NextResponse.json({ scenes: MOCK_SCENES, mock: true });
    }

    const result = await withLlmSlot(() =>
      chatCompletion({
        taskType: "visual_prompting",
        messages: [
          {
            role: "system",
            content: `You are a storyboard director. Break the user's concept into exactly ${sceneCount} scenes. Respond ONLY with a JSON array of objects: [{"order": number, "title": string, "prompt": string}]. Each "prompt" must be a detailed, cinematic image-generation prompt.${hasReferenceImage ? " The user provided a starter reference image that every scene will use as a visual/style reference — write prompts that describe framing and action while staying consistent with a single continuous look." : ""}`,
          },
          { role: "user", content: concept },
        ],
        temperature: 0.8,
      })
    );

    const jsonText = result.content.replace(/```json?|```/g, "").trim();
    const parsed = JSON.parse(jsonText) as {
      order: number;
      title: string;
      prompt: string;
    }[];

    const scenes: StoryboardScene[] = parsed.map((s, i) => ({
      order: s.order ?? i + 1,
      title: s.title ?? `Scene ${i + 1}`,
      prompt: s.prompt,
      image_url: null,
      video_url: null,
    }));

    return NextResponse.json({ scenes, mock: false });
  } catch (err) {
    if (err instanceof GuardrailError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 429 }
      );
    }
    const message =
      err instanceof Error ? err.message : "Storyboard generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
