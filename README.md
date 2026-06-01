# Chroma

A cross-platform color palette and design token manager for designers and developers. Create color systems, map them to design tokens, and export to CSS, SCSS, JSON, Tailwind, and Android XML — all from a single local-first application with no backend and no account required.

---

## Platforms

| Platform | Stack |
|----------|-------|
| Desktop (Windows) | Native C# + .NET 8 WPF |
| Desktop (Linux) | Native Rust + GTK 4 + Relm4 |
| Android | Kotlin + Jetpack Compose + Material 3 |
| iOS | Swift + SwiftUI (iOS 17+) |

---

## Features

**Color palettes**
- Create and name palettes
- Add colors via hex input or an interactive color picker
- View hex, RGB, and HSL representations side-by-side
- WCAG contrast ratio scoring (AAA / AA / AA Large / Fail) for every color
- Live contrast adjustment recommendations (native fixes)

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
- Copy to clipboard or save to a file natively

**Privacy**
- No backend, no network requests, no telemetry
- All data stored locally on-device

---

## Repository Structure

```
chroma-app/
└── apps/
    ├── desktop-windows/   # Native Windows WPF app (C# / .NET 8)
    ├── desktop-linux/     # Native Linux GTK app (Rust / Relm4)
    ├── android/           # Native Android app (Kotlin / Jetpack Compose)
    └── ios/               # Native iOS app (Swift / SwiftUI)
```

Each platform application implements equivalent state persistence, color mathematics, and export pipelines natively in their respective languages.

---

## Prerequisites

| Requirement | Purpose |
|-------------|---------|
| .NET 8 SDK or later | Windows desktop build |
| Rust (stable) + GTK 4 | Linux desktop build |
| Android Studio + Android SDK | Android build and emulator |
| Xcode 16+ (macOS only) | iOS build and simulator |
| XcodeGen (optional) | Regenerate the iOS `.xcodeproj` from `project.yml` |

---

## Getting Started

### Windows Port (C#)

```bash
# Restore and build the project
dotnet build apps/desktop-windows/Chroma.csproj

# Run the project
dotnet run --project apps/desktop-windows/Chroma.csproj
```

### Linux Port (Rust)

```bash
# Build the project
cargo build --manifest-path apps/desktop-linux/Cargo.toml

# Run the project
cargo run --manifest-path apps/desktop-linux/Cargo.toml
```

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

**Windows:**

```bash
dotnet publish apps/desktop-windows/Chroma.csproj -c Release -r win-x64 --self-contained true -o publish/
```

Produces a standalone application package in `publish/`.

**Linux:**

```bash
cargo build --release --manifest-path apps/desktop-linux/Cargo.toml
```

Produces a release binary in `apps/desktop-linux/target/release/`.

**Android:**

```bash
cd apps/android
./gradlew assembleRelease
```

Signed APK/AAB is output to `apps/android/app/build/outputs/`.

**iOS:**

Archive and distribute through Xcode: **Product → Archive**, then use the Organizer to export or upload to App Store Connect.

---

## License

See [LICENSE](LICENSE) for details.
