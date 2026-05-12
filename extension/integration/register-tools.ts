import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { WorkerRuntime } from "../runtime/worker-runtime.js";
import type { WorkerDiscoveryWarning } from "../worker-discovery.js";
import { registerCrewAbortTool } from "./tools/crew-abort.js";
import { registerCrewDoneTool } from "./tools/crew-done.js";
import { registerCrewListTool } from "./tools/crew-list.js";
import { registerCrewRespondTool } from "./tools/crew-respond.js";
import { registerCrewSpawnTool } from "./tools/crew-spawn.js";

export function registerCrewTools(
  pi: ExtensionAPI,
  runtime: WorkerRuntime,
  extensionDir: string,
): void {
  const shownWarnings = new Set<string>();

  const notifyDiscoveryWarnings = (ctx: ExtensionContext, warnings: WorkerDiscoveryWarning[]) => {
    if (!ctx.hasUI) return;

    for (const warning of warnings) {
      const key = `${warning.filePath}:${warning.message}`;
      if (shownWarnings.has(key)) continue;

      shownWarnings.add(key);
      ctx.ui.notify(`${warning.message} (${warning.filePath})`, "warning");
    }
  };

  const deps = { pi, runtime, extensionDir, notifyDiscoveryWarnings };

  registerCrewListTool(deps);
  registerCrewSpawnTool(deps);
  registerCrewAbortTool(deps);
  registerCrewRespondTool(deps);
  registerCrewDoneTool(deps);
}
