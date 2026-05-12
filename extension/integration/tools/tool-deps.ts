import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { WorkerDiscoveryWarning } from "../../worker-discovery.js";
import type { WorkerRuntime } from "../../runtime/worker-runtime.js";
export interface CrewToolDeps { pi: ExtensionAPI; runtime: WorkerRuntime; extensionDir: string; notifyDiscoveryWarnings: (ctx: ExtensionContext, warnings: WorkerDiscoveryWarning[]) => void }
