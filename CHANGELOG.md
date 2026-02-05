# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-02-05

### Changed

- Declared the public API stable for `1.x` (component props, ref API, exported types, and helpers).
- No breaking API changes from `0.1.1`; this release marks production-ready SemVer guarantees.

### Added

- GitHub Pages playground deployment workflow and related playground build configuration.
- README live playground link and screenshots.

## [0.1.1] - 2026-02-05

### Fixed

- Synchronized README install/import examples with the published scoped package name (`@luismvl/react-json-treeview`).
- Updated README status version to match the current published line.

### Added

- CI workflow (`.github/workflows/ci.yml`) with pre-publish checks:
- `lint`, `test`, `build`, `npm pack --dry-run`, and tarball smoke tests for ESM/CJS/types/CSS.
- `prepublishOnly` script to enforce local release checks before publishing.
- `engines.node` metadata (`>=18`) in `package.json`.

## [0.1.0] - 2026-02-05

### Added

- Initial preview release.
- `<JsonTreeView />` component with expand/collapse for objects and arrays.
- Search UI with next/previous navigation and match highlighting.
- Sticky breadcrumb that tracks the visible path while scrolling.
- Keyboard navigation for the tree and search input.
- Imperative ref API (`expandAll`, `collapseAll`, `scrollToPath`, `focusSearch`, `getExpandedPaths`, `nextMatch`, `previousMatch`).
- Theming via CSS variables and `theme="light" | "dark" | "auto"`.
