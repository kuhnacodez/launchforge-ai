import { getClaudeClient, CLAUDE_MODEL } from "./claude";

// Strip markdown fences Claude sometimes wraps JSON in
export function extractJSON(raw: string): string {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function callAgentClaude(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  if (!hasClaudeKey()) {
    throw new Error("ANTHROPIC_API_KEY is not configured. Add it to your environment variables.");
  }
  const client = getClaudeClient();
  const msg = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
  const block = msg.content[0];
  if (block.type !== "text") throw new Error("Non-text Claude response");
  return extractJSON(block.text);
}

export const hasClaudeKey = () =>
  Boolean(process.env.ANTHROPIC_API_KEY?.trim());
