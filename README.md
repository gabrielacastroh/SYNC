# SYNC — Real-Time Collaboration Board

**Collaborative Boards for Modern Teams**

SYNC is a frontend-only application that demonstrates advanced state management, real-time simulation, drag-and-drop architecture, and modern UI patterns. It is inspired by Linear, Notion, FigJam, and modernized Jira—minimal, elegant, and keyboard-friendly.

---

## Why This Project Matters

This project showcases production-grade frontend engineering:

- **Strict TypeScript** (no `any`) and clear domain types
- **Zustand + Immer** for predictable, immutable state updates
- **@dnd-kit** for accessible drag-and-drop (columns and cards, including cross-column moves)
- **Framer Motion** for subtle, professional animations
- **Real-time simulation** to mimic collaborative editing and presence
- **Command palette** (Cmd/Ctrl+K) and keyboard shortcuts (N, B, Escape)
- **Persistence** in `localStorage` for boards, columns, cards, and activity

It is suitable as a portfolio piece or as a base for a real collaborative product (e.g. wiring to a WebSocket backend or Yjs).

---

## Architecture

```
src/
├── app/
├── features/
│   ├── boards/
│   ├── columns/
│   ├── cards/
│   ├── activity/
│   ├── presence/
│   └── command-palette/
├── components/
│   ├── ui/
│   └── layout/
├── store/
├── hooks/
├── services/
├── routes/
├── types/
└── utils/
```

- **Domain logic** lives in stores and services; **UI** in components and features.
- **State** is normalized (boards, columns, cards by id) and persisted via a single `persist.ts` that reads/writes all stores and avoids circular dependencies.

---

## State Management

- **Zustand** holds: `boards`, `columns`, `cards`, `activity`, `presence`, `ui`.
- **Immer** is used inside Zustand reducers (e.g. `produce`) for immutable updates.
- **Persistence**: `store/persist.ts` exposes `hydrateStores()` and `persistStores()`. On app load, `main.tsx` calls `hydrateStores()`. Subscriptions in the app call `persistStores()` after store changes so data is saved to `localStorage` without coupling each store to the persistence layer.

---

## Drag and Drop

- Implemented with **@dnd-kit** (core + sortable).
- **One `DndContext`** at board level (in `BoardView`) handles:
  - **Column reorder**: columns are sortable (horizontal list); `onDragEnd` updates `board.columnOrder`.
  - **Card move/reorder**: each column is a droppable (`useDroppable` with id `column-${columnId}`); cards are sortable. Dropping a card on another column or on another card updates `card.columnId` and column `cardOrder`; activity is logged.
- Columns use `useSortable` and `useDroppable` (same node ref) so they can be reordered and accept card drops. Cards use `useSortable` and can be dragged across columns.

---

## Real-Time Simulation

- **`services/realtimeSimulation.ts`** runs when viewing a board (`/board/:boardId`).
- It adds a simulated presence user and on an interval:
  - Moves a random card to another column (and logs activity).
  - Edits a random card title (and logs activity).
- Presence is stored in the `presence` store; avatars are shown in the board header. This simulates “another user editing” and “User is editing…”-style indicators without a real backend.

---

## Tech Stack

| Category        | Choice           |
|----------------|------------------|
| Framework      | React 18         |
| Language       | TypeScript (strict) |
| Build          | Vite             |
| Styling        | TailwindCSS      |
| UI primitives  | shadcn-style (Button, Input, Card, Dialog, Tooltip, Avatar, Skeleton, Toast) |
| State          | Zustand + Immer  |
| Drag and drop  | @dnd-kit (core + sortable) |
| Animations     | Framer Motion    |
| Routing        | React Router v6  |
| Utilities      | uuid, clsx, tailwind-merge |

---

## How to Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

- **Create a board** from the home list or Cmd/Ctrl+K.
- **Add columns** (e.g. Backlog, In Progress, Done) and **cards**; drag cards between columns.
- **Click a card** to open the detail modal (description, due date, labels, assignees, activity).
- **N** creates a new card in the first column; **Cmd/Ctrl+K** opens the command palette; **Escape** closes modals/palette.
- **Activity** panel (header icon) shows the timeline; **theme** toggle switches light/dark.

---

## Screenshots

_Placeholder: add screenshots of the board list, board view with columns/cards, card detail modal, and command palette._

---

## Quality

- **TypeScript**: strict mode, no `any`, `noUncheckedIndexedAccess` where applicable.
- **Separation**: domain types in `types/`, store logic in `store/`, UI in `components/` and `features/`.
- **Reusable hooks**: `usePersistSync`, `useThemeSync`, `useKeyboardShortcuts`.
- Naming and structure aim for mid-level+ frontend engineer quality.
