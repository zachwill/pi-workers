import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import type { WorkerRuntime } from "./runtime/worker-runtime.js";
import { registerCrewMessageRenderers } from "./integration/register-renderers.js";
import { registerCrewTools } from "./integration/register-tools.js";
export function registerCrewIntegration(pi: ExtensionAPI, runtime: WorkerRuntime, extensionDir: string): void { registerCrewTools(pi, runtime, extensionDir); registerCrewMessageRenderers(pi); }
