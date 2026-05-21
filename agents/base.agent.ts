import type { AgentResult } from "@/types";

export abstract class BaseAgent<TInput, TOutput> {
  abstract name: string;
  abstract systemPrompt: string;

  // Subclasses implement either real or mock logic
  abstract run(input: TInput): Promise<AgentResult<TOutput>>;

  protected success<T>(data: T, tokens_used?: number): AgentResult<T> {
    return { success: true, data, tokens_used };
  }

  protected failure<T>(error: string): AgentResult<T> {
    return { success: false, error };
  }
}
