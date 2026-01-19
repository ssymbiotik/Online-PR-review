import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, CodeFile } from "../types";

export const analyzePullRequest = async (
  apiKey: string,
  files: CodeFile[],
  title: string,
  description: string
): Promise<AnalysisResult> => {
  
  if (!apiKey) {
    throw new Error("Gemini API Key is required");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Optimization: Limit content per file to stay within safe token bounds for typical PRs
  // We use flash-preview which has a massive 1M context, but we still want to be efficient.
  const filesContext = files.slice(0, 50).map(f => {
    let contentDisplay = '';
    if (f.patch) {
        contentDisplay = `Diff:\n${f.patch.slice(0, 10000)}`;
    } else if (f.content) {
        contentDisplay = `Full File Content (Modified):\n${f.content.slice(0, 10000)}`;
    } else {
        contentDisplay = '(No content available)';
    }

    return `File: ${f.filename}\nStatus: ${f.status}\n${contentDisplay}\n----------------`;
  }).join('\n');

  const prompt = `
    Act as a Senior Software Engineer performing a peer review.
    
    TASK: Provide a technical critique of the provided Pull Request.
    
    PR Title: ${title}
    PR Description: ${description}
    
    CRITICAL INSTRUCTIONS: 
    - BE CONCISE. Provide short, punchy, actionable answers.
    - DO NOT mention AI, Gemini, or being a tool.
    - Write exactly like a human colleague.
    - Avoid formal headers like "Review Summary" or "Observations".
    - Focus on logic, security, and performance.
    
    INSTRUCTIONS:
    1. Identify logical bugs or security vulnerabilities.
    2. Check for maintainability.
    
    DECISION CRITERIA:
    - REQUEST_CHANGES: Critical flaws.
    - COMMENT: Minor suggestions.
    - APPROVE: Ready for production.

    Files:
    ${filesContext}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A very brief human-like summary of the review."
            },
            decision: {
              type: Type.STRING,
              enum: ["APPROVE", "REQUEST_CHANGES", "COMMENT"],
              description: "Review status."
            },
            comments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  filename: { type: Type.STRING },
                  lineContent: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["INFO", "WARNING", "CRITICAL"] },
                  comment: { type: Type.STRING, description: "Short, direct peer comment." }
                },
                required: ["filename", "severity", "comment"]
              }
            }
          },
          required: ["summary", "decision", "comments"]
        }
      }
    });

    const text = response.text;
    
    if (!text) {
      throw new Error("Empty response received.");
    }

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : text;
      return JSON.parse(cleanJson) as AnalysisResult;
    } catch (parseError) {
      throw new Error("Failed to parse the review findings.");
    }
  } catch (error: any) {
    throw new Error(error.message || "Analysis failed.");
  }
};