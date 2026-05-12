import { type AgentSession, createAgentSession, DefaultResourceLoader, type ModelRegistry, SessionManager, SettingsManager } from "@mariozechner/pi-coding-agent";
import type { Api, Model } from "@mariozechner/pi-ai";
import type { WorkerConfig } from "./worker-discovery.js";
import { SUPPORTED_TOOL_NAMES, type SupportedToolName } from "./tool-registry.js";

export interface BootstrapContext { model: Model<Api> | undefined; modelRegistry: ModelRegistry; agentDir: string; parentSessionFile?: string }
export interface BootstrapResult { session: AgentSession; warnings: string[] }

function resolveTools(worker: WorkerConfig): SupportedToolName[] { return [...(worker.tools ?? SUPPORTED_TOOL_NAMES)]; }
function resolveModel(worker: WorkerConfig, ctx: BootstrapContext): { model: Model<Api> | undefined; warnings: string[] } {
  if (!worker.parsedModel) return { model: ctx.model, warnings: [] };
  const found = ctx.modelRegistry.find(worker.parsedModel.provider, worker.parsedModel.modelId);
  if (found) return { model: found, warnings: [] };
  return { model: ctx.model, warnings: [`Model "${worker.model}" not found, using current session model`] };
}
function getSkillWarnings(worker: WorkerConfig, loader: DefaultResourceLoader): string[] {
  if (!worker.skills) return [];
  const available = new Set(loader.getSkills().skills.map((skill) => skill.name));
  return worker.skills.filter((skill) => !available.has(skill)).map((skill) => `Unknown skill "${skill}" in worker config, skipping`);
}

export async function bootstrapSession(opts: { worker: WorkerConfig; cwd: string; ctx: BootstrapContext; extensionResolvedPath: string }): Promise<BootstrapResult> {
  const warnings: string[] = [];
  const { worker, cwd, ctx, extensionResolvedPath } = opts;
  const authStorage = ctx.modelRegistry.authStorage;
  const model = resolveModel(worker, ctx);
  warnings.push(...model.warnings);
  const resourceLoader = new DefaultResourceLoader({
    cwd,
    agentDir: ctx.agentDir,
    extensionsOverride: (base) => ({ ...base, extensions: base.extensions.filter((ext) => !ext.resolvedPath.startsWith(extensionResolvedPath)) }),
    skillsOverride: worker.skills ? (base) => ({ skills: base.skills.filter((skill) => worker.skills!.includes(skill.name)), diagnostics: base.diagnostics }) : undefined,
    appendSystemPromptOverride: (base) => worker.systemPrompt.trim() ? [...base, worker.systemPrompt] : base,
  });
  await resourceLoader.reload();
  warnings.push(...getSkillWarnings(worker, resourceLoader));
  const settingsManager = SettingsManager.inMemory({ compaction: { enabled: worker.compaction ?? true } });
  const sessionManager = SessionManager.create(cwd);
  sessionManager.newSession({ parentSession: ctx.parentSessionFile });
  const result = await createAgentSession({ cwd, agentDir: ctx.agentDir, model: model.model, thinkingLevel: worker.thinking, tools: resolveTools(worker), resourceLoader, sessionManager, settingsManager, authStorage, modelRegistry: ctx.modelRegistry });
  return { session: result.session, warnings };
}
