import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

export async function POST(req: Request) {
  try {
    const { content } = await req.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'No content provided.' },
        { status: 400 }
      )
    }

    const response = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content:
            'You rewrite text to improve grammar, clarity, and readability while preserving the original meaning. Return only the rewritten text.',
        },
        {
          role: 'user',
          content: `
Rewrite the following note to:
- Correct grammar and spelling mistakes.
- Improve sentence structure.
- Keep the original meaning.
- Preserve the overall length unless shortening improves clarity.

Note:
${content}
          `,
        },
      ],
    })

    const paraphrased =
      response.choices[0]?.message?.content?.trim() ||
      ''

    return NextResponse.json({
      paraphrased,
    })
  } catch (error) {
    console.error('Paraphrase error:', error)

    return NextResponse.json(
      { error: 'Failed to paraphrase note.' },
      { status: 500 }
    )
  }
}