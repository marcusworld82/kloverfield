"use client";

// Generic canvas node. Border color encodes category (red = generation,
// white = utility, grey = text/notes). Each node carries its own settings
// panel: model dropdown, resolution, aspect ratio, batch size (max 10).

import { memo, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Play, Settings2, Trash2 } from "lucide-react";
import { getNodeConfig } from "./node-configs";
import { getModelsByCategory } from "@/lib/fal/models.config";
import { useCanvasStore, type KfNodeData } from "@/store/canvas-store";
import { useGeneration } from "@/lib/generation/use-generation";
import { GenerationCard } from "@/components/shared/generation-card";

const BORDER_CLASS = {
  red: "border-accent-red",
  white: "border-white/60",
  grey: "border-border-default",
} as const;

export const KfNode = memo(function KfNode({
  id,
  data,
}: NodeProps<Node<KfNodeData>>) {
  const config = getNodeConfig(data.kind);
  const [showSettings, setShowSettings] = useState(false);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const deleteNode = useCanvasStore((s) => s.deleteNode);
  const gen = useGeneration();

  const models = config.modelCategory
    ? getModelsByCategory(config.modelCategory)
    : [];

  function runNode() {
    if (!config.isGenerator) return;
    const model = data.model ?? models[0]?.id;
    if (!model) return;
    gen.run({
      model,
      input: {
        prompt: data.prompt,
        aspect_ratio: data.aspectRatio,
        resolution: data.resolution,
        batch_size: data.batchSize,
      },
    });
  }

  return (
    <div
      className={`w-64 rounded-2xl border bg-bg-card p-3 shadow-lg ${BORDER_CLASS[config.border]}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border-none !bg-accent-red"
      />
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-text-primary">
          {config.label}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings((v) => !v)}
            aria-label="Node settings"
            className="text-text-muted hover:text-white"
          >
            <Settings2 size={13} />
          </button>
          <button
            onClick={() => deleteNode(id)}
            aria-label="Delete node"
            className="text-text-muted hover:text-error"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {config.hasPrompt && (
        <textarea
          value={data.prompt}
          onChange={(e) => updateNodeData(id, { prompt: e.target.value })}
          placeholder={
            data.kind === "stickyNote" ? "Note..." : "Prompt..."
          }
          rows={2}
          className="nodrag mb-2 w-full resize-none rounded-lg border border-border-default bg-bg-secondary p-2 text-xs text-text-primary outline-none focus:border-accent-red"
        />
      )}

      {showSettings && (
        <div className="nodrag mb-2 space-y-2 rounded-lg border border-border-default bg-bg-secondary p-2">
          {models.length > 0 && (
            <select
              value={data.model ?? models[0]?.id}
              onChange={(e) => updateNodeData(id, { model: e.target.value })}
              className="w-full rounded border border-border-default bg-bg-card p-1.5 text-[11px] text-text-primary"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} (~${m.estimatedCostUsd.toFixed(2)})
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-2">
            <select
              value={data.aspectRatio}
              onChange={(e) =>
                updateNodeData(id, { aspectRatio: e.target.value })
              }
              className="flex-1 rounded border border-border-default bg-bg-card p-1.5 text-[11px] text-text-primary"
            >
              {["1:1", "16:9", "9:16", "4:5", "3:2"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <select
              value={data.resolution}
              onChange={(e) =>
                updateNodeData(id, { resolution: e.target.value })
              }
              className="flex-1 rounded border border-border-default bg-bg-card p-1.5 text-[11px] text-text-primary"
            >
              {["512", "768", "1024", "2048"].map((r) => (
                <option key={r} value={r}>
                  {r}px
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-[11px] text-text-muted">
            Batch
            <input
              type="number"
              min={1}
              max={10}
              value={data.batchSize}
              onChange={(e) =>
                updateNodeData(id, {
                  batchSize: Math.min(
                    10,
                    Math.max(1, Number(e.target.value) || 1)
                  ),
                })
              }
              className="w-14 rounded border border-border-default bg-bg-card p-1 text-[11px] text-text-primary"
            />
            <span>(max 10)</span>
          </label>
        </div>
      )}

      {config.isGenerator && (
        <>
          <button
            onClick={runNode}
            disabled={gen.status === "queued" || gen.status === "processing"}
            className="nodrag flex w-full items-center justify-center gap-1.5 rounded-full bg-accent-red py-1.5 text-xs font-semibold text-white hover:bg-accent-red-hover disabled:opacity-60"
          >
            <Play size={11} /> Generate
          </button>
          <div className="nodrag mt-2">
            <GenerationCard
              status={gen.status}
              error={gen.error}
              result={gen.result}
              onRetry={gen.retry}
              onEditPrompt={gen.reset}
              onRegenerate={runNode}
            />
          </div>
        </>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-none !bg-accent-red"
      />
    </div>
  );
});
