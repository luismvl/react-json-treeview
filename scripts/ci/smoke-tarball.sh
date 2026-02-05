#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

PKG_NAME="$(node -p "require('./package.json').name")"
TARBALL_PATH="${1:-}"

if [[ -z "$TARBALL_PATH" ]]; then
  TARBALL_PATH="$(ls -t ./*.tgz 2>/dev/null | head -n1 || true)"
fi

if [[ -z "$TARBALL_PATH" || ! -f "$TARBALL_PATH" ]]; then
  echo "Tarball not found. Run 'npm pack' first or pass a .tgz path." >&2
  exit 1
fi

TARBALL_PATH="$(realpath "$TARBALL_PATH")"

TMPDIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMPDIR"
}
trap cleanup EXIT

pushd "$TMPDIR" >/dev/null
npm init -y >/dev/null
npm i react react-dom >/dev/null
npm i "$TARBALL_PATH" >/dev/null

cat > esm-check.mjs <<EOF
import { JsonTreeView, highlightText } from '$PKG_NAME'
console.log(typeof JsonTreeView, typeof highlightText)
EOF

cat > cjs-check.cjs <<EOF
const { JsonTreeView, highlightText } = require('$PKG_NAME')
console.log(typeof JsonTreeView, typeof highlightText)
EOF

cat > types-check.ts <<EOF
import type { JsonTreeViewProps, JsonTreeViewRef, RenderValueContext } from '$PKG_NAME'
const a: JsonTreeViewProps | undefined = undefined
const b: JsonTreeViewRef | undefined = undefined
const c: RenderValueContext | undefined = undefined
void a
void b
void c
EOF

node esm-check.mjs
node cjs-check.cjs
"$REPO_ROOT/node_modules/.bin/tsc" types-check.ts --moduleResolution bundler --module ESNext --target ES2022 --noEmit
node -e "console.log(require.resolve('$PKG_NAME/styles.css'))"
popd >/dev/null

echo "Smoke test passed for $PKG_NAME via $(basename "$TARBALL_PATH")"
