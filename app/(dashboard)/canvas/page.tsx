"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Plus,
  MousePointer2,
  Hand,
  Undo2,
  Redo2,
  Save,
  StickyNote,
} from "lucide-react";
import { useCanvasStore } from "@/store/canvas-store";
import { KfNode } from "@/components/canvas/kf-node";
import {
  NODE_CONFIGS,
  NODE_CATEGORIES,
  type NodeKind,
} from "@/components/canvas/node-configs";

const nodeTypes: NodeTypes = { kfNode: KfNode };

function NodeMenu({
  position,
  onPick,
  onClose,
}: {
  position: { x: number; y: number };
  onPick: (kind: NodeKind) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed z-50 max-h-96 w-56 overflow-y-auto rounded-xl border border-border-default bg-bg-card p-2 shadow-2xl"
      style={{ left: position.x, top: position.y }}
      onMouseLeave={onClose}
    >
      {NODE_CATEGORIES.map((cat) => (
        <div key={cat} className="mb-1">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            {cat}
          </p>
          {NODE_CONFIGS.filter((c) => c.category === cat).map((c) => (
            <button
              key={c.kind}
              onClick={() => onPick(c.kind)}
              className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-text-secondary hover:bg-accent-red-muted hover:text-white"
            >
              {c.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function CanvasInner() {
  const store = useCanvasStore();
  const { screenToFlowPosition } = useReactFlow();
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [panMode, setPanMode] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    store.hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openMenuAt = useCallback((x: number, y: number) => {
    setMenu({ x, y });
  }, []);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      openMenuAt(e.clientX, e.clientY);
    },
    [openMenuAt]
  );

  function pickNode(kind: NodeKind) {
    if (!menu) return;
    const flowPos = screenToFlowPosition({ x: menu.x, y: menu.y });
    store.addNode(kind, flowPos);
    setMenu(null);
  }

  function handleSave() {
    store.persist();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="relative h-full w-full" ref={wrapperRef}>
      {/* Top bar: space name + breadcrumb */}
      <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border-default bg-bg-card px-4 py-1.5 text-xs">
        <span className="text-text-muted">Spaces /</span>
        <input
          value={store.spaceName}
          onChange={(e) =>
            useCanvasStore.setState({ spaceName: e.target.value })
          }
          className="w-32 bg-transparent font-medium text-text-primary outline-none"
        />
      </div>

      {/* Left toolbar */}
      <div className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1.5 rounded-2xl border border-border-default bg-bg-card p-1.5">
        <button
          title="Add node"
          onClick={() => openMenuAt(70, window.innerHeight / 2 - 150)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-red text-white hover:bg-accent-red-hover"
        >
          <Plus size={16} />
        </button>
        <button
          title="Select"
          onClick={() => setPanMode(false)}
          className={`flex h-9 w-9 items-center justify-center rounded-full ${!panMode ? "bg-accent-red-muted text-accent-red" : "text-text-secondary hover:text-white"}`}
        >
          <MousePointer2 size={15} />
        </button>
        <button
          title="Pan"
          onClick={() => setPanMode(true)}
          className={`flex h-9 w-9 items-center justify-center rounded-full ${panMode ? "bg-accent-red-muted text-accent-red" : "text-text-secondary hover:text-white"}`}
        >
          <Hand size={15} />
        </button>
        <button
          title="Add sticky note"
          onClick={() =>
            store.addNode(
              "stickyNote",
              screenToFlowPosition({ x: 300, y: 250 })
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:text-white"
        >
          <StickyNote size={15} />
        </button>
        <button
          title="Undo"
          onClick={store.undo}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:text-white disabled:opacity-40"
          disabled={store.past.length === 0}
        >
          <Undo2 size={15} />
        </button>
        <button
          title="Redo"
          onClick={store.redo}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:text-white disabled:opacity-40"
          disabled={store.future.length === 0}
        >
          <Redo2 size={15} />
        </button>
        <button
          title="Save space"
          onClick={handleSave}
          className={`flex h-9 w-9 items-center justify-center rounded-full ${saved ? "text-success" : "text-text-secondary hover:text-white"}`}
        >
          <Save size={15} />
        </button>
      </div>

      <ReactFlow
        nodes={store.nodes}
        edges={store.edges}
        onNodesChange={store.onNodesChange}
        onEdgesChange={store.onEdgesChange}
        onConnect={store.onConnect}
        nodeTypes={nodeTypes}
        onContextMenu={handleContextMenu}
        onPaneClick={() => setMenu(null)}
        panOnDrag={panMode ? [0, 1, 2] : [1, 2]}
        fitView
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        className="!bg-bg-secondary"
      >
        <Background color="#1F1F1F" gap={24} />
        <MiniMap
          position="bottom-right"
          className="!border !border-border-default !bg-bg-card"
          maskColor="rgba(10,10,10,0.7)"
          nodeColor="#C8102E"
        />
      </ReactFlow>

      {store.nodes.length === 0 && !menu && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="rounded-full border border-border-default bg-bg-card px-5 py-2 text-xs text-text-muted">
            Right-click anywhere (or hit +) to add your first node
          </p>
        </div>
      )}

      {menu && (
        <NodeMenu
          position={menu}
          onPick={pickNode}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}

export default function CanvasPage() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
