# Chroma

A cross-platform color palette and design token manager for designers and developers. Create color systems, map them to design tokens, and export to CSS, SCSS, JSON, Tailwind, and Android XML — all from a single local-first application with no backend and no account required.

---

## Platforms

| Platform | Stack |
|----------|-------|
| Desktop (Windows, macOS, Linux) | Tauri 2 + React 19 + TypeScript |
| Android | Kotlin + Jetpack Compose + Material 3 |
| iOS | Swift + SwiftUI (iOS 17+) |

---

## Features

**Color palettes**
- Create and name palettes
- Add colors via hex input or an interactive color picker
- View hex, RGB, and HSL representations side-by-side
- WCAG contrast ratio scoring (AAA / AA / AA Large / Fail) for every color

**Design tokens**
- Organize tokens into named groups
- Assign palette colors to individual tokens
- Tokens resolve to their final hex values at export time

**Export formats**
- CSS custom properties (`:root` block)
- SCSS variables (grouped by token group)
- JSON (Amazon Style Dictionary format)
- Tailwind CSS color configuration block
- Android `colors.xml` (snake\_case names)
- Copy to clipboard or save to a file (desktop)

**Privacy**
- No backend, no network requests, no telemetry
- All data stored locally on-device

---

## Repository Structure

```
chroma-app/
├── apps/
│   ├── desktop/      # Tauri 2 desktop app (React + Vite + TypeScript)
│   ├── android/      # Native Android app (Kotlin + Jetpack Compose)
│   └── ios/          # Native iOS app (Swift + SwiftUI)
└── packages/
    └── core/         # Shared TypeScript library (color logic, stores, exporters)
```

`packages/core` contains all color conversion utilities, Zustand state stores, and export formatters. The desktop app depends on it via the pnpm workspace (`@chroma/core`). The Android and iOS apps implement equivalent logic natively in Kotlin and Swift respectively.

---

## Prerequisites

| Requirement | Purpose |
|-------------|---------|
| Node.js 18+ | Desktop app runtime |
| pnpm | Package manager (monorepo workspace) |
| Rust (stable) | Tauri desktop build |
| Android Studio + Android SDK | Android build and emulator |
| Xcode 16+ (macOS only) | iOS build and simulator |
| XcodeGen (optional) | Regenerate the iOS `.xcodeproj` from `project.yml` |

Install pnpm if you don't have it:

```bash
npm install -g pnpm
```

Install XcodeGen if you need to regenerate the Xcode project:

```bash
brew install xcodegen
```

---

## Getting Started

**Install JavaScript dependencies:**

```bash
pnpm install
```

### Desktop

```bash
pnpm desktop
```

Starts the Vite dev server on port 1420 and launches the Tauri window with hot module replacement.

### Android

Open `apps/android` in Android Studio and run on a connected device or emulator. Alternatively, use Gradle directly:

```bash
cd apps/android
./gradlew installDebug
```

### iOS

Open `apps/ios/Chroma.xcodeproj` in Xcode, select a simulator or device, and press Run. If the `.xcodeproj` is missing or you've added new source files, regenerate it first:

```bash
cd apps/ios
xcodegen generate
```

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

Signed APK/AAB is output to `apps/android/app/build/outputs/`.

**iOS:**

Archive and distribute through Xcode: **Product → Archive**, then use the Organizer to export or upload to App Store Connect.

---

## Development Scripts

| Command | Description |
|---------|-------------|
| `pnpm desktop` | Start desktop app in development mode |
| `pnpm --filter desktop build` | Build desktop frontend only |
| `cd apps/android && ./gradlew installDebug` | Install debug build on Android |
| `cd apps/android && ./gradlew assembleRelease` | Build release APK/AAB |
| `cd apps/ios && xcodegen generate` | Regenerate Xcode project from `project.yml` |

---

## Tech Stack

**Desktop**
- React 19, Vite, TypeScript, Tailwind CSS 4
- Tauri 2 (Rust backend — file system, clipboard, native dialogs)
- Zustand 5 (state management)
- `@chroma/core` (shared color logic and exporters)

**Android**
- Kotlin, Jetpack Compose, Material 3
- AndroidX Navigation Compose
- AndroidX DataStore (Preferences)
- Kotlin Serialization

**iOS**
- Swift 5.10, SwiftUI (iOS 17+)
- `@Observable` + `UserDefaults` (state and persistence)
- XcodeGen (project generation)

---

## Data Persistence

All data is stored locally under two keys:

| Key | Contents |
|-----|----------|
| `chroma-palettes` | All palette and color data |
| `chroma-token-groups` | All token groups and assignments |

Desktop uses `localStorage`; Android uses AndroidX DataStore (Preferences); iOS uses `UserDefaults`. No data ever leaves the device.

---

## License

See [LICENSE](LICENSE) for details.
