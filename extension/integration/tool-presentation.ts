import { Text } from "@mariozechner/pi-tui";

export function toolSuccess(
  text: string,
  details: Record<string, unknown> = {},
  extra: Record<string, unknown> = {},
) {
  return {
    content: [{ type: "text" as const, text }],
    details,
    ...extra,
  };
}

export function toolError(text: string, details: Record<string, unknown> = {}) {
  return {
    content: [{ type: "text" as const, text }],
    details: { ...details, error: true },
  };
}

export function renderCrewCall(theme: any, tool: string, target?: string, detail?: string) {
  let text = theme.fg("toolTitle", theme.bold(tool));
  if (target) text += ` ${theme.fg("accent", target)}`;
  if (detail) text += ` ${theme.fg("dim", detail)}`;
  return new Text(text, 0, 0);
}

export function renderCrewResult(result: any, _theme: any) {
  const first = result.content?.[0];
  return new Text(first?.type === "text" ? first.text : "(no output)", 0, 0);
}
