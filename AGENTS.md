# AI Agent Instructions

## Project Overview

React JSON tree viewer library with search, navigation, and sticky breadcrumbs. Currently in active development. You can save notes and internal docs for the user and agents inside the `_notes/` directory (see `_notes/PROGRESS.md` for status). Any other docs that you consider relevant to the repo can be added in the `docs/` directory instead.

**Architecture:** Minimal component library with Vite in library mode, outputting ESM + CJS bundles.

## Key Files

- `src/JsonTreeView.tsx` - Main exported component, manages expand/collapse state
- `src/JsonTree.tsx` - Recursive `TreeNode` component for rendering
- `src/Breadcrumb.tsx` - Sticky breadcrumb renderer (Phase 10)
- `src/SearchBar.tsx` - Search input + next/prev UI (Phase 9)
- `src/useSearch.ts` - Search matching + navigation state (Phase 9)
- `src/highlightText.tsx` - `<mark>` helper for highlighting matches (Phase 9/10)
- `src/types.ts` - All TypeScript types (`JsonValue`, `JsonTreeViewProps`, etc.)
- `docs/react-json-treeview-spec.md` - Full API specification and planned features
- `_notes/PROGRESS.md` - Current implementation status
- `dev/main.tsx` - Development playground (not shipped)

## Development Commands

```bash
npm run dev        # Start dev server (uses dev/ folder as root)
npm run build      # Build library to dist/
npm run lint       # ESLint check
npm run lint:fix   # ESLint auto-fix
npm test           # Run tests once
npm run test:watch # Watch mode
```

## Code Patterns

### Recursive Tree Rendering

Tree nodes are rendered recursively. Each `TreeNode` receives the full `expandedPaths` Set and a path array:

```tsx
<TreeNode
    value={val}
    path={[...path, key]}
    expandedPaths={expandedPaths}
    onToggle={toggleExpand}
    indentSize={indentSize}
/>
```

### Path Keys

Paths are stored as dot-joined strings (e.g., `"address.city"`). Root level has empty path `[]`.

### Scroll Container

The viewer is structured as:

- `.jt-toolbar` (sticky-like header inside the component): breadcrumb + search UI
- `.jt-scroll` (scroll container): holds the tree, used as `IntersectionObserver` root when scrollable

Breadcrumb tracking observes `.jt-row[data-path]` elements.

### Keyboard Navigation

Keyboard navigation is handled on `.jt-scroll` using a visible-node list computed from `data` + `expandedPaths`:

- `Ctrl/Cmd + F`: focus search (scoped to when the event target is inside the component)
- `↑/↓`, `Home/End`: move focus across visible nodes
- `→`: expand or move to first child
- `←`: collapse or move to parent
- `Enter`/`Space`: toggle expand/collapse

### Type Guards

Use `typeof` and `Array.isArray()` for JSON type detection:

```tsx
const isExpandable = value !== null && typeof value === 'object' && Object.entries(value).length > 0
```

### CSS Class Naming

Prefix all classes with `jt-` (e.g., `jt-node`, `jt-key`, `jt-value`, `jt-null`).

### Ref API

`JsonTreeViewRef` includes:

- `expandAll`, `collapseAll`, `scrollToPath`, `focusSearch`, `getExpandedPaths`
- `nextMatch`, `previousMatch` (search navigation)

## Conventions

- **No barrel files** - Import directly from source files, not from `index.ts`
- **No redundant comments** - Code should be self-explanatory
- **Zero runtime dependencies** - Only React as peer dependency
- **CSS Variables for theming** - No CSS-in-JS libraries
- **Functional components only** - Use hooks, no class components
- **Fast Refresh-safe exports** - Keep React component modules exporting components only; move non-component helpers (e.g. `getAllExpandablePaths`) into separate files to avoid Vite HMR invalidation warnings.

## Build Configuration

Vite is configured differently for dev vs build:

- `npm run dev` - Uses `dev/` as root for local testing
- `npm run build` - Library mode, entry at `src/JsonTreeView.tsx`, externals React

## What's Not Implemented Yet

Per `_notes/PROGRESS.md`, these are still TODO:

- Testing (Phase 12)
- Documentation pass (Phase 13+)

Consult `_notes/phases/` for detailed implementation guidance when working on these features.
