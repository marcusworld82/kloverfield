// @-mentionable elements library (plan §8): uploaded files + images promoted
// via "Create Element" from the generation grid.

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ElementItem {
  id: string;
  name: string;
  url: string;
  kind: "upload" | "element";
}

interface ElementsState {
  items: ElementItem[];
  add: (item: Omit<ElementItem, "id">) => void;
  remove: (id: string) => void;
}

export const useElementsStore = create<ElementsState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => ({
          items: [
            { ...item, id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
            ...s.items,
          ],
        })),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    }),
    { name: "kloverfield-elements" }
  )
);
