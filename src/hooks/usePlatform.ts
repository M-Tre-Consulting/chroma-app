import { useEffect, useState } from "react";

type Platform = "desktop" | "mobile";

/**
 * Detects whether the app is running on a mobile or desktop platform
 * using Tauri's OS plugin. Falls back to viewport width heuristic
 * if the plugin is unavailable.
 */
export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>("desktop");

  useEffect(() => {
    async function detect() {
      try {
        const { platform } = await import("@tauri-apps/plugin-os");
        const p = platform();
        setPlatform(p === "android" || p === "ios" ? "mobile" : "desktop");
      } catch {
        setPlatform(window.innerWidth < 768 ? "mobile" : "desktop");
      }
    }
    detect();
  }, []);

  return platform;
}
