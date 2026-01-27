# react-json-treeview

A lightweight, performant React JSON tree viewer with search, navigation, and sticky breadcrumbs.

> ⚠️ **Work in Progress** - This library is currently under active development and has not been published yet.

## Planned Features

- 🌳 **Recursive Tree Rendering** - Expandable/collapsible objects and arrays
- 🎨 **Syntax Highlighting** - Distinct colors for keys, strings, numbers, booleans, null
- 🔍 **Search with Jump Navigation** - Find keys/values, jump between matches
- 📍 **Sticky Breadcrumb** - Shows current path while scrolling through large JSON
- 🌗 **Dark/Light Theme Support** - Automatic or manual theme switching
- ⌨️ **Keyboard Navigation** - Full keyboard accessibility
- 🎯 **Imperative API** - Programmatic control via ref
- 📦 **Zero Dependencies** - Only React as peer dependency
- 📘 **TypeScript First** - Full type definitions included
- 🪶 **Lightweight** - Target ~5KB gzipped

## Installation

```bash
# Not yet published
npm install react-json-treeview
```

## Quick Start

```tsx
import { JsonTreeView } from 'react-json-treeview'
import 'react-json-treeview/styles.css'

function App() {
    const data = {
        name: 'John',
        age: 30,
        address: {
            city: 'New York',
            zip: '10001',
        },
    }

    return <JsonTreeView data={data} />
}
```

## Development Status

This project is being built and is not yet ready for production use.

## Compatibility

| React Version | Status       |
| ------------- | ------------ |
| React 18.x    | ✅ Supported |
| React 19.x    | ✅ Supported |

**Note:** This library uses `forwardRef` for the imperative API to maintain compatibility with React 18. While `forwardRef` is deprecated in React 19 (in favor of `ref` as a prop), it remains fully functional. We will migrate to the new pattern when React 18 reaches end-of-life.

## License

MIT
