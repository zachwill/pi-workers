import { Type } from "typebox";
import { renderCrewCall, renderCrewResult, toolError, toolSuccess } from "../tool-presentation.js";
import type { CrewToolDeps } from "./tool-deps.js";

function formatAbortResult(result: {
  abortedIds: string[];
  missingIds: string[];
  foreignIds: string[];
}): string {
  return [
    result.abortedIds.length ? `Aborted ${result.abortedIds.length} worker(s): ${result.abortedIds.join(", ")}` : "",
    result.missingIds.length ? `Not found or already finished: ${result.missingIds.join(", ")}` : "",
    result.foreignIds.length ? `Belong to a different session: ${result.foreignIds.join(", ")}` : "",
  ].filter(Boolean).join("\n");
}

export function registerCrewAbortTool({ pi, runtime }: CrewToolDeps): void {
  pi.registerTool({
    name: "crew_abort",
    label: "Abort Workers",
    description: "Abort one, many, or all active workers owned by the current session.",
    parameters: Type.Object({
      subagent_id: Type.Optional(Type.String({ description: "Legacy single worker ID to abort" })),
      worker_id: Type.Optional(Type.String({ description: "Single worker ID to abort" })),
      subagent_ids: Type.Optional(Type.Array(Type.String(), { minItems: 1, description: "Legacy multiple worker IDs to abort" })),
      worker_ids: Type.Optional(Type.Array(Type.String(), { minItems: 1, description: "Multiple worker IDs to abort" })),
      all: Type.Optional(Type.Boolean({ description: "Abort all active workers owned by the current session" })),
    }),
    promptSnippet: "Abort one, many, or all active workers from this session.",
    async execute(_id, params, _signal, _onUpdate, ctx) {
      const single = params.worker_id ?? params.subagent_id;
      const many = params.worker_ids ?? params.subagent_ids;
      const modeCount = Number(Boolean(single)) + Number(Boolean(many?.length)) + Number(params.all === true);

      if (modeCount !== 1) {
        return toolError("Provide exactly one of: worker_id, worker_ids, or all=true.");
      }

      if (params.all) {
        const ids = runtime.abortAllOwned(ctx.sessionManager.getSessionId(), "Aborted by tool request");
        if (!ids.length) return toolError("No active workers in the current session.");
        return toolSuccess(`Aborted ${ids.length} worker(s): ${ids.join(", ")}`, { ids }, { terminate: true });
      }

      const result = runtime.abortOwned(
        single ? [single] : (many ?? []),
        ctx.sessionManager.getSessionId(),
        "Aborted by tool request",
      );
      const message = formatAbortResult(result);

      if (!result.abortedIds.length) return toolError(message || "No workers were aborted.");

      return toolSuccess(
        message,
        { ids: result.abortedIds, missing_ids: result.missingIds, foreign_ids: result.foreignIds },
        { terminate: true },
      );
    },
    renderCall(args, theme) {
      const target = args.all
        ? "all"
        : (args.worker_id ?? args.subagent_id ?? `${(args.worker_ids ?? args.subagent_ids ?? []).length} ids`);
      return renderCrewCall(theme, "crew_abort", target);
    },
    renderResult(result, _options, theme) {
      return renderCrewResult(result, theme);
    },
  });
}
