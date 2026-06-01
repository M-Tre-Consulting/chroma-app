# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Desktop dev server (Vite + Tauri, port 1420)
pnpm desktop

# Desktop frontend build only
pnpm --filter desktop build

# Desktop Tauri production build
pnpm --filter desktop tauri build

# Android debug build
cd apps/android && ./gradlew installDebug

# Android release build
cd apps/android && ./gradlew assembleRelease

# iOS project regeneration (after adding source files)
cd apps/ios && xcodegen generate
```

There are no tests or linters configured (`.eslintrc.js` is an empty root marker).

## Architecture

### Monorepo structure (pnpm workspace)

```
packages/core/     # @chroma/core — shared types, color math, Zustand stores, export formatters
apps/desktop/      # Tauri 2 + React 19 + Vite + Tailwind CSS 4 — depends on @chroma/core
apps/android/      # Native Kotlin + Jetpack Compose
apps/ios/          # Native Swift + SwiftUI
```

### Data model

`Palette` → contains `Colour[]` → each `Colour` has `id`, `name`, `hex`, `rgb`, `hsl`
`TokenGroup` → contains `Token[]` → each `Token` has a `TokenValue` referencing `paletteId` + `colourId`

Tokens are *assigned* to colours from palettes; they resolve to hex values at export time.

### Store factory pattern

`@chroma/core` exports **store creators**, not pre-instantiated stores:

- `createPaletteStore(storage: StateStorage)` — returns a Zustand store persisted under key `"chroma-palettes"`
- `createTokenStore(storage: StateStorage)` — returns a Zustand store persisted under key `"chroma-tokens"`

The desktop app calls `createPaletteStore(localStorage)` and exports the result as `usePaletteStore`. On Android/iOS, the native apps implement equivalent state persistence natively (no core stores used).

### Desktop app dual-layout architecture

`App.tsx` calls `usePlatform()` (from `hooks/usePlatform.ts`), which detects the platform via Tauri's OS plugin. If `"android"`, it renders `<MobileAndroidApp />` — a mobile-first layout with bottom navigation and a Material 3 splash screen. Otherwise, it renders the desktop layout with a sidebar panel system.

The desktop layout has three left-sidebar tabs (Palettes, Tokens, Export) and a main area with a color picker column + color cards column.

### CSS design token system

The app uses CSS custom properties exclusively (no direct Tailwind color classes in markup). Variables are defined in `index.css` with light and dark (`prefers-color-scheme: dark`) variants:

- `--bg`, `--bg-raised`, `--bg-sunken` — surface hierarchy
- `--border`, `--border-strong` — borders
- `--ink`, `--ink-2`, `--ink-3`, `--ink-4` — text (decreasing opacity)
- `--accent`, `--accent-soft`, `--accent-strong` — brand purple
- `--wcag-aaa-bg`, `--wcag-aa-bg`, etc. — contrast badge colors

Desktop components use inline `style={{ color: "var(--ink)" }}` rather than Tailwind classes for colors. The `react-colorful` library provides the color picker wheel.

### Export pipeline

1. `resolveTokens(groups, palettes)` — joins tokens to their assigned colours across groups and palettes, filtering unassigned tokens
2. Format-specific exporters (`exportCSS`, `exportSCSS`, `exportJSON`, `exportTailwind`, `exportAndroidXml`) consume the resolved flat list and produce strings
3. On desktop, Tauri plugins handle clipboard (`writeText`) and file save dialog + write (`@tauri-apps/plugin-fs`)

### Release workflow

Git tags matching `v*` trigger `.github/workflows/release.yml`, which builds Android APK, macOS universal DMG, Windows x64, and Windows ARM64 in parallel, then publishes all artifacts to a GitHub Release. Version numbers are injected into `tauri.conf.json` and Android Gradle properties from the tag.
