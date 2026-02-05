# AI Agent Instructions

## Project Overview

React JSON tree viewer library with search, navigation, sticky breadcrumbs, keyboard support, and TypeScript types.

**Architecture:** Minimal component library with Vite in library mode, outputting ESM + CJS bundles.

## Key Files

- `src/entry.ts` - Public package entry (exports component, types, and helpers)
- `src/JsonTreeView.tsx` - Main exported component, manages state and composition
- `src/JsonTree.tsx` - Recursive `TreeNode` renderer
- `src/Breadcrumb.tsx` - Sticky breadcrumb renderer
- `src/SearchBar.tsx` - Search input + next/prev UI
- `src/useSearch.ts` - Search matching + navigation state
- `src/highlightText.tsx` - `<mark>` helper for highlighting matches
- `src/types.ts` - Public TypeScript types (`JsonValue`, `JsonTreeViewProps`, etc.)
- `dev/main.tsx` - Development playground (not shipped)

## Development Commands

```bash
npm run dev                  # Start dev server (uses dev/ folder as root)
npm run build                # Build library to dist/
npm run lint                 # ESLint check
npm run lint:fix             # ESLint auto-fix
npm test                     # Run tests once
npm run test:watch           # Watch mode
npm run test:coverage        # Coverage report
npm run ci:verify            # Lint + test + build + npm pack checks
npm run ci:smoke-tarball     # Consumer-style tarball install/import/types/css check
```

## Code Patterns

### Recursive Tree Rendering

Tree nodes are rendered recursively. Each `TreeNode` receives the full `expandedPaths` `Set` and a path array:

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

- `.jt-toolbar` (header area inside the component): breadcrumb + search UI
- `.jt-scroll` (scroll container): tree content and keyboard target

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

Prefix all component classes with `jt-` (e.g., `jt-node`, `jt-key`, `jt-value`, `jt-null`).

### Ref API

`JsonTreeViewRef` includes:

- `expandAll`, `collapseAll`, `scrollToPath`, `focusSearch`, `getExpandedPaths`
- `nextMatch`, `previousMatch`

## Testing

Tests live in `tests/` and run with Vitest + React Testing Library in `jsdom`.

- Config: `vitest.config.ts`
- Setup: `tests/setup.ts` (mocks `IntersectionObserver` + scroll methods for jsdom)
- Typechecking in VSCode:
  - `tests/tsconfig.json` adds `vitest/globals` + `@testing-library/jest-dom` matcher typings
  - `tests/vitest.d.ts` imports `@testing-library/jest-dom/vitest`

## Conventions

- **No barrel files** in source internals. Import directly from source files.
- **No redundant comments** - code should be self-explanatory.
- **Zero runtime dependencies** - only React as peer dependency.
- **CSS Variables for theming** - no CSS-in-JS libraries.
- **Functional components only** - hooks, no class components.
- **Fast Refresh-safe exports** - keep React component modules exporting components only; move non-component helpers into separate modules.

## Build Configuration

Vite is configured differently for dev vs build:

- `npm run dev` - uses `dev/` as root for local testing
- `npm run build` - library mode, entry at `src/entry.ts`, externals React
