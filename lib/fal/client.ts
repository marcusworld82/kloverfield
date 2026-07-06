// FAL AI client wrapper (Section 4.1).
// All FAL traffic flows through submitJob() / pollJob() / getResult().
// Server-side only — FAL_KEY must never reach the browser.
// Falls back to mock mode when FAL_KEY is missing so the UI stays demo-able.

const FAL_QUEUE_URL = "https://queue.fal.run";

export const isFalMockMode = () => !process.env.FAL_KEY;

export interface FalJobSubmission {
  requestId: string;
  statusUrl: string;
  mock: boolean;
}

export interface FalJobStatus {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  requestId: string;
  mock: boolean;
}

export interface FalJobResult<T = unknown> {
  requestId: string;
  data: T;
  mock: boolean;
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Key ${process.env.FAL_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function submitJob(
  modelId: string,
  input: Record<string, unknown>
): Promise<FalJobSubmission> {
  if (isFalMockMode()) {
    return {
      requestId: `mock-${modelId.replace(/\//g, "-")}-${Date.now()}`,
      statusUrl: "",
      mock: true,
    };
  }

  const res = await fetch(`${FAL_QUEUE_URL}/${modelId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`FAL submit failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  return {
    requestId: json.request_id,
    statusUrl: json.status_url ?? `${FAL_QUEUE_URL}/${modelId}/requests/${json.request_id}/status`,
    mock: false,
  };
}

export async function pollJob(
  modelId: string,
  requestId: string
): Promise<FalJobStatus> {
  if (isFalMockMode() || requestId.startsWith("mock-")) {
    return { status: "COMPLETED", requestId, mock: true };
  }

  const res = await fetch(
    `${FAL_QUEUE_URL}/${modelId}/requests/${requestId}/status`,
    { headers: authHeaders() }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`FAL status poll failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  return { status: json.status, requestId, mock: false };
}

export async function getResult<T = unknown>(
  modelId: string,
  requestId: string
): Promise<FalJobResult<T>> {
  if (isFalMockMode() || requestId.startsWith("mock-")) {
    return {
      requestId,
      data: {
        images: [
          {
            url: "https://placehold.co/1024x1024/161616/C8102E?text=Mock+Generation",
            width: 1024,
            height: 1024,
          },
        ],
        note: "Mock result — set FAL_KEY in .env.local for real generations.",
      } as T,
      mock: true,
    };
  }

  const res = await fetch(
    `${FAL_QUEUE_URL}/${modelId}/requests/${requestId}`,
    { headers: authHeaders() }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`FAL result fetch failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  return { requestId, data: json as T, mock: false };
}
