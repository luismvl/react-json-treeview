# react-json-treeview

A lightweight, performant React JSON tree viewer with search, navigation, and sticky breadcrumbs.

[![npm version](https://img.shields.io/npm/v/react-json-treeview.svg)](https://www.npmjs.com/package/react-json-treeview)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-json-treeview)](https://bundlephobia.com/package/react-json-treeview)
[![license](https://img.shields.io/npm/l/react-json-treeview.svg)](https://github.com/yourusername/react-json-treeview/blob/main/LICENSE)

## Features

- **Recursive Tree Rendering** - Expandable/collapsible objects and arrays
- **Syntax Highlighting** - Distinct colors for keys, strings, numbers, booleans, null
- **Search with Jump Navigation** - Find keys/values, jump between matches (Ctrl+F)
- **Sticky Breadcrumb** - Shows current path while scrolling through large JSON
- **Dark/Light Theme Support** - Automatic or manual theme switching
- **Keyboard Navigation** - Enter/Shift+Enter for next/prev match, Escape to clear
- **Imperative API** - Programmatic control via ref (expandAll, collapseAll, scrollToPath)
- **Zero Dependencies** - Only React as peer dependency
- **TypeScript First** - Full type definitions included
- **~5KB gzipped** - Lightweight bundle

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|----------|
| Build tool | Vite | Fast, excellent library mode, handles CSS |
| Language | TypeScript | Type safety, better DX, self-documenting |
| Styling | CSS Variables + Plain CSS | Zero runtime, easy theming, no dependencies |
| Testing | Vitest + Testing Library | Fast, Vite-native, React best practices |
| Bundle formats | ESM + CJS | ESM for modern bundlers, CJS for legacy |
| React version | ≥17.0.0 | Hooks required, wide compatibility |
| Virtualization | TBD (`@tanstack/virtual`?) | Only if needed, adds dependency |

---

## Installation

```bash
npm install react-json-treeview
# or
pnpm add react-json-treeview
# or
yarn add react-json-treeview
```

---

## Quick Start

```tsx
import { JsonTreeView } from 'react-json-treeview';
import 'react-json-treeview/styles.css';

function App() {
  const data = {
    name: "John",
    age: 30,
    address: {
      city: "New York",
      zip: "10001"
    }
  };

  return <JsonTreeView data={data} />;
}
```

---

## API Reference

### `<JsonTreeView />`

Main component for rendering JSON data.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `JsonValue` | required | The JSON data to render |
| `defaultExpanded` | `boolean` | `true` | Whether nodes start expanded |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Color theme |
| `className` | `string` | - | Additional CSS class |
| `searchable` | `boolean` | `true` | Show search bar |
| `showBreadcrumb` | `boolean` | `true` | Show sticky breadcrumb |
| `indentSize` | `number` | `20` | Pixels per indent level |
| `fontSize` | `number` | `13` | Font size in pixels |
| `onNodeClick` | `(path: string[], value: JsonValue) => void` | - | Callback when node clicked |
| `onSearchChange` | `(query: string, matches: SearchMatch[]) => void` | - | Callback on search |
| `externalSearchQuery` | `string` | - | External search query (use with `searchable={false}`) |
| `renderValue` | `(value: JsonPrimitive, path: string[], type: string) => ReactNode \| null` | - | Custom value renderer. Return `null` for default |
| `virtualized` | `boolean` | `false` | Enable virtualization for large datasets |
| `estimatedNodeHeight` | `number` | `24` | Estimated row height for virtualization |
| `maxDepth` | `number` | `Infinity` | Maximum depth to render (TBD) |
| `sortKeys` | `boolean` | `false` | Alphabetically sort object keys (TBD) |

#### Ref Methods

```tsx
import { JsonTreeView, JsonTreeViewRef } from 'react-json-treeview';

const ref = useRef<JsonTreeViewRef>(null);

// Expand all nodes
ref.current?.expandAll();

// Collapse all nodes
ref.current?.collapseAll();

// Scroll to specific path
ref.current?.scrollToPath(['address', 'city']);

// Focus search input
ref.current?.focusSearch();

// Get current expanded paths
ref.current?.getExpandedPaths(); // Set<string>
```

---

## Types

```typescript
// Primitive JSON values
type JsonPrimitive = string | number | boolean | null;

// JSON object
type JsonObject = { [key: string]: JsonValue };

// JSON array
type JsonArray = JsonValue[];

// Any JSON value
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

// Search match result
interface SearchMatch {
  path: string[];           // Path to the match, e.g. ['address', 'city']
  key: string;              // The matching key
  value?: string;           // The matching value (if value matched)
  type: 'key' | 'value';    // Whether key or value matched
}

// Ref interface for imperative control
interface JsonTreeViewRef {
  expandAll: () => void;
  collapseAll: () => void;
  scrollToPath: (path: string[]) => void;
  focusSearch: () => void;
  getExpandedPaths: () => Set<string>;
}
```

---

## Theming

### Built-in Themes

```tsx
// Auto-detect system preference
<JsonTreeView data={data} theme="auto" />

// Force light theme
<JsonTreeView data={data} theme="light" />

// Force dark theme
<JsonTreeView data={data} theme="dark" />
```

### Custom Colors

Override CSS variables for custom theming:

```css
.react-json-treeview {
  /* Syntax colors */
  --jt-key: #0ea5e9;           /* Keys */
  --jt-string: #10b981;        /* String values */
  --jt-number: #8b5cf6;        /* Number values */
  --jt-boolean: #f59e0b;       /* Boolean values */
  --jt-null: #6b7280;          /* Null values */
  --jt-bracket: #9ca3af;       /* Brackets {} [] */
  
  /* Search highlight */
  --jt-match-bg: #fef08a;      /* Match background */
  --jt-current-match-bg: #fdba74;  /* Current match */
  --jt-current-match-ring: #f97316; /* Current match ring */
  
  /* UI colors */
  --jt-bg: #ffffff;            /* Background */
  --jt-border: #e5e7eb;        /* Borders */
  --jt-text: #1f2937;          /* Text */
  --jt-text-muted: #6b7280;    /* Muted text */
}

/* Dark theme overrides */
.react-json-treeview[data-theme="dark"] {
  --jt-key: #38bdf8;
  --jt-string: #34d399;
  --jt-number: #a78bfa;
  --jt-boolean: #fbbf24;
  --jt-null: #9ca3af;
  --jt-bracket: #6b7280;
  
  --jt-match-bg: rgba(234, 179, 8, 0.3);
  --jt-current-match-bg: rgba(249, 115, 22, 0.4);
  
  --jt-bg: #1f2937;
  --jt-border: #374151;
  --jt-text: #f9fafb;
  --jt-text-muted: #9ca3af;
}
```

---

## Advanced Usage

### Controlled Search

```tsx
function ControlledSearch() {
  const [query, setQuery] = useState('');
  const ref = useRef<JsonTreeViewRef>(null);

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <JsonTreeView 
        ref={ref}
        data={data}
        searchable={false}  // Hide built-in search
        externalSearchQuery={query}
      />
    </div>
  );
}
```

### Custom Node Renderer

```tsx
<JsonTreeView
  data={data}
  renderValue={(value, path, type) => {
    // Custom rendering for specific paths
    if (path.join('.') === 'user.avatar') {
      return <img src={value} alt="avatar" className="w-8 h-8 rounded" />;
    }
    // Return null to use default rendering
    return null;
  }}
/>
```

### Virtualization for Large Data

For JSON with 10,000+ nodes, enable virtualization:

```tsx
<JsonTreeView
  data={largeData}
  virtualized
  estimatedNodeHeight={24}
/>
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + F` | Focus search input |
| `Enter` | Jump to next match |
| `Shift + Enter` | Jump to previous match |
| `Escape` | Clear search |
| `Arrow Left` | Collapse current node |
| `Arrow Right` | Expand current node |

---

## Error Handling

> ⚠️ **TODO:** Define exact behavior during implementation.

| Scenario | Behavior |
|----------|----------|
| `data` is `undefined` | Render empty state or show placeholder (TBD) |
| `data` is not valid JSON | Display error message in component (TBD) |
| Circular references | Not supported - will cause infinite loop. Consider adding detection (TBD) |
| Very long strings (>10KB) | Truncate with "Show more" button (TBD) |
| Deeply nested (100+ levels) | May hit recursion limits. Consider `maxDepth` prop |
| `scrollToPath` with invalid path | No-op, optionally log warning (TBD) |
| Empty object `{}` / array `[]` | Render with empty indicator (e.g., "empty object") |

---

## Accessibility

> ⚠️ **TODO:** Implement and verify with screen readers.

### Planned A11y Features

- [ ] `role="tree"` and `role="treeitem"` ARIA roles
- [ ] `aria-expanded` on collapsible nodes
- [ ] `aria-level` for nesting depth
- [ ] `aria-label` on interactive elements
- [ ] Focus management with visible focus ring
- [ ] Screen reader announcements for search results
- [ ] Keyboard navigation following [WAI-ARIA TreeView pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)

### Keyboard Navigation (Planned)

| Key | Action |
|-----|--------|
| `↑` / `↓` | Move focus between visible nodes |
| `←` | Collapse node or move to parent |
| `→` | Expand node or move to first child |
| `Home` | Move to first node |
| `End` | Move to last visible node |
| `Enter` | Activate/select node |
| `*` | Expand all siblings |

---

## SSR & Framework Compatibility

> ⚠️ **TODO:** Test with Next.js, Remix, Astro after implementation.

### Goals

- [ ] Works with Next.js App Router (React Server Components)
- [ ] Hydration without layout shift
- [ ] No `window`/`document` access during SSR
- [ ] Compatible with `'use client'` directive

### Known Considerations

- Breadcrumb scroll detection requires `window` - needs client-side only
- `matchMedia` for theme auto-detection - needs client-side only
- Virtualization may need special handling for SSR

---

## Performance

### Optimizations Included

1. **Memoized Nodes** - `React.memo` on tree nodes prevents unnecessary re-renders
2. **Virtualization Support** - Optional windowing for very large JSON
3. **Throttled Scroll** - Breadcrumb updates are throttled via `requestAnimationFrame`
4. **Lazy Search** - Search is debounced and runs in chunks for large data

### Benchmarks

> ⚠️ **TODO:** These are placeholder estimates. Real benchmarks need to be measured after implementation.
> 
> **Action Items:**
> - [ ] Set up performance testing with React DevTools Profiler
> - [ ] Test with realistic JSON datasets (API responses, config files)
> - [ ] Measure memory usage with Chrome DevTools
> - [ ] Compare with and without virtualization
> - [ ] Test on low-end devices

| Nodes | Initial Render | Search (avg) | Memory |
|-------|---------------|--------------|--------|
| 100 | ~TBD | ~TBD | ~TBD |
| 1,000 | ~TBD | ~TBD | ~TBD |
| 10,000 | ~TBD | ~TBD | ~TBD |
| 10,000 (virtualized) | ~TBD | ~TBD | ~TBD |

---

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

---

## Comparison

| Feature | react-json-treeview | react-json-view | react-json-tree |
|---------|---------------------|-----------------|-----------------|
| Bundle Size | ~5KB | ~40KB | ~8KB |
| Search | Yes | Yes | No |
| Sticky Breadcrumb | Yes | No | No |
| Jump Navigation | Yes | No | No |
| TypeScript | Yes | Partial | Yes |
| React 18 | Yes | No | Yes |
| Maintained | Yes | No | Yes |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

## Limitations

Things this library intentionally does NOT support (at least in v1):

| Limitation | Reason |
|------------|--------|
| Circular references | JSON doesn't support them; detection adds overhead |
| BigInt values | Not valid JSON; would need special handling |
| `undefined` values | Not valid JSON |
| Editing JSON | Out of scope for v1 (read-only viewer) |
| Non-JSON data (Date, Map, Set) | Serialize to JSON first |
| Streaming/partial JSON | Full JSON must be loaded |

---

## Open Questions

Decisions to make during development:

1. **Default expand depth?** - Should we limit initial expansion (e.g., 3 levels) for large JSON?
2. **Copy functionality?** - Copy value, copy path, or copy subtree as JSON?
3. **Search behavior** - Case-sensitive option? Regex support?
4. **Array indices in path** - Use `[0]` or `.0` notation?
5. **Virtualization library** - Use `@tanstack/virtual` or custom implementation?
6. **CSS approach** - Plain CSS, CSS Modules, or CSS-in-JS fallback?

---

## Roadmap

### v1.0 (MVP)

- [ ] Core tree rendering with expand/collapse
- [ ] Syntax highlighting for all JSON types
- [ ] Light/dark/auto theme
- [ ] Basic search with highlight
- [ ] Keyboard navigation (Ctrl+F, Enter, Escape)
- [ ] Sticky breadcrumb
- [ ] Imperative ref API
- [ ] TypeScript types
- [ ] Basic accessibility (ARIA roles)
- [ ] Unit tests with Vitest
- [ ] Documentation & examples

### v1.x (Post-MVP)

- [ ] Copy path to clipboard on click
- [ ] Virtualization for 10k+ nodes
- [ ] Performance benchmarks
- [ ] SSR compatibility verification
- [ ] Full accessibility audit

### v2.0 (Future)

- [ ] Diff mode (compare two JSON objects)
- [ ] JSON Schema validation indicators
- [ ] Export to various formats (YAML, TOML)
- [ ] Inline editing mode
- [ ] Drag-and-drop reordering

