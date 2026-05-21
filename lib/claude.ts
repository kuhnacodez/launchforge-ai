import Anthropic from "@anthropic-ai/sdk";

// Lazily initialized so server-only code doesn't crash during build
let _client: Anthropic | null = null;

export function getClaudeClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _client;
}

export const CLAUDE_MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 4096
): Promise<string> {
  const client = getClaudeClient();
  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}
