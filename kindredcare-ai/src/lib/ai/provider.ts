import Anthropic from "@anthropic-ai/sdk";

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AICompletionOptions {
  system: string;
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface AICompletion {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

class AnthropicProvider {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async complete(opts: AICompletionOptions): Promise<AICompletion> {
    const response = await this.client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: opts.maxTokens ?? 1024,
      system: opts.system,
      messages: opts.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    return {
      text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  }
}

let _provider: AnthropicProvider | null = null;

export function getAIProvider(): AnthropicProvider {
  if (!_provider) _provider = new AnthropicProvider();
  return _provider;
}
