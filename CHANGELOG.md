# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-02-05

### Added

- Initial preview release.
- `<JsonTreeView />` component with expand/collapse for objects and arrays.
- Search UI with next/previous navigation and match highlighting.
- Sticky breadcrumb that tracks the visible path while scrolling.
- Keyboard navigation for the tree and search input.
- Imperative ref API (`expandAll`, `collapseAll`, `scrollToPath`, `focusSearch`, `getExpandedPaths`, `nextMatch`, `previousMatch`).
- Theming via CSS variables and `theme="light" | "dark" | "auto"`.
