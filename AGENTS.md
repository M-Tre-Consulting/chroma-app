# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Commands

```bash
# ==========================================
# 1. WINDOWS PORT (C# / WPF .NET 8)
# ==========================================

# Restore and build the project
dotnet build apps/desktop-windows/Chroma.csproj

# Run the project
dotnet run --project apps/desktop-windows/Chroma.csproj

# ==========================================
# 2. LINUX PORT (C++ / GTK 4 / Libadwaita)
# ==========================================

# Build the project
make -C apps/desktop-linux

# Run the project
./apps/desktop-linux/desktop-linux

# ==========================================
# 3. ANDROID APP (Kotlin / Jetpack Compose)
# ==========================================

# Android debug build & install
cd apps/android && ./gradlew installDebug

# Android release build
cd apps/android && ./gradlew assembleRelease

# ==========================================
# 4. IOS APP (Swift / SwiftUI)
# ==========================================

# iOS project regeneration (after adding source files)
cd apps/ios && xcodegen generate
```

## Architecture

### Project Structure

```
apps/desktop-windows/    # Native C# (.NET 8 WPF) desktop application for Windows
  ├── Models/            # Domain models (Colour, Palette, Token, etc.)
  ├── Services/          # Color math, JSON storage, and dynamic format exporters
  ├── ViewModels/        # MainWindowViewModel state store (INotifyPropertyChanged)
  └── MainWindow.xaml    # Modern WPF styles & bound UI views

apps/desktop-linux/      # Native C++ + GTK 4 + Libadwaita desktop application for Linux
apps/android/            # Native Kotlin + Jetpack Compose mobile application
apps/ios/                # Native Swift + SwiftUI mobile application
```

### Data Model

- `Palette` → contains `Colour[]` → each `Colour` has `id`, `name`, `hex`, `rgb`, `hsl`
- `TokenGroup` → contains `Token[]` → each `Token` has a `TokenValue` referencing `paletteId` + `colourId`

Tokens are *assigned* to colours from palettes; they resolve to hex values at export time.

### State Persistence & Storage

- **Windows Desktop (C#)**: State is managed via `MainWindowViewModel` and serialized natively in `StorageService` to JSON files stored in the user's local application data folder (`AppData/Local/Chroma/`).
- **Linux Desktop (C++)**: State is handled via `store.cpp` saving configuration/JSON files.
- **Mobile (Android/iOS)**: Native state persistence implements equivalent offline data stores (SQLite or standard platform preference storage).

### Styling & Theme Systems

- **Windows Desktop (C#)**: Fully customized in `App.xaml` using flat, modern brushes, custom templates for rounded buttons, focused textbox layouts, and WCAG rating indicators (AAA, AA, Fail).
- **Linux Desktop (C++)**: Handled using native GTK CSS style sheets.

### Export Pipeline

1. **Resolution**: Joins tokens to their assigned colours across groups and palettes, filtering unassigned tokens.
2. **Formatting**: Format-specific engines (`CSS`, `SCSS`, `JSON`, `Tailwind TS`, `Android XML`) consume the resolved flat list and produce strings.
3. **Execution**: File system writing and Clipboard copies are executed natively by each platform app (e.g. C# uses Microsoft `SaveFileDialog` and standard WPF `Clipboard`).
