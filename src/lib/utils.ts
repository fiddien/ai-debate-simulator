import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateCitations(text: string, situation: string): string {
  const removePunctuation = (text: string): string => {
    const translator = new Map<string, string>()
    for (const char of ".,;:!?") {
      translator.set(char, "")
    }
    return text.split("").map(char => translator.get(char) || char).join("").toLowerCase().trim()
  }

  const cleanedSituation = removePunctuation(situation)

  const validateQuote = (substring: string, ...args: any[]): string => {
    const content = args[0].trim()
    const cleanedContent = removePunctuation(content)
    const tag = cleanedSituation.includes(cleanedContent) ? "v_quote" : "u_quote"
    return `<${tag}>${content}</${tag}>`
  }

  return text.replace(/<quote>(.*?)<\/quote>/g, validateQuote)
}

export function extractTagContent(text: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}>(.*?)<\/${tagName}>`, 'gs')
  const matches = [...text.matchAll(regex)]
  return matches.map(match => match[1].trim())
}

export function extractThinking(text: string): string {
  const thinkings = extractTagContent(text, 'thinking')
  return thinkings.length > 0 ? thinkings.join('\n\n').trim() : text.trim()
}

export function extractQuotes(text: string): string[] {
  return extractTagContent(text, 'quote')
}

export function extractArguments(text: string): string {
  const args = extractTagContent(text, 'argument')
  return args.length > 0 ? args.join('\n\n').trim() : text.trim()
}

// Example usage:
// const thinking = extractThinking(text) // ["content inside thinking tags"]
// const quotes = extractQuotes(text)     // ["quoted content"]
// const args = extractArguments(text)    // ["argument content"]