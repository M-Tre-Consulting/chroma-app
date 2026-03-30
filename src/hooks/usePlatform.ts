import { useEffect, useState } from "react";

/** Platform type string */
type Platform = 'desktop' | 'android' | 'ios';

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

        switch (p) {
          case 'android': setPlatform('android'); break;
          case 'ios': setPlatform('ios'); break;
          default: setPlatform('desktop'); break;
        }
      } catch {
        setPlatform(window.innerWidth < 768 ? 'android' : 'desktop');
      }
    }
    detect();
  }, []);

  return platform;
}
