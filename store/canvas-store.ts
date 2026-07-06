// Canvas state (Section 5.3) with undo/redo history and localStorage
// persistence (Supabase `canvas_spaces` sync in real mode).

import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import type { NodeKind } from "@/components/canvas/node-configs";

export interface KfNodeData extends Record<string, unknown> {
  kind: NodeKind;
  prompt: string;
  model?: string;
  aspectRatio: string;
  resolution: string;
  batchSize: number;
}

const HISTORY_LIMIT = 50;
const STORAGE_KEY = "kloverfield-canvas";

interface CanvasState {
  spaceName: string;
  nodes: Node<KfNodeData>[];
  edges: Edge[];
  past: { nodes: Node<KfNodeData>[]; edges: Edge[] }[];
  future: { nodes: Node<KfNodeData>[]; edges: Edge[] }[];

  onNodesChange: (changes: NodeChange<Node<KfNodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (kind: NodeKind, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, patch: Partial<KfNodeData>) => void;
  deleteNode: (id: string) => void;
  undo: () => void;
  redo: () => void;
  persist: () => void;
  hydrate: () => void;
}

function snapshot(s: Pick<CanvasState, "nodes" | "edges" | "past">) {
  return [...s.past, { nodes: s.nodes, edges: s.edges }].slice(-HISTORY_LIMIT);
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  spaceName: "Untitled Space",
  nodes: [],
  edges: [],
  past: [],
  future: [],

  onNodesChange: (changes) =>
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) })),
  onEdgesChange: (changes) =>
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),
  onConnect: (connection) =>
    set((s) => ({
      past: snapshot(s),
      future: [],
      edges: addEdge(
        { ...connection, style: { stroke: "#C8102E" } },
        s.edges
      ),
    })),

  addNode: (kind, position) =>
    set((s) => ({
      past: snapshot(s),
      future: [],
      nodes: [
        ...s.nodes,
        {
          id: `${kind}-${Date.now()}`,
          type: "kfNode",
          position,
          data: {
            kind,
            prompt: "",
            aspectRatio: "1:1",
            resolution: "1024",
            batchSize: 1,
          },
        },
      ],
    })),

  updateNodeData: (id, patch) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
      ),
    })),

  deleteNode: (id) =>
    set((s) => ({
      past: snapshot(s),
      future: [],
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
    })),

  undo: () =>
    set((s) => {
      const prev = s.past[s.past.length - 1];
      if (!prev) return s;
      return {
        past: s.past.slice(0, -1),
        future: [{ nodes: s.nodes, edges: s.edges }, ...s.future].slice(
          0,
          HISTORY_LIMIT
        ),
        nodes: prev.nodes,
        edges: prev.edges,
      };
    }),

  redo: () =>
    set((s) => {
      const next = s.future[0];
      if (!next) return s;
      return {
        future: s.future.slice(1),
        past: snapshot(s),
        nodes: next.nodes,
        edges: next.edges,
      };
    }),

  persist: () => {
    const { spaceName, nodes, edges } = get();
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ spaceName, nodes, edges })
      );
    } catch {
      // storage full/unavailable — non-fatal
    }
  },

  hydrate: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      set({
        spaceName: saved.spaceName ?? "Untitled Space",
        nodes: saved.nodes ?? [],
        edges: saved.edges ?? [],
      });
    } catch {
      // corrupt saved state — start fresh
    }
  },
}));
