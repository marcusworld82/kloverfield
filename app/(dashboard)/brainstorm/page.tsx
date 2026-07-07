"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowUp,
  Loader2,
  BookmarkPlus,
  FileUp,
  Library,
  X,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  model?: string;
}

interface SavedPrompt {
  id: string;
  title: string;
  content: string;
  savedAt: string;
}

interface SkillFile {
  name: string;
  content: string;
}

const MODEL_OPTIONS = [
  { value: "auto", label: "Auto (task routing)" },
  { value: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4" },
  { value: "openai/gpt-4o", label: "GPT-4o" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "perplexity/sonar", label: "Perplexity Sonar" },
  { value: "openai/gpt-4o-mini", label: "GPT-4o mini" },
];

const LIBRARY_KEY = "kloverfield-prompt-library";
const SKILLS_KEY = "kloverfield-skills";

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function BrainstormInner() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<SkillFile[]>([]);
  const [library, setLibrary] = useState<SavedPrompt[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef(false);

  useEffect(() => {
    setSkills(loadJson<SkillFile[]>(SKILLS_KEY, []));
    setLibrary(loadJson<SavedPrompt[]>(LIBRARY_KEY, []));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setError(null);
    const userMessage: Message = { role: "user", content: text.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const systemMessages = skills.map((s) => ({
        role: "system" as const,
        content: `[Skill: ${s.name}]\n${s.content}`,
      }));
      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...systemMessages, ...nextMessages],
          ...(model === "auto"
            ? { taskType: "creative_writing" }
            : { model }),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "LLM request failed");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: json.content, model: json.model },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Seed from Studio prompt bar (?q=)
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !seededRef.current) {
      seededRef.current = true;
      send(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function saveToLibrary(content: string) {
    const entry: SavedPrompt = {
      id: `p-${Date.now()}`,
      title: content.slice(0, 60),
      content,
      savedAt: new Date().toISOString(),
    };
    const next = [entry, ...library];
    setLibrary(next);
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
  }

  function uploadSkill(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const next = [
        ...skills,
        { name: file.name, content: String(reader.result ?? "") },
      ];
      setSkills(next);
      localStorage.setItem(SKILLS_KEY, JSON.stringify(next));
    };
    reader.readAsText(file);
  }

  function removeSkill(name: string) {
    const next = skills.filter((s) => s.name !== name);
    setSkills(next);
    localStorage.setItem(SKILLS_KEY, JSON.stringify(next));
  }

  const filteredLibrary = library.filter(
    (p) =>
      !librarySearch ||
      p.content.toLowerCase().includes(librarySearch.toLowerCase())
  );

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Messages */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {messages.length === 0 && (
              <p className="mt-16 text-center text-sm text-text-muted">
                Start a conversation — routed to the best model for the task.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl bg-accent-red px-4 py-2.5 text-sm text-white"
                    : "mr-auto max-w-[85%] rounded-2xl border border-border-default bg-bg-card px-4 py-2.5 text-sm text-text-primary"
                }
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.role === "assistant" && (
                  <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-border-default pt-2">
                    <span className="text-[10px] text-text-muted">
                      {m.model}
                    </span>
                    <button
                      onClick={() => saveToLibrary(m.content)}
                      className="flex items-center gap-1 text-[10px] text-text-muted hover:text-accent-red"
                    >
                      <BookmarkPlus size={11} /> Save to library
                    </button>
                    {(["image", "video", "storyboard"] as const).map((dest) => (
                      <a
                        key={dest}
                        href={`/${dest}?q=${encodeURIComponent(m.content.slice(0, 800))}`}
                        className="rounded-full border border-border-default px-2 py-0.5 text-[10px] text-text-muted hover:border-accent-red hover:text-white"
                      >
                        → Create {dest === "storyboard" ? "Storyboard" : dest === "image" ? "Image" : "Video"}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="mr-auto flex items-center gap-2 rounded-2xl border border-border-default bg-bg-card px-4 py-2.5">
                <Loader2 size={13} className="animate-spin text-accent-red" />
                <span className="text-xs text-text-muted">Thinking...</span>
              </div>
            )}
            {error && <p className="text-sm text-error">{error}</p>}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="shrink-0 px-6 pb-6">
          <div className="mx-auto max-w-2xl rounded-3xl border border-border-default bg-bg-card p-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask anything..."
              className="w-full bg-transparent px-2 py-1 text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="rounded-full border border-border-default bg-bg-secondary px-3 py-1.5 text-xs text-text-secondary outline-none"
                >
                  {MODEL_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent-red hover:text-white">
                  <FileUp size={12} /> Skill file
                  <input
                    type="file"
                    accept=".txt,.md"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadSkill(f);
                    }}
                  />
                </label>
                <button
                  onClick={() => setShowLibrary((v) => !v)}
                  className="flex items-center gap-1.5 rounded-full border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:border-accent-red hover:text-white"
                >
                  <Library size={12} /> Library ({library.length})
                </button>
              </div>
              <button
                onClick={() => send(input)}
                disabled={loading}
                aria-label="Send"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-red text-white hover:bg-accent-red-hover disabled:opacity-60"
              >
                <ArrowUp size={16} />
              </button>
            </div>
            {skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span
                    key={s.name}
                    className="flex items-center gap-1 rounded-full bg-accent-red-muted px-2 py-0.5 text-[10px] text-accent-red"
                  >
                    {s.name}
                    <button
                      onClick={() => removeSkill(s.name)}
                      aria-label={`Remove ${s.name}`}
                    >
                      <X size={9} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prompt library drawer */}
      {showLibrary && (
        <aside className="w-72 shrink-0 overflow-y-auto border-l border-border-default bg-bg-secondary p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">
              Prompt Library
            </h2>
            <button
              onClick={() => setShowLibrary(false)}
              aria-label="Close library"
              className="text-text-muted hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
          <input
            value={librarySearch}
            onChange={(e) => setLibrarySearch(e.target.value)}
            placeholder="Search saved prompts..."
            className="mb-3 w-full rounded-lg border border-border-default bg-bg-card px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-red"
          />
          {filteredLibrary.length === 0 && (
            <p className="text-xs text-text-muted">
              Nothing saved yet — use &quot;Save to library&quot; on any
              response.
            </p>
          )}
          <div className="space-y-2">
            {filteredLibrary.map((p) => (
              <button
                key={p.id}
                onClick={() => setInput(p.content)}
                className="kf-card block w-full p-3 text-left"
              >
                <p className="line-clamp-3 text-xs text-text-secondary">
                  {p.content}
                </p>
                <p className="mt-1.5 text-[10px] text-text-muted">
                  {new Date(p.savedAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}

export default function BrainstormPage() {
  return (
    <Suspense>
      <BrainstormInner />
    </Suspense>
  );
}
