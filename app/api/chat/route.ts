// app/api/chat/route.ts

import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { chatRequestSchema } from "@/lib/schemas/chat-schema"

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.minimax.io/v1",
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = chatRequestSchema.safeParse(body)

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request",
          details: parsed.error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const result = await streamText({
      model: openai("MiniMax-M2"),
      messages: parsed.data.messages,
      temperature: 1.0,
    })

    return result.toTextStreamResponse()
  } catch (_error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
