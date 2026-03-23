# Velozity Project Tracker - Technical Assessment

A high-performance, multi-view project management tool built with React, TypeScript, and Tailwind CSS. This project features custom-built drag-and-drop, virtual scrolling, and real-time collaboration indicators.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🛠 Tech Stack Decisions

### State Management: Zustand
I chose **Zustand** over React Context + useReducer for several reasons:
- **Performance**: Zustand allows for micro-state subscriptions, meaning components only re-render when the specific state they use changes. In a list of 500+ tasks, this is critical to avoid unnecessary globally-triggered renders.
- **Simplicity**: Unlike Redux or Context, Zustand has a very small boilerplate. The store is just a hook, making the code cleaner and more Maintainable.
- **Async Handling**: Zustand handles asynchronous actions naturally without needing extra middleware.

### Styling: Tailwind CSS
Used for rapid UI development and maintaining a consistent design system. Custom tokens were implemented in `tailwind.config.js` to create a premium, dark-themed aesthetic.

## 🧱 Key Features & Implementations

### Custom Virtual Scrolling (List View)
The virtual scrolling engine was built from scratch to handle 500+ tasks efficiently. 
- **Mechanism**: We calculate the `scrollTop` of a container and determine the `startIndex` and `endIndex` based on a fixed `ROW_HEIGHT` (64px).
- **Optimization**: Only the currently visible rows plus a buffer of 5 rows above and below are rendered in the DOM. 
- **Layout Persistence**: An inner "strut" div maintains the correct total height of the scrollable area, ensuring the scrollbar behaves naturally even as rows are recycled.

### Custom Drag-and-Drop (Kanban)
Implemented using native HTML5 Drag events with custom logic to ensure smooth transitions and touch-friendly interactions.
- **Placeholder Handling**: To prevent layout shift, a hidden "ghost" element is cloned on drag start, and a dedicated "drop target" state renders a pulse-animated placeholder in the destination column during drag-over.
- **State Sync**: Drops are instantly reflected in the Zustand store, which updates the column counts and task status across all views.

### Live Collaboration Indicators
Simulated using an interval-based hook in the `Layout` component. 
- Every 8 seconds, 2-4 "simulated" users are assigned to random tasks.
- Indicators appear on Kanban cards and in the List View.
- A global presence bar in the `TopBar` shows the currently "active" users.

## 📝 Reflection

### The Hardest UI Problem
The most challenging part was ensuring the **Virtual Scrolling** felt smooth while also supporting **Sortable Headers**. Sorting 500 tasks in memory is fast, but re-calculating the virtual window during a sort could cause flickering. I solved this by using `useMemo` for the sorting logic and ensuring the scroll position is preserved during state updates.

### Drag Placeholder & Layout Shift
To avoid layout shift, I pre-calculated the dimensions of task cards. When a card is dragged, I use a `draggedTask` state to hide the original card (`opacity-0`) while keeping it in the DOM, maintaining its height. Simultaneously, the `dropTarget` state in the destination column renders a placeholder of the exact same height, ensuring a stable layout throughout the operation.

### Future Refactors
With more time, I would:
1.  **Pointer Events for DND**: While native Drag works well on desktop, a full Pointer Events implementation would provide smoother, more native-feeling touch support on mobile/tablets.
2.  **Memoized Rows**: Further optimize the List View rows with `React.memo` to prevent any re-renders during rapid scrolling.
3.  **Real-time WebSockets**: Replace the simulation with a real socket (e.g., Socket.io) for genuine multi-user collaboration.

---
**Lighthouse Performance**: Optimized for 90+ score by leveraging virtualization and CSS-only animations.
