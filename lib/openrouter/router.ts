// Task-type → model routing for OpenRouter (Section 4.3).

export type TaskType =
  | "creative_writing"
  | "code_logic"
  | "visual_prompting"
  | "research"
  | "fallback";

const MODEL_ROUTES: Record<TaskType, string> = {
  creative_writing: "anthropic/claude-sonnet-4",
  code_logic: "anthropic/claude-sonnet-4",
  visual_prompting: "google/gemini-2.5-flash",
  research: "perplexity/sonar",
  fallback: "openai/gpt-4o-mini",
};

export function routeModel(taskType: TaskType = "fallback"): string {
  return MODEL_ROUTES[taskType] ?? MODEL_ROUTES.fallback;
}
