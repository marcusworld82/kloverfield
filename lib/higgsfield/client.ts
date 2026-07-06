// Higgsfield API client — Soul ONLY (Section 4.2, verified endpoints).
// Auth uses two custom headers (hf-api-key / hf-secret), NOT a bearer token.
// Soul Cinema has no confirmed public endpoint — do not add one here until
// Higgsfield documents it. Falls back to mock mode when keys are missing.

const HIGGSFIELD_BASE_URL = "https://platform.higgsfield.ai";

export const isHiggsfieldMockMode = () =>
  !process.env.HIGGSFIELD_API_KEY || !process.env.HIGGSFIELD_API_SECRET;

export interface CustomReference {
  id: string;
  name: string;
  status: "not_ready" | "ready";
  thumbnail_url: string | null;
  created_at: string;
  in_progress_at?: string | null;
}

export interface SoulGenerationParams {
  custom_reference_id: string;
  prompt: string;
  width_and_height?: string;
  quality?: string;
  style_id?: string;
  style_strength?: number;
  custom_reference_strength?: number;
  batch_size?: number;
  seed?: number;
  webhook?: { url: string; secret: string };
}

function authHeaders(): Record<string, string> {
  return {
    "hf-api-key": process.env.HIGGSFIELD_API_KEY ?? "",
    "hf-secret": process.env.HIGGSFIELD_API_SECRET ?? "",
    "Content-Type": "application/json",
  };
}

async function hfFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${HIGGSFIELD_BASE_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Higgsfield ${path} failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function createCharacter(
  name: string,
  inputImages: { type: string; image_url: string }[]
): Promise<CustomReference> {
  if (isHiggsfieldMockMode()) {
    return {
      id: `mock-ref-${Date.now()}`,
      name,
      status: "not_ready",
      thumbnail_url: null,
      created_at: new Date().toISOString(),
    };
  }
  return hfFetch<CustomReference>("/v1/custom-references", {
    method: "POST",
    body: JSON.stringify({ name, input_images: inputImages }),
  });
}

export async function listCharacters(): Promise<CustomReference[]> {
  if (isHiggsfieldMockMode()) {
    return [
      {
        id: "mock-ref-1",
        name: "Marcus — Soul ID (mock)",
        status: "ready",
        thumbnail_url: null,
        created_at: new Date().toISOString(),
      },
    ];
  }
  const json = await hfFetch<{ items?: CustomReference[] } | CustomReference[]>(
    "/v1/custom-references/list"
  );
  return Array.isArray(json) ? json : (json.items ?? []);
}

export async function getCharacter(id: string): Promise<CustomReference> {
  if (isHiggsfieldMockMode() || id.startsWith("mock-")) {
    return {
      id,
      name: "Mock character",
      status: "ready",
      thumbnail_url: null,
      created_at: new Date().toISOString(),
    };
  }
  return hfFetch<CustomReference>(`/v1/custom-references/${id}`);
}

export async function deleteCharacter(id: string): Promise<void> {
  if (isHiggsfieldMockMode() || id.startsWith("mock-")) return;
  await hfFetch(`/v1/custom-references/${id}`, { method: "DELETE" });
}

export async function generateSoulImage(
  params: SoulGenerationParams
): Promise<{ id: string; mock: boolean }> {
  if (isHiggsfieldMockMode()) {
    return { id: `mock-soul-job-${Date.now()}`, mock: true };
  }
  const json = await hfFetch<{ id: string }>("/v1/text2image/soul", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return { id: json.id, mock: false };
}

export async function getSoulGeneration(
  id: string
): Promise<{ id: string; status: string; results?: unknown; mock: boolean }> {
  if (isHiggsfieldMockMode() || id.startsWith("mock-")) {
    return {
      id,
      status: "completed",
      results: [
        {
          url: "https://placehold.co/1024x1024/161616/C8102E?text=Mock+Soul+Image",
        },
      ],
      mock: true,
    };
  }
  const json = await hfFetch<{ id: string; status: string; results?: unknown }>(
    `/v1/text2image/soul?id=${encodeURIComponent(id)}`
  );
  return { ...json, mock: false };
}
