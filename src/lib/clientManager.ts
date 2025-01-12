import { modelToProvider } from "@/constants/setupConstants";
import { ApiSetup } from "@/types";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import OpenAI from "openai";

class LLMClientManager {
  private openaiClient: OpenAI | null = null;
  private anthropicClient: Anthropic | null = null;
  private geminiClient: GoogleGenerativeAI | null = null;
  private groqClient: Groq | null = null;
  private deepseekClient: OpenAI | null = null;

  constructor(private apiSetup: ApiSetup) {
    this.initializeClients();
  }

  private initializeClients() {
    const { apiKeys } = this.apiSetup;

    try {
      if (apiKeys.OpenAI) {
        this.openaiClient = new OpenAI({
          apiKey: apiKeys.OpenAI.trim(),
          dangerouslyAllowBrowser: true,
        });
        console.log("OpenAI client initialized");
      }

      if (apiKeys.Anthropic) {
        this.anthropicClient = new Anthropic({
          apiKey: apiKeys.Anthropic.trim(),
          dangerouslyAllowBrowser: true,
        });
        console.log("Anthropic client initialized");
      }

      if (apiKeys.Gemini) {
        this.geminiClient = new GoogleGenerativeAI(apiKeys.Gemini.trim());
        console.log("Gemini client initialized");
      }

      if (apiKeys.Groq) {
        this.groqClient = new Groq({
          apiKey: apiKeys.Groq.trim(),
          dangerouslyAllowBrowser: true,
        });
        console.log("Groq client initialized");
      }

      if (apiKeys.DeepSeek) {
        this.deepseekClient = new OpenAI({
          baseURL: "https://api.deepseek.com/v1",
          apiKey: apiKeys.DeepSeek.trim(),
          dangerouslyAllowBrowser: true,
        });
        console.log("DeepSeek client initialized");
      }
    } catch (error) {
      console.error("Error initializing clients:", error);
      throw new Error(`Failed to initialize LLM clients: ${error}`);
    }
  }

  private getClient(provider: string) {
    switch (provider) {
      case "OpenAI":
        if (!this.openaiClient)
          throw new Error(
            "OpenAI client not initialized. Please check your API key."
          );
        return this.openaiClient;
      case "Anthropic":
        if (!this.anthropicClient)
          throw new Error(
            "Anthropic client not initialized. Please check your API key."
          );
        return this.anthropicClient;
      case "Gemini":
        if (!this.geminiClient)
          throw new Error(
            "Gemini client not initialized. Please check your API key."
          );
        return this.geminiClient;
      case "Groq":
        if (!this.groqClient)
          throw new Error(
            "Groq client not initialized. Please check your API key."
          );
        return this.groqClient;
      case "DeepSeek":
        if (!this.deepseekClient)
          throw new Error(
            "DeepSeek client not initialized. Please check your API key."
          );
        return this.deepseekClient;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  async generateResponse(model: string, prompt: string): Promise<string> {
    const provider = modelToProvider[model];
    if (!provider) throw new Error(`No provider found for model: ${model}`);

    try {
      const client = this.getClient(provider);

      switch (provider) {
        case "OpenAI":
          const openaiResponse = await (
            client as OpenAI
          ).chat.completions.create({
            model,
            messages: [{ role: "user", content: prompt }],
          });
          return openaiResponse.choices[0].message.content || "";

        case "Anthropic":
          if (!this.anthropicClient)
            throw new Error("Anthropic client not initialized");
          const anthropicResponse = await this.anthropicClient.messages.create({
            model,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1024,
          });
          return anthropicResponse.content[0].text || "";

        case "Gemini":
          if (!this.geminiClient)
            throw new Error("Gemini client not initialized");
          const geminiModel = this.geminiClient.getGenerativeModel({ model });
          const geminiResponse = await geminiModel.generateContent(prompt);
          return geminiResponse.response.text();

        case "Groq":
          if (!this.groqClient) throw new Error("Groq client not initialized");
          const groqResponse = await this.groqClient.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model,
          });
          return groqResponse.choices[0].message.content || "";

        case "DeepSeek":
          if (!this.deepseekClient)
            throw new Error("DeepSeek client not initialized");
          const deepseekResponse =
            await this.deepseekClient.chat.completions.create({
              model,
              messages: [{ role: "user", content: prompt }],
            });
          return deepseekResponse.choices[0].message.content || "";

        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error generating response for ${provider}:`, error);
      throw error;
    }
  }

  async testConnections() {
    const { debaterModels } = this.apiSetup;
    const modelsToTest = new Set([
      debaterModels.debaterA,
      debaterModels.debaterB,
      debaterModels.judge,
    ]);

    for (const model of modelsToTest) {
      const provider = modelToProvider[model];
      if (!provider) {
        throw new Error(`Invalid model selected: ${model}`);
      }

      // Verify client exists
      this.getClient(provider);
    }

    return true;
  }
}

export default LLMClientManager;
