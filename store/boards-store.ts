// Color-transfer boards (plan §9): named boards of reference images used to
// control color/style during Soul generation.

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ColorBoard {
  id: string;
  name: string;
  images: string[]; // urls (object URLs / upload:// placeholders in mock mode)
}

interface BoardsState {
  boards: ColorBoard[];
  activeBoardId: string | null;
  createBoard: (name: string) => void;
  addImage: (boardId: string, url: string) => void;
  removeBoard: (id: string) => void;
  setActiveBoard: (id: string | null) => void;
}

export const useBoardsStore = create<BoardsState>()(
  persist(
    (set) => ({
      boards: [],
      activeBoardId: null,
      createBoard: (name) =>
        set((s) => ({
          boards: [
            { id: `board-${Date.now()}`, name, images: [] },
            ...s.boards,
          ],
        })),
      addImage: (boardId, url) =>
        set((s) => ({
          boards: s.boards.map((b) =>
            b.id === boardId ? { ...b, images: [...b.images, url] } : b
          ),
        })),
      removeBoard: (id) =>
        set((s) => ({
          boards: s.boards.filter((b) => b.id !== id),
          activeBoardId: s.activeBoardId === id ? null : s.activeBoardId,
        })),
      setActiveBoard: (id) => set({ activeBoardId: id }),
    }),
    { name: "kloverfield-boards" }
  )
);
