import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Text } from "@mariozechner/pi-tui";
export function registerCrewMessageRenderers(pi: ExtensionAPI): void {
  for (const type of ["pi-workers-result", "pi-workers-note"]) {
    pi.registerMessageRenderer(type, (message, _options, _theme) => {
      const content = typeof message.content === "string"
        ? message.content
        : message.content.map((part) => part.type === "text" ? part.text : "[image]").join("\n");
      return new Text(content, 0, 0);
    });
  }
}
