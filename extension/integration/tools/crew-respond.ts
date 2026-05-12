import { Type } from "typebox";
import { renderCrewCall, renderCrewResult, toolError, toolSuccess } from "../tool-presentation.js";
import type { CrewToolDeps } from "./tool-deps.js";

export function registerCrewRespondTool({ pi, runtime }: CrewToolDeps): void {
  pi.registerTool({
    name: "crew_respond",
    label: "Respond to Worker",
    description: "Send a follow-up message to an interactive worker that is waiting for response.",
    parameters: Type.Object({
      subagent_id: Type.Optional(Type.String({ description: "Legacy worker ID" })),
      worker_id: Type.Optional(Type.String({ description: "Worker ID" })),
      message: Type.String({ description: "Message for the waiting worker" }),
    }),
    promptSnippet: "Respond to a waiting interactive worker.",
    async execute(_id, params, _signal, _onUpdate, ctx) {
      const id = params.worker_id ?? params.subagent_id;
      if (!id) return toolError("Provide worker_id (or legacy subagent_id).");

      const result = runtime.respond(id, params.message, ctx.sessionManager.getSessionId());
      if (result.error) return toolError(result.error);

      return toolSuccess(`Sent response to worker ${id}.`, { id });
    },
    renderCall(args, theme) {
      return renderCrewCall(theme, "crew_respond", args.worker_id ?? args.subagent_id ?? "...");
    },
    renderResult(result, _options, theme) {
      return renderCrewResult(result, theme);
    },
  });
}
