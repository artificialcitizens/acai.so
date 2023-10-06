import { getToken } from "../../../utils/config"
import { OpenAI } from "langchain/llms/openai"
import { ChatOpenAI } from "langchain/chat_models/openai"

const acaiDefaults = {
  streaming: true,
  temperature: 0,
  maxTokens: 1024,
  openAIApiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
  configuration: {
    baseURL: getToken('OPENAI_API_BASE') ?? import.meta.env.VITE_OPENAI_API_BASE,
  }
}

// Need a central way to assign acai-managed config
// Only supports OpenAI for now
export function useAcaiChat(fields: any = {}) {
  return {
    chat: new ChatOpenAI({ 
      modelName: "gpt-3.5-turbo",
      ...acaiDefaults,
      ...fields
    })
  }
}

// I think we should consolidate to Chat in all cases, but this replaces non-chat for now
export function useAcaiLLM(fields: any = {}) {
  return {
    llm: new OpenAI({
      ...acaiDefaults,
      ...fields
    })
  }
}