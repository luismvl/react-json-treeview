# Contributing

Thanks for helping improve `react-json-treeview`.

## Requirements

- Node.js 18+
- npm (or pnpm/yarn)

## Local development

```bash
npm install
npm run dev
```

The dev server uses the `dev/` playground as its Vite root.

## Useful scripts

```bash
npm run build
npm run lint
npm test
```

## Project guidelines

- No runtime dependencies (React is a peer dependency).
- Keep the public API small and well-documented.
- Prefer small, focused PRs with tests where behavior changes.
- Keep CSS class names prefixed with `jt-` and favor CSS variables for theming.

## Testing

Tests are in `tests/` and run with Vitest + React Testing Library (`jsdom`).

- Add/adjust tests for any behavior change.
- Prefer user-facing assertions (DOM, roles, keyboard interactions).

## Submitting changes

1. Run `npm run lint` and `npm test`.
2. Update `README.md` / `CHANGELOG.md` when changing public API or behavior.
3. Open a PR with a clear description and screenshots/GIFs for UI changes when relevant.
