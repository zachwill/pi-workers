import { Type } from "typebox";
import { renderCrewCall, renderCrewResult, toolError, toolSuccess } from "../tool-presentation.js";
import type { CrewToolDeps } from "./tool-deps.js";

export function registerCrewDoneTool({ pi, runtime }: CrewToolDeps): void {
  pi.registerTool({
    name: "crew_done",
    label: "Finish Worker",
    description: "Dispose an interactive worker that is waiting and no longer needs input.",
    parameters: Type.Object({
      subagent_id: Type.Optional(Type.String({ description: "Legacy worker ID" })),
      worker_id: Type.Optional(Type.String({ description: "Worker ID" })),
    }),
    promptSnippet: "Finish a waiting interactive worker.",
    async execute(_id, params, _signal, _onUpdate, ctx) {
      const id = params.worker_id ?? params.subagent_id;
      if (!id) return toolError("Provide worker_id (or legacy subagent_id).");

      const result = runtime.done(id, ctx.sessionManager.getSessionId());
      if (result.error) return toolError(result.error);

      return toolSuccess(`Worker ${id} marked done and disposed.`, { id }, { terminate: true });
    },
    renderCall(args, theme) {
      return renderCrewCall(theme, "crew_done", args.worker_id ?? args.subagent_id ?? "...");
    },
    renderResult(result, _options, theme) {
      return renderCrewResult(result, theme);
    },
  });
}
