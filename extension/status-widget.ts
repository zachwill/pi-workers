import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { WorkerRuntime } from "./runtime/worker-runtime.js";
import { STATUS_ICON } from "./worker-messages.js";
export function updateWidget(ctx: ExtensionContext, runtime: WorkerRuntime): void { const active = runtime.getActiveSummariesForOwner(ctx.sessionManager.getSessionId()); if (!active.length) { ctx.ui.setStatus("pi-workers", undefined); ctx.ui.setWidget("pi-workers", undefined); return; } ctx.ui.setStatus("pi-workers", `${active.length} worker${active.length === 1 ? "" : "s"}`); ctx.ui.setWidget("pi-workers", ["pi-workers", ...active.map((worker) => `${STATUS_ICON[worker.status]} ${worker.id} ${worker.status} turns=${worker.turns}`)]); }
