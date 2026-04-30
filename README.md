# Chroma

A cross-platform color palette and design token management tool for designers and developers. Create color systems, map them to design tokens, and export to CSS, SCSS, JSON, Tailwind, and Android XML — all from a single local-first application.

---

## Platforms

| Platform | Technology |
|----------|-----------|
| Desktop (Windows, macOS, Linux) | Tauri 2 + React |
| Android | Native Kotlin + Jetpack Compose |
| iOS | Expo / React Native |
| Web | Expo Web |

---

## Features

**Color palettes**
- Create and name palettes
- Add colors via hex input or an interactive color picker
- View hex, RGB, and HSL representations side-by-side

**Design tokens**
- Organize tokens into named groups
- Assign palette colors to individual tokens
- Tokens are resolved to their final hex values at export time

**Export formats**
- CSS custom properties (`:root` variables)
- SCSS variables (grouped by token group)
- JSON (Amazon Style Dictionary format)
- Tailwind CSS configuration block
- Android `colors.xml` (with automatic snake\_case conversion)
- Copy to clipboard or save directly to a file (desktop)

**Color utilities**
- Hex, RGB, and HSL conversion
- WCAG contrast ratio calculation (AAA / AA / AA Large / Fail)
- Automatic contrast fix suggestions via lightness adjustment

**Privacy**
- No backend, no network requests
- All data is stored locally (localStorage, DataStore, or AsyncStorage depending on platform)

---

## Repository Structure

```
chroma-app/
├── apps/
│   ├── desktop/          # Tauri desktop application (React + Rust)
│   ├── android/          # Native Android application (Kotlin + Jetpack Compose)
│   └── mobile/           # Expo React Native application (iOS / Web)
└── packages/
    └── core/             # Shared library: color logic, state, types, exporters
```

The `@chroma/core` package contains all color conversion utilities, Zustand stores, and export formatters. Both `desktop` and `mobile` depend on it — no business logic lives in the app packages. The native Android app implements its own equivalent logic directly in Kotlin.

---

## Prerequisites

| Requirement | Purpose |
|-------------|---------|
| Node.js 18+ | JavaScript runtime |
| pnpm | Package manager (monorepo) |
| Rust (stable) | Tauri desktop build |
| Android SDK | Android mobile build |
| Xcode (macOS only) | iOS build |

Install pnpm if you don't have it:

```bash
npm install -g pnpm
```

---

## Getting Started

**Install dependencies:**

```bash
pnpm install
```

**Run the desktop app (development):**

```bash
pnpm desktop
```

This starts the Vite dev server on port 1420 and launches the Tauri window with hot module replacement.

**Run the Android app (development):**

Open `apps/android` in Android Studio and run on a connected device or emulator, or use Gradle directly:

```bash
cd apps/android
./gradlew installDebug
```

**Run the iOS / web app (development):**

```bash
pnpm mobile
```

Then press `i` for iOS or `w` for web in the Expo CLI prompt.

---

## Building for Production

**Desktop:**

```bash
cd apps/desktop
pnpm tauri build
```

Produces a platform-native installer in `apps/desktop/src-tauri/target/release/bundle/`.

**Android:**

```bash
cd apps/android
./gradlew assembleRelease
```

The signed APK/AAB is output to `apps/android/app/build/outputs/`.

**iOS / Web:**

Use Expo EAS Build for managed iOS builds:

```bash
cd apps/mobile
npx eas build --platform ios
```

---

## Development Scripts

| Command | Description |
|---------|-------------|
| `pnpm desktop` | Start desktop app in development mode |
| `pnpm mobile` | Start Expo dev server (iOS / Web) |
| `pnpm --filter desktop build` | Build desktop frontend only |
| `pnpm --filter mobile ios` | Run on iOS simulator (macOS only) |
| `./gradlew installDebug` (in `apps/android`) | Install debug build on Android device/emulator |
| `./gradlew assembleRelease` (in `apps/android`) | Build release APK/AAB |

---

## Tech Stack

**Shared / Core**
- TypeScript 5.9
- Zustand 5 (state management)

**Desktop**
- React 19
- Vite 7
- Tailwind CSS 4
- Tauri 2 (Rust backend, file system, clipboard, native dialogs)

**Android**
- Kotlin
- Jetpack Compose + Material3
- AndroidX Navigation Compose
- AndroidX DataStore (Preferences)
- Kotlin Serialization

**iOS / Web**
- React Native 0.81 via Expo 54
- Expo Router 6 (file-based navigation)
- React Native Reanimated 4

---

## Data Persistence

Data is stored locally under two keys:

| Key | Contents |
|-----|----------|
| `chroma-palettes` | All palette and color data |
| `chroma-tokens` | All token groups and token assignments |

Desktop uses `localStorage`; the native Android app uses AndroidX DataStore (Preferences); iOS/Web use `@react-native-async-storage/async-storage`. No data ever leaves the device.

---

## License

See [LICENSE](LICENSE) for details.
